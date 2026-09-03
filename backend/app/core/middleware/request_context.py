"""Request id propagation and access logging."""

from __future__ import annotations

import time
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from app.core.context import REQUEST_ID_HEADER, new_request_id, reset_request_id, set_request_id
from app.core.logging import get_logger

logger = get_logger(__name__)

# An inbound id is echoed so a trace can span the proxy, the frontend and the
# API -- but only if it looks like an id. Anything longer or containing control
# characters is discarded rather than being written into logs and headers.
MAX_INBOUND_REQUEST_ID_LENGTH = 128


def _sanitize(candidate: str | None) -> str | None:
    if not candidate:
        return None
    value = candidate.strip()
    if not value or len(value) > MAX_INBOUND_REQUEST_ID_LENGTH:
        return None
    if not all(char.isalnum() or char in "-_:." for char in value):
        return None
    return value


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assign every request an id, expose it, and bind it to the log context."""

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        request_id = _sanitize(request.headers.get(REQUEST_ID_HEADER)) or new_request_id()

        token = set_request_id(request_id)
        request.state.request_id = request_id
        try:
            response = await call_next(request)
        finally:
            reset_request_id(token)

        response.headers[REQUEST_ID_HEADER] = request_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Emit one structured access-log record per request.

    Replaces uvicorn's access log so that method, path, status, duration and
    request id land in a single structured record.
    """

    def __init__(self, app: ASGIApp, *, exclude_paths: tuple[str, ...] = ()) -> None:
        super().__init__(app)
        self._exclude_paths = frozenset(exclude_paths)

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        if request.url.path in self._exclude_paths:
            return await call_next(request)

        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            # The exception handlers own the response; this records the timing
            # for the failed request before re-raising to them.
            duration_ms = round((time.perf_counter() - started) * 1000, 2)
            logger.exception(
                "request_errored",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "client": request.client.host if request.client else None,
                },
            )
            raise

        duration_ms = round((time.perf_counter() - started) * 1000, 2)
        response.headers["X-Response-Time-Ms"] = str(duration_ms)

        logger.info(
            "request_completed",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "client": request.client.host if request.client else None,
            },
        )
        return response
