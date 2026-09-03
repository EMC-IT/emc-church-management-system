"""Enable required PostgreSQL extensions

Revision ID: 0001
Revises:
Created: Phase 1 -- Platform foundations

Corresponds to revision 0001_extensions in
``docs/backend-database-plan.md`` §8.

  - pgcrypto : gen_random_uuid(), the server-side default for UUID primary
               keys on rows inserted outside the ORM. Built in from
               PostgreSQL 13, but declared explicitly so the schema does not
               depend on the server version.
  - citext   : case-insensitive text, for email and username uniqueness
               (users, members) without a functional index on lower().
  - pg_trgm  : trigram indexes backing GET /members/search.

Migration review checklist (backend/AGENTS.md §13):
  - [x] No data loss -- creates extensions only
  - [x] No indexes, foreign keys or nullability changes
  - [x] Tenant isolation unaffected
  - [x] downgrade() deliberately does not drop extensions (see note below)
"""

from __future__ import annotations

from collections.abc import Sequence

from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

EXTENSIONS: tuple[str, ...] = ("pgcrypto", "citext", "pg_trgm")


def upgrade() -> None:
    for extension in EXTENSIONS:
        op.execute(f'CREATE EXTENSION IF NOT EXISTS "{extension}"')


def downgrade() -> None:
    """Deliberately a no-op.

    Dropping an extension cascades to every column, index and default that
    depends on it, which would silently destroy data in any database where a
    later migration has already used citext or a gen_random_uuid() default.
    The safe reversal of this migration is to drop the database.
    """
