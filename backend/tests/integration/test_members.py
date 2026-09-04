"""Member schema: creation, constraints, and the same-tenant composite FK
integrity for the optional Branch/User relationships (ADR-007).
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

import pytest
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.passwords import hash_password
from app.domains.churches.models import Branch, BranchStatus, BranchType, Church
from app.domains.identity.models import User, UserStatus
from app.domains.members.models import Gender, Member

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


def _branch(tenant_id: uuid.UUID, **overrides: object) -> Branch:
    defaults: dict[str, object] = {
        "tenant_id": tenant_id,
        "name": "Adenta (HQ)",
        "type": BranchType.HEADQUARTERS,
        "established": "2005",
        "email": "adenta@gracechapel.example",
        "phone": "0244000001",
        "street": "5 Adenta Rd",
        "city": "Accra",
        "state": "Greater Accra",
        "postal_code": "00233",
        "country": "Ghana",
        "pastor": "Rev. Kofi Mensah",
        "capacity": 500,
        "status": BranchStatus.ACTIVE,
    }
    defaults.update(overrides)
    return Branch(**defaults)


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


def _member(tenant_id: uuid.UUID, **overrides: object) -> Member:
    defaults: dict[str, object] = {
        "tenant_id": tenant_id,
        "first_name": "Kwame",
        "last_name": "Mensah",
        "phone": "0244111222",
        "gender": Gender.MALE,
    }
    defaults.update(overrides)
    return Member(**defaults)


class TestMemberCreation:
    async def test_can_be_created(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id)
        db_session.add(member)
        await db_session.flush()

        assert member.id is not None

    async def test_primary_key_is_a_generated_uuid(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id)
        db_session.add(member)
        await db_session.flush()

        assert isinstance(member.id, uuid.UUID)

    async def test_required_field_missing_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id, first_name=None)
        db_session.add(member)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_timestamps_are_set_on_create(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id)
        db_session.add(member)
        await db_session.flush()

        assert member.created_at is not None
        assert member.updated_at is not None


class TestUserRelationship:
    async def test_member_can_exist_without_a_user(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id)
        db_session.add(member)
        await db_session.flush()

        assert member.user_id is None

    async def test_member_can_reference_a_valid_user(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        member = _member(tenant_id=church.id, user_id=user.id)
        db_session.add(member)
        await db_session.flush()

        assert member.user_id == user.id

    async def test_member_cannot_reference_a_nonexistent_user(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id, user_id=uuid.uuid4())
        db_session.add(member)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_deleting_a_linked_user_is_rejected(self, db_session: AsyncSession) -> None:
        """ON DELETE RESTRICT: the User hard-delete is blocked outright, so
        the Member is never at risk of losing data or being auto-deleted."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        member = _member(tenant_id=church.id, user_id=user.id)
        db_session.add(member)
        await db_session.flush()

        await db_session.delete(user)
        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestTenantIntegrity:
    """Member/User same-tenant enforcement -- mandatory per ADR-007."""

    async def test_member_and_user_in_same_tenant_is_allowed(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(tenant_id=church.id)
        db_session.add(user)
        await db_session.flush()

        member = _member(tenant_id=church.id, user_id=user.id)
        db_session.add(member)
        await db_session.flush()

        assert member.tenant_id == user.tenant_id

    async def test_member_and_user_in_different_tenants_is_rejected(
        self, db_session: AsyncSession
    ) -> None:
        church_a = _church(name="Grace Chapel")
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()

        user_in_b = _user(tenant_id=church_b.id)
        db_session.add(user_in_b)
        await db_session.flush()

        member_in_a = _member(tenant_id=church_a.id, user_id=user_in_b.id)
        db_session.add(member_in_a)

        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestBranchIntegrity:
    """Member/Branch same-tenant enforcement -- mandatory per ADR-007, since
    `branch` is an evidenced Member relationship (backend-domain-map.md §3)."""

    async def test_member_and_branch_in_same_tenant_is_allowed(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        branch = _branch(tenant_id=church.id)
        db_session.add(branch)
        await db_session.flush()

        member = _member(tenant_id=church.id, branch_id=branch.id)
        db_session.add(member)
        await db_session.flush()

        assert member.branch_id == branch.id

    async def test_member_and_branch_in_different_tenants_is_rejected(
        self, db_session: AsyncSession
    ) -> None:
        church_a = _church(name="Grace Chapel")
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()

        branch_in_b = _branch(tenant_id=church_b.id)
        db_session.add(branch_in_b)
        await db_session.flush()

        member_in_a = _member(tenant_id=church_a.id, branch_id=branch_in_b.id)
        db_session.add(member_in_a)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_member_cannot_reference_a_nonexistent_branch(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id, branch_id=uuid.uuid4())
        db_session.add(member)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_member_without_a_branch_is_allowed(self, db_session: AsyncSession) -> None:
        """NULL branch_id bypasses the composite FK check entirely (MATCH SIMPLE)."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id)
        db_session.add(member)
        await db_session.flush()

        assert member.branch_id is None


class TestMembershipStatus:
    async def test_a_value_from_each_candidate_taxonomy_can_be_stored(
        self, db_session: AsyncSession
    ) -> None:
        """'New' (Member.membershipStatus) and 'Suspended' (memberCreateSchema)
        are drawn from the two disagreeing candidate sets (OQ-04) -- the CHECK
        must accept both without picking a winner."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_member(tenant_id=church.id, phone="0244000010", membership_status="New"))
        db_session.add(
            _member(tenant_id=church.id, phone="0244000011", membership_status="Suspended")
        )
        await db_session.flush()

    async def test_invalid_membership_status_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        member = _member(tenant_id=church.id, membership_status="not-a-real-status")
        db_session.add(member)

        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestUniqueness:
    """Traced to Errors_Responses.md §5 -- 409 on email/phone collision."""

    async def test_same_email_in_same_tenant_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(
            _member(tenant_id=church.id, phone="0244000020", email="kwame@gracechapel.example")
        )
        await db_session.flush()

        db_session.add(
            _member(tenant_id=church.id, phone="0244000021", email="kwame@gracechapel.example")
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_same_phone_in_same_tenant_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_member(tenant_id=church.id, phone="0244000030"))
        await db_session.flush()

        db_session.add(_member(tenant_id=church.id, phone="0244000030"))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_soft_deleted_members_email_can_be_reused(self, db_session: AsyncSession) -> None:
        """The partial index excludes deleted_at IS NOT NULL rows."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        first = _member(tenant_id=church.id, phone="0244000040", email="reused@gracechapel.example")
        db_session.add(first)
        await db_session.flush()

        first.deleted_at = datetime.now(UTC)
        await db_session.flush()

        db_session.add(
            _member(tenant_id=church.id, phone="0244000041", email="reused@gracechapel.example")
        )
        await db_session.flush()
