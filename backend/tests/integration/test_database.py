"""Database connectivity, session behaviour and transaction semantics."""

from __future__ import annotations

import pytest
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.config import Settings
from app.core.database import check_database, session_factory, transaction_scope

pytestmark = pytest.mark.requires_db


class TestDatabaseConnects:
    """The application can reach PostgreSQL."""

    async def test_engine_executes_a_query(self, engine: AsyncEngine) -> None:
        async with engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            assert result.scalar_one() == 1

    async def test_health_probe_succeeds(self) -> None:
        await check_database()

    async def test_connected_to_the_test_database(self, engine: AsyncEngine) -> None:
        """Guards against a suite pointed at a development database."""
        async with engine.connect() as connection:
            name = (await connection.execute(text("SELECT current_database()"))).scalar_one()
        assert "test" in str(name), f"tests are connected to {name!r}"

    async def test_server_version_is_supported(self, engine: AsyncEngine) -> None:
        async with engine.connect() as connection:
            version = (await connection.execute(text("SHOW server_version_num"))).scalar_one()
        assert int(version) >= 140000, "PostgreSQL 14+ required"

    def test_uses_the_async_driver(self, settings: Settings) -> None:
        """One driver in the project keeps migrations and runtime consistent."""
        assert settings.database_url_str.startswith("postgresql+asyncpg://")


class TestSessionManagement:
    """Session factory behaviour."""

    async def test_yields_a_working_session(self, db_session: AsyncSession) -> None:
        result = await db_session.execute(text("SELECT 42"))
        assert result.scalar_one() == 42

    async def test_sessions_are_independent(self) -> None:
        async with session_factory() as first, session_factory() as second:
            assert first is not second

    async def test_does_not_expire_objects_on_commit(self) -> None:
        """expire_on_commit=False keeps returned entities usable after commit."""
        assert session_factory.kw["expire_on_commit"] is False


class TestTransactionScope:
    """transaction_scope is the atomicity boundary for financial work.

    A real table is used rather than a TEMP table: transaction_scope commits
    and releases its connection, and under NullPool that connection is closed,
    taking any TEMP table with it. The table would vanish for reasons that have
    nothing to do with transaction semantics, which is exactly the kind of
    false signal a test of transaction semantics must not produce.
    """

    @pytest.fixture
    async def probe_table(self, engine: AsyncEngine) -> str:
        """Recreate the probe table at setup rather than dropping it at teardown.

        Dropping at teardown deadlocks: the test's session is still holding a
        lock on the table when the fixture unwinds (fixtures tear down in
        reverse setup order, and the table fixture is set up last), so the
        DROP waits on a session that is waiting on the DROP. Cleaning at setup
        removes the ordering problem entirely.
        """
        name = "tx_probe"
        async with engine.begin() as connection:
            await connection.execute(text(f"DROP TABLE IF EXISTS {name}"))
            await connection.execute(text(f"CREATE TABLE {name} (id int)"))
        return name

    async def test_commits_on_success(self, db_session: AsyncSession, probe_table: str) -> None:
        async with transaction_scope(db_session) as session:
            await session.execute(text(f"INSERT INTO {probe_table} VALUES (1)"))

        result = await db_session.execute(text(f"SELECT count(*) FROM {probe_table}"))
        assert result.scalar_one() == 1

    async def test_rolls_back_on_failure(self, db_session: AsyncSession, probe_table: str) -> None:
        """A failure must discard the whole unit of work.

        This is what guarantees a financial write and its audit record either
        both land or neither does (backend/AGENTS.md §10-§11).
        """
        with pytest.raises(ProgrammingError):
            async with transaction_scope(db_session) as session:
                await session.execute(text(f"INSERT INTO {probe_table} VALUES (1)"))
                await session.execute(text("SELECT * FROM table_that_does_not_exist"))

        await db_session.rollback()
        result = await db_session.execute(text(f"SELECT count(*) FROM {probe_table}"))
        assert result.scalar_one() == 0

    async def test_nests_without_abandoning_the_outer_transaction(
        self, db_session: AsyncSession, probe_table: str
    ) -> None:
        """An inner failure must not silently discard outer work."""
        async with transaction_scope(db_session) as outer:
            await outer.execute(text(f"INSERT INTO {probe_table} VALUES (1)"))

            with pytest.raises(ProgrammingError):
                async with transaction_scope(outer) as inner:
                    await inner.execute(text(f"INSERT INTO {probe_table} VALUES (2)"))
                    await inner.execute(text("SELECT * FROM still_not_a_table"))

        result = await db_session.execute(text(f"SELECT count(*) FROM {probe_table}"))
        assert result.scalar_one() == 1
