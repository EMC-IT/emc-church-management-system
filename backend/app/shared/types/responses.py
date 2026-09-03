"""Standard API response envelopes.

Shapes are fixed by ``api-documentations/Errors_Responses.md`` and by the
frontend's ``ApiResponse<T>`` / ``PaginatedResponse<T>`` in
``lib/types/common.ts``. The flat pagination shape is used (data, total, page,
limit, totalPages) because that is what ``PaginatedResponse<T>`` destructures.
"""

from __future__ import annotations

from typing import Any, Self

from pydantic import Field

from app.shared.types.base import ResponseModel


class SuccessResponse[T](ResponseModel):
    """Envelope for a single item.

    ``{"success": true, "data": {...}, "message": "..."}``
    """

    success: bool = True
    data: T
    message: str | None = None

    @classmethod
    def of(cls, data: T, message: str | None = None) -> Self:
        return cls(data=data, message=message)


class MessageResponse(ResponseModel):
    """Envelope for an operation with no body, e.g. logout or delete."""

    success: bool = True
    message: str


class PaginatedResponse[T](ResponseModel):
    """Envelope for a page of items.

    ``{"success": true, "data": [...], "total": 120, "page": 1,
       "limit": 20, "totalPages": 6}``
    """

    success: bool = True
    data: list[T]
    total: int = Field(ge=0, description="Total matching records across all pages")
    page: int = Field(ge=1, description="1-indexed page number")
    limit: int = Field(ge=1, description="Page size")
    total_pages: int = Field(ge=0, description="Total number of pages")

    @classmethod
    def of(cls, items: list[T], *, total: int, page: int, limit: int) -> Self:
        """Build a page, deriving ``total_pages`` so it can never disagree."""
        total_pages = (total + limit - 1) // limit if limit > 0 else 0
        return cls(data=items, total=total, page=page, limit=limit, total_pages=total_pages)


class FieldError(ResponseModel):
    """One field-level validation failure."""

    field: str
    message: str


class ErrorResponse(ResponseModel):
    """Standard error envelope.

    ``details`` and ``errors`` are omitted when empty so that simple errors
    stay small. ``request_id`` is always present so a user-reported failure can
    be traced to a log line.

    ``code`` is required rather than defaulted: this module sits below
    ``app.core.exceptions`` in the dependency order and must not import the
    code catalogue, and an error envelope should never be constructible
    without deciding what the error was.
    """

    success: bool = False
    code: str
    message: str
    errors: list[FieldError] | None = None
    details: dict[str, Any] | None = None
    request_id: str | None = None


class DependencyStatus(ResponseModel):
    """Health of a single downstream dependency."""

    name: str
    status: str
    latency_ms: float | None = None
    error: str | None = None


class HealthResponse(ResponseModel):
    """Liveness probe payload."""

    status: str
    service: str
    version: str
    environment: str


class ReadinessResponse(ResponseModel):
    """Readiness probe payload."""

    status: str
    service: str
    version: str
    environment: str
    dependencies: list[DependencyStatus]
