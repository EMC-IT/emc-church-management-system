"""Async database engine and session management."""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool

from app.config import Settings, settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def create_engine(config: Settings) -> AsyncEngine:
    """Build the async engine for the given configuration.

    Tests use :class:`NullPool` so that each test gets a clean connection and
    no pooled connection outlives the event loop it was created on.
    """
    if config.is_testing:
        return create_async_engine(
            config.database_url_str,
            echo=config.DATABASE_ECHO,
            future=True,
            poolclass=NullPool,
        )

    return create_async_engine(
        config.database_url_str,
        echo=config.DATABASE_ECHO,
        future=True,
        pool_pre_ping=True,
        pool_size=config.DATABASE_POOL_SIZE,
        max_overflow=config.DATABASE_MAX_OVERFLOW,
        pool_timeout=config.DATABASE_POOL_TIMEOUT,
        pool_recycle=config.DATABASE_POOL_RECYCLE,
    )


engine: AsyncEngine = create_engine(settings)

session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession]:
    """FastAPI dependency yielding a request-scoped session.

    The session is rolled back and closed on the way out. Committing is the
    application service's job, not the dependency's, so a request that raises
    after a partial write leaves nothing behind.
    """
    async with session_factory() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database() -> None:
    """Verify the database answers a trivial query.

    Raises whatever the driver raises; the readiness endpoint converts that
    into a dependency status and applies the timeout.
    """
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))


async def dispose_engine() -> None:
    """Close all pooled connections. Called on application shutdown."""
    await engine.dispose()
    logger.info("database_engine_disposed")
