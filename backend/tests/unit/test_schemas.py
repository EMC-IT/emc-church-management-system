"""Response envelopes and base model conventions."""

from __future__ import annotations

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.shared.types.base import CamelModel, ResponseModel
from app.shared.types.responses import (
    ErrorResponse,
    FieldError,
    MessageResponse,
    PaginatedResponse,
    SuccessResponse,
)


class _Member(ResponseModel):
    member_id: str
    first_name: str
    total_given: int = 0


class _MemberInput(CamelModel):
    first_name: str
    last_name: str


class TestCamelCaseConvention:
    """The frontend consumes camelCase throughout (lib/types/**)."""

    def test_serializes_to_camel_case(self) -> None:
        member = _Member(member_id="m-1", first_name="Ama")
        assert member.model_dump() == {
            "memberId": "m-1",
            "firstName": "Ama",
            "totalGiven": 0,
        }

    def test_accepts_camel_case_input(self) -> None:
        parsed = _MemberInput.model_validate({"firstName": "Ama", "lastName": "Mensah"})
        assert parsed.first_name == "Ama"

    def test_accepts_snake_case_input(self) -> None:
        """populate_by_name keeps internal construction ergonomic."""
        parsed = _MemberInput.model_validate({"first_name": "Ama", "last_name": "Mensah"})
        assert parsed.last_name == "Mensah"

    def test_python_attributes_stay_snake_case(self) -> None:
        member = _Member(member_id="m-1", first_name="Ama")
        assert member.member_id == "m-1"

    def test_to_wire_drops_none(self) -> None:
        assert "totalGiven" in _Member(member_id="m-1", first_name="Ama").to_wire()


class TestInputStrictness:
    """Request schemas reject what they do not understand."""

    def test_unknown_fields_are_rejected(self) -> None:
        """Silently ignoring an unknown field hides client-side typos."""
        with pytest.raises(PydanticValidationError):
            _MemberInput.model_validate({"firstName": "Ama", "lastName": "Mensah", "isAdmin": True})

    def test_whitespace_is_stripped(self) -> None:
        parsed = _MemberInput.model_validate({"firstName": "  Ama  ", "lastName": "Mensah"})
        assert parsed.first_name == "Ama"

    def test_response_models_ignore_unknown_attributes(self) -> None:
        """An ORM row gaining a column must not widen an API response."""
        assert _Member.model_validate(
            {"memberId": "m-1", "firstName": "Ama", "internalNote": "secret"}
        ).model_dump() == {"memberId": "m-1", "firstName": "Ama", "totalGiven": 0}


class TestSuccessEnvelope:
    """{"success": true, "data": ..., "message": ...}"""

    def test_shape(self) -> None:
        payload = SuccessResponse[_Member].of(
            _Member(member_id="m-1", first_name="Ama"), "Member created successfully"
        )
        assert payload.model_dump() == {
            "success": True,
            "data": {"memberId": "m-1", "firstName": "Ama", "totalGiven": 0},
            "message": "Member created successfully",
        }

    def test_message_is_optional(self) -> None:
        payload = SuccessResponse[_Member].of(_Member(member_id="m-1", first_name="Ama"))
        assert payload.message is None

    def test_message_only_envelope(self) -> None:
        assert MessageResponse(message="Member deleted successfully").model_dump() == {
            "success": True,
            "message": "Member deleted successfully",
        }


class TestPaginatedEnvelope:
    """Flat shape, matching lib/types/common.ts PaginatedResponse<T>."""

    def test_shape(self) -> None:
        page = PaginatedResponse[_Member].of(
            [_Member(member_id="m-1", first_name="Ama")], total=120, page=1, limit=20
        )
        dumped = page.model_dump()
        assert dumped["success"] is True
        assert dumped["total"] == 120
        assert dumped["page"] == 1
        assert dumped["limit"] == 20
        assert dumped["totalPages"] == 6
        assert isinstance(dumped["data"], list)

    def test_data_is_a_top_level_list(self) -> None:
        """Not nested under data.data -- see OQ-API-02."""
        page = PaginatedResponse[_Member].of([], total=0, page=1, limit=20)
        assert page.model_dump()["data"] == []

    @pytest.mark.parametrize(
        ("total", "limit", "expected"),
        [(0, 20, 0), (1, 20, 1), (20, 20, 1), (21, 20, 2), (120, 20, 6), (119, 20, 6)],
    )
    def test_total_pages_is_derived(self, total: int, limit: int, expected: int) -> None:
        """Derived, so it can never disagree with total and limit."""
        page = PaginatedResponse[_Member].of([], total=total, page=1, limit=limit)
        assert page.total_pages == expected


class TestErrorEnvelope:
    """Shape from api-documentations/Errors_Responses.md."""

    def test_minimal_error(self) -> None:
        error = ErrorResponse(code="NOT_FOUND", message="Member was not found")
        assert error.model_dump(exclude_none=True) == {
            "success": False,
            "code": "NOT_FOUND",
            "message": "Member was not found",
        }

    def test_validation_error_with_field_details(self) -> None:
        error = ErrorResponse(
            code="VALIDATION_ERROR",
            message="Validation failed for submitted data",
            errors=[FieldError(field="amount", message="Amount must be greater than zero")],
        )
        dumped = error.model_dump(exclude_none=True)
        assert dumped["errors"] == [
            {"field": "amount", "message": "Amount must be greater than zero"}
        ]

    def test_request_id_is_serialized_as_camel_case(self) -> None:
        error = ErrorResponse(code="NOT_FOUND", message="x", request_id="abc-123")
        assert error.model_dump(exclude_none=True)["requestId"] == "abc-123"

    def test_code_is_required(self) -> None:
        """An error envelope should not be constructible without a code."""
        with pytest.raises(PydanticValidationError):
            ErrorResponse.model_validate({"message": "something went wrong"})
