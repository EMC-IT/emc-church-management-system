"""Baseline security middleware.

Covers the transport-level controls listed in ``backend architecture.md`` §36
and the backend security plan §9. Authentication and authorization are *not*
here -- they arrive in Phase 2 as router dependencies.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from starlette.datastructures import Headers
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.core.exceptions.errors import AppError, ErrorCode

# The API returns JSON to a separate origin; it never renders HTML itself, so
# the policy can be maximally restrictive. `frame-ancestors 'none'` is the
# modern equivalent of X-Frame-Options: DENY and covers the docs pages too.
_API_CSP = "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"

# Swagger UI and ReDoc load their assets from a CDN and use inline styles, so
# the docs routes need a relaxed policy. They are disabled in deployed
# environments by default (Settings.docs_enabled).
_DOCS_CSP = (
    "default-src 'self'; "
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
    "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
    "img-src 'self' https://fastapi.tiangolo.com data:; "
    "worker-src 'self' blob:; "
    "frame-ancestors 'none'; base-uri 'none'"
)

_BASE_HEADERS: dict[str, str] = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-site",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
}


class RequestTooLargeError(AppError):
    """The declared request body exceeds the configured limit."""

    status_code = 413
    code = ErrorCode.VALIDATION_ERROR
    message = "Request body is too large"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Attach hardening headers to every response."""

    def __init__(
        self,
        app: ASGIApp,
        *,
        enable_hsts: bool = False,
        hsts_max_age: int = 63_072_000,
        docs_paths: tuple[str, ...] = (),
    ) -> None:
        super().__init__(app)
        self._enable_hsts = enable_hsts
        self._hsts_max_age = hsts_max_age
        self._docs_paths = frozenset(docs_paths)

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)

        for header, value in _BASE_HEADERS.items():
            response.headers.setdefault(header, value)

        is_docs = request.url.path in self._docs_paths
        response.headers.setdefault("Content-Security-Policy", _DOCS_CSP if is_docs else _API_CSP)

        # Authenticated API responses must not be stored by shared caches.
        response.headers.setdefault("Cache-Control", "no-store")

        if self._enable_hsts:
            response.headers.setdefault(
                "Strict-Transport-Security",
                f"max-age={self._hsts_max_age}; includeSubDomains; preload",
            )

        return response


class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Reject oversized request bodies before they are buffered.

    A declared Content-Length over the limit is refused immediately. This is a
    cheap first line of defence; per-endpoint upload limits arrive with the
    files domain (Phase 3).
    """

    def __init__(self, app: ASGIApp, *, max_body_bytes: int) -> None:
        super().__init__(app)
        self._max_body_bytes = max_body_bytes

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        declared = _content_length(request.headers)
        if declared is not None and declared > self._max_body_bytes:
            raise RequestTooLargeError(
                f"Request body exceeds the {self._max_body_bytes} byte limit"
            )
        return await call_next(request)


def _content_length(headers: Headers) -> int | None:
    raw = headers.get("content-length")
    if raw is None:
        return None
    try:
        return int(raw)
    except ValueError:
        return None
