# ADR-009: Permission Catalogue Completeness — One Gap Closed, Three Families Deferred

**Status:** Accepted
**Resolves:** OQ-SEC-05 (partially — see Deferred below)
**Relates to:** ADR-003 (authoritative RBAC model), ADR-008 (RBAC storage)
**Date:** 2026-09-03

## Context

Phase 2B-4A transcribed the canonical permission catalogue into the backend and
found that `lib/authorization/permissions.ts` disagreed with itself. Phase
2B-4B turns that catalogue into enforcement, so any contradiction in it becomes
a contradiction in live authorization behaviour. The catalogue has to be
internally consistent *before* anything reads it to make an allow/deny
decision.

Two distinct problems were on the table:

1. A live inconsistency that made `SuperAdmin` less privileged than `Admin`.
2. Three permission families that ADR-003 and the security plan's OQ-SEC-05
   flagged as missing, with no decision recorded either way.

These need opposite treatments. The first is a defect and was fixed. The
second is a set of open product questions, and inventing permissions to close
them would be worse than leaving them open.

## Decision 1 — `pastoral-care` is now a permission category (resolved)

`pastoral-care.view` and `pastoral-care.manage` were defined in the flat
`PERMISSIONS` const and granted to `Admin` and `Pastor` by `ROLE_PERMISSIONS`,
but belonged to **no** `PERMISSION_CATEGORIES` entry.

Because `ROLE_PERMISSIONS[SuperAdmin]` is computed by flattening the
categories:

```ts
[ROLES.SUPER_ADMIN]: PERMISSION_CATEGORIES.flatMap(c => c.permissions.map(p => p.id)),
```

**SuperAdmin did not receive two permissions that Admin and Pastor held.** That
contradicts `lib/authorization/policies.ts`, where `SuperAdmin` short-circuits
to universal access, and it would have contradicted the backend too, which
resolves permissions from `role_permissions` rather than short-circuiting on a
role name (ADR-011).

A new `pastoral-care` category was added to `PERMISSION_CATEGORIES`, holding
exactly those two existing codes. This is why that is the right shape rather
than folding them into `prayer-requests`:

- Pastoral care is a distinct admin module with its own route
  (`/dashboard/pastoral-care`), its own backend domain package
  (`app/domains/pastoral_care/`), and its own entities in the domain map
  (`pastoral_cases`, `pastoral_sessions`).
- The security plan classifies pastoral records as CONFIDENTIAL with their own
  resource policies, separate from prayer requests.
- The two codes already sat at the end of the flat const's
  "Prayer Requests & Pastoral Care" block, i.e. adjacent to but distinct from
  the prayer-request codes.

**No permission code was invented, renamed, or removed.** The category is
grouping metadata over codes that already existed. The category's own `name`
and `description`, and the two permissions' `name`/`description`, are new
display text written to match the surrounding entries' style — the canonical
source has always required those three fields on a categorised permission, and
these two codes were the only ones in the file lacking them.

Effect: the two lists now agree at 164 codes each, and
`ROLE_PERMISSIONS[SuperAdmin]` is a true superset of every other role's grants.

### Why the columns stay nullable

`permissions.name`, `.description` and `.category_id` remain nullable even
though every seeded row now fills them. That nullability is the mechanism that
let this gap be *recorded* rather than papered over: an uncategorised code gets
seeded with NULLs, which is visible in the data, instead of being dropped
(silently under-granting a role) or given invented text (silently inventing
product decisions). Tightening the columns now would remove the only honest
representation of the next such gap. `tests/unit/test_rbac_registry.py`
asserts that there are currently none, which is the guarantee that matters.

## Decision 2 — Three families are formally deferred

None of these is invented into the catalogue. Each is recorded here with what
would have to be decided first, and each is pinned as *absent* by
`tests/unit/test_rbac_registry.py::TestDeferredPermissionFamilies`, so adding
one is a deliberate act that updates this ADR alongside the code.

