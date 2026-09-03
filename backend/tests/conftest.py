"""Shared pytest fixtures.

Environment defaults are installed before any application module is imported,
because ``app.config`` builds its settings singleton at import time. Every
value uses ``setdefault`` so CI can override by exporting the variable.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator

# Must run before `import app.*` anywhere in the suite. Environment variables
# take precedence over the .env file in pydantic-settings, so these win.
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DEBUG", "false")
os.environ.setdefault("LOG_LEVEL", "WARNING")
os.environ.setdefault("LOG_FORMAT", "console")
os.environ.setdefault("CELERY_TASK_ALWAYS_EAGER", "true")
os.environ.setdefault(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/emc_church_test_db",
)
os.environ["DATABASE_URL"] = os.environ["TEST_DATABASE_URL"]
# Redis db 15 is reserved for tests and is flushed between them.
os.environ.setdefault("TEST_REDIS_URL", "redis://localhost:6379/15")
os.environ["REDIS_URL"] = os.environ["TEST_REDIS_URL"]

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from app.config import Settings, get_settings
from app.core.cache import close_redis, get_redis_client
from app.core.database import session_factory
from app.core.database.session import engine as app_engine
from app.main import create_app


@pytest.fixture(scope="session")
def settings() -> Settings:
    """Validated test settings."""
    return get_settings()


@pytest.fixture(scope="session")
def api_prefix(settings: Settings) -> str:
    """The configured API version prefix, e.g. ``/api/v1``."""
    return settings.API_V1_STR


@pytest.fixture(scope="session")
def app() -> FastAPI:
    """The FastAPI application under test."""
    return create_app()


@pytest.fixture
async def client(app: FastAPI) -> AsyncGenerator[AsyncClient]:
    """HTTP client wired straight to the ASGI app.

    Exercises the full middleware and exception-handler stack without binding
    a socket.
    """
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client


@pytest.fixture
async def lifespan_client(app: FastAPI) -> AsyncGenerator[AsyncClient]:
    """Client that also runs the application's startup and shutdown hooks."""
    async with app.router.lifespan_context(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
            yield http_client


@pytest.fixture(scope="session")
def engine() -> AsyncEngine:
    """The application's async engine, pointed at the test database."""
    return app_engine


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession]:
    """A database session rolled back at the end of the test.

    Nothing a test writes survives it, so tests can run in any order.
    """
    async with session_factory() as session:
        try:
            yield session
        finally:
            await session.rollback()
            await session.close()


@pytest.fixture
async def redis_client() -> AsyncGenerator[Redis]:
    """Redis client against the test database index, flushed afterwards."""
    client = get_redis_client()
    try:
        yield client
    finally:
        await client.flushdb()


@pytest.fixture(scope="session", autouse=True)
async def _release_connections() -> AsyncGenerator[None]:
    """Close pooled connections once the session ends."""
    yield
    await close_redis()
    await app_engine.dispose()
