"""Shared column type conventions.

Money is ``NUMERIC(14,2)`` everywhere, never ``Float``/``Double`` --
``backend/AGENTS.md`` §10 and ``docs/backend-database-plan.md`` §1, §7. A
single shared type instance means a future Finance migration cannot
accidentally introduce ``Numeric(10, 2)`` or a bare ``Float`` for a money
column.
"""

from __future__ import annotations

from sqlalchemy import Numeric

Money = Numeric(14, 2, asdecimal=True)
