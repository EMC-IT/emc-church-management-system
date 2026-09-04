"""Authentication endpoints: login, current user, password change.

The three the frontend contract defines concretely enough to build. Logout,
refresh, register, profile update and the forgot/reset pair remain deferred --
see the ADR-011 addenda for what each is waiting on.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from app.api.dependencies import (
    CurrentSecurityContext,
    CurrentUser,
    DbSession,
    enforce_login_rate_limit,
    require_permission,
)
from app.core.security import create_access_token
from app.domains.identity.authentication import authenticate, change_password
from app.domains.identity.authorization import resolve_security_context
from app.domains.identity.schemas import (
    AuthPayload,
    ChangePasswordRequest,
    LoginRequest,
    UserEnvelope,
)
from app.shared.types.responses import MessageResponse, SuccessResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=SuccessResponse[AuthPayload],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(enforce_login_rate_limit)],
    summary="Authenticate and receive an access token",
    description=(
        "Returns the user, their resolved role and permissions, and a bearer "
        "token. Permissions are echoed for UI convenience only -- they are "
        "resolved server-side on every request and are never read back from "
        "the token or the client."
    ),
)
async def login(payload: LoginRequest, session: DbSession) -> SuccessResponse[AuthPayload]:
    user = await authenticate(session, email=payload.email, password=payload.password)
    context = await resolve_security_context(session, user)
    token = create_access_token(user_id=user.id, tenant_id=user.tenant_id)

    return SuccessResponse.of(
        AuthPayload(user=UserEnvelope.of(user, context), token=token),
        message="Login successful",
    )


@router.get(
    "/me",
    response_model=SuccessResponse[UserEnvelope],
    summary="The authenticated user",
    description=(
        "Reflects current database state: a role reassigned or a permission "
        "revoked since the token was issued is visible here immediately."
    ),
)
async def read_current_user(
    user: CurrentUser, context: CurrentSecurityContext
) -> SuccessResponse[UserEnvelope]:
    return SuccessResponse.of(UserEnvelope.of(user, context))


@router.put(
    "/change-password",
    response_model=MessageResponse,
    dependencies=[Depends(require_permission("profile.security"))],
    summary="Change the authenticated user's password",
    description=(
        "Requires the current password: a stolen token alone must not be "
        "enough to take permanent ownership of an account. Clears "
        "`requirePasswordChange` on success."
    ),
)
async def change_own_password(
    payload: ChangePasswordRequest, user: CurrentUser, session: DbSession
) -> MessageResponse:
    await change_password(
        session,
        user,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )
    return MessageResponse(message="Password changed successfully")
