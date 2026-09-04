# ADR-013: Login Rate Limiting Is Per-IP, Redis-Backed, and Fails Closed

**Status:** Accepted
**Partly resolves:** OQ-SEC-18 (mechanism). **Does not resolve:** OQ-SEC-04.
**Date:** 2026-09-03

## Context

`POST /auth/login` is the most exposed unauthenticated surface in the system.
Phase 2B-5 shipped it with no throttle at all, and recorded that as a gap.

`backend-security-plan.md` §7 establishes the requirement — rate limiting is
"Redis-backed", and "login and forgot-password need **much tighter per-IP
limits**" than the documented general budget of 1000 req/hour/user — but
records the numbers as unspecified (**OQ-SEC-18**). So the repository
establishes *that* login must be throttled, *where* the counters live, and
*what dimension* they are counted on, but not the threshold or the window.

That split matters, because the two halves have different answers. Building
the mechanism is engineering. Choosing the threshold is a product decision
about how many times a real user may fumble their password before the system
stops talking to them, and inventing a number would make an arbitrary choice
look authoritative.

## Decision

### 1. Per-IP only

Login attempts are counted per source address, and per source address only.

The security plan evidences exactly one dimension — "per-IP limits". A
per-account counter is **account lockout**, a separate control whose
threshold, duration and unlock mechanism are all still unspecified
(**OQ-SEC-04**), and one with a failure mode the per-IP limit does not have:
an attacker who knows a target's email address can aim failures at it and
deny that person service. Implementing it here under the name "rate limiting"
would resolve OQ-SEC-04 by accident and in the wrong direction.

### 2. Every attempt counts, successes included

Succeeding does not clear the counter. Resetting on success would let an
attacker who guesses one password in a spray keep an unlimited budget for
every remaining account, and it would make the limit trivially resettable by
anyone holding a single working credential.

### 3. Redis, not process memory

Counters use the existing `get_redis_client()` pool and are namespaced under
`emc:ratelimit:`. Process-local counters would multiply the budget by the
instance count and reset on every deploy.

The TTL is set atomically with the increment, in one Lua script. Doing it as
two round trips leaves a window in which a crash between them strands a
counter with no expiry — a counter that never resets is not a rate limit, it
is an accidental permanent block.

### 4. The identity is the connection peer, never a header

The counted identifier is `request.client.host`. `X-Forwarded-For` and
friends are **never** read directly: a client sets those itself, so trusting
one hands every caller an unlimited supply of distinct identities and removes
the limit entirely. Behind a proxy, uvicorn rewrites `request.client` from the
forwarded header only for sources listed in `--forwarded-allow-ips`, which is
where that trust decision belongs — an operator's deployment configuration,
not application code. `tests/unit/test_security_context.py` fails the build if
any module under `app/` mentions a forwarding header.

### 5. Fail closed by default

If Redis cannot be reached, the limit cannot be applied, and the request is
refused with **503**, not served unthrottled. Redis is already a readiness
dependency, so an instance that cannot reach it is pulled from rotation
anyway; failing closed here does not introduce a new outage mode, it declines
to introduce a silent one.

`LOGIN_RATE_LIMIT_FAIL_OPEN=true` selects availability over enforcement. That
is a legitimate trade for some operators, but it is a deliberate, documented
choice — never the default, and never something a Redis blip makes on its own.

### 6. The thresholds are configuration, not policy

```
LOGIN_RATE_LIMIT_ATTEMPTS        = 10     # per window, per IP
LOGIN_RATE_LIMIT_WINDOW_SECONDS  = 300
```

**These numbers are not authoritative.** They are a conservative placeholder
chosen so the mechanism can exist and be tested: generous enough that a human
mistyping a password is unaffected, tight enough to make online guessing
useless. **OQ-SEC-18 remains open** until a product decision sets them, and
nothing in the codebase should be read as having answered it.

### 7. A refusal discloses nothing

A throttled caller receives `429` with the standard error envelope and a
`Retry-After` header. The body carries no remaining-attempt count, no budget
size and no window length: this is an unauthenticated surface, and the caller
needs to know only that it must wait.

Note that the documented `X-RateLimit-Limit` / `-Remaining` / `-Reset` headers
in `Income_Endpoints.md` are **not** emitted here. Those describe the general
*authenticated* budget, where telling a known caller its remaining quota is a
service; on an anonymous login endpoint the same headers are reconnaissance.

## Consequences

- A shared egress IP — an office, a school, a mobile carrier NAT — shares one
  budget. At 10 attempts per 5 minutes this is unlikely to bite, but it is a
  real property of per-IP limiting and a reason the threshold should be set
  deliberately rather than left at the placeholder.
- Deployments behind a load balancer **must** configure the ASGI server's
  proxy headers. Without it every request appears to come from the balancer
  and the whole deployment shares one budget.
- `forgot-password`, which the security plan names alongside login, has no
  endpoint yet. When it lands it should reuse `app/core/security/rate_limit.py`
  rather than growing its own counter.

## Alternatives Considered

- **Per-account or per-email counters as well.** Rejected here: unevidenced
  in the security plan, and it is account lockout wearing a different name.
  It becomes available the moment OQ-SEC-04 is answered.
- **Sliding window or token bucket.** Rejected as premature. A fixed window
  admits at most two budgets across a boundary; that is worth fixing when
  there is a real policy to enforce precisely, not before.
- **Middleware covering every route.** Rejected: the documented general budget
  is per authenticated user, which is a different key, a different dimension
  and a different failure mode. Applying one mechanism to both now would bake
  in a shape neither contract asked for.
- **Failing open on a Redis outage.** Rejected as the default — it turns an
  infrastructure blip into an unthrottled login endpoint, silently, exactly
  when an attacker most benefits. Available as configuration.
