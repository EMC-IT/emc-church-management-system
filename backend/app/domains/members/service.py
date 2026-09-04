"""Member operations, scoped to the caller's tenant and branches.

Members are **INTERNAL** data in `backend-security-plan.md` §6's
classification: *tenant + branch + RBAC*, with no further resource policy. So
authorization here is exactly two axes on top of the permission the route
already required, and there is deliberately no ownership, confidentiality or
approval rule -- inventing one would be inventing product policy.

Both axes are applied as **query predicates**, not as checks on rows already
fetched. A row belonging to another tenant or another branch is never loaded,
so there is no window in which it exists in memory and something forgets to
look at it. The predicate is the enforcement (`backend/CLAUDE.md` §7, which
requires the repository layer to re-apply scope as the last line of defence).

Branch scope follows ADR-011 literally: a principal's reach is exactly its
``user_branch_assignments``, and an empty set denies every branch. The mirror
of that rule decides members with no branch at all -- ``members.branch_id`` is
nullable -- and they are **not** visible: ``branch_id IS NULL`` is in nobody's
assignment set. Reading "no branch" as "every branch" would reopen fail-open
branch scope through the data rather than through the code, and would let
anyone who can create a member create one that escapes branch containment.
Creation therefore always lands a member in a real, reachable branch.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthorizationError, NotFoundError, ValidationError
from app.core.security import SecurityContext
from app.domains.members.models import Member
from app.domains.members.schemas import (
    MemberCreateRequest,
    MemberUpdateRequest,
    validate_membership_status,
)
from app.shared.pagination import Page, PaginationParams

SORTABLE_COLUMNS = {
    "firstName": Member.first_name,
    "lastName": Member.last_name,
    "email": Member.email,
    "joinDate": Member.join_date,
    "membershipStatus": Member.membership_status,
    "createdAt": Member.created_at,
}
"""Sortable fields, as an allow-list.

``sortBy`` arrives from the client. Interpolating it into an ORDER BY would be
SQL injection; resolving it through a fixed map means an unknown value is
simply refused.
"""

DEFAULT_SORT = Member.created_at

_WRITABLE_COLUMNS = frozenset(
    {
        "first_name",
        "last_name",
        "email",
        "phone",
        "address",
        "date_of_birth",
        "gender",
        "membership_status",
        "join_date",
        "avatar_url",
        "department",
        "custom_fields",
    }
)
"""Columns an update may write.

