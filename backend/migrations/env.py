"""Alembic environment.

Runs migrations against the async engine so there is exactly one database
driver in the project (asyncpg) and one source of truth for the DSN
(application settings).
"""

from __future__ import annotations

import asyncio
from logging.config import fileConfig
from typing import Any

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from app.config import settings
from app.core.database.base import Base

# Importing the models package registers every domain's tables on
# Base.metadata so autogenerate can see them. It is empty in Phase 1.
import app.models  # noqa: F401  isort:skip

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.database_url_str)

target_metadata = Base.metadata


def _include_object(
    obj: Any,
    name: str | None,
    type_: str,
    reflected: bool,
    compare_to: Any,
) -> bool:
    """Filter objects out of autogenerate.

    PostGIS/extension-owned tables and Alembic's own bookkeeping table must
    never appear in a generated migration.
    """
    del obj, reflected, compare_to
    return not (type_ == "table" and name == "alembic_version")


def _configure(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        include_object=_include_object,
        # Detect column type and server-default drift, not just added/dropped
        # columns -- a silent type change on a money column is exactly the
        # kind of thing a migration review must catch.
        compare_type=True,
        compare_server_default=True,
        render_as_batch=False,
        transaction_per_migration=True,
    )


def run_migrations_offline() -> None:
    """Emit SQL to stdout without connecting (``alembic upgrade --sql``)."""
    context.configure(
        url=settings.database_url_str,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_object=_include_object,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def _run_migrations(connection: Connection) -> None:
    _configure(connection)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online_async() -> None:
    """Connect with the async engine and run migrations."""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    try:
        async with connectable.connect() as connection:
            await connection.run_sync(_run_migrations)
    finally:
        await connectable.dispose()


def run_migrations_online() -> None:
    """Entry point for online migrations.

    Reuses an already-running loop's connection when Alembic is driven from
    inside async test code; otherwise starts its own loop.
    """
    try:
        asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(run_migrations_online_async())
        return

    # Called from within a running loop (e.g. a pytest fixture): the caller is
    # responsible for providing a connection via config.attributes.
    connection = config.attributes.get("connection")
    if connection is None:
        raise RuntimeError(
            "run_migrations_online() was called inside a running event loop "
            "without a 'connection' in config.attributes"
        )
    _run_migrations(connection)


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
