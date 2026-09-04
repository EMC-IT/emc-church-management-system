"""Importing the application must register every mapped table.

Foreign keys are declared against table *names* (``"churches.id"``) so that
``app.core`` never imports a domain package. SQLAlchemy resolves those lazily
at first flush, which fails if the target table's module was never imported.
Reaching a model through a route is not enough: signing in flushes ``users``,
whose ``tenant_id`` points at ``churches`` -- a table nothing in the
authentication path imports.

This is checked in a **subprocess** because it cannot be observed in-process:
the rest of the suite imports ``app.models`` for its own fixtures, which
registers everything and hides the omission. A live server has no such luck,
and this exact gap produced a 500 on ``POST /auth/login`` until ``app.main``
started importing the registry.
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[2]
TIMEOUT_SECONDS = 60

# Tables an authenticated request touches or resolves against, directly or
# through a foreign key.
REQUIRED_TABLES = (
    "churches",
    "branches",
    "users",
    "roles",
    "permissions",
    "role_permissions",
    "user_branch_assignments",
)


def _run(source: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(  # noqa: S603 - fixed argv, no shell
        [sys.executable, "-c", source],
        cwd=BACKEND_ROOT,
        capture_output=True,
        text=True,
        timeout=TIMEOUT_SECONDS,
        check=False,
    )


class TestImportingTheAppRegistersEveryTable:
    def test_metadata_is_complete_after_importing_main_alone(self) -> None:
        result = _run(
            "import app.main\n"
            "from app.core.database.base import Base\n"
            f"missing = [t for t in {REQUIRED_TABLES!r} if t not in Base.metadata.tables]\n"
            "print('MISSING:', missing)\n"
        )

        assert result.returncode == 0, result.stderr
        assert "MISSING: []" in result.stdout, result.stdout

    def test_every_foreign_key_resolves_after_importing_main_alone(self) -> None:
        """The failure mode itself: an unresolvable FK raises only when
        SQLAlchemy sorts tables for a flush, i.e. on the first write."""
        result = _run(
            "import app.main\n"
            "from app.core.database.base import Base\n"
            "for table in Base.metadata.tables.values():\n"
            "    for fk in table.foreign_keys:\n"
            "        fk.column  # resolves, or raises NoReferencedTableError\n"
            "print('RESOLVED')\n"
        )

        assert result.returncode == 0, result.stderr
        assert "RESOLVED" in result.stdout

    def test_importing_only_the_identity_domain_is_not_enough(self) -> None:
        """Pins *why* the import in ``app.main`` is load-bearing: without a
        registry import, the identity domain alone cannot resolve its own
        tenant foreign key."""
        result = _run(
            "from app.domains.identity.models import User\n"
            "from app.core.database.base import Base\n"
            "print('CHURCHES_REGISTERED:', 'churches' in Base.metadata.tables)\n"
        )

        assert result.returncode == 0, result.stderr
        assert "CHURCHES_REGISTERED: False" in result.stdout
