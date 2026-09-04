"""Member endpoints -- the first domain wired to the authorization pipeline.

Four operations, each gated by the canonical permission code the catalogue
already defines. Handlers stay thin (`backend/CLAUDE.md` §12): the permission
is a route dependency, and tenant and branch scope live in the service as
query predicates.

`DELETE /members/{id}` and every `/members/{id}/*` sub-resource are
deliberately absent. See the Phase 2B-8 addendum to ADR-011 for what each one
is blocked on -- in every case an unresolved contract or a domain that has no
schema, never a missing permission.
"""

from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import CurrentSecurityContext, DbSession, Pagination, require_permission
from app.domains.members import service
from app.domains.members.schemas import (
    MemberCreateRequest,
    MemberEnvelope,
    MemberUpdateRequest,
)
from app.shared.types.responses import PaginatedResponse, SuccessResponse

router = APIRouter(prefix="/members", tags=["Members"])


def member_filters(
    search: Annotated[str | None, Query(max_length=255)] = None,
    status_: Annotated[str | None, Query(alias="status", max_length=50)] = None,
    gender: Annotated[str | None, Query(max_length=20)] = None,
) -> service.MemberFilters:
    """``memberSearchSchema``'s filters, minus those the table cannot answer.

    ``ageGroup`` is not offered: it would have to be derived from
    ``date_of_birth`` against band definitions the repository does not specify.
    """
    return service.MemberFilters(search=search, status=status_, gender=gender)


MemberFilterParams = Annotated[service.MemberFilters, Depends(member_filters)]


@router.get(
    "",
    response_model=PaginatedResponse[MemberEnvelope],
    dependencies=[Depends(require_permission("members.view"))],
    summary="List members in the caller's assigned branches",
    description=(
        "Scoped to the caller's tenant and to the branches assigned to them. "
        "A principal with no branch assignments receives an empty page, not "
        "every member (ADR-011)."
    ),
)
async def list_members(
    session: DbSession,
    context: CurrentSecurityContext,
    pagination: Pagination,
    filters: MemberFilterParams,
) -> PaginatedResponse[MemberEnvelope]:
    page = await service.list_members(session, context, params=pagination, filters=filters)
    return PaginatedResponse.of(
        [MemberEnvelope.of(member) for member in page.items],
        total=page.total,
        page=page.page,
        limit=page.limit,
    )


@router.get(
    "/{member_id}",
    response_model=SuccessResponse[MemberEnvelope],
    dependencies=[Depends(require_permission("members.view"))],
    summary="One member",
    description=(
        "Answers 404 for a member in another tenant, in an unassigned branch, "
        "or in no branch -- never 403, which would confirm the record exists."
    ),
)
async def get_member(
    member_id: uuid.UUID, session: DbSession, context: CurrentSecurityContext
) -> SuccessResponse[MemberEnvelope]:
    member = await service.get_member(session, context, member_id)
    return SuccessResponse.of(MemberEnvelope.of(member))


@router.post(
    "",
    response_model=SuccessResponse[MemberEnvelope],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("members.create"))],
    summary="Create a member",
    description=(
        "The member is created in the caller's own tenant. A supplied "
        "`branchId` must be one the caller is assigned to; an omitted one "
        "falls back to their primary branch."
    ),
)
async def create_member(
    payload: MemberCreateRequest, session: DbSession, context: CurrentSecurityContext
) -> SuccessResponse[MemberEnvelope]:
    member = await service.create_member(session, context, payload)
    return SuccessResponse.of(MemberEnvelope.of(member), message="Member created successfully")


@router.put(
    "/{member_id}",
    response_model=SuccessResponse[MemberEnvelope],
    dependencies=[Depends(require_permission("members.edit"))],
    summary="Update a member",
    description=(
        "Both the member's current branch and any requested new branch must be "
        "ones the caller holds, so an update cannot move a record out of the "
        "caller's reach or into a branch they lack."
    ),
)
async def update_member(
    member_id: uuid.UUID,
    payload: MemberUpdateRequest,
    session: DbSession,
    context: CurrentSecurityContext,
) -> SuccessResponse[MemberEnvelope]:
    member = await service.update_member(session, context, member_id, payload)
    return SuccessResponse.of(MemberEnvelope.of(member), message="Member updated successfully")
