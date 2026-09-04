"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Created: ${create_date}

Migration review checklist (backend/CLAUDE.md §13):
  - [ ] No unintended data loss
  - [ ] Indexes added for foreign keys and frequent query predicates
  - [ ] Foreign keys and ON DELETE behaviour correct
  - [ ] Nullability matches the domain contract
  - [ ] Uniqueness constraints tenant-scoped where relevant
  - [ ] Tenant isolation preserved
  - [ ] Performance impact on existing data considered
  - [ ] downgrade() is correct, or explicitly refuses
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
${imports if imports else ""}
revision: str = ${repr(up_revision)}
down_revision: str | None = ${repr(down_revision)}
branch_labels: str | Sequence[str] | None = ${repr(branch_labels)}
depends_on: str | Sequence[str] | None = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
