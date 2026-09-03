"""Request-scoped context.

Holds values that every layer needs but that would be noise to thread through
every function signature -- currently the request id, later the authenticated
principal's tenant and user (Phase 2).

Backed by :mod:`contextvars`, so values are isolated per task and safe under
concurrent requests.
"""

from __future__ import annotations

import uuid
from contextvars import ContextVar, Token
from dataclasses import dataclass

REQUEST_ID_HEADER = "X-Request-ID"

_request_id: ContextVar[str | None] = ContextVar("request_id", default=None)


def new_request_id() -> str:
    """Generate a fresh request id."""
    return str(uuid.uuid4())


def get_request_id() -> str | None:
    """Return the current request id, or ``None`` outside a request."""
    return _request_id.get()


def set_request_id(request_id: str) -> Token[str | None]:
    """Bind a request id to the current context."""
    return _request_id.set(request_id)


def reset_request_id(token: Token[str | None]) -> None:
    """Restore the previous request id."""
    _request_id.reset(token)


@dataclass(frozen=True, slots=True)
class RequestContext:
    """Immutable snapshot of the current request's context."""

    request_id: str | None = None

    @classmethod
    def current(cls) -> RequestContext:
        return cls(request_id=get_request_id())
