"""Add members

Revision ID: 0004
Revises: 0003
Created: Phase 2B-3 -- Member domain foundation

``members`` is the church membership/domain identity, distinct from
``users`` (ADR-001). Field lists trace to ``Member``/``MemberFormData`` in
``lib/types/members.ts`` -- see ``app/domains/members/models.py`` for the
full source-mapping note and deliberate omissions (``family_id``, a stored
``full_name``, a full-text search index).

Also alters ``branches`` and ``users`` to add ``UNIQUE(tenant_id, id)`` --
required so ``members``' composite foreign keys can reference them and
prove same-tenant integrity (ADR-007): a plain ``branch_id -> branches.id``
or ``user_id -> users.id`` only proves the row exists *somewhere*, not that
it belongs to the member's own church.

Migration review checklist (backend/CLAUDE.md §13):
  - [x] No data loss -- one new table; the two ALTERs on `branches`/`users`
        add a unique constraint on already-unique columns (`id` is already
        each table's PK), so no existing data can violate it
  - [x] Indexes: `(tenant_id, branch_id, membership_status)` (listing
        members by branch/status), `(tenant_id, user_id)` (portal-login
        lookup), `deleted_at` (from `SoftDeleteMixin`) -- all traced to
        `backend-database-plan.md`'s members section except the documented
        full-text GIN index, deferred to whichever phase builds
        `/members/search`
  - [x] Foreign keys and ON DELETE:
        - `(tenant_id) -> churches.id`, RESTRICT (from `TenantScopedMixin`)
        - `(tenant_id, branch_id) -> branches(tenant_id, id)`, RESTRICT --
          same-tenant branch integrity (ADR-007); RESTRICT because a branch
          with members assigned should not be deletable out from under them
        - `(tenant_id, user_id) -> users(tenant_id, id)`, RESTRICT -- not
          `SET NULL`: Postgres applies a composite FK's `SET NULL` to
          *every* column in the key, which would null out `tenant_id` too
          (`NOT NULL` on `members`) -- caught by a failing integration test
          before release. Column-scoped `SET NULL (user_id)` needs Postgres
          15+; the project's minimum is 14
          (`tests/integration/test_database.py`), so it isn't portable
          here. `RESTRICT` blocks hard-deleting a User while a Member still
          links to it, matching every other FK in this schema; the Member
          is never at risk either way (ADR-001, ADR-007) since a User is
          normally deactivated via `SoftDeleteMixin`, which never triggers
          this FK at all
  - [x] Nullability matches `Member`/`MemberFormData`: fields optional in
        `MemberFormData` are nullable here; `firstName`/`lastName`/`phone`/
        `gender` (required in the form) are `NOT NULL`
  - [x] Uniqueness: `(tenant_id, email)` and `(tenant_id, phone)`, both
        partial (`WHERE deleted_at IS NULL`, email additionally `WHERE
        email IS NOT NULL`) -- traced to `Errors_Responses.md` §5's 409 on
        email/phone collision, scoped per-tenant like every other
        uniqueness invariant in this schema
  - [x] Tenant isolation: both `branch_id` and `user_id` use composite FKs
        against `(tenant_id, id)`, not a plain FK against `id` alone --
        the specific gap this migration closes (ADR-007)
  - [x] Performance: one new table, two ALTERs adding a unique constraint
        that PK-uniqueness on `id` already guarantees is satisfiable
  - [x] downgrade() drops `members` (and its FKs) *before* dropping the two
        unique constraints on `branches`/`users` that those FKs depend on --
        the reverse order errors, since Postgres refuses to drop a unique
        constraint an existing foreign key still references. Also drops the
        `member_gender` native ENUM type explicitly -- `op.drop_table()`
        does not drop a dropped column's ENUM type on its own (same issue
        caught and fixed in 0002 and 0003)
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0004"
down_revision: str | None = "0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

MEMBERSHIP_STATUS_CANDIDATES = (
    "New",
    "Active",
    "Inactive",
    "Transferred",
    "Archived",
    "Pending",
    "Suspended",
    "Deceased",
)


def upgrade() -> None:
    op.create_unique_constraint(op.f("uq_branches_tenant_id_id"), "branches", ["tenant_id", "id"])
    op.create_unique_constraint(op.f("uq_users_tenant_id_id"), "users", ["tenant_id", "id"])

    op.create_table(
        "members",
        sa.Column("user_id", sa.UUID(), nullable=True),
        sa.Column("first_name", sa.String(length=255), nullable=False),
        sa.Column("last_name", sa.String(length=255), nullable=False),
        sa.Column("email", postgresql.CITEXT(), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=True),
        sa.Column("gender", sa.Enum("Male", "Female", name="member_gender"), nullable=False),
        sa.Column("membership_status", sa.String(length=50), nullable=False),
        sa.Column("join_date", sa.Date(), nullable=True),
        sa.Column("avatar_url", sa.String(length=255), nullable=True),
        sa.Column("department", sa.String(length=255), nullable=True),
        sa.Column("emergency_contact_name", sa.String(length=255), nullable=True),
        sa.Column("emergency_contact_phone", sa.String(length=32), nullable=True),
        sa.Column("emergency_contact_relationship", sa.String(length=255), nullable=True),
        sa.Column("custom_fields", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("branch_id", sa.UUID(), nullable=True),
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
        sa.CheckConstraint(
            f"membership_status IN {MEMBERSHIP_STATUS_CANDIDATES!r}",
            name=op.f("ck_members_membership_status_candidate"),
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "branch_id"],
            ["branches.tenant_id", "branches.id"],
            name=op.f("fk_members_tenant_id_branch_id_branches"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["users.tenant_id", "users.id"],
            name=op.f("fk_members_tenant_id_user_id_users"),
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["tenant_id"],
            ["churches.id"],
            name=op.f("fk_members_tenant_id_churches"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_members")),
    )
    op.create_index(op.f("ix_members_branch_id"), "members", ["branch_id"], unique=False)
    op.create_index(op.f("ix_members_deleted_at"), "members", ["deleted_at"], unique=False)
    op.create_index(op.f("ix_members_tenant_id"), "members", ["tenant_id"], unique=False)
    op.create_index(
        "ix_members_tenant_id_branch_id_membership_status",
        "members",
        ["tenant_id", "branch_id", "membership_status"],
        unique=False,
    )
    op.create_index(
        "ix_members_tenant_id_user_id", "members", ["tenant_id", "user_id"], unique=False
    )
    op.create_index(
        "uq_members_tenant_id_email",
        "members",
        ["tenant_id", "email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL AND deleted_at IS NULL"),
    )
    op.create_index(
        "uq_members_tenant_id_phone",
        "members",
        ["tenant_id", "phone"],
        unique=True,
        postgresql_where=sa.text("deleted_at IS NULL"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_members_tenant_id_phone",
        table_name="members",
        postgresql_where=sa.text("deleted_at IS NULL"),
    )
    op.drop_index(
        "uq_members_tenant_id_email",
        table_name="members",
        postgresql_where=sa.text("email IS NOT NULL AND deleted_at IS NULL"),
    )
    op.drop_index("ix_members_tenant_id_user_id", table_name="members")
    op.drop_index("ix_members_tenant_id_branch_id_membership_status", table_name="members")
    op.drop_index(op.f("ix_members_tenant_id"), table_name="members")
    op.drop_index(op.f("ix_members_deleted_at"), table_name="members")
    op.drop_index(op.f("ix_members_branch_id"), table_name="members")
    op.drop_table("members")
    sa.Enum(name="member_gender").drop(op.get_bind(), checkfirst=True)

    op.drop_constraint(op.f("uq_users_tenant_id_id"), "users", type_="unique")
    op.drop_constraint(op.f("uq_branches_tenant_id_id"), "branches", type_="unique")
