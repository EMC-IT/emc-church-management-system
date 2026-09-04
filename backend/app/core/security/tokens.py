"""JWT access tokens: issuance and verification.

Tokens carry **identity only** -- who the caller is and which tenant they
belong to. Role, permissions and branch assignments are deliberately absent
and are resolved from the database on every request (ADR-011). An access token
outlives a permission change, so a permission list embedded here would mean
revoking a permission does not actually revoke it until the token expires.

Signing key, algorithm and lifetime all come from ``app.config``; this module
introduces no configuration of its own.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Final

import jwt

from app.config import Settings, get_settings
from app.core.exceptions import AuthenticationError

TOKEN_TYPE_ACCESS: Final = "access"  # noqa: S105 - a claim value, not a credential
"""Value of the ``typ`` claim on an access token.

Present so that a refresh token -- which a later phase will issue from the
same signing key -- cannot be replayed as an access token. Without it, two
token kinds signed by one key are interchangeable.
"""

_REQUIRED_CLAIMS: Final = ("sub", "tid", "typ", "exp", "iat")


@dataclass(frozen=True, slots=True)
class TokenClaims:
    """The verified contents of an access token.

    Only ``user_id`` and ``tenant_id`` are authorization-relevant, and even
    ``tenant_id`` is cross-checked against the user record before it is
    trusted (see ``app.domains.identity.authorization``).
    """

    user_id: uuid.UUID
    tenant_id: uuid.UUID
    issued_at: datetime
    expires_at: datetime


def create_access_token(
    *,
    user_id: uuid.UUID,
    tenant_id: uuid.UUID,
    expires_in: timedelta | None = None,
    settings: Settings | None = None,
) -> str:
    """Issue a signed access token for an authenticated user."""
    config = settings or get_settings()
    now = datetime.now(UTC)
    lifetime = expires_in or timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)

    payload: dict[str, Any] = {
        "sub": str(user_id),
        "tid": str(tenant_id),
        "typ": TOKEN_TYPE_ACCESS,
        "iat": now,
        "exp": now + lifetime,
    }
    return jwt.encode(payload, config.SECRET_KEY, algorithm=config.ALGORITHM)


def decode_access_token(token: str, *, settings: Settings | None = None) -> TokenClaims:
    """Verify a token's signature, algorithm, type and expiry, and read its claims.

    Raises :class:`AuthenticationError` for every failure mode, with a single
    generic message: which specific check failed is useful to an attacker
    probing for valid identifiers and useless to a legitimate client, whose
    only remedy is to authenticate again either way.
    """
    config = settings or get_settings()
    try:
        payload = jwt.decode(
            token,
            config.SECRET_KEY,
            # An explicit allow-list, not the token's own header: accepting the
            # header's algorithm is what makes "alg": "none" and RS256->HS256
            # confusion attacks work.
            algorithms=[config.ALGORITHM],
            options={"require": list(_REQUIRED_CLAIMS), "verify_exp": True},
        )
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError() from exc

    if payload.get("typ") != TOKEN_TYPE_ACCESS:
        raise AuthenticationError()

    try:
        user_id = uuid.UUID(str(payload["sub"]))
        tenant_id = uuid.UUID(str(payload["tid"]))
    except (ValueError, TypeError) as exc:
        raise AuthenticationError() from exc

    return TokenClaims(
        user_id=user_id,
        tenant_id=tenant_id,
        issued_at=datetime.fromtimestamp(payload["iat"], tz=UTC),
        expires_at=datetime.fromtimestamp(payload["exp"], tz=UTC),
    )
