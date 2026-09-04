"""Church profile operations -- the first **tenant-wide** endpoint.

The church profile is tenant-wide reference data, and that is settled rather
than inferred: ``backend-domain-map.md`` §5 lists ``church_profile`` in the
"Tenant-wide only" column, ``backend-security-plan.md`` §4.2 says tenant-wide
reference data "is readable across branches", and ADR-011 Decision 4 names the
church profile in the same breath ("branch scope is **opt-in per endpoint**:
it applies only where a resource is branch-scoped"). All three agree, so **no
branch predicate belongs here** -- and a principal with no branch assignments
at all can still read and write it, which is exactly the promise ADR-011 makes
when it says an unassigned principal "is not locked out of the application".

That makes this the first endpoint where the tenant predicate stands alone.
Phase 2B-8 found that ``members``' tenant predicate was only enforced
*transitively*, through the branch predicate, and recorded that this "is fine
until the first tenant-wide endpoint". This is that endpoint: there is no
second predicate to fall back on, so ``Church.id == context.tenant_id`` is the
whole of the isolation and is asserted structurally as well as behaviourally.

The resource is a **singleton**: the church row *is* the tenant, so its
identity is ``context.tenant_id`` and never a path, query or body value. There
is no identifier for a caller to tamper with -- the strongest form of "never
trust a client-supplied tenant id" is to give the client nowhere to supply one.
"""

from __future__ import annotations

from pydantic.alias_generators import to_camel
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.core.security import SecurityContext
from app.domains.churches.models import Church
from app.domains.churches.schemas import ChurchProfileUpdateRequest

_WRITABLE_COLUMNS = frozenset(
    {
        "name",
        "motto",
        "vision",
        "mission",
        "core_values",
        "history",
        "founded",
        "denomination",
        "email",
        "phone",
        "alternative_phone",
        "website",
        "street",
        "city",
        "state",
        "postal_code",
        "country",
        "facebook",
        "twitter",
        "instagram",
        "youtube",
        "senior_pastor",
        "assistant_pastor",
        "secretary",
        "treasurer",
    }
)
"""Columns an update may write -- an allow-list, not "whatever the schema dumped".

``id`` and the timestamps are absent, so identity and audit columns cannot be
reached through a request body even if a future schema gains such a field. A
field that is not here fails loudly rather than being ``setattr`` onto a bogus
attribute, which would report success and write nothing (the Phase 2B-8
lesson).
"""

_NULLABLE_COLUMNS = frozenset(
    {
        "motto",
        "history",
        "founded",
        "denomination",
        "alternative_phone",
        "website",
        "facebook",
        "twitter",
        "instagram",
        "youtube",
        "assistant_pastor",
        "secretary",
        "treasurer",
    }
)
"""Fields an update may explicitly clear by sending ``null``.

Exactly the columns ``churches`` declares nullable, which are exactly the
fields ``churchProfileSchema`` marks ``.optional()``. Clearing anything else
is refused rather than silently skipped: the database would reject it anyway,
and a 200 that quietly kept the old value is the failure mode this phase's
predecessor was written to prevent.
"""


def visible_church(context: SecurityContext) -> Select[tuple[Church]]:
    """The only way a church row is ever selected.

    ``churches`` carries no ``tenant_id`` column -- its ``id`` *is* the tenant
    id (ADR-005) -- so ``Church.id == context.tenant_id`` is the tenant
    predicate, not a primary-key lookup that happens to use it. Removing it
    would return an arbitrary church, which is a cross-tenant read.
    """
    return select(Church).where(Church.id == context.tenant_id)


async def get_church_profile(session: AsyncSession, context: SecurityContext) -> Church:
    """The caller's own church.

    ``NotFoundError`` here is a should-not-happen: an authenticated principal
    was resolved from a ``users`` row whose ``tenant_id`` has a ``RESTRICT``
    foreign key to this table. It stays fail-closed rather than asserting.
    """
    church = await session.scalar(visible_church(context))
    if church is None:
        raise NotFoundError("Church profile was not found")
    return church


async def update_church_profile(
    session: AsyncSession, context: SecurityContext, payload: ChurchProfileUpdateRequest
) -> Church:
    """Update the caller's own church profile.

    The row is loaded through :func:`get_church_profile`, so the tenant
    predicate is applied before anything is written; there is no separate
    "which church?" decision for an attacker to influence.
    """
    church = await get_church_profile(session, context)

    # `by_alias=False` matters: these models serialise by alias, so the default
    # dump is camelCase and every key below would miss the allow-list and be
    # rejected -- or, worse, be written to an attribute that does not exist.
    fields = payload.model_dump(exclude_unset=True, by_alias=False)

    for field, value in fields.items():
        # Errors name the field as the wire spells it; `field` is the Python
        # attribute, and a caller cannot act on a name it never sent.
        wire_name = to_camel(field)
        if field not in _WRITABLE_COLUMNS:
            raise ValidationError(f"{wire_name!r} is not an updatable church profile field")
        if value is None and field not in _NULLABLE_COLUMNS:
            raise ValidationError(
                f"{wire_name!r} is required and cannot be cleared",
                field_errors=[{"field": wire_name, "message": "This field cannot be cleared"}],
            )
        setattr(church, field, value)

    await session.flush()
    return church


__all__ = ["get_church_profile", "update_church_profile", "visible_church"]
