"""Shared schema types and response envelopes."""

from app.shared.types.base import CamelModel, ResponseModel, StrictCamelModel
from app.shared.types.responses import (
    DependencyStatus,
    ErrorResponse,
    FieldError,
    HealthResponse,
    MessageResponse,
    PaginatedResponse,
    ReadinessResponse,
    SuccessResponse,
)

__all__ = [
    "CamelModel",
    "DependencyStatus",
    "ErrorResponse",
    "FieldError",
    "HealthResponse",
    "MessageResponse",
    "PaginatedResponse",
    "ReadinessResponse",
    "ResponseModel",
    "StrictCamelModel",
    "SuccessResponse",
]
