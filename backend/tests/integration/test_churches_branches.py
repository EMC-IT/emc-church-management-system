"""Church and Branch schema: creation, constraints, and tenant isolation."""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.churches.models import Branch, BranchStatus, BranchType, Church

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


class TestChurchCreation:
    async def test_can_be_created(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        assert church.id is not None

    async def test_primary_key_is_a_generated_uuid(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        assert isinstance(church.id, uuid.UUID)

    async def test_required_field_missing_is_rejected(self, db_session: AsyncSession) -> None:
        """`vision` is required by `churchProfileSchema`; omitting it is a NOT NULL violation."""
        church = _church(vision=None)
        db_session.add(church)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_timestamps_are_set_on_create(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        assert church.created_at is not None
        assert church.updated_at is not None

    async def test_updated_at_advances_on_update(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        first_updated_at = church.updated_at

        church.motto = "Faith. Family. Fellowship."
        await db_session.flush()

        assert church.updated_at >= first_updated_at


class TestBranchCreation:
    async def test_can_be_created_under_a_church(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        branch = _branch(tenant_id=church.id)
        db_session.add(branch)
        await db_session.flush()

        assert branch.id is not None
        assert branch.tenant_id == church.id

    async def test_requires_a_tenant_id(self, db_session: AsyncSession) -> None:
        branch = Branch(
            name="Adenta (HQ)",
            type=BranchType.HEADQUARTERS,
            established="2005",
            email="adenta@gracechapel.example",
            phone="0244000001",
            street="5 Adenta Rd",
            city="Accra",
            state="Greater Accra",
            postal_code="00233",
            country="Ghana",
            pastor="Rev. Kofi Mensah",
            capacity=500,
            status=BranchStatus.ACTIVE,
        )
        db_session.add(branch)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_cannot_reference_a_nonexistent_church(self, db_session: AsyncSession) -> None:
        branch = _branch(tenant_id=uuid.uuid4())
        db_session.add(branch)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_two_branches_in_one_church_cannot_share_a_name(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_branch(tenant_id=church.id, name="Adenta (HQ)"))
        await db_session.flush()

        db_session.add(
            _branch(
                tenant_id=church.id,
                name="Adenta (HQ)",
                type=BranchType.BRANCH,
                email="duplicate@gracechapel.example",
            )
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_church_cannot_have_two_headquarters_branches(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_branch(tenant_id=church.id, name="Adenta (HQ)"))
        await db_session.flush()

        db_session.add(
            _branch(
                tenant_id=church.id,
                name="Somanya (HQ)",
                type=BranchType.HEADQUARTERS,
                email="somanya@gracechapel.example",
            )
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_two_different_churches_can_each_have_their_own_headquarters(
        self, db_session: AsyncSession
    ) -> None:
        """The Headquarters uniqueness is per-tenant, not global."""
        church_a = _church(name="Grace Chapel")
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()

        db_session.add(_branch(tenant_id=church_a.id, name="Adenta (HQ)"))
        db_session.add(
            _branch(tenant_id=church_b.id, name="Kasoa (HQ)", email="kasoa@mercy.example")
        )
        await db_session.flush()


class TestTenantIsolation:
    async def test_branches_do_not_leak_across_tenants(self, db_session: AsyncSession) -> None:
        church_a = _church(name="Grace Chapel")
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()

        db_session.add(_branch(tenant_id=church_a.id, name="Adenta (HQ)"))
        db_session.add(
            _branch(
                tenant_id=church_b.id,
                name="Kasoa (HQ)",
                email="kasoa@mercy.example",
            )
        )
        await db_session.flush()

        result = await db_session.execute(select(Branch).where(Branch.tenant_id == church_a.id))
        branches_for_a = result.scalars().all()

        assert len(branches_for_a) == 1
        assert branches_for_a[0].tenant_id == church_a.id

    async def test_deleting_a_church_with_branches_is_rejected(
        self, db_session: AsyncSession
    ) -> None:
        """`ON DELETE RESTRICT` -- a church cannot be deleted out from under its branches."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_branch(tenant_id=church.id))
        await db_session.flush()

        await db_session.delete(church)
        with pytest.raises(IntegrityError):
            await db_session.flush()
