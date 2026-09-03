"""User schema: creation, constraints, tenant integrity, email identity, and
password storage.

Response-schema redaction ("hash is not returned by public/user response
schemas") is not tested here: no Pydantic schema or endpoint exists yet for
User (out of scope for this phase, per the task boundary) -- that check
belongs with whichever future phase adds them.
"""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy.exc import IntegrityError, StatementError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.passwords import hash_password, verify_password
from app.domains.churches.models import Church
from app.domains.identity.models import User, UserStatus

pytestmark = pytest.mark.requires_db


def _church(**overrides: object) -> Church:
    defaults: dict[str, object] = {
        "name": "Grace Chapel",
        "vision": "A vision statement at least twenty characters long.",
        "mission": "A mission statement at least twenty characters long.",
        "core_values": "Core values at least twenty characters long.",
        "email": "info@gracechapel.example",
        "phone": "0244000000",
        "street": "12 Liberation Rd",
        "city": "Accra",
        "state": "Greater Accra",
        "postal_code": "00233",
        "country": "Ghana",
        "senior_pastor": "Rev. Ama Owusu",
    }
    defaults.update(overrides)
    return Church(**defaults)


def _user(tenant_id: uuid.UUID, **overrides: object) -> User:
    defaults: dict[str, object] = {
        "tenant_id": tenant_id,
        "first_name": "Ama",
        "last_name": "Owusu",
        "email": "ama.owusu@gracechapel.example",
        "username": "ama.owusu",
        "password_hash": hash_password("correct horse battery staple"),
        "status": UserStatus.ACTIVE,
        "require_password_change": True,
    }
    defaults.update(overrides)
    return User(**defaults)


class TestUserCreation:
    async def test_can_be_created(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        assert user.id is not None

    async def test_primary_key_is_a_generated_uuid(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        assert isinstance(user.id, uuid.UUID)

    async def test_required_field_missing_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id, first_name=None)
        db_session.add(user)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_timestamps_are_set_on_create(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        assert user.created_at is not None
        assert user.updated_at is not None


class TestTenantIntegrity:
    async def test_user_can_reference_a_valid_church(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        assert user.tenant_id == church.id

    async def test_user_cannot_reference_a_nonexistent_church(
        self, db_session: AsyncSession
    ) -> None:
        user = _user(tenant_id=uuid.uuid4())
        db_session.add(user)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_deleting_a_church_with_users_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_user(tenant_id=church.id))
        await db_session.flush()

        await db_session.delete(church)
        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestEmailIdentity:
    """Tenant-scoped uniqueness -- ADR-006."""

    async def test_same_email_in_same_tenant_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_user(tenant_id=church.id, username="ama.owusu"))
        await db_session.flush()

        db_session.add(_user(tenant_id=church.id, username="a.owusu.2"))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_same_email_in_different_tenants_is_allowed(
        self, db_session: AsyncSession
    ) -> None:
        church_a = _church(name="Grace Chapel")
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()

        db_session.add(_user(tenant_id=church_a.id, username="ama.owusu.a"))
        db_session.add(_user(tenant_id=church_b.id, username="ama.owusu.b"))
        await db_session.flush()

    async def test_email_comparison_is_case_insensitive(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(
            _user(
                tenant_id=church.id,
                email="Ama.Owusu@GraceChapel.example",
                username="u1",
            )
        )
        await db_session.flush()

        db_session.add(
            _user(tenant_id=church.id, email="ama.owusu@gracechapel.example", username="u2")
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_same_username_in_same_tenant_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_user(tenant_id=church.id, email="a@example.com", username="ama.owusu"))
        await db_session.flush()

        db_session.add(_user(tenant_id=church.id, email="b@example.com", username="ama.owusu"))
        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestPasswordStorage:
    async def test_hash_is_persisted_not_plaintext(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        plaintext = "correct horse battery staple"
        user = _user(tenant_id=church.id, password_hash=hash_password(plaintext))
        db_session.add(user)
        await db_session.flush()

        assert plaintext not in user.password_hash
        assert user.password_hash.startswith("$argon2id$")

    async def test_stored_hash_verifies_with_the_shared_utility(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        plaintext = "correct horse battery staple"
        user = _user(tenant_id=church.id, password_hash=hash_password(plaintext))
        db_session.add(user)
        await db_session.flush()
        await db_session.refresh(user)

        assert verify_password(plaintext, user.password_hash) is True
        assert verify_password("wrong password", user.password_hash) is False


class TestStatus:
    async def test_each_valid_status_can_be_stored(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        for index, status in enumerate(UserStatus):
            db_session.add(
                _user(
                    tenant_id=church.id,
                    email=f"user{index}@gracechapel.example",
                    username=f"user{index}",
                    status=status,
                )
            )
        await db_session.flush()

    async def test_invalid_status_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id, status="not-a-real-status")
        db_session.add(user)

        with pytest.raises((IntegrityError, StatementError, LookupError)):
            await db_session.flush()
