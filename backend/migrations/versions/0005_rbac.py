"""Add RBAC: permissions, roles, role grants, user branch assignments

Revision ID: 0005
Revises: 0004
Created: Phase 2B-4A -- RBAC database foundation

Stores the canonical authorization model from ``lib/authorization/roles.ts``
and ``lib/authorization/permissions.ts``, which ADR-003 makes authoritative.
No new taxonomy is introduced: the codes and role names seeded into these
tables are those files verbatim (see ``app/domains/identity/rbac_registry.py``).

``permission_categories`` and ``permissions`` are global -- canonical
definitions identical for every church. ``roles`` are per-tenant instances:
every church gets its own row for each canonical role. ADR-008 explains why,
and why that departs from ``backend-database-plan.md``'s ``tenant_id NULL =>
system role`` sketch.

This migration creates no rows. Seeding is
``app/domains/identity/rbac_seed.py``, because the per-tenant half has to run
whenever a church is provisioned, not once at deploy time.

Migration review checklist (backend/CLAUDE.md §13):
  - [x] No data loss -- four new tables plus one nullable column on `users`.
        `users.role_id` is nullable with no default, so every existing row
        stays valid and unchanged; MATCH SIMPLE exempts those NULL rows from
        the new composite foreign key
  - [x] Indexes: `roles.tenant_id`, `permissions.category_id`,
        `users.role_id`, and `tenant_id`/`user_id`/`branch_id` on
        `user_branch_assignments` -- every foreign key is covered, which
        matters because all of them are RESTRICT/CASCADE and Postgres scans
        the referencing side on every parent delete. `role_permissions` needs
        no extra index: its PK `(role_id, permission_id)` already serves the
        "permissions of this role" lookup that authorization performs on
        every request
  - [x] Foreign keys and ON DELETE:
        - `roles.tenant_id -> churches.id`, RESTRICT -- matches every other
          tenant-owned table
        - `permissions.category_id -> permission_categories.id`, RESTRICT --
          a category with permissions in it is not deletable
        - `role_permissions.role_id -> roles.id`, CASCADE -- a grant has no
          meaning without its role, and deleting a role should not be blocked
          by the rows that describe it
        - `role_permissions.permission_id -> permissions.id`, RESTRICT --
          a canonical permission still granted by some role must not vanish
          out from under it
        - `users.(tenant_id, role_id) -> roles(tenant_id, id)`, RESTRICT --
          composite, not a plain `role_id -> roles.id`. This is the
          privilege-escalation boundary: a plain FK would accept a role
          belonging to another church. RESTRICT also means a role still held
          by a user cannot be deleted (ADR-007, ADR-008)
        - `user_branch_assignments.(tenant_id, user_id) -> users(tenant_id, id)`,
          CASCADE -- an assignment is meaningless without its user, unlike
          `members.user_id`, which is an independent record and so RESTRICTs
        - `user_branch_assignments.(tenant_id, branch_id) -> branches(tenant_id, id)`,
          RESTRICT -- a branch with users assigned should not be deletable
  - [x] Nullability: `roles.key` is nullable because tenant-created roles have
        no canonical identity; the CHECK `NOT is_system OR key IS NOT NULL`
        keeps every seeded role keyed. `permissions.name`/`description`/
        `category_id` are nullable because two canonical codes
        (`pastoral-care.view`, `pastoral-care.manage`) are defined and granted
        but categorised nowhere, so the source supplies none of the three --
        recorded as NULL rather than invented (ADR-008)
  - [x] Uniqueness: `roles` is unique on `(tenant_id, key)` and
        `(tenant_id, name)`, both tenant-scoped, so the same canonical role
        exists once per church and many times across churches. `permissions`
        is unique on `code` alone and `permission_categories` on `key` alone
        -- deliberately global, not tenant-scoped. `role_permissions`' PK
        makes a duplicate grant impossible. `user_branch_assignments` is
        unique on `(user_id, branch_id)`, plus a partial unique index on
        `user_id WHERE is_primary` allowing at most one primary branch per
        user
  - [x] Tenant isolation: `roles.tenant_id` is NOT NULL, and both
        `users.role_id` and `user_branch_assignments` reach their targets
        through composite `(tenant_id, ...)` foreign keys, so a cross-tenant
        role assignment or branch assignment is rejected by the database
        rather than by service code. `roles` carries `UNIQUE(tenant_id, id)`
        so it can be such a target. `role_permissions` deliberately has no
        `tenant_id`: `role_id` already fixes the tenancy, and a second copy
        that could disagree with its parent would be a hazard, not a
        safeguard
  - [x] Performance: four empty tables; the only change to an existing table
        is `ALTER TABLE users ADD COLUMN role_id UUID NULL`, which is a
        metadata-only operation in Postgres 11+ (no default, no rewrite)
  - [x] downgrade() drops `users.role_id` and its composite FK *before*
        dropping `roles`, and drops the two join/assignment tables before
        their parents -- verified by a full downgrade/re-upgrade cycle
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "permission_categories",
        sa.Column("key", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
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
        sa.PrimaryKeyConstraint("id", name=op.f("pk_permission_categories")),
        sa.UniqueConstraint("key", name=op.f("uq_permission_categories_key")),
    )
    op.create_table(
        "permissions",
        sa.Column("code", sa.String(length=128), nullable=False),
        sa.Column("category_id", sa.UUID(), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["permission_categories.id"],
            name=op.f("fk_permissions_category_id_permission_categories"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_permissions")),
        sa.UniqueConstraint("code", name=op.f("uq_permissions_code")),
    )
    op.create_index(
        op.f("ix_permissions_category_id"), "permissions", ["category_id"], unique=False
    )
    op.create_table(
        "roles",
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("key", sa.String(length=64), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_system", sa.Boolean(), nullable=False),
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
        sa.CheckConstraint(
            "NOT is_system OR key IS NOT NULL", name=op.f("ck_roles_system_role_has_key")
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["churches.id"],
            name=op.f("fk_roles_tenant_id_churches"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_roles")),
        sa.UniqueConstraint("tenant_id", "id", name=op.f("uq_roles_tenant_id_id")),
        sa.UniqueConstraint("tenant_id", "key", name=op.f("uq_roles_tenant_id_key")),
        sa.UniqueConstraint("tenant_id", "name", name=op.f("uq_roles_tenant_id_name")),
    )
    op.create_index(op.f("ix_roles_tenant_id"), "roles", ["tenant_id"], unique=False)
    op.create_table(
        "role_permissions",
        sa.Column("role_id", sa.UUID(), nullable=False),
        sa.Column("permission_id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(
            ["permission_id"],
            ["permissions.id"],
            name=op.f("fk_role_permissions_permission_id_permissions"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["role_id"],
            ["roles.id"],
            name=op.f("fk_role_permissions_role_id_roles"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("role_id", "permission_id", name=op.f("pk_role_permissions")),
    )
    op.create_table(
        "user_branch_assignments",
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("branch_id", sa.UUID(), nullable=False),
        sa.Column("is_primary", sa.Boolean(), nullable=False),
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
        sa.ForeignKeyConstraint(
            ["tenant_id", "branch_id"],
            ["branches.tenant_id", "branches.id"],
            name=op.f("fk_user_branch_assignments_tenant_id_branch_id_branches"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["users.tenant_id", "users.id"],
            name=op.f("fk_user_branch_assignments_tenant_id_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["churches.id"],
            name=op.f("fk_user_branch_assignments_tenant_id_churches"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_branch_assignments")),
        sa.UniqueConstraint(
            "user_id", "branch_id", name=op.f("uq_user_branch_assignments_user_id_branch_id")
        ),
    )
    op.create_index(
        op.f("ix_user_branch_assignments_branch_id"),
        "user_branch_assignments",
        ["branch_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_branch_assignments_tenant_id"),
        "user_branch_assignments",
        ["tenant_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_branch_assignments_user_id"),
        "user_branch_assignments",
        ["user_id"],
        unique=False,
    )
    op.create_index(
        "uq_user_branch_assignments_user_id_primary",
        "user_branch_assignments",
        ["user_id"],
        unique=True,
        postgresql_where=sa.text("is_primary"),
    )
    op.add_column("users", sa.Column("role_id", sa.UUID(), nullable=True))
    op.create_index(op.f("ix_users_role_id"), "users", ["role_id"], unique=False)
    op.create_foreign_key(
        op.f("fk_users_tenant_id_role_id_roles"),
        "users",
        "roles",
        ["tenant_id", "role_id"],
        ["tenant_id", "id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    op.drop_constraint(op.f("fk_users_tenant_id_role_id_roles"), "users", type_="foreignkey")
    op.drop_index(op.f("ix_users_role_id"), table_name="users")
    op.drop_column("users", "role_id")
    op.drop_index(
        "uq_user_branch_assignments_user_id_primary",
        table_name="user_branch_assignments",
        postgresql_where=sa.text("is_primary"),
    )
    op.drop_index(op.f("ix_user_branch_assignments_user_id"), table_name="user_branch_assignments")
    op.drop_index(
        op.f("ix_user_branch_assignments_tenant_id"), table_name="user_branch_assignments"
    )
    op.drop_index(
        op.f("ix_user_branch_assignments_branch_id"), table_name="user_branch_assignments"
    )
    op.drop_table("user_branch_assignments")
    op.drop_table("role_permissions")
    op.drop_index(op.f("ix_roles_tenant_id"), table_name="roles")
    op.drop_table("roles")
    op.drop_index(op.f("ix_permissions_category_id"), table_name="permissions")
    op.drop_table("permissions")
    op.drop_table("permission_categories")
