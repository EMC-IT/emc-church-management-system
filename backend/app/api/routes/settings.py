"""Settings endpoints -- church profile only.

Two operations, both gated by ``settings.church-profile``, the one canonical
code that names this resource. The rest of the `/settings` surface the route
tree implies -- branches, users, roles, the permissions matrix, integrations,
backups, the notification defaults and the `GET|PUT /settings` aggregate
itself -- is deliberately absent. See the Phase 2B-9 addendum to ADR-011 for
what each is blocked on; in no case is it a missing permission code.

**Read is gated by the manage permission, deliberately.** No canonical code
means "view the church profile": the catalogue has ``settings.church-profile``
("Manage Church Profile") and the broader ``settings.view`` ("Access settings
overview and general configurations"). Gating the read on the narrower of the
two cannot over-grant; choosing ``settings.view`` would decide, by
implementation, that every ``Pastor`` may read the church's full profile --
a product decision nothing in the repository makes. Recorded as OQ-SEC-21.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentSecurityContext, DbSession, require_permission
from app.domains.churches import service
from app.domains.churches.schemas import ChurchProfileEnvelope, ChurchProfileUpdateRequest
from app.shared.types.responses import SuccessResponse

router = APIRouter(prefix="/settings", tags=["Settings"])

CHURCH_PROFILE = "settings.church-profile"


@router.get(
    "/church-profile",
    response_model=SuccessResponse[ChurchProfileEnvelope],
    dependencies=[Depends(require_permission(CHURCH_PROFILE))],
    summary="The caller's own church profile",
    description=(
        "Tenant-wide reference data: no branch scope applies, so a principal "
        "with no branch assignments can still read it (ADR-011 Decision 4). "
        "The church returned is always the caller's own -- it is identified "
        "from the security context, and the route takes no identifier."
    ),
)
async def get_church_profile(
    session: DbSession, context: CurrentSecurityContext
) -> SuccessResponse[ChurchProfileEnvelope]:
    church = await service.get_church_profile(session, context)
    return SuccessResponse.of(ChurchProfileEnvelope.of(church))


@router.put(
    "/church-profile",
    response_model=SuccessResponse[ChurchProfileEnvelope],
    dependencies=[Depends(require_permission(CHURCH_PROFILE))],
    summary="Update the caller's own church profile",
    description=(
        "Partial: only the fields present are written, matching the one "
        "documented settings write. There is no way to name another church -- "
        "the row updated is resolved from the security context."
    ),
)
async def update_church_profile(
    payload: ChurchProfileUpdateRequest,
    session: DbSession,
    context: CurrentSecurityContext,
) -> SuccessResponse[ChurchProfileEnvelope]:
    church = await service.update_church_profile(session, context, payload)
    return SuccessResponse.of(
        ChurchProfileEnvelope.of(church), message="Church profile updated successfully"
    )
