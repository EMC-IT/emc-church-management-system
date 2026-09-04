"""Add churches and branches

Revision ID: 0002
Revises: 0001
Created: Phase 2B-1 -- Church, Tenant & Branch foundation

``churches`` is the tenant root: no ``tenant_id`` column, per
``backend/docs/backend-domain-map.md`` §4 ("churches rows are the tenant
roots themselves"). Field lists trace to ``lib/validation/settings.ts``
(``churchProfileSchema``, ``branchCreateSchema``) -- see
``app/domains/churches/models.py`` for the full source-mapping note and the
deliberate omissions (``churches.status``/``timezone``/``currency``,
``branches.current_members``).

Migration review checklist (backend/CLAUDE.md §13):
  - [x] No data loss -- new tables only, no existing data affected
  - [x] Indexes: `(tenant_id, status)` for branch listing/filtering by
        status within a tenant; PK indexes on both tables
  - [x] Foreign keys: `branches.tenant_id -> churches.id`, `ON DELETE
        RESTRICT` -- a church with branches cannot be deleted out from
        under them; no cascade that could silently drop branch data
  - [x] Nullability matches `churchProfileSchema`/`branchCreateSchema`:
        fields optional in the Zod schema are nullable here, required
        fields are `NOT NULL`
  - [x] Uniqueness: `(tenant_id, name)` on branches -- two branches in the
        same church cannot share a name; partial unique index enforces at
        most one `type='Headquarters'` branch per tenant
        (`docs/backend-database-plan.md` branches note)
  - [x] Tenant isolation: `branches.tenant_id` is a real foreign key, not
        just an indexed column -- an orphaned or cross-tenant branch row is
        impossible at the database level
  - [x] Performance: two new tables, no existing data to migrate
  - [x] downgrade() drops both tables, their indexes, and the two native
        ENUM types created for `branches.type`/`branches.status` -- Alembic's
        `op.drop_table()` does not drop a dropped column's ENUM type, which
        otherwise collides with `CREATE TYPE` on the next upgrade (caught by
        an upgrade -> downgrade -> upgrade rehearsal against a live database)
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "churches",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("motto", sa.String(length=255), nullable=True),
        sa.Column("vision", sa.Text(), nullable=False),
        sa.Column("mission", sa.Text(), nullable=False),
        sa.Column("core_values", sa.Text(), nullable=False),
        sa.Column("history", sa.Text(), nullable=True),
        sa.Column("founded", sa.String(length=32), nullable=True),
        sa.Column("denomination", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("alternative_phone", sa.String(length=32), nullable=True),
        sa.Column("website", sa.String(length=255), nullable=True),
        sa.Column("street", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=255), nullable=False),
        sa.Column("state", sa.String(length=255), nullable=False),
        sa.Column("postal_code", sa.String(length=32), nullable=False),
        sa.Column("country", sa.String(length=255), nullable=False),
        sa.Column("facebook", sa.String(length=255), nullable=True),
        sa.Column("twitter", sa.String(length=255), nullable=True),
        sa.Column("instagram", sa.String(length=255), nullable=True),
        sa.Column("youtube", sa.String(length=255), nullable=True),
        sa.Column("senior_pastor", sa.String(length=255), nullable=False),
        sa.Column("assistant_pastor", sa.String(length=255), nullable=True),
        sa.Column("secretary", sa.String(length=255), nullable=True),
        sa.Column("treasurer", sa.String(length=255), nullable=True),
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
        sa.PrimaryKeyConstraint("id", name=op.f("pk_churches")),
    )
    op.create_table(
        "branches",
        sa.Column("tenant_id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "type",
            sa.Enum("Headquarters", "Branch", "Mission", "Outreach Center", name="branch_type"),
            nullable=False,
        ),
        sa.Column("established", sa.String(length=32), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=False),
        sa.Column("alternative_phone", sa.String(length=32), nullable=True),
        sa.Column("street", sa.String(length=255), nullable=False),
        sa.Column("city", sa.String(length=255), nullable=False),
        sa.Column("state", sa.String(length=255), nullable=False),
        sa.Column("postal_code", sa.String(length=32), nullable=False),
        sa.Column("country", sa.String(length=255), nullable=False),
        sa.Column("pastor", sa.String(length=255), nullable=False),
        sa.Column("assistant_pastor", sa.String(length=255), nullable=True),
        sa.Column("secretary", sa.String(length=255), nullable=True),
        sa.Column("capacity", sa.Integer(), nullable=False),
        sa.Column("service_schedule", sa.Text(), nullable=True),
        sa.Column("facilities", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.Enum("active", "inactive", "under-construction", name="branch_status"),
            nullable=False,
        ),
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
            ["tenant_id"],
            ["churches.id"],
            name=op.f("fk_branches_tenant_id_churches"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_branches")),
        sa.UniqueConstraint("tenant_id", "name", name=op.f("uq_branches_tenant_id_name")),
    )
    op.create_index(
        "ix_branches_tenant_id_status", "branches", ["tenant_id", "status"], unique=False
    )
    op.create_index(
        "uq_branches_one_headquarters_per_tenant",
        "branches",
        ["tenant_id"],
        unique=True,
        postgresql_where=sa.text("type = 'Headquarters'"),
    )


def downgrade() -> None:
    op.drop_index(
        "uq_branches_one_headquarters_per_tenant",
        table_name="branches",
        postgresql_where=sa.text("type = 'Headquarters'"),
    )
    op.drop_index("ix_branches_tenant_id_status", table_name="branches")
    op.drop_table("branches")
    op.drop_table("churches")
    # op.drop_table() does not drop the native Postgres ENUM types a dropped
    # column used -- left in place, they collide with CREATE TYPE on the next
    # upgrade. Must be dropped explicitly, after the columns that reference
    # them are gone.
    sa.Enum(name="branch_status").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="branch_type").drop(op.get_bind(), checkfirst=True)
