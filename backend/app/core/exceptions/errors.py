"""Application exception hierarchy.

Mirrors the frontend taxonomy in ``lib/errors/app-error.ts`` so that a given
failure carries the same ``code`` and HTTP status on both sides of the wire.
Status/code pairs are fixed by ``api-documentations/Errors_Responses.md``.
"""

from __future__ import annotations

from http import HTTPStatus
from typing import Any


class ErrorCode:
    """Canonical machine-readable error codes returned to clients."""

    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHENTICATED = "UNAUTHENTICATED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    TENANT_ISOLATION_VIOLATION = "TENANT_ISOLATION_VIOLATION"
    FINANCIAL_INTEGRITY_ERROR = "FINANCIAL_INTEGRITY_ERROR"
    RATE_LIMITED = "RATE_LIMITED"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"


class AppError(Exception):
    """Base class for every error the application raises deliberately.

    Anything that is *not* an ``AppError`` reaching the exception handlers is
    treated as a bug: it is logged with a stack trace and reported to the
    client as a generic 500 with no internal detail.
    """

    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR
    code: str = ErrorCode.INTERNAL_SERVER_ERROR
    message: str = "An unexpected error occurred while processing your request."

    def __init__(
        self,
        message: str | None = None,
        *,
        status_code: int | None = None,
        code: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message or self.message
        self.status_code = status_code or self.status_code
        self.code = code or self.code
        self.details = details
        super().__init__(self.message)

    def __repr__(self) -> str:
        return f"{type(self).__name__}(code={self.code!r}, status={self.status_code})"


class ValidationError(AppError):
    """Input failed schema or business-rule validation."""

    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    code = ErrorCode.VALIDATION_ERROR
    message = "Validation failed for submitted data"

    def __init__(
        self,
        message: str | None = None,
        *,
        field_errors: list[dict[str, str]] | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message, details=details)
        self.field_errors = field_errors or []


class AuthenticationError(AppError):
    """No valid credentials were presented."""

    status_code = HTTPStatus.UNAUTHORIZED
    code = ErrorCode.UNAUTHENTICATED
    message = "Authentication required. Bearer token is missing or expired."


class AuthorizationError(AppError):
    """Credentials are valid but insufficient for this operation.

    Deliberately 403 and never 401: the frontend's Axios interceptor clears the
    session and redirects to /login on *any* 401, so returning 401 for a mere
    permission failure would log the user out spuriously.
    """

    status_code = HTTPStatus.FORBIDDEN
    code = ErrorCode.FORBIDDEN
    message = "Access denied for this resource or operation"


class NotFoundError(AppError):
    """The entity does not exist within the caller's visible scope."""

    status_code = HTTPStatus.NOT_FOUND
    code = ErrorCode.NOT_FOUND
    message = "Resource was not found"

    def __init__(
        self,
        resource: str = "Resource",
        identifier: str | None = None,
        *,
        message: str | None = None,
    ) -> None:
        if message is None:
            message = (
                f"{resource} with identifier '{identifier}' was not found"
                if identifier
                else f"{resource} was not found"
            )
        super().__init__(message, details={"resource": resource, "id": identifier})


class ConflictError(AppError):
    """Uniqueness or state conflict, e.g. duplicate email or double check-in."""

    status_code = HTTPStatus.CONFLICT
    code = ErrorCode.CONFLICT
    message = "The request conflicts with the current state of the resource"


class TenantIsolationError(AppError):
    """An attempt to reach data outside the caller's tenant or branch."""

    status_code = HTTPStatus.FORBIDDEN
    code = ErrorCode.TENANT_ISOLATION_VIOLATION
    message = "Cross-tenant access violation"


class FinancialIntegrityError(AppError):
    """A financial invariant would be broken by this operation."""

    status_code = HTTPStatus.BAD_REQUEST
    code = ErrorCode.FINANCIAL_INTEGRITY_ERROR
    message = "Financial integrity violation or invalid accounting operation"


class RateLimitedError(AppError):
    """The caller exceeded a rate limit."""

    status_code = HTTPStatus.TOO_MANY_REQUESTS
    code = ErrorCode.RATE_LIMITED
    message = "Too many requests. Please retry later."

    def __init__(self, message: str | None = None, *, retry_after: int | None = None) -> None:
        super().__init__(message, details={"retryAfter": retry_after} if retry_after else None)
        self.retry_after = retry_after


class ServiceUnavailableError(AppError):
    """A dependency the request needs is unavailable."""

    status_code = HTTPStatus.SERVICE_UNAVAILABLE
    code = ErrorCode.SERVICE_UNAVAILABLE
    message = "A required service is currently unavailable"
