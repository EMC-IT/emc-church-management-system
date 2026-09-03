"""SQLAlchemy declarative base and model conventions.

Every persistent model in every domain inherits :class:`Base` and composes the
mixins here, so tenancy, timestamps and soft deletion are spelled the same way
across all twenty domains.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, MetaData, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column

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
    """

    @declared_attr.directive
    def id(cls) -> Mapped[uuid.UUID]:
        return mapped_column(
            UUID(as_uuid=True),
            primary_key=True,
            default=uuid.uuid4,
            server_default=text("gen_random_uuid()"),
        )


class TimestampMixin:
    """Creation and modification timestamps, maintained by the database."""

    @declared_attr.directive
    def created_at(cls) -> Mapped[datetime]:
        return mapped_column(
            DateTime(timezone=True),
            nullable=False,
            default=utcnow,
            server_default=func.now(),
        )

    @declared_attr.directive
    def updated_at(cls) -> Mapped[datetime]:
        return mapped_column(
            DateTime(timezone=True),
            nullable=False,
            default=utcnow,
            onupdate=utcnow,
            server_default=func.now(),
        )


class TenantScopedMixin:
    """Tenant and branch partitioning.

    ``tenant_id`` is non-nullable on every tenant-owned table. ``branch_id`` is
    nullable so tenant-wide reference data (categories, roles, church profile)
    can share the same table shape as branch-scoped operational data.

    The value is always derived from the authenticated principal, never from a
    request body -- see ``backend/AGENTS.md`` §7 and the security plan §4.
    """

    @declared_attr.directive
    def tenant_id(cls) -> Mapped[uuid.UUID]:
        return mapped_column(UUID(as_uuid=True), nullable=False, index=True)

    @declared_attr.directive
    def branch_id(cls) -> Mapped[uuid.UUID | None]:
        return mapped_column(UUID(as_uuid=True), nullable=True, index=True)


class SoftDeleteMixin:
    """Soft deletion for rows that history or finance still references."""

    @declared_attr.directive
    def deleted_at(cls) -> Mapped[datetime | None]:
        return mapped_column(DateTime(timezone=True), nullable=True, index=True)

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
