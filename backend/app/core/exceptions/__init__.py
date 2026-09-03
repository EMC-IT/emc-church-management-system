"""Application exception hierarchy and global handlers."""

from app.core.exceptions.errors import (
    AppError,
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    ErrorCode,
    FinancialIntegrityError,
    NotFoundError,
    RateLimitedError,
    ServiceUnavailableError,
    TenantIsolationError,
    ValidationError,
)
from app.core.exceptions.handlers import register_exception_handlers

__all__ = [
    "AppError",
    "AuthenticationError",
    "AuthorizationError",
    "ConflictError",
    "ErrorCode",
    "FinancialIntegrityError",
    "NotFoundError",
    "RateLimitedError",
    "ServiceUnavailableError",
    "TenantIsolationError",
    "ValidationError",
    "register_exception_handlers",
]