An allow-list rather than "whatever the schema dumped": it is the guard that
turns a future schema field with no column into a loud failure instead of a
``setattr`` onto a bogus attribute that reports success and writes nothing.
``tenant_id`` and ``branch_id`` are deliberately absent -- tenant is never
writable at all, and branch goes through ``resolve_branch``.
"""

_NULLABLE_COLUMNS = frozenset({"address", "avatar_url", "department", "email"})
"""Fields an update may explicitly clear by sending ``null``."""


@dataclass(frozen=True, slots=True)
class MemberFilters:
    """The subset of ``memberSearchSchema`` the ``members`` table can answer."""

    search: str | None = None
    status: str | None = None
    gender: str | None = None


def visible_members(context: SecurityContext) -> Select[tuple[Member]]:
    """The only way a member row is ever selected.

    Every read in this module starts here, so tenant and branch scope cannot be
    forgotten at one call site. ``branch_id.in_(...)`` with an empty set is a
    contradiction in SQL and yields nothing, which is the intended
    fail-closed answer for a principal with no branch assignments.
    """
    return select(Member).where(
        Member.tenant_id == context.tenant_id,
        Member.deleted_at.is_(None),
        Member.branch_id.in_(context.assigned_branch_ids),
    )


def _apply_filters(
    statement: Select[tuple[Member]], filters: MemberFilters
) -> Select[tuple[Member]]:
    if filters.search:
        pattern = f"%{filters.search}%"
        statement = statement.where(
            or_(
                Member.first_name.ilike(pattern),
                Member.last_name.ilike(pattern),
                Member.email.ilike(pattern),
                Member.phone.ilike(pattern),
            )
        )
    if filters.status:
        statement = statement.where(Member.membership_status == filters.status)
    if filters.gender:
        statement = statement.where(Member.gender == filters.gender)
    return statement


async def list_members(
    session: AsyncSession,
    context: SecurityContext,
    *,
    params: PaginationParams,
    filters: MemberFilters | None = None,
) -> Page[Member]:
    """A page of members the caller may see.

    A principal with no branch assignments gets an empty page rather than an
    error: the request was legitimate and the answer is "nothing", which is
    also what a branch with no members returns.
    """
    statement = _apply_filters(visible_members(context), filters or MemberFilters())

    total = await session.scalar(
        select(func.count()).select_from(statement.order_by(None).subquery())
    )

    column = SORTABLE_COLUMNS.get(params.sort_by or "", DEFAULT_SORT)
    ordering = column.desc() if params.is_descending else column.asc()
    rows = await session.execute(
        statement.order_by(ordering, Member.id).offset(params.offset).limit(params.limit)
    )

    return Page.create(list(rows.scalars().all()), total or 0, params)


async def get_member(
    session: AsyncSession, context: SecurityContext, member_id: uuid.UUID
) -> Member:
    """One member, or 404.

    A member in another tenant, in an unassigned branch, in no branch, or
    soft-deleted all produce the same **404** -- never 403. 403 would confirm
    the id names something real, turning this endpoint into an existence
    oracle for other churches' records (`backend-security-plan.md` §6 forbids
    disclosing another tenant's data, and an id is data). ``NotFoundError``
    already means "not within the caller's visible scope".
    """
    member = await session.scalar(visible_members(context).where(Member.id == member_id))
    if member is None:
        raise NotFoundError("Member was not found")
    return member


def resolve_branch(context: SecurityContext, requested: uuid.UUID | None) -> uuid.UUID:
    """Decide which branch a written member belongs to.

    A requested branch must be one the caller holds; otherwise this is an
    attempt to place a record where the caller could not then read it, which
    is how a resource is moved out of its own scope. An omitted branch falls
    back to the caller's primary assignment rather than to NULL, because a
    NULL-branch member is unreadable by everyone including its author.

    A principal with no assignments has no branch to write into and is
    refused, which is the same fail-closed answer ADR-011 gives for reads.
    """
    if requested is not None:
        context.require_branch(requested)
        return requested

    if context.primary_branch_id is None:
        raise AuthorizationError(
            "No branch is assigned to this account, so member records cannot be created."
        )
    return context.primary_branch_id


async def create_member(
    session: AsyncSession, context: SecurityContext, payload: MemberCreateRequest
) -> Member:
    """Create a member in the caller's tenant.

    ``tenant_id`` comes from the security context and from nowhere else: the
    request schema has no such field, and ``extra="forbid"`` means one cannot
    be smuggled in.
    """
    _validate_status(payload.membership_status)
    branch_id = resolve_branch(context, payload.branch_id)

    member = Member(
        tenant_id=context.tenant_id,
        branch_id=branch_id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email or None,
        phone=payload.phone,
        address=payload.address,
        date_of_birth=payload.date_of_birth,
        gender=payload.gender,
        membership_status=payload.membership_status,
        join_date=payload.join_date,
        avatar_url=payload.avatar_url,
        department=payload.department,
        emergency_contact_name=payload.emergency_contact.name
        if payload.emergency_contact
        else None,
        emergency_contact_phone=(
            payload.emergency_contact.phone if payload.emergency_contact else None
        ),
        emergency_contact_relationship=(
            payload.emergency_contact.relationship if payload.emergency_contact else None
        ),
        custom_fields=payload.custom_fields,
    )
    session.add(member)
    await session.flush()
    return member


async def update_member(
    session: AsyncSession,
    context: SecurityContext,
    member_id: uuid.UUID,
    payload: MemberUpdateRequest,
) -> Member:
    """Update a member the caller can already reach.

    Two separate checks, both required. The member is loaded through
    :func:`get_member`, so a record outside the caller's scope is a 404 before
    anything is written. Then, if the payload names a branch, that branch is
    checked too -- otherwise an update would be a way to push a record into a
    branch the caller does not hold, which is the mutation-boundary invariant.
    """
    member = await get_member(session, context, member_id)

    # `by_alias=False` matters: these models serialise by alias, so the default
    # dump is camelCase and every key below -- `branch_id` above all -- would
    # silently miss, skipping the branch check while still reporting success.
    fields = payload.model_dump(exclude_unset=True, by_alias=False)

    if fields.get("membership_status") is not None:
        _validate_status(fields["membership_status"])

    if "branch_id" in fields:
        member.branch_id = resolve_branch(context, fields.pop("branch_id"))

    contact = fields.pop("emergency_contact", None)
    if contact is not None:
        member.emergency_contact_name = contact["name"]
        member.emergency_contact_phone = contact["phone"]
        member.emergency_contact_relationship = contact["relationship"]

    for field, value in fields.items():
        if field not in _WRITABLE_COLUMNS:
            raise ValidationError(f"{field!r} is not an updatable member field")
        if value is not None or field in _NULLABLE_COLUMNS:
            setattr(member, field, value)

    await session.flush()
    return member


def _validate_status(value: str) -> None:
    try:
        validate_membership_status(value)
    except ValueError as exc:
        raise ValidationError(
            str(exc),
            field_errors=[{"field": "membershipStatus", "message": str(exc)}],
        ) from exc


__all__ = [
    "MemberFilters",
    "create_member",
    "get_member",
    "list_members",
    "resolve_branch",
    "update_member",
    "visible_members",
]
