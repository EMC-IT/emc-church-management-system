"""Global exception handling.

Every error leaving the API passes through here, so responses have one shape
and internal detail never escapes. Handlers are registered on the app in
:func:`register_exception_handlers`.
"""

from __future__ import annotations

from http import HTTPStatus
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.context import get_request_id
from app.core.exceptions.errors import AppError, ErrorCode, RateLimitedError, ValidationError
from app.core.logging import get_logger
from app.shared.types.responses import ErrorResponse, FieldError

logger = get_logger(__name__)

# Maps a bare HTTP status to the canonical code from Errors_Responses.md.
_STATUS_TO_CODE: dict[int, str] = {
    HTTPStatus.BAD_REQUEST: ErrorCode.VALIDATION_ERROR,
    HTTPStatus.UNAUTHORIZED: ErrorCode.UNAUTHENTICATED,
    HTTPStatus.FORBIDDEN: ErrorCode.FORBIDDEN,
    HTTPStatus.NOT_FOUND: ErrorCode.NOT_FOUND,
    HTTPStatus.METHOD_NOT_ALLOWED: ErrorCode.NOT_FOUND,
    HTTPStatus.CONFLICT: ErrorCode.CONFLICT,
    HTTPStatus.UNPROCESSABLE_ENTITY: ErrorCode.VALIDATION_ERROR,
    HTTPStatus.TOO_MANY_REQUESTS: ErrorCode.RATE_LIMITED,
    HTTPStatus.SERVICE_UNAVAILABLE: ErrorCode.SERVICE_UNAVAILABLE,
}

GENERIC_500_MESSAGE = (
    "An unexpected error occurred while processing your request. Please contact support."
)


def _render(
    status_code: int,
    code: str,
    message: str,
    *,
    field_errors: list[FieldError] | None = None,
    details: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    """Serialize an error into the standard envelope."""
    body = ErrorResponse(
        code=code,
        message=message,
        errors=field_errors or None,
        details=details or None,
        request_id=get_request_id(),
    )
    return JSONResponse(
        status_code=status_code,
        content=body.model_dump(by_alias=True, exclude_none=True),
        headers=headers,
    )


def _field_path(location: tuple[int | str, ...]) -> str:
    """Turn a Pydantic error location into a dotted field path.

    Drops the leading source segment (``body`` / ``query`` / ``path``) so the
    client sees ``emergencyContact.phone`` rather than
    ``body.emergencyContact.phone``.
    """
    parts = [str(part) for part in location]
    if parts and parts[0] in {"body", "query", "path", "header", "cookie"}:
        parts = parts[1:]
    return ".".join(parts) if parts else "__root__"


def _to_field_errors(errors: list[Any]) -> list[FieldError]:
    return [
        FieldError(field=_field_path(err.get("loc", ())), message=err.get("msg", "Invalid value"))
        for err in errors
    ]


async def app_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle deliberate application errors."""
    assert isinstance(exc, AppError)  # noqa: S101 - registered only for AppError

    field_errors = (
        _to_field_errors_from_validation(exc) if isinstance(exc, ValidationError) else None
    )
    headers = (
        {"Retry-After": str(exc.retry_after)}
        if isinstance(exc, RateLimitedError) and exc.retry_after
        else None
    )

    log = logger.error if exc.status_code >= HTTPStatus.INTERNAL_SERVER_ERROR else logger.info
    log(
        "request_failed",
        extra={
            "error_code": exc.code,
            "status_code": exc.status_code,
            "path": request.url.path,
            "method": request.method,
        },
    )

    return _render(
        exc.status_code,
        exc.code,
        exc.message,
        field_errors=field_errors,
        details=exc.details,
        headers=headers,
    )


def _to_field_errors_from_validation(exc: ValidationError) -> list[FieldError] | None:
    if not exc.field_errors:
        return None
    return [
        FieldError(field=item.get("field", "__root__"), message=item.get("message", ""))
        for item in exc.field_errors
    ]


async def request_validation_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle FastAPI request validation failures (bad body/query/path)."""
    assert isinstance(exc, RequestValidationError)  # noqa: S101

    field_errors = _to_field_errors(list(exc.errors()))
    logger.info(
        "request_validation_failed",
        extra={
            "path": request.url.path,
            "method": request.method,
            "invalid_fields": [fe.field for fe in field_errors],
        },
    )
    return _render(
        HTTPStatus.UNPROCESSABLE_ENTITY,
        ErrorCode.VALIDATION_ERROR,
        "Validation failed for submitted data",
        field_errors=field_errors,
    )


async def pydantic_validation_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle a Pydantic error raised outside request parsing.

    Usually means a response model failed to build, which is a server-side
    defect -- so it is logged as an error and reported generically.
    """
    assert isinstance(exc, PydanticValidationError)  # noqa: S101

    logger.error(
        "response_validation_failed",
        exc_info=exc,
        extra={"path": request.url.path, "method": request.method},
    )
    return _render(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        GENERIC_500_MESSAGE,
    )


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle bare Starlette/FastAPI HTTPExceptions, including 404 and 405."""
    assert isinstance(exc, StarletteHTTPException)  # noqa: S101

    code = _STATUS_TO_CODE.get(exc.status_code, ErrorCode.INTERNAL_SERVER_ERROR)
    message = str(exc.detail) if exc.detail else HTTPStatus(exc.status_code).phrase

    if exc.status_code >= HTTPStatus.INTERNAL_SERVER_ERROR:
        logger.error(
            "http_exception",
            extra={"status_code": exc.status_code, "path": request.url.path},
        )
        message = GENERIC_500_MESSAGE

    headers = getattr(exc, "headers", None)
    return _render(exc.status_code, code, message, headers=headers)


async def integrity_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Map a database constraint violation to 409 Conflict.

    The driver message is logged but never returned: it exposes table, column
    and constraint names.
    """
    assert isinstance(exc, IntegrityError)  # noqa: S101

    logger.warning(
        "database_integrity_error",
        exc_info=exc,
        extra={"path": request.url.path, "method": request.method},
    )
    return _render(
        HTTPStatus.CONFLICT,
        ErrorCode.CONFLICT,
        "The request conflicts with existing data.",
    )


async def sqlalchemy_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle any other database failure as a generic 500."""
    assert isinstance(exc, SQLAlchemyError)  # noqa: S101

    logger.error(
        "database_error",
        exc_info=exc,
        extra={"path": request.url.path, "method": request.method},
    )
    return _render(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        GENERIC_500_MESSAGE,
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Last resort. Logs the stack trace; returns nothing internal."""
    logger.error(
        "unhandled_exception",
        exc_info=exc,
        extra={"path": request.url.path, "method": request.method},
    )
    return _render(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.INTERNAL_SERVER_ERROR,
        GENERIC_500_MESSAGE,
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register every handler on the application.

    Order matters only in that more specific exception types must be
    registered; Starlette resolves by walking the class hierarchy.
    """
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, request_validation_handler)
    app.add_exception_handler(PydanticValidationError, pydantic_validation_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
