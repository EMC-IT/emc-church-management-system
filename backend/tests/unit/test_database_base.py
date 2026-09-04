"""Base model conventions shared by every domain."""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import cast

from sqlalchemy import Column, DateTime, Integer, String, Table, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database.base import (
    NAMING_CONVENTION,
    Base,
    SoftDeleteMixin,
    TenantScopedMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    tenant_scoped_table_args,
    utcnow,
)


class _Probe(Base, UUIDPrimaryKeyMixin, TenantScopedMixin, TimestampMixin, SoftDeleteMixin):
    """A throwaway model composing every mixin.

    Declared against a private metadata table name that no migration creates,
    so it exercises the conventions without touching the real schema.
    """

    __tablename__ = "_probe_model"
    __table_args__ = tenant_scoped_table_args()

    name: Mapped[str] = mapped_column(String(50))


# DeclarativeBase types __table__ as FromClause; the concrete Table exposes
# the primary key, indexes and column types these assertions inspect.
_PROBE_TABLE = cast(Table, _Probe.__table__)


class TestUtcNow:
    """Timestamps are always timezone-aware."""

    def test_is_timezone_aware(self) -> None:
        assert utcnow().tzinfo is not None

    def test_is_utc(self) -> None:
        assert utcnow().utcoffset() == datetime.now(UTC).utcoffset()


class TestPrimaryKey:
    def test_column_is_the_primary_key(self) -> None:
        assert _Probe.__table__.c.id.primary_key is True

    def test_default_generates_a_uuid(self) -> None:
        """Generated application-side so a service can reference the id
        before flushing, which is what lets an audit record and its subject be
        written in one transaction."""
        generated = _Probe.__table__.c.id.default.arg(None)
        assert isinstance(generated, uuid.UUID)

    def test_has_a_server_side_default(self) -> None:
        """Covers rows inserted outside the ORM (migrations, bulk loads)."""
        server_default = _Probe.__table__.c.id.server_default
        assert "gen_random_uuid()" in str(server_default.arg)


class TestTenantScope:
    def test_tenant_id_is_required(self) -> None:
        """Every tenant-owned row must carry its tenant."""
        assert _Probe.__table__.c.tenant_id.nullable is False

    def test_tenant_id_is_indexed(self) -> None:
        """Every query filters on it."""
        assert _Probe.__table__.c.tenant_id.index is True

    def test_branch_id_is_optional(self) -> None:
        """Tenant-wide reference data shares the table shape."""
        assert _Probe.__table__.c.branch_id.nullable is True

    def test_branch_id_is_indexed(self) -> None:
        assert _Probe.__table__.c.branch_id.index is True


class TestTimestamps:
    def test_both_are_required(self) -> None:
        assert _Probe.__table__.c.created_at.nullable is False
        assert _Probe.__table__.c.updated_at.nullable is False

    def test_both_are_timezone_aware(self) -> None:
        created = _PROBE_TABLE.c.created_at.type
        updated = _PROBE_TABLE.c.updated_at.type
        assert isinstance(created, DateTime)
        assert isinstance(updated, DateTime)
        assert created.timezone is True
        assert updated.timezone is True

    def test_updated_at_has_an_onupdate_hook(self) -> None:
        assert _Probe.__table__.c.updated_at.onupdate is not None

    def test_created_at_has_no_onupdate_hook(self) -> None:
        assert _Probe.__table__.c.created_at.onupdate is None


class TestSoftDelete:
    """Soft deletion for rows history and finance still reference."""

    def test_column_is_nullable_and_indexed(self) -> None:
        column = _Probe.__table__.c.deleted_at
        assert column.nullable is True
        assert column.index is True

    def test_is_deleted_reflects_the_column(self) -> None:
        probe = _Probe(name="x")
        assert probe.is_deleted is False
        probe.deleted_at = utcnow()
        assert probe.is_deleted is True


class TestNamingConvention:
    """Deterministic constraint names.

    Without these, autogenerate emits database-assigned names that differ
    between environments and a later migration cannot drop a constraint by
    name.
    """

    def test_metadata_carries_the_convention(self) -> None:
        assert Base.metadata.naming_convention == NAMING_CONVENTION

    def test_primary_key_name(self) -> None:
        assert _PROBE_TABLE.primary_key.name == "pk__probe_model"

    def test_index_name(self) -> None:
        names = {index.name for index in _PROBE_TABLE.indexes}
        assert "ix__probe_model_tenant_id" in names

    def test_unique_constraint_name(self) -> None:
        table = Table(
            "_probe_unique",
            Base.metadata,
            Column("id", Integer, primary_key=True),
            Column("tenant_id", Integer),
            Column("email", String(255)),
            UniqueConstraint("tenant_id", "email"),
        )
        constraint = next(c for c in table.constraints if isinstance(c, UniqueConstraint))
        assert constraint.name == "uq__probe_unique_tenant_id_email"
