"""Redis connection management.

Redis backs caching, rate limiting and the Celery broker. Per
``backend architecture.md`` §27 it holds church configuration, permission
definitions, public listings and rate-limit counters -- never financial or
pastoral data.
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from redis.asyncio import ConnectionPool, Redis

from app.config import Settings, settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_pool: ConnectionPool | None = None
_client: Redis | None = None


def create_pool(config: Settings) -> ConnectionPool:
    """Build a connection pool for the given configuration."""
    return ConnectionPool.from_url(
        str(config.REDIS_URL),
        max_connections=config.REDIS_MAX_CONNECTIONS,
        socket_timeout=config.REDIS_SOCKET_TIMEOUT,
        socket_connect_timeout=config.REDIS_SOCKET_TIMEOUT,
        decode_responses=True,
        health_check_interval=30,
    )


def get_redis_client() -> Redis:
    """Return the process-wide Redis client, creating it on first use."""
    global _pool, _client

    if _client is None:
        _pool = create_pool(settings)
        _client = Redis(connection_pool=_pool)
    return _client


async def get_redis() -> AsyncGenerator[Redis]:
    """FastAPI dependency yielding the shared Redis client.

    The client is pooled and shared; it is deliberately not closed per request.
    """
    yield get_redis_client()


async def check_redis() -> None:
    """Verify Redis answers PING.

    Raises on failure; the readiness endpoint turns that into a dependency
    status and applies the timeout.
    """
    client = get_redis_client()
    await client.ping()


async def close_redis() -> None:
    """Release Redis connections. Called on application shutdown."""
    global _pool, _client

    if _client is not None:
        await _client.aclose()
        _client = None
    if _pool is not None:
        await _pool.aclose()
        _pool = None
    logger.info("redis_connections_closed")
