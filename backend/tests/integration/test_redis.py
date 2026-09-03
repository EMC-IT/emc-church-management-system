"""Redis connectivity and client behaviour."""

from __future__ import annotations

import pytest
from redis.asyncio import Redis

from app.config import Settings
from app.core.cache import check_redis, get_redis_client

pytestmark = pytest.mark.requires_redis


class TestRedisConnects:
    """The application can reach Redis."""

    async def test_responds_to_ping(self, redis_client: Redis) -> None:
        assert await redis_client.ping() is True

    async def test_health_probe_succeeds(self) -> None:
        await check_redis()

    async def test_client_is_a_shared_singleton(self) -> None:
        """One pooled client per process; not one per request."""
        assert get_redis_client() is get_redis_client()

    def test_uses_the_reserved_test_database(self, settings: Settings) -> None:
        """Guards against a suite flushing a development Redis database."""
        assert str(settings.REDIS_URL).endswith("/15")


class TestRedisOperations:
    """Round-trip behaviour the cache and rate limiter will rely on."""

    async def test_set_and_get(self, redis_client: Redis) -> None:
        await redis_client.set("emc:test:key", "value")
        assert await redis_client.get("emc:test:key") == "value"

    async def test_responses_are_decoded_to_str(self, redis_client: Redis) -> None:
        """decode_responses=True, so callers never handle bytes."""
        await redis_client.set("emc:test:decoded", "text")
        assert isinstance(await redis_client.get("emc:test:decoded"), str)

    async def test_expiry_is_honoured(self, redis_client: Redis) -> None:
        await redis_client.set("emc:test:ttl", "value", ex=60)
        ttl = await redis_client.ttl("emc:test:ttl")
        assert 0 < ttl <= 60

    async def test_atomic_increment(self, redis_client: Redis) -> None:
        """Rate limiting depends on INCR being atomic."""
        for expected in (1, 2, 3):
            assert await redis_client.incr("emc:test:counter") == expected

    async def test_missing_key_returns_none(self, redis_client: Redis) -> None:
        assert await redis_client.get("emc:test:never-written") is None
