"""Pagination primitives."""

from __future__ import annotations

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.shared.pagination import (
    DEFAULT_LIMIT,
    DEFAULT_PAGE,
    MAX_LIMIT,
    Page,
    PaginationParams,
    SortOrder,
    pagination_params,
)


class TestDefaults:
    """Defaults match the shipped frontend contract."""

    def test_page_and_limit(self) -> None:
        """memberSearchSchema defaults to page 1, limit 20."""
        params = PaginationParams()
        assert params.page == DEFAULT_PAGE == 1
        assert params.limit == DEFAULT_LIMIT == 20

    def test_sort_order_defaults_to_ascending(self) -> None:
        assert PaginationParams().sort_order is SortOrder.ASC

    def test_sort_by_is_optional(self) -> None:
        assert PaginationParams().sort_by is None


class TestBounds:
    """Bounds are enforced server-side regardless of frontend validation."""

    def test_limit_is_capped(self) -> None:
        """'Maximum page size is 100 items' -- Income_Endpoints.md."""
        assert MAX_LIMIT == 100
        with pytest.raises(PydanticValidationError):
            PaginationParams(limit=MAX_LIMIT + 1)

    def test_limit_must_be_positive(self) -> None:
        with pytest.raises(PydanticValidationError):
            PaginationParams(limit=0)

    def test_page_must_be_positive(self) -> None:
        """Page numbers start from 1."""
        with pytest.raises(PydanticValidationError):
            PaginationParams(page=0)

    def test_negative_page_is_rejected(self) -> None:
        with pytest.raises(PydanticValidationError):
            PaginationParams(page=-1)

    def test_maximum_limit_is_accepted(self) -> None:
        assert PaginationParams(limit=MAX_LIMIT).limit == MAX_LIMIT

    def test_invalid_sort_order_is_rejected(self) -> None:
        with pytest.raises(PydanticValidationError):
            PaginationParams(sort_order="sideways")  # type: ignore[arg-type]


class TestOffset:
    @pytest.mark.parametrize(
        ("page", "limit", "expected"),
        [(1, 20, 0), (2, 20, 20), (3, 20, 40), (1, 100, 0), (5, 10, 40)],
    )
    def test_offset(self, page: int, limit: int, expected: int) -> None:
        assert PaginationParams(page=page, limit=limit).offset == expected

    def test_descending_flag(self) -> None:
        assert PaginationParams(sort_order=SortOrder.DESC).is_descending is True
        assert PaginationParams(sort_order=SortOrder.ASC).is_descending is False


class TestPage:
    """The repository-layer page container."""

    def test_total_pages(self) -> None:
        assert Page(items=[], total=120, page=1, limit=20).total_pages == 6

    def test_total_pages_rounds_up(self) -> None:
        assert Page(items=[], total=121, page=1, limit=20).total_pages == 7

    def test_total_pages_of_empty_result(self) -> None:
        assert Page(items=[], total=0, page=1, limit=20).total_pages == 0

    def test_navigation_flags_on_first_page(self) -> None:
        page: Page[str] = Page(items=["a"], total=60, page=1, limit=20)
        assert page.has_next is True
        assert page.has_previous is False

    def test_navigation_flags_on_last_page(self) -> None:
        page: Page[str] = Page(items=["a"], total=60, page=3, limit=20)
        assert page.has_next is False
        assert page.has_previous is True

    def test_empty_helper(self) -> None:
        params = PaginationParams(page=2, limit=50)
        page: Page[str] = Page.empty(params)
        assert page.items == []
        assert page.total == 0
        assert page.page == 2
        assert page.limit == 50

    def test_create_helper_carries_params(self) -> None:
        params = PaginationParams(page=3, limit=25)
        page = Page.create(["a", "b"], total=99, params=params)
        assert page.items == ["a", "b"]
        assert page.total == 99
        assert page.page == 3
        assert page.limit == 25

    def test_is_immutable(self) -> None:
        """A page is a value; a service must not mutate one in place."""
        page: Page[str] = Page(items=[], total=0, page=1, limit=20)
        with pytest.raises(AttributeError):
            page.total = 5  # type: ignore[misc]


class TestDependency:
    def test_builds_params(self) -> None:
        params = pagination_params(page=2, limit=50, sort_by="lastName", sort_order=SortOrder.DESC)
        assert params.page == 2
        assert params.limit == 50
        assert params.sort_by == "lastName"
        assert params.is_descending is True

    def test_defaults_match_the_model(self) -> None:
        assert pagination_params() == PaginationParams()