| Family | Status | What must be decided first |
| :-- | :-- | :-- |
| `finance.expenses.approve` | **Deferred to the Finance domain phase.** | Whether expense approval is a real workflow state at all. `security-boundary-map.md` §3 assumes an approver role, but no frontend screen, schema or service implements an approval step, and `Accountant` currently holds full CRUD on expenses with no separate approver. A permission guarding a workflow that does not exist would be enforcement theatre. |
| `files.*` | **Deferred to the File Vault domain phase.** | The whole permission model for `/dashboard/files`, which today has none. `members.documents` covers only member-scoped documents. This needs a family (view/upload/download/delete/share), a confidentiality split for `medical`/`legal`/`financial` documents, and a decision on per-file sharing (`document_shares` in the database plan) — a domain design, not a permission rename. |
| `pastoral-care.view-confidential` | **Deferred, pending OQ-SEC-14.** | Whether a general `Admin` should read counselling notes. The current role matrix says yes (`Admin` holds `pastoral-care.manage`); the confidentiality requirement in the security plan says no. Adding the permission before resolving that would encode the unresolved question into enforcement. `prayer-requests.view-confidential` already exists and is the precedent to follow once decided. |

### Why deferral is safe for Phase 2B-4B

Adding a permission is a **data** change — seed rows and a `ROLE_PERMISSIONS`
entry — not a schema change. The tables, the composite-FK integrity, the seed
and the resolution path introduced in ADR-008 all work unchanged when a family
lands later. What 2B-4B must not do is *assume* these codes exist: no
authorization dependency, policy or endpoint may reference a code that is not
in the catalogue, and none may fall back to a role-name check in its absence
(ADR-011).

The practical consequence is that these capabilities are **unavailable**, not
implicitly permitted. Expense approval, File Vault access and confidential
pastoral notes have no permission to grant, so under fail-closed evaluation
nobody is authorised for them until the decision is made. That is the correct
posture for an undecided boundary.

## Consequences

- `lib/authorization/permissions.ts` gains one category and no codes. The
  frontend test suite is unaffected (120 tests, unchanged before and after) and
  `tsc --noEmit` is clean.
- `app/(admin)/dashboard/settings/permissions/page.tsx` gains one entry in its
  `categoryIcons` map so the new category renders with a pastoral icon rather
  than the generic `Folder` fallback. No other UI change.
- The backend registry was regenerated by `scripts/generate_rbac_registry.py`;
  `SuperAdmin` now seeds 164 grants instead of 162.
- `tests/unit/test_rbac_registry.py`'s gap pins became invariant assertions:
  every defined code belongs to a category, and SuperAdmin's set is a superset
  of every role's. The same test failed loudly when the fix landed, which is
  exactly what a pin is for.
- OQ-SEC-05 is partially resolved. The `pastoral-care` half is closed; the
  three families above remain open and are tracked here rather than in the
  security plan's open-questions table alone.

## Alternatives Considered

- **Fold the two codes into the `prayer-requests` category.** Rejected: it
  would make the catalogue self-consistent while misrepresenting the domain
  model, and it would tie pastoral-care authorization to a category that a
  future `prayer-requests.*` change could disturb.
- **Leave the gap and special-case SuperAdmin in the backend** (short-circuit
  to universal access, as `policies.ts` does). Rejected: that is the
  `if user.role == "SuperAdmin"` pattern ADR-011 forbids, and it would hide a
  data defect behind a code path instead of fixing the data.
- **Drop the two uncategorised codes from the seed.** Rejected: `Admin` and
  `Pastor` genuinely grant them and a real admin page depends on them, so
  dropping them would silently strip authority from two roles.
- **Invent the three deferred families now**, since the schema supports them.
  Rejected under ADR-003's rule that the canonical files are authoritative and
  the backend must not invent a parallel scheme. Each family encodes a product
  decision (is there an approval step? who may read counselling notes?) that
  the repository does not answer.
