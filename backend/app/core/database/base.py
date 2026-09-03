"""SQLAlchemy declarative base and model conventions.

Every persistent model in every domain inherits :class:`Base` and composes the
mixins here, so tenancy, timestamps and soft deletion are spelled the same way
across all twenty domains.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, ForeignKeyConstraint, MetaData, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlalchemy.sql.schema import SchemaItem

# Deterministic constraint names. Without this, Alembic autogenerate emits
# database-assigned names that differ between environments, and a later
# migration cannot reliably drop a constraint by name.
NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(table_name)s_%(column_0_N_name)s",
    "uq": "uq_%(table_name)s_%(column_0_N_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_N_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


def utcnow() -> datetime:
    """Current time, always timezone-aware.

    Naive datetimes are a persistent source of off-by-hours defects in
    attendance streaks and financial period boundaries; the codebase never
    produces one.
    """
    return datetime.now(UTC)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


class UUIDPrimaryKeyMixin:
    """UUID primary key.

    Generated application-side so a service can reference a row's id before
    flushing, which matters for building an audit record and its subject in
    one transaction. ``gen_random_uuid()`` is the server-side default for rows
    inserted outside the ORM.

    A plain class-level ``mapped_column()``, not ``@declared_attr`` -- every
    subclass gets an identical column (no per-class variation such as a
    foreign-key target), and SQLAlchemy's declarative mixin machinery already
    copies a plain mixin column onto each mapped class's own table. The
    ``@declared_attr.directive`` form previously used here type-checked as
    ``Mapped[uuid.UUID]`` even at the *instance* level under strict mypy
    (confirmed against a plain-attribute control case), which broke on first
    real use -- e.g. ``Branch(tenant_id=some_church.id)``.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )


class TimestampMixin:
    """Creation and modification timestamps, maintained by the database."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=utcnow,
        onupdate=utcnow,
        server_default=func.now(),
    )


def branch_scope_fk() -> ForeignKeyConstraint:
    """The composite FK proving ``branch_id`` belongs to the same tenant.

    ``(tenant_id, branch_id) -> branches(tenant_id, id)``, not a plain
    ``branch_id -> branches.id``: a single-column FK only proves the branch
    exists *somewhere*, not that it belongs to the row's own church -- e.g.
    ``Member.tenant_id`` = Church A with ``Member.branch_id`` pointing at a
    Church B branch would pass a plain FK but is a real tenant-isolation
    violation. Postgres composite FKs use MATCH SIMPLE by default: any NULL
    member (here, ``branch_id IS NULL``) exempts the row from the check
    entirely, so tenant-wide (branch-unassigned) rows are unaffected. This
    requires ``branches`` to carry ``UNIQUE(tenant_id, id)`` in addition to
    its plain PK on ``id`` -- see ADR-007.

    A standalone function, not baked directly into
    ``TenantScopedMixin.__table_args__``: a subclass that needs
    ``__table_args__`` of its own (unique constraints, extra indexes) has
    its own definition fully shadow the mixin's declared_attr version rather
    than merge with it, so that subclass must call this directly and include
    it alongside its own entries. ``TenantScopedMixin`` itself still uses it
    below, so a subclass with no ``__table_args__`` of its own gets the
    constraint automatically.
    """
    return ForeignKeyConstraint(
        ["tenant_id", "branch_id"],
        ["branches.tenant_id", "branches.id"],
        ondelete="RESTRICT",
    )


class TenantScopedMixin:
    """Tenant and branch partitioning.

    ``tenant_id`` is non-nullable on every tenant-owned table and carries a
    real foreign key to ``churches.id`` -- see ADR-005 -- so a tenant-scoped
    row referencing a nonexistent or since-deleted church is impossible at
    the database level, not just convention. The target is a string
    (``"churches.id"``), which SQLAlchemy resolves lazily against the shared
    registry at mapper-configuration time: this module never imports the
    churches domain, so there is no import cycle between core and a domain
    package. ``ON DELETE RESTRICT`` matches the same choice already made for
    ``branches.tenant_id`` -- a church cannot be deleted while tenant-scoped
    data still references it.

    ``branch_id`` is nullable so tenant-wide reference data (categories,
    roles, church profile) can share the same table shape as branch-scoped
    operational data. Its same-tenant integrity is enforced by the composite
    FK in ``branch_scope_fk()`` above -- see ADR-007.

    The value is always derived from the authenticated principal, never from a
    request body -- see ``backend/AGENTS.md`` §7 and the security plan §4.
    """

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("churches.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    branch_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )

    @declared_attr.directive
    def __table_args__(cls) -> tuple[SchemaItem, ...]:
        return (branch_scope_fk(),)


class SoftDeleteMixin:
    """Soft deletion for rows that history or finance still references."""

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, index=True
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
