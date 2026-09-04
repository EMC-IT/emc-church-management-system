"""Identity and access management: users, roles, permissions, branch assignments.

``User`` is the system's authenticated principal; the rest of this module is
the RBAC model it is authorised through -- the canonical role and permission
taxonomies from ``lib/authorization/`` (ADR-003), stored per ADR-008.

``User`` deliberately excludes fields that belong to phases not yet built:

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

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import CITEXT, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database.base import (
    Base,
    SoftDeleteMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    tenant_scoped_table_args,
)


class UserStatus(StrEnum):
    """Settled value set -- ``userAccountCreateSchema.status`` enum, verbatim."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"


class User(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    """An authenticated system principal. Not a Member -- see ADR-001.

    ``tenant_id`` is declared directly rather than via ``TenantScopedMixin``:
    the mixin's nullable ``branch_id`` models a single branch, but a user's
    branch access is many-to-many (``assignedBranchIds[]`` in the frontend
    ``SecurityContext``) and lives in :class:`UserBranchAssignment`, not in a
    column here. Same reasoning already applied to ``Branch.tenant_id``.

    ``role_id`` is nullable and carries a *composite* foreign key,
    ``(tenant_id, role_id) -> roles(tenant_id, id)``: a plain
    ``role_id -> roles.id`` would let a user in church A be granted a role
    belonging to church B, which is a privilege-escalation path across the
    tenant boundary, not merely a data error (ADR-007, ADR-008). Postgres
    composite FKs are MATCH SIMPLE, so a user with no role yet
    (``role_id IS NULL``) is exempt from the check, as intended. ``RESTRICT``
    means a role still held by any user cannot be deleted.

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
        ForeignKeyConstraint(
            ["tenant_id", "role_id"],
            ["roles.tenant_id", "roles.id"],
            ondelete="RESTRICT",
        ),
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

    role_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), index=True)

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


class PermissionCategory(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A grouping from ``PERMISSION_CATEGORIES``. Global, not tenant-scoped.

    Categories are canonical definitions, identical for every church, so they
    carry no ``tenant_id`` -- the same reasoning the database plan applies to
    ``permissions``. Tenants never create them; the registry seed owns this
    table entirely.
    """

    __tablename__ = "permission_categories"
    __table_args__ = (UniqueConstraint("key"),)

    key: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)


