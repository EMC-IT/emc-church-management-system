"""Add users

Revision ID: 0003
Revises: 0002
Created: Phase 2B-2 -- User identity foundation

``users`` is the authenticated system principal, distinct from a future
``members`` table (ADR-001). Field lists trace to
``lib/validation/settings.ts`` (``userAccountCreateSchema``) and
``lib/types/auth.ts`` -- see ``app/domains/identity/models.py`` for the full
source-mapping note and deliberate omissions (``role_id``, lockout counters,
a stored display ``name``).

``email``/``username`` use ``CITEXT`` (enabled in 0001 for exactly this
purpose) rather than ``VARCHAR`` + a functional index on ``lower()``.

Migration review checklist (backend/AGENTS.md §13):
  - [x] No data loss -- new table only, no existing data affected
  - [x] Indexes: `tenant_id` (FK lookups), `deleted_at` (soft-delete filter,
        from `SoftDeleteMixin`) -- both already indexed by the mixins,
        `(tenant_id, email)`/`(tenant_id, username)` unique constraints
        additionally serve as tenant-scoped lookup indexes
  - [x] Foreign key: `users.tenant_id -> churches.id`, `ON DELETE RESTRICT`
        -- same choice as `branches.tenant_id`; a church with user accounts
        cannot be deleted out from under them
  - [x] Nullability matches `userAccountCreateSchema`: `phone`, `department`,
        `avatar_url`, `last_login_at`, `notes` are optional there and
        nullable here; everything else required in the form is `NOT NULL`
  - [x] Uniqueness: `(tenant_id, email)` and `(tenant_id, username)` --
        tenant-scoped, not global, per
        docs/adr/006-user-tenant-scoped-email-identity.md
  - [x] Tenant isolation: `users.tenant_id` is a real foreign key
  - [x] Performance: one new table, no existing data to migrate
  - [x] downgrade() drops the table, its indexes, and the `user_status`
        native ENUM type -- `op.drop_table()` does not drop a dropped
        column's ENUM type on its own (same issue caught and fixed in 0002)
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003"
down_revision: str | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("first_name", sa.String(length=255), nullable=False),
        sa.Column("last_name", sa.String(length=255), nullable=False),
        sa.Column("email", postgresql.CITEXT(), nullable=False),
        sa.Column("username", postgresql.CITEXT(), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("department", sa.String(length=255), nullable=True),
        sa.Column(
            "status",
            sa.Enum("active", "inactive", "suspended", name="user_status"),
            nullable=False,
        ),
        sa.Column("require_password_change", sa.Boolean(), nullable=False),
        sa.Column("avatar_url", sa.String(length=255), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["churches.id"],
            name=op.f("fk_users_tenant_id_churches"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_users")),
        sa.UniqueConstraint("tenant_id", "email", name=op.f("uq_users_tenant_id_email")),
        sa.UniqueConstraint("tenant_id", "username", name=op.f("uq_users_tenant_id_username")),
    )
    op.create_index(op.f("ix_users_deleted_at"), "users", ["deleted_at"], unique=False)
    op.create_index(op.f("ix_users_tenant_id"), "users", ["tenant_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_tenant_id"), table_name="users")
    op.drop_index(op.f("ix_users_deleted_at"), table_name="users")
    op.drop_table("users")
    sa.Enum(name="user_status").drop(op.get_bind(), checkfirst=True)
