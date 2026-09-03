"""Church (tenant root) and Branch models.

Field lists are traced to ``lib/validation/settings.ts`` (``churchProfileSchema``,
``branchCreateSchema``) rather than ``docs/backend-database-plan.md``, which
also lists ``default_currency``/``timezone``/``status`` on ``churches``. Those
three have no source in the actual profile form; ``timezone``/``currency`` are
``AppSettings`` fields (``lib/types.ts``) that belong to the future ``settings``
table's ``appearance`` JSONB, a different entity. See
``backend/docs/adr/005-church-branch-tenant-root.md``.

``Branch.current_members`` from the branch add/edit forms is deliberately not
a column here: ``docs/backend-database-plan.md`` §7 rule 6 requires member
counts to be derived from the ledger, never client-supplied, and the Members
domain that would derive it does not exist yet.
"""

from __future__ import annotations

import uuid
from enum import StrEnum

from sqlalchemy import Enum, ForeignKey, Index, Integer, String, Text, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Church(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """The tenant root. A church's own ``id`` is the tenant id everywhere else.

    No ``tenant_id`` column: per ``backend-domain-map.md`` §4, "churches rows
    are the tenant roots themselves." Composing ``TenantScopedMixin`` here
    would be a self-reference.
    """

    __tablename__ = "churches"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    motto: Mapped[str | None] = mapped_column(String(255))
    vision: Mapped[str] = mapped_column(Text, nullable=False)
    mission: Mapped[str] = mapped_column(Text, nullable=False)
    core_values: Mapped[str] = mapped_column(Text, nullable=False)
    history: Mapped[str | None] = mapped_column(Text)
    founded: Mapped[str | None] = mapped_column(String(32))
    denomination: Mapped[str | None] = mapped_column(String(255))

    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    alternative_phone: Mapped[str | None] = mapped_column(String(32))
    website: Mapped[str | None] = mapped_column(String(255))

    street: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(255), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(32), nullable=False)
    country: Mapped[str] = mapped_column(String(255), nullable=False)

    facebook: Mapped[str | None] = mapped_column(String(255))
    twitter: Mapped[str | None] = mapped_column(String(255))
    instagram: Mapped[str | None] = mapped_column(String(255))
    youtube: Mapped[str | None] = mapped_column(String(255))

    senior_pastor: Mapped[str] = mapped_column(String(255), nullable=False)
    assistant_pastor: Mapped[str | None] = mapped_column(String(255))
    secretary: Mapped[str | None] = mapped_column(String(255))
    treasurer: Mapped[str | None] = mapped_column(String(255))


class BranchType(StrEnum):
    """Settled value set -- ``branchCreateSchema.type`` enum, verbatim."""

    HEADQUARTERS = "Headquarters"
    BRANCH = "Branch"
    MISSION = "Mission"
    OUTREACH_CENTER = "Outreach Center"


class BranchStatus(StrEnum):
    """Settled value set -- ``branchCreateSchema.status`` enum, verbatim."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    UNDER_CONSTRUCTION = "under-construction"


class Branch(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A church's physical location. Belongs to exactly one tenant.

    Declares ``tenant_id`` directly rather than composing
    ``TenantScopedMixin``: that mixin also adds a nullable ``branch_id``,
    which would be a branch referencing itself. This is also the first table
    where the tenant parent (``churches``) actually exists, so ``tenant_id``
    gets a real foreign key rather than the mixin's bare indexed column.

    ``UNIQUE(tenant_id, id)`` exists so that a *different* domain's
    ``(tenant_id, branch_id)`` composite foreign key can reference this
    table and prove a branch belongs to the referencing row's own tenant --
    see ``branch_scope_fk()`` in ``app/core/database/base.py`` and ADR-007.
    Postgres requires an FK's target columns to be covered by a unique
    constraint; the plain PK on ``id`` alone does not cover ``tenant_id``.
    """

    __tablename__ = "branches"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id"),
        UniqueConstraint("tenant_id", "name"),
        Index("ix_branches_tenant_id_status", "tenant_id", "status"),
        Index(
            "uq_branches_one_headquarters_per_tenant",
            "tenant_id",
            unique=True,
            postgresql_where=text("type = 'Headquarters'"),
        ),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("churches.id", ondelete="RESTRICT"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[BranchType] = mapped_column(
        Enum(
            BranchType,
            name="branch_type",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=BranchType.BRANCH,
    )
    established: Mapped[str] = mapped_column(String(32), nullable=False)

    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    alternative_phone: Mapped[str | None] = mapped_column(String(32))

    street: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(255), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(32), nullable=False)
    country: Mapped[str] = mapped_column(String(255), nullable=False)

    pastor: Mapped[str] = mapped_column(String(255), nullable=False)
    assistant_pastor: Mapped[str | None] = mapped_column(String(255))
    secretary: Mapped[str | None] = mapped_column(String(255))

    capacity: Mapped[int] = mapped_column(Integer, nullable=False)

    service_schedule: Mapped[str | None] = mapped_column(Text)
    facilities: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)

    status: Mapped[BranchStatus] = mapped_column(
        Enum(
            BranchStatus,
            name="branch_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=BranchStatus.ACTIVE,
    )
