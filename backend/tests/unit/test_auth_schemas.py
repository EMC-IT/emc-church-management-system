"""Login request and response schemas.

The response shape is a contract with a frontend that already exists, so these
assert the exact wire names ``lib/types/auth.ts`` and the API documentation
specify -- and that credential material has no way to reach the wire at all.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.core.security.context import SecurityContext
from app.domains.identity.models import User, UserStatus
from app.domains.identity.schemas import AuthPayload, LoginRequest, RoleEnvelope, UserEnvelope

TENANT_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")
BRANCH_ID = uuid.UUID("33333333-3333-3333-3333-333333333333")


def _user(**overrides: object) -> User:
    user = User(
        tenant_id=TENANT_ID,
        first_name="Ama",
        last_name="Owusu",
        email="ama.owusu@gracechapel.example",
        username="ama.owusu",
        password_hash="$argon2id$v=19$m=65536,t=3,p=4$SECRET",
        status=UserStatus.ACTIVE,
        require_password_change=False,
        avatar_url=None,
    )
    user.id = uuid.uuid4()
    user.created_at = datetime(2026, 1, 21, 10, 30, tzinfo=UTC)
    user.updated_at = datetime(2026, 1, 21, 10, 30, tzinfo=UTC)
    for key, value in overrides.items():
        setattr(user, key, value)
    return user


def _context(**overrides: object) -> SecurityContext:
    defaults: dict[str, object] = {
        "user_id": uuid.uuid4(),
        "tenant_id": TENANT_ID,
        "role_id": uuid.uuid4(),
        "role_key": "Admin",
        "role_name": "Admin",
        "permissions": frozenset({"members.view", "dashboard.view"}),
        "assigned_branch_ids": frozenset({BRANCH_ID}),
        "primary_branch_id": BRANCH_ID,
    }
    defaults.update(overrides)
    return SecurityContext(**defaults)  # type: ignore[arg-type]


class TestLoginRequest:
    def test_accepts_the_documented_credentials(self) -> None:
        request = LoginRequest(email="admin@church.com", password="password123")
        assert request.email == "admin@church.com"

    def test_password_minimum_matches_the_frontend_schema(self) -> None:
        """``loginSchema`` requires six characters."""
        LoginRequest(email="a@b.example", password="123456")
        with pytest.raises(PydanticValidationError):
            LoginRequest(email="a@b.example", password="12345")

    def test_reserved_example_domains_are_accepted(self) -> None:
        """``EmailStr`` would reject these. The address is a lookup key for an
        account that already exists, so a format rule here can only lock
        someone out of an account creation allowed."""
        LoginRequest(email="pastor@gracechapel.example", password="password123")
        LoginRequest(email="pastor@church.test", password="password123")

    def test_unknown_fields_are_rejected(self) -> None:
        with pytest.raises(PydanticValidationError):
            LoginRequest(email="a@b.example", password="123456", tenantId="smuggled")  # type: ignore[call-arg]

    @pytest.mark.parametrize("missing", ["email", "password"])
    def test_missing_credentials_are_rejected(self, missing: str) -> None:
        payload = {"email": "a@b.example", "password": "123456"}
        del payload[missing]
        with pytest.raises(PydanticValidationError):
            LoginRequest(**payload)


class TestRoleEnvelope:
    def test_carries_the_documented_role_fields(self) -> None:
        wire = RoleEnvelope.of(_context())
        assert wire is not None
        assert set(wire.to_wire()) == {"name", "tenantId", "branchId", "permissions"}

    def test_permissions_are_the_flat_dot_notation_array(self) -> None:
        """What ``hasPermission()`` reads."""
        wire = RoleEnvelope.of(_context())
        assert wire is not None
        assert wire.permissions == ["dashboard.view", "members.view"]

    def test_branch_id_is_the_primary_branch(self) -> None:
        wire = RoleEnvelope.of(_context())
        assert wire is not None
        assert wire.branch_id == BRANCH_ID

    def test_a_user_with_no_role_gets_no_role_object(self) -> None:
        """Rather than a placeholder whose name would have to be invented; the
        frontend reads this with optional chaining."""
        assert RoleEnvelope.of(_context(role_key=None, role_name=None)) is None

    def test_full_assignment_list_is_not_exposed(self) -> None:
        context = _context(assigned_branch_ids=frozenset({BRANCH_ID, uuid.uuid4()}))
        wire = RoleEnvelope.of(context)
        assert wire is not None
        assert "assignedBranchIds" not in wire.to_wire()


class TestUserEnvelope:
    def test_carries_the_documented_user_fields(self) -> None:
        wire = UserEnvelope.of(_user(), _context()).to_wire()
        assert set(wire) >= {"id", "email", "name", "role", "createdAt", "updatedAt"}

    def test_name_is_derived_from_first_and_last(self) -> None:
        assert UserEnvelope.of(_user(), _context()).name == "Ama Owusu"

    def test_require_password_change_is_surfaced(self) -> None:
        """The state must not be silently discarded; the client decides what to
        do with it."""
        envelope = UserEnvelope.of(_user(require_password_change=True), _context())
        assert envelope.require_password_change is True
        assert envelope.to_wire()["requirePasswordChange"] is True

    def test_password_hash_has_no_field_and_cannot_be_serialised(self) -> None:
        assert "password_hash" not in UserEnvelope.model_fields
        wire = UserEnvelope.of(_user(), _context()).to_wire()
        assert "passwordHash" not in wire
        assert "SECRET" not in str(wire)

    @pytest.mark.parametrize(
        "leaked",
        ["passwordHash", "password_hash", "username", "status", "deletedAt", "notes"],
    )
    def test_no_internal_field_reaches_the_wire(self, leaked: str) -> None:
        assert leaked not in UserEnvelope.of(_user(), _context()).to_wire()

    def test_a_role_less_user_serialises_with_a_null_role(self) -> None:
        envelope = UserEnvelope.of(_user(), _context(role_key=None, role_name=None))
        assert envelope.role is None


class TestAuthPayload:
    def test_is_user_and_token_only(self) -> None:
        payload = AuthPayload(user=UserEnvelope.of(_user(), _context()), token="a.b.c")
        assert set(payload.to_wire()) == {"user", "token"}

    def test_carries_no_refresh_token(self) -> None:
        """Optional in the frontend's ``AuthResponse``; issuing one needs the
        deferred ``refresh_tokens`` table."""
        assert "refresh_token" not in AuthPayload.model_fields