class Permission(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """One canonical permission code. Global, not tenant-scoped.

    ``code`` is the dot-notation identifier from ``lib/authorization/permissions.ts``
    verbatim (``members.view``, ``finance.expenses.create``) -- ADR-003 makes
    that taxonomy authoritative and the backend must not invent a parallel
    scheme.

    ``name``, ``description`` and ``category_id`` are nullable so that a code
    the canonical source defines but does not categorise can be seeded as
    exactly that, rather than forcing invented text into the catalogue. Two
    codes were in that state when this table was built
    (``pastoral-care.view``, ``pastoral-care.manage``); ADR-009 closed the gap
    upstream, and every seeded row now carries its metadata. The columns stay
    nullable because the recording mechanism is what keeps the next such gap
    honest -- see ADR-009.

    No ``resource``/``action`` columns: ``backend-database-plan.md`` lists
    them, but ``PermissionItem`` in the canonical source carries only
    ``id``/``name``/``description``, and splitting a code into resource and
    action is ambiguous for the three-segment codes
    (``sunday-school.classes.view``). Deriving them would be inventing
    structure the source does not have.
    """

    __tablename__ = "permissions"
    __table_args__ = (UniqueConstraint("code"),)

    code: Mapped[str] = mapped_column(String(128), nullable=False)
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("permission_categories.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    name: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)


class Role(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """A named permission bundle, owned by exactly one church.

    Roles are **per-tenant instances**, not global definitions: every church
    gets its own row for each of the six canonical roles, and may also create
    its own (``settings.roles.create``). ``tenant_id`` is therefore
    ``NOT NULL``, which is what lets ``users.role_id`` carry the composite
    foreign key that makes a cross-tenant role assignment impossible in the
    database rather than merely discouraged in service code. See ADR-008 --
    this deliberately departs from ``backend-database-plan.md``'s
    ``tenant_id NULL => system role`` sketch, which cannot support that
    constraint.

    ``tenant_id`` is declared here rather than composed from
    ``TenantScopedMixin`` because roles are tenant-wide reference data, not
    branch-scoped (``backend-domain-map.md`` §5 lists ``roles`` alongside
    ``church_profile`` as readable across branches). Composing the mixin would
    add an always-NULL ``branch_id`` and invent a branch scope the canonical
    contracts do not establish. Same reasoning already applied to ``Branch``
    and ``User``.

    ``key`` is the stable canonical identifier (``"SuperAdmin"``, ``"Admin"``,
    ... verbatim from ``ROLES``); ``name`` is the display label, which an
    admin may edit. The seed matches on ``key`` so renaming a role does not
    make a re-run create a duplicate. Tenant-created roles have no canonical
    identity and so carry ``key IS NULL`` -- multiple NULLs coexist under a
    unique constraint in Postgres, and the CHECK below keeps every *system*
    role keyed.

    No ``SoftDeleteMixin``: nothing in the canonical contracts restores a
    deleted role, and the ``ON DELETE RESTRICT`` on ``users.role_id`` already
    blocks deleting a role that still has holders, which is the lifecycle
    safety that matters here.
    """

    __tablename__ = "roles"
    __table_args__ = (
        # Required as the target of `users`' composite (tenant_id, role_id) FK;
        # the PK on `id` alone does not cover `tenant_id` (ADR-007).
        UniqueConstraint("tenant_id", "id"),
        UniqueConstraint("tenant_id", "key"),
        UniqueConstraint("tenant_id", "name"),
        CheckConstraint("NOT is_system OR key IS NOT NULL", name="system_role_has_key"),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("churches.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    key: Mapped[str | None] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class RolePermission(Base):
    """Which permissions a role grants. ``PK (role_id, permission_id)``.

    No ``tenant_id``: the pair's tenancy is fully determined by ``role_id``
    (permissions are global), so a column here would be a second, unenforced
    copy of a fact the FK already fixes -- and a redundant tenant column that
    can disagree with its parent is a cross-tenant hazard, not a safeguard.
    The composite primary key is what makes attaching the same permission to
    the same role twice impossible.

    ``role_id`` cascades: deleting a role should take its grants with it,
    since a grant has no meaning without its role. ``permission_id``
    restricts: a canonical permission still referenced by any role must not
    be deletable.
    """

    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("permissions.id", ondelete="RESTRICT"),
        primary_key=True,
    )


class UserBranchAssignment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Which branches a user may act in -- ``SecurityContext.assignedBranchIds``.

    A user's branch access is many-to-many (`lib/authorization/scope.ts`), so
    it lives here rather than as a column on ``users``, exactly as the ``User``
    docstring anticipated.

    ``tenant_id`` and ``branch_id`` are declared here rather than composed from
    ``TenantScopedMixin`` because ``branch_id`` must be ``NOT NULL`` -- an
    assignment that names no branch is not an assignment -- and the mixin's is
    nullable by design. The table args still come from
    :func:`tenant_scoped_table_args`, so the branch constraint is the same one
    every tenant-scoped model gets, and the tenant-scope guard checks this
    table on exactly the same terms as any other.

    Both foreign keys are composite against ``(tenant_id, id)``, so the user
    and the branch are provably the same church's -- a plain pair of
    single-column FKs would happily let tenant A's user be assigned to tenant
    B's branch (ADR-007).

    ``is_primary`` backs ``SecurityContext.branchId``, the single active
    branch, and is capped at one row per user by a partial unique index.
    """

    __tablename__ = "user_branch_assignments"
    __table_args__ = tenant_scoped_table_args(
        ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["users.tenant_id", "users.id"],
            ondelete="CASCADE",
        ),
        UniqueConstraint("user_id", "branch_id"),
        Index(
            "uq_user_branch_assignments_user_id_primary",
            "user_id",
            unique=True,
            postgresql_where=text("is_primary"),
        ),
    )

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("churches.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    branch_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
