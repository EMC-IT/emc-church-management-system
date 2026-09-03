"""Alembic migrations.

Proves migrations apply to a genuinely clean database, which is the standard
``backend/AGENTS.md`` §20 sets ("migration works from a clean database"). A
scratch database is created for the run and dropped afterwards, so the result
cannot be an artefact of state left by an earlier suite.

The Alembic CLI is invoked as a subprocess rather than through its Python API
so that the exact command an operator runs in production is what gets tested,
including alembic.ini parsing and settings resolution.
"""

from __future__ import annotations

import subprocess
import sys
import uuid
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from sqlalchemy import text
from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import create_async_engine

from app.config import Settings

pytestmark = pytest.mark.requires_db

BACKEND_ROOT = Path(__file__).resolve().parents[2]
MIGRATION_TIMEOUT_SECONDS = 120

EXPECTED_EXTENSIONS = frozenset({"pgcrypto", "citext", "pg_trgm"})


def _admin_url(database_url: str) -> str:
    """Maintenance connection URL, pointed at the default `postgres` database."""
    return str(make_url(database_url).set(database="postgres"))


def _with_database(database_url: str, name: str) -> str:
    return str(make_url(database_url).set(database=name))


async def _run_on_admin(database_url: str, statement: str) -> None:
    """Execute a statement that cannot run inside a transaction."""
    engine = create_async_engine(_admin_url(database_url), isolation_level="AUTOCOMMIT")
    try:
        async with engine.connect() as connection:
            await connection.execute(text(statement))
    finally:
        await engine.dispose()


def _alembic(*args: str, database_url: str) -> subprocess.CompletedProcess[str]:
    """Run the Alembic CLI against a specific database."""
    return subprocess.run(  # noqa: S603 - fixed argv, no shell
        [sys.executable, "-m", "alembic", *args],
        cwd=BACKEND_ROOT,
        env={
            **_base_env(),
            "DATABASE_URL": database_url,
            "ENVIRONMENT": "test",
        },
        capture_output=True,
        text=True,
        timeout=MIGRATION_TIMEOUT_SECONDS,
        check=False,
    )


def _base_env() -> dict[str, str]:
    import os

    # Alembic resolves the DSN through app settings, so the child process needs
    # PATH and the interpreter's environment but not the parent's DATABASE_URL.
    return {k: v for k, v in os.environ.items() if k != "DATABASE_URL"}


@pytest.fixture
async def clean_database(settings: Settings) -> AsyncGenerator[str]:
    """Create an empty database for one test, and drop it afterwards."""
    name = f"emc_migration_test_{uuid.uuid4().hex[:12]}"
    base = settings.database_url_str

    await _run_on_admin(base, f'CREATE DATABASE "{name}"')
    try:
        yield _with_database(base, name)
    finally:
        await _run_on_admin(base, f'DROP DATABASE IF EXISTS "{name}" WITH (FORCE)')


class TestMigrationsRunFromClean:
    """`alembic upgrade head` on an empty database."""

    async def test_upgrade_head_succeeds(self, clean_database: str) -> None:
        result = _alembic("upgrade", "head", database_url=clean_database)
        assert result.returncode == 0, (
            f"alembic upgrade head failed\nstdout:\n{result.stdout}\nstderr:\n{result.stderr}"
        )

    async def test_records_the_applied_revision(self, clean_database: str) -> None:
        _alembic("upgrade", "head", database_url=clean_database)

        engine = create_async_engine(clean_database)
        try:
            async with engine.connect() as connection:
                revision = (
                    await connection.execute(text("SELECT version_num FROM alembic_version"))
                ).scalar_one()
        finally:
            await engine.dispose()

        assert revision == "0003"

    async def test_creates_the_required_extensions(self, clean_database: str) -> None:
        _alembic("upgrade", "head", database_url=clean_database)

        engine = create_async_engine(clean_database)
        try:
            async with engine.connect() as connection:
                rows = await connection.execute(text("SELECT extname FROM pg_extension"))
                installed = {row[0] for row in rows}
        finally:
            await engine.dispose()

        assert installed >= EXPECTED_EXTENSIONS

    async def test_gen_random_uuid_is_available(self, clean_database: str) -> None:
        """UUID primary keys declare gen_random_uuid() as their server default."""
        _alembic("upgrade", "head", database_url=clean_database)

        engine = create_async_engine(clean_database)
        try:
            async with engine.connect() as connection:
                value = (await connection.execute(text("SELECT gen_random_uuid()"))).scalar_one()
        finally:
            await engine.dispose()

        assert uuid.UUID(str(value))

    async def test_is_idempotent(self, clean_database: str) -> None:
        """Re-running against an up-to-date database is a no-op, not an error."""
        first = _alembic("upgrade", "head", database_url=clean_database)
        second = _alembic("upgrade", "head", database_url=clean_database)
        assert first.returncode == 0
        assert second.returncode == 0, second.stderr


class TestMigrationTooling:
    """The Alembic setup itself is wired correctly."""

    async def test_current_reports_head_after_upgrade(self, clean_database: str) -> None:
        _alembic("upgrade", "head", database_url=clean_database)
        result = _alembic("current", database_url=clean_database)
        assert result.returncode == 0
        assert "0003" in result.stdout

    async def test_offline_mode_emits_sql(self, clean_database: str) -> None:
        """`alembic upgrade head --sql` works for review and for DBA hand-off."""
        result = _alembic("upgrade", "head", "--sql", database_url=clean_database)
        assert result.returncode == 0, result.stderr
        assert "CREATE EXTENSION" in result.stdout

    async def test_history_is_linear(self, clean_database: str) -> None:
        """A branched history would make `upgrade head` ambiguous."""
        result = _alembic("heads", database_url=clean_database)
        assert result.returncode == 0
        heads = [line for line in result.stdout.splitlines() if line.strip()]
        assert len(heads) == 1, f"expected a single head, got: {heads}"

    def test_alembic_ini_carries_no_credentials(self) -> None:
        """The DSN comes from settings so no credential is committed."""
        content = (BACKEND_ROOT / "alembic.ini").read_text()
        assert "sqlalchemy.url = postgresql" not in content
