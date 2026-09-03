"""User: the system's authenticated identity/principal.

Deliberately excludes fields that belong to phases not yet built:

- No ``role_id`` -- the Roles domain does not exist yet. An FK to a
  nonexistent table isn't possible, and a placeholder column invites exactly
  the half-built state ``backend/AGENTS.md`` §19 warns against.
- No ``failed_login_count``/``locked_until`` -- lockout is named only as a
  future *test* requirement in ``backend-implementation-plan.md`` (Phase 2
  exit criteria), not a concrete field anywhere in the frontend contract.
  These columns are only useful once the login flow that enforces them
  exists; they belong with that logic, not speculatively ahead of it.
- No stored ``name`` (display) -- ``first_name``/``last_name`` are the
  evidenced source of truth (``userAccountCreateSchema``); the combined
  display name ``lib/types/auth.ts``'s ``User.name`` shows is derived at the
  application layer when built, not persisted as a second copy that could
  drift out of sync.

See ``backend/docs/adr/006-user-tenant-scoped-email-identity.md`` for the
tenant-scoped email/username uniqueness decision.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import CITEXT, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class UserStatus(StrEnum):
    """Settled value set -- ``userAccountCreateSchema.status`` enum, verbatim."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class User(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """An authenticated system principal. Not a Member -- see ADR-001.

    ``tenant_id`` is declared directly rather than via ``TenantScopedMixin``:
    the mixin's nullable ``branch_id`` models a single branch, but a user's
    branch access is many-to-many (``UserBranchAssignment`` in
    ``backend-domain-map.md`` §3, ``assignedBranchIds[]`` in the frontend
    ``SecurityContext``) -- a future join table, not a column here. Same
    reasoning already applied to ``Branch.tenant_id``.

    ``SoftDeleteMixin`` is composed because financial and audit records
    reference ``recorded_by_user_id``/``approved_by_user_id`` -- hard-deleting
    a user would orphan that history, the same reasoning the database plan
    already applies to member, financial and file tables.

    ``UNIQUE(tenant_id, id)`` exists so ``members.user_id`` can use a
    composite foreign key (``(tenant_id, user_id) -> users(tenant_id, id)``)
    proving a Member's optional User link belongs to the Member's own
    tenant -- see ADR-007. The plain PK on ``id`` does not cover
    ``tenant_id``, which Postgres requires for an FK target.
    """

    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("tenant_id", "id"),
        UniqueConstraint("tenant_id", "email"),
        UniqueConstraint("tenant_id", "username"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("churches.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(CITEXT, nullable=False)
    username: Mapped[str] = mapped_column(CITEXT, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32))

    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    department: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[UserStatus] = mapped_column(
        Enum(
            UserStatus,
            name="user_status",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=UserStatus.ACTIVE,
    )
    require_password_change: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    notes: Mapped[str | None] = mapped_column(Text)
