"""Shared FastAPI dependencies.

Infrastructure dependencies (database, cache, pagination) plus the single
authentication and authorization chain every protected route uses:

    CurrentUser -> CurrentSecurityContext -> require_permission("<code>")

There is one of each, deliberately. A domain that grows its own variant of
"who is calling and what may they do" is how two subtly different answers to
that question end up in one codebase (ADR-011).
"""

from __future__ import annotations

import uuid
from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.cache import get_redis
from app.core.database import get_db
from app.core.exceptions import AuthenticationError, RateLimitedError, ServiceUnavailableError
from app.core.logging import get_logger
from app.core.security import SecurityContext, decode_access_token
from app.core.security.rate_limit import RateLimitPolicy, RateLimitUnavailableError, consume
from app.domains.identity.authorization import load_authenticated_user, resolve_security_context
from app.domains.identity.models import User
from app.domains.identity.rbac_registry import PERMISSION_CODES
from app.shared.pagination import PaginationParams, pagination_params

logger = get_logger(__name__)

LOGIN_RATE_LIMIT_NAMESPACE = "login:ip"

DbSession = Annotated[AsyncSession, Depends(get_db)]
"""Request-scoped database session."""

RedisClient = Annotated[Redis, Depends(get_redis)]
"""Shared Redis client."""

Pagination = Annotated[PaginationParams, Depends(pagination_params)]
"""Validated page, size and sort parameters."""


# auto_error=False so a missing header raises our own AuthenticationError and
# renders through the standard error envelope, rather than Starlette's bare 403.
_bearer_scheme = HTTPBearer(auto_error=False, description="JWT access token")

BearerCredentials = Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer_scheme)]

_CANONICAL_PERMISSION_CODES = frozenset(PERMISSION_CODES)


async def get_current_user(session: DbSession, credentials: BearerCredentials) -> User:
    """The authenticated user, from the bearer token alone.

    There is no override path -- no header, query parameter or body field can
    name a different principal.
    """
    if credentials is None or not credentials.credentials:
        raise AuthenticationError()

    claims = decode_access_token(credentials.credentials)
    return await load_authenticated_user(session, claims)


CurrentUser = Annotated[User, Depends(get_current_user)]
"""The authenticated user record."""


async def get_security_context(session: DbSession, user: CurrentUser) -> SecurityContext:
    """The authenticated principal's effective authorization state."""
    return await resolve_security_context(session, user)


CurrentSecurityContext = Annotated[SecurityContext, Depends(get_security_context)]
"""Tenant, role, permissions and branch assignments, as of this request."""


def require_permission(code: str) -> Callable[[SecurityContext], SecurityContext]:
    """Dependency factory guarding a route with one permission code.

    Usage::

        @router.get("/members", dependencies=[Depends(require_permission("members.view"))])

    ``code`` is validated against the canonical catalogue **now**, at import
    time, so a typo or a permission ADR-009 has deferred fails loudly on
    startup instead of silently making the route unreachable forever.
    """
    if code not in _CANONICAL_PERMISSION_CODES:
        raise ValueError(
            f"{code!r} is not a canonical permission code. Permissions come from "
            f"lib/authorization/permissions.ts via app.domains.identity.rbac_registry "
            f"(ADR-003); a code that is not there cannot be granted to any role."
        )

    def dependency(context: CurrentSecurityContext) -> SecurityContext:
        context.require_permission(code)
        return context

    return dependency


def _client_ip(request: Request) -> str:
    """The address the limit is counted against.

    Read from ``request.client`` and never from ``X-Forwarded-For`` directly:
    a client can set that header itself, so trusting it hands every caller an
    unlimited supply of distinct identities and removes the limit entirely.
    Behind a proxy, uvicorn rewrites ``request.client`` from the forwarded
    header only for sources listed in ``--forwarded-allow-ips``, which is the
    right place for that trust decision.
    """
    return request.client.host if request.client else "unknown"


async def enforce_login_rate_limit(request: Request, redis: RedisClient) -> None:
    """Throttle login attempts per source address.

    Counted per IP only. A per-account counter would be account lockout, a
    separate control whose threshold, duration and unlock mechanism are still
    unspecified (OQ-SEC-04) -- and one an attacker can aim at a known address
    to deny that person service.

    Every attempt counts, successful or not: resetting on success would let an
    attacker who guesses one password in a batch keep an unlimited budget for
    the rest, and the endpoint also needs protecting from sheer volume.
    """
    policy = RateLimitPolicy(
        limit=settings.LOGIN_RATE_LIMIT_ATTEMPTS,
        window_seconds=settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS,
    )

    try:
        verdict = await consume(
            redis,
            namespace=LOGIN_RATE_LIMIT_NAMESPACE,
            identifier=_client_ip(request),
            policy=policy,
        )
    except RateLimitUnavailableError as exc:
        if settings.LOGIN_RATE_LIMIT_FAIL_OPEN:
            logger.warning("login_rate_limit_skipped_backend_unavailable")
            return
        raise ServiceUnavailableError(
            "Login is temporarily unavailable. Please try again shortly."
        ) from exc

    if not verdict.allowed:
        # No remaining count and no window size in the message: an
        # unauthenticated caller learns only that it must wait.
        logger.info("login_rate_limited")
        raise RateLimitedError(retry_after=verdict.retry_after)


def require_branch_access(context: SecurityContext, branch_id: uuid.UUID) -> None:
    """Assert the principal may act in ``branch_id``.

    A function rather than a dependency because the branch id is a property of
    the request being served -- sometimes a path parameter, sometimes a filter,
    sometimes a field on the body being written -- and a dependency would have
    to guess which.
    """
    context.require_branch(branch_id)


__all__ = [
    "LOGIN_RATE_LIMIT_NAMESPACE",
    "BearerCredentials",
    "CurrentSecurityContext",
    "CurrentUser",
    "DbSession",
    "Pagination",
    "RedisClient",
    "enforce_login_rate_limit",
    "get_current_user",
    "get_security_context",
    "require_branch_access",
    "require_permission",
]
