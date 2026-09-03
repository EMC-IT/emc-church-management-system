"""Pagination, sorting and search primitives.

Bounds come from the shipped frontend contract:
``lib/validation/members.ts::memberSearchSchema`` caps ``limit`` at 100 and
defaults it to 20, and ``api-documentations/Income_Endpoints.md`` states
"Default page size is 20 items. Maximum page size is 100 items." Those bounds
are enforced here once rather than repeated per endpoint.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Annotated, Self

from fastapi import Query
from pydantic import Field

from app.shared.types.base import CamelModel

DEFAULT_PAGE = 1
DEFAULT_LIMIT = 20
MAX_LIMIT = 100


class SortOrder(StrEnum):
    """Sort direction, matching the frontend's ``'asc' | 'desc'``."""

    ASC = "asc"
    DESC = "desc"


class PaginationParams(CamelModel):
    """Page, size and sort, as accepted on list endpoints."""

    page: int = Field(default=DEFAULT_PAGE, ge=1, description="1-indexed page number")
    limit: int = Field(
        default=DEFAULT_LIMIT,
        ge=1,
        le=MAX_LIMIT,
        description=f"Page size (max {MAX_LIMIT})",
    )
    sort_by: str | None = Field(default=None, description="Field to sort by")
    sort_order: SortOrder = Field(default=SortOrder.ASC, description="Sort direction")

    @property
    def offset(self) -> int:
        """Rows to skip for this page."""
        return (self.page - 1) * self.limit

    @property
    def is_descending(self) -> bool:
        return self.sort_order is SortOrder.DESC


def pagination_params(
    page: Annotated[int, Query(ge=1, description="1-indexed page number")] = DEFAULT_PAGE,
    limit: Annotated[
        int, Query(ge=1, le=MAX_LIMIT, description=f"Page size (max {MAX_LIMIT})")
    ] = DEFAULT_LIMIT,
    sort_by: Annotated[str | None, Query(alias="sortBy")] = None,
    sort_order: Annotated[SortOrder, Query(alias="sortOrder")] = SortOrder.ASC,
) -> PaginationParams:
    """FastAPI dependency yielding validated :class:`PaginationParams`."""
    return PaginationParams(page=page, limit=limit, sort_by=sort_by, sort_order=sort_order)


@dataclass(frozen=True, slots=True)
class Page[T]:
    """An in-memory page of results plus the total match count.

    Repositories return this; routers convert it to a
    :class:`~app.shared.types.responses.PaginatedResponse`. Keeping the two
    apart stops HTTP concerns leaking into the data layer.
    """

    items: list[T]
    total: int
    page: int
    limit: int

    @property
    def total_pages(self) -> int:
        if self.limit <= 0:
            return 0
        return (self.total + self.limit - 1) // self.limit

    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages

    @property
    def has_previous(self) -> bool:
        return self.page > 1

    @classmethod
    def empty(cls, params: PaginationParams) -> Self:
        return cls(items=[], total=0, page=params.page, limit=params.limit)

    @classmethod
    def create(cls, items: list[T], total: int, params: PaginationParams) -> Self:
        return cls(items=items, total=total, page=params.page, limit=params.limit)
