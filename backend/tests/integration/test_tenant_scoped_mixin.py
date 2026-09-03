"""TenantScopedMixin.tenant_id: the foreign key to churches.id (ADR-005).

No real domain composes ``TenantScopedMixin`` yet (Phase 2B-2 is Users and
Members). A throwaway probe model stands in for "some future tenant-scoped
domain table" so the FK's actual Postgres behaviour is proven now, rather
than deferred until the first real domain that uses the mixin.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from typing import cast

import pytest
from sqlalchemy import String, Table, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database.base import Base, TenantScopedMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.domains.churches.models import Church

pytestmark = pytest.mark.requires_db


class _TenantScopedProbe(UUIDPrimaryKeyMixin, TenantScopedMixin, TimestampMixin, Base):
    __tablename__ = "_tenant_scoped_probe"

    name: Mapped[str] = mapped_column(String(50))


# DeclarativeBase types __table__ as FromClause; the concrete Table exposes
# the create()/drop() DDL methods this fixture needs.
_PROBE_TABLE = cast(Table, _TenantScopedProbe.__table__)


@pytest.fixture
async def probe_table(engine: AsyncEngine) -> AsyncGenerator[None]:
    """Recreate the probe table at setup, not drop it at teardown.

    Same reasoning as ``test_database.py``'s ``probe_table`` fixture: the
    test's own session still holds a lock when fixtures unwind in reverse
    setup order, so dropping at teardown would deadlock against it.
    """
    async with engine.begin() as connection:
        await connection.run_sync(lambda conn: _PROBE_TABLE.drop(conn, checkfirst=True))
        await connection.run_sync(lambda conn: _PROBE_TABLE.create(conn, checkfirst=True))
    yield


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


class TestTenantForeignKey:
    async def test_can_reference_an_existing_church(
        self, db_session: AsyncSession, probe_table: None
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        probe = _TenantScopedProbe(tenant_id=church.id, name="probe row")
        db_session.add(probe)
        await db_session.flush()

        assert probe.tenant_id == church.id

    async def test_cannot_reference_a_nonexistent_church(
        self, db_session: AsyncSession, probe_table: None
    ) -> None:
        probe = _TenantScopedProbe(tenant_id=uuid.uuid4(), name="orphan row")
        db_session.add(probe)

        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_deleting_a_church_with_dependents_is_rejected(
        self, db_session: AsyncSession, probe_table: None
    ) -> None:
        """Proves ``ON DELETE RESTRICT`` lives on the mixin's FK itself, not
        only on ``branches.tenant_id``'s separately-declared one."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_TenantScopedProbe(tenant_id=church.id, name="dependent row"))
        await db_session.flush()

        await db_session.delete(church)
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_data_does_not_leak_across_tenants(
        self, db_session: AsyncSession, probe_table: None
    ) -> None:
        church_a = _church(name="Grace Chapel")
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()

        db_session.add(_TenantScopedProbe(tenant_id=church_a.id, name="a-row"))
        db_session.add(_TenantScopedProbe(tenant_id=church_b.id, name="b-row"))
        await db_session.flush()

        result = await db_session.execute(
            select(_TenantScopedProbe).where(_TenantScopedProbe.tenant_id == church_a.id)
        )
        rows = result.scalars().all()

        assert len(rows) == 1
        assert rows[0].name == "a-row"
