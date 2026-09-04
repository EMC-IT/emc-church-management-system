"""Redis-backed fixed-window rate limiting.

Counters live in Redis rather than process memory because the deployment runs
several application instances: a per-process counter would multiply every
budget by the instance count and reset on every deploy, which is not a limit
so much as a suggestion.

This module is the *mechanism* only. It holds no policy: what to limit, how
tightly, and what to do when Redis is unreachable are all decided by the
caller, because those are product/security questions with different answers
for a login endpoint and an export endpoint.

The window is fixed rather than sliding. A fixed window admits at most two
full budgets across a boundary, which is the well-known cost of the cheapest
correct implementation; a sliding-log or token-bucket variant belongs with the
phase that has an actual rate-limit policy to enforce (OQ-SEC-18).
"""

from __future__ import annotations

from dataclasses import dataclass

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.logging import get_logger

logger = get_logger(__name__)

KEY_PREFIX = "emc:ratelimit"
"""Namespace for every counter this module writes.

Redis is shared with the cache and the Celery broker, so rate-limit keys are
prefixed to keep them identifiable, greppable and safe to flush independently.
"""

# INCR then set the TTL only on the increment that created the key, as one
# atomic step. Doing it as two round trips leaves a window in which a crash
# between them strands a key with no expiry -- a counter that never resets is
# an accidental permanent block.
_INCREMENT_AND_EXPIRE = """
local current = redis.call('INCR', KEYS[1])
if current == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return {current, redis.call('PTTL', KEYS[1])}
"""


@dataclass(frozen=True, slots=True)
class RateLimitPolicy:
    """At most ``limit`` requests per ``window_seconds``."""

    limit: int
    window_seconds: int


@dataclass(frozen=True, slots=True)
class RateLimitVerdict:
    """The outcome of consuming one unit of budget."""

    allowed: bool
    remaining: int
    retry_after: int
    """Whole seconds until the current window expires. At least 1 when denied,
    so a client honouring it never retries into the same closed window."""


class RateLimitUnavailableError(RuntimeError):
    """Redis could not be reached, so no limit could be applied.

    Deliberately not an ``AppError``: whether an unenforceable limit should
    fail the request or be waved through is the caller's decision, and this
    module must not make it by choosing an HTTP status.
    """


def build_key(namespace: str, identifier: str) -> str:
    """The Redis key holding one caller's counter for one namespace."""
    return f"{KEY_PREFIX}:{namespace}:{identifier}"


async def consume(
    client: Redis,
    *,
    namespace: str,
    identifier: str,
    policy: RateLimitPolicy,
) -> RateLimitVerdict:
    """Count one request against ``identifier`` and report whether it may proceed.

    ``identifier`` becomes part of a Redis key, so callers must pass an opaque
    or already-safe value -- never a raw credential. Raises
    :class:`RateLimitUnavailableError` if Redis cannot be reached.
    """
    key = build_key(namespace, identifier)

    try:
        count, ttl_ms = await client.eval(
            _INCREMENT_AND_EXPIRE, 1, key, policy.window_seconds * 1000
        )
    except (RedisError, OSError, TimeoutError) as exc:
        # Not logged with the identifier: this fires on infrastructure
        # failure, and an outage should not write a caller list to the log.
        logger.warning("rate_limit_backend_unavailable", extra={"namespace": namespace})
        raise RateLimitUnavailableError(namespace) from exc

    # PTTL returns -1 for a key with no expiry and -2 if it vanished between
    # the INCR and the PTTL. Neither should happen, but treating them as "a
    # full window remains" keeps retry_after from going negative.
    remaining_ms = policy.window_seconds * 1000 if ttl_ms < 0 else ttl_ms
    retry_after = max(1, -(-remaining_ms // 1000))

    return RateLimitVerdict(
        allowed=count <= policy.limit,
        remaining=max(0, policy.limit - count),
        retry_after=retry_after,
    )


async def reset(client: Redis, *, namespace: str, identifier: str) -> None:
    """Drop one counter. For administrative use and for tests."""
    await client.delete(build_key(namespace, identifier))


__all__ = [
    "KEY_PREFIX",
    "RateLimitPolicy",
    "RateLimitUnavailableError",
    "RateLimitVerdict",
    "build_key",
    "consume",
    "reset",
]
