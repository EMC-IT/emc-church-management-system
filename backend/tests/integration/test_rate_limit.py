"""The Redis-backed fixed-window limiter.

Run against real Redis rather than a fake: the properties that matter here --
atomic increment, an expiry that is actually set, a counter shared between
processes -- are properties of Redis, and a stub would assert only that the
stub behaves as written.
"""

from __future__ import annotations

import asyncio
import uuid

import pytest
from redis.asyncio import Redis
from redis.exceptions import ConnectionError as RedisConnectionError

from app.core.security.rate_limit import (
    KEY_PREFIX,
    RateLimitPolicy,
    RateLimitUnavailableError,
    build_key,
    consume,
    reset,
)

pytestmark = pytest.mark.requires_redis

NAMESPACE = "test:limiter"


@pytest.fixture
def identifier() -> str:
    """A fresh counter per test, so tests never share a budget."""
    return str(uuid.uuid4())


def policy(limit: int = 3, window_seconds: int = 60) -> RateLimitPolicy:
    return RateLimitPolicy(limit=limit, window_seconds=window_seconds)


class TestBudget:
    async def test_allows_requests_up_to_the_limit(
        self, redis_client: Redis, identifier: str
    ) -> None:
        for _ in range(3):
            verdict = await consume(
                redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy()
            )
            assert verdict.allowed

    async def test_denies_the_request_after_the_limit(
        self, redis_client: Redis, identifier: str
    ) -> None:
        for _ in range(3):
            await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy())

        verdict = await consume(
            redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy()
        )
        assert verdict.allowed is False

    async def test_remaining_counts_down_and_never_goes_negative(
        self, redis_client: Redis, identifier: str
    ) -> None:
        seen = [
            (
                await consume(
                    redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy()
                )
            ).remaining
            for _ in range(5)
        ]

        assert seen == [2, 1, 0, 0, 0]

    async def test_budgets_are_independent_per_identifier(
        self, redis_client: Redis, identifier: str
    ) -> None:
        """One caller exhausting its budget must not throttle everyone else."""
        for _ in range(4):
            await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy())

        other = await consume(
            redis_client, namespace=NAMESPACE, identifier=str(uuid.uuid4()), policy=policy()
        )
        assert other.allowed

    async def test_budgets_are_independent_per_namespace(
        self, redis_client: Redis, identifier: str
    ) -> None:
        for _ in range(4):
            await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy())

        elsewhere = await consume(
            redis_client, namespace="test:other", identifier=identifier, policy=policy()
        )
        assert elsewhere.allowed


class TestExpiry:
    async def test_the_counter_is_given_an_explicit_ttl(
        self, redis_client: Redis, identifier: str
    ) -> None:
        """A counter with no expiry is a permanent block, not a rate limit."""
        await consume(
            redis_client,
            namespace=NAMESPACE,
            identifier=identifier,
            policy=policy(window_seconds=60),
        )

        ttl = await redis_client.ttl(build_key(NAMESPACE, identifier))
        assert 0 < ttl <= 60

    async def test_the_window_is_not_extended_by_later_requests(
        self, redis_client: Redis, identifier: str
    ) -> None:
        """Fixed window, not sliding: the TTL is set once, on the first
        request, so a caller who keeps trying still gets a fresh budget when
        the original window ends rather than being locked out indefinitely."""
        await consume(
            redis_client,
            namespace=NAMESPACE,
            identifier=identifier,
            policy=policy(window_seconds=2),
        )
        await asyncio.sleep(1.1)
        await consume(
            redis_client,
            namespace=NAMESPACE,
            identifier=identifier,
            policy=policy(window_seconds=2),
        )

        ttl_ms = await redis_client.pttl(build_key(NAMESPACE, identifier))
        assert ttl_ms <= 1000

    async def test_the_budget_returns_when_the_window_expires(
        self, redis_client: Redis, identifier: str
    ) -> None:
        limit = policy(limit=1, window_seconds=1)
        assert (
            await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=limit)
        ).allowed
        assert not (
            await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=limit)
        ).allowed

        await asyncio.sleep(1.2)

        assert (
            await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=limit)
        ).allowed

    async def test_retry_after_is_always_a_usable_delay(
        self, redis_client: Redis, identifier: str
    ) -> None:
        """Never zero or negative: a client honouring it must not retry
        straight back into the same closed window."""
        limit = policy(limit=1, window_seconds=1)
        await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=limit)
        verdict = await consume(
            redis_client, namespace=NAMESPACE, identifier=identifier, policy=limit
        )

        assert verdict.retry_after >= 1


class TestConcurrency:
    async def test_concurrent_requests_share_one_budget(
        self, redis_client: Redis, identifier: str
    ) -> None:
        """The check is atomic, so ten simultaneous requests against a budget
        of three admit exactly three -- a read-then-write limiter would let
        most of them through."""
        verdicts = await asyncio.gather(
            *(
                consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy())
                for _ in range(10)
            )
        )

        assert sum(verdict.allowed for verdict in verdicts) == 3


class TestKeys:
    async def test_keys_are_namespaced_under_the_application_prefix(
        self, redis_client: Redis, identifier: str
    ) -> None:
        """Redis is shared with the cache and the Celery broker."""
        await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy())

        assert build_key(NAMESPACE, identifier).startswith(f"{KEY_PREFIX}:")
        assert await redis_client.exists(build_key(NAMESPACE, identifier))

    async def test_reset_drops_the_counter(self, redis_client: Redis, identifier: str) -> None:
        await consume(redis_client, namespace=NAMESPACE, identifier=identifier, policy=policy())
        await reset(redis_client, namespace=NAMESPACE, identifier=identifier)

        assert not await redis_client.exists(build_key(NAMESPACE, identifier))


class TestBackendFailure:
    async def test_an_unreachable_backend_raises_rather_than_allowing(
        self, identifier: str
    ) -> None:
        """The limiter never silently returns "allowed" when it could not
        count. What to do about that is the caller's decision, but it has to
        be a decision."""
        unreachable = Redis(host="127.0.0.1", port=1, socket_connect_timeout=0.2)

        try:
            with pytest.raises(RateLimitUnavailableError):
                await consume(
                    unreachable, namespace=NAMESPACE, identifier=identifier, policy=policy()
                )
        finally:
            await unreachable.aclose()

    async def test_the_redis_failure_is_kept_as_the_cause(self, identifier: str) -> None:
        unreachable = Redis(host="127.0.0.1", port=1, socket_connect_timeout=0.2)

        try:
            with pytest.raises(RateLimitUnavailableError) as raised:
                await consume(
                    unreachable, namespace=NAMESPACE, identifier=identifier, policy=policy()
                )
            assert isinstance(raised.value.__cause__, RedisConnectionError | OSError)
        finally:
            await unreachable.aclose()
