"""Resolving an authenticated principal's authorization state from the database.

The whole of the ADR-011 pipeline lives here:

    token -> user -> tenant -> role -> permissions -> branches

Every step reads current database state. Nothing is taken from the token
beyond the user id and a tenant claim that is cross-checked against the user
record, so reassigning a role or revoking a permission takes effect on the
principal's next request rather than when their token happens to expire.

Every query is filtered by the authenticated tenant as well as by the entity
id. The composite foreign keys from ADR-007/ADR-008 already make a cross-tenant
role or branch assignment unstorable; the redundant predicate means a
resolution bug cannot read across the boundary even if one were.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError
from app.core.security.context import SecurityContext
from app.core.security.tokens import TokenClaims
from app.domains.identity.models import (
    Permission,
    Role,
    RolePermission,
    User,
    UserBranchAssignment,
    UserStatus,
)


async def load_authenticated_user(session: AsyncSession, claims: TokenClaims) -> User:
    """Load the user a verified token identifies, or reject the request.

    Rejects with 401 rather than 403 throughout: none of these states is "this
    principal lacks a permission", they are "this token does not identify a
    usable principal", and the frontend's interceptor should end the session.

    The tenant claim is checked against the stored ``tenant_id`` rather than
    used to scope the lookup -- a token whose claim disagrees with the user
    record is not a token to trust the claim from.
    """
    user = await session.get(User, claims.user_id)

    if (
        user is None
        or user.deleted_at is not None
        or user.status is not UserStatus.ACTIVE
        or user.tenant_id != claims.tenant_id
    ):
        raise AuthenticationError()

    return user


async def resolve_security_context(session: AsyncSession, user: User) -> SecurityContext:
    """Build the principal's effective authorization state.

    A user with no role, or whose role resolves to nothing within their own
    tenant, gets an empty permission set rather than an exception: they are
    authenticated but authorized for nothing, so every permission check denies
    and returns 403. Raising here instead would report an authorization
    outcome as an authentication failure.
    """
    role = await _load_role(session, tenant_id=user.tenant_id, role_id=user.role_id)
    permissions = (
        await _load_permission_codes(session, tenant_id=user.tenant_id, role_id=role.id)
        if role is not None
        else frozenset()
    )
    assigned, primary = await _load_branch_assignments(
        session, tenant_id=user.tenant_id, user_id=user.id
    )

    return SecurityContext(
        user_id=user.id,
        tenant_id=user.tenant_id,
        role_id=role.id if role else None,
        role_key=role.key if role else None,
        role_name=role.name if role else None,
        permissions=permissions,
        assigned_branch_ids=assigned,
        primary_branch_id=primary,
    )


async def _load_role(
    session: AsyncSession, *, tenant_id: uuid.UUID, role_id: uuid.UUID | None
) -> Role | None:
    if role_id is None:
        return None
    return (
        await session.execute(select(Role).where(Role.id == role_id, Role.tenant_id == tenant_id))
    ).scalar_one_or_none()


async def _load_permission_codes(
    session: AsyncSession, *, tenant_id: uuid.UUID, role_id: uuid.UUID
) -> frozenset[str]:
    result = await session.execute(
        select(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(Role, Role.id == RolePermission.role_id)
        .where(Role.id == role_id, Role.tenant_id == tenant_id)
    )
    return frozenset(result.scalars().all())


async def _load_branch_assignments(
    session: AsyncSession, *, tenant_id: uuid.UUID, user_id: uuid.UUID
) -> tuple[frozenset[uuid.UUID], uuid.UUID | None]:
    result = await session.execute(
        select(UserBranchAssignment.branch_id, UserBranchAssignment.is_primary).where(
            UserBranchAssignment.user_id == user_id,
            UserBranchAssignment.tenant_id == tenant_id,
        )
    )
    rows = result.tuples().all()
    assigned = frozenset(branch_id for branch_id, _ in rows)
    primary = next((branch_id for branch_id, is_primary in rows if is_primary), None)
    return assigned, primary
