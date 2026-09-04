"""Provisioning a new church: the founding administrator problem.

ADR-011's addendum recorded a prerequisite this module exists to satisfy:
branch access is assignment data with no role-based shortcut, so a church
whose founding administrator holds no ``user_branch_assignments`` has nobody
who can act in its branches. Seeding roles is not enough.

    Church -> Branches -> canonical roles -> founding User -> branch assignments

The whole sequence is one transaction. A church with roles but no
administrator, or an administrator with no branch access, is exactly the
half-provisioned state that would be discovered later as a lockout.

Idempotent by re-running safely: every step is matched on an identity the
database already enforces as unique -- ``branches(tenant_id, name)``,
``users(tenant_id, email)``, ``user_branch_assignments(user_id, branch_id)``,
and ``roles(tenant_id, key)`` via the existing seed. A retry after a partial
failure completes the tenant rather than duplicating it.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database.transaction import transaction_scope
from app.core.security.passwords import hash_password
from app.domains.churches.models import Branch, Church
from app.domains.identity.models import Role, User, UserBranchAssignment, UserStatus
from app.domains.identity.rbac_registry import CANONICAL_ROLES
from app.domains.identity.rbac_seed import seed_tenant_roles, sync_permission_registry

DEFAULT_FOUNDING_ROLE_KEY = "SuperAdmin"


@dataclass(frozen=True, slots=True)
class FoundingAdmin:
    """The first user a church gets, and the credentials they sign in with."""

    first_name: str
    last_name: str
    email: str
    username: str
    password: str
    role_key: str = DEFAULT_FOUNDING_ROLE_KEY


@dataclass(frozen=True, slots=True)
class ProvisionedTenant:
    """What provisioning established, whether this run or an earlier one."""

    church: Church
    branches: tuple[Branch, ...]
    role: Role
    founding_user: User
    assigned_branch_ids: tuple[Branch, ...]
    primary_branch: Branch


async def provision_church(
    session: AsyncSession,
    *,
    church: Church,
    branches: Sequence[Branch],
    founding_admin: FoundingAdmin,
) -> ProvisionedTenant:
    """Create a usable church: roles seeded, one administrator, branch access.

    ``branches`` must be non-empty, and its **first** entry becomes the
    founding administrator's primary branch. Ordering is the caller's rather
    than inferred from ``BranchType.HEADQUARTERS``, so provisioning never has
    to guess which of several branches the administrator primarily works in.

    The founding administrator is assigned to **every** branch created here,
    explicitly, one row each. That is the whole of their branch access: no
    role name and no permission set widens it (ADR-010, ADR-011).
    """
    if not branches:
        raise ValueError("A church must be provisioned with at least one branch.")
    if founding_admin.role_key not in {role.key for role in CANONICAL_ROLES}:
        raise ValueError(
            f"{founding_admin.role_key!r} is not a canonical role. Founding "
            f"administrators hold one of the roles seeded from "
            f"lib/authorization/roles.ts (ADR-003, ADR-008)."
        )

    async with transaction_scope(session):
        persisted_church = await _ensure_church(session, church)
        persisted_branches = await _ensure_branches(session, persisted_church, branches)

        await sync_permission_registry(session)
        await seed_tenant_roles(session, persisted_church.id)
        role = await _load_role(session, persisted_church, founding_admin.role_key)

        user = await _ensure_founding_user(session, persisted_church, role, founding_admin)
        primary = persisted_branches[0]
        await _ensure_branch_assignments(
            session, persisted_church, user, persisted_branches, primary
        )

    return ProvisionedTenant(
        church=persisted_church,
        branches=tuple(persisted_branches),
        role=role,
        founding_user=user,
        assigned_branch_ids=tuple(persisted_branches),
        primary_branch=primary,
    )


async def _ensure_church(session: AsyncSession, church: Church) -> Church:
    """Persist the church, or reuse it when a retry passes one already stored."""
    if church.id is not None and await session.get(Church, church.id) is not None:
        return church
    session.add(church)
    await session.flush()
    return church


async def _ensure_branches(
    session: AsyncSession, church: Church, branches: Sequence[Branch]
) -> list[Branch]:
    """Create each branch, matching an existing one by ``(tenant_id, name)``."""
    existing = {
        branch.name: branch
        for branch in (
            await session.execute(select(Branch).where(Branch.tenant_id == church.id))
        ).scalars()
    }

    resolved: list[Branch] = []
    for branch in branches:
        already = existing.get(branch.name)
        if already is not None:
            resolved.append(already)
            continue
        branch.tenant_id = church.id
        session.add(branch)
        resolved.append(branch)
    await session.flush()
    return resolved


async def _load_role(session: AsyncSession, church: Church, role_key: str) -> Role:
    return (
        await session.execute(select(Role).where(Role.tenant_id == church.id, Role.key == role_key))
    ).scalar_one()


async def _ensure_founding_user(
    session: AsyncSession, church: Church, role: Role, admin: FoundingAdmin
) -> User:
    """Create the administrator, matching an existing one by ``(tenant_id, email)``.

    A retry does not reset an existing user's password, role or status: by then
    the church may have changed any of them, and provisioning re-running is not
    a reason to undo that.
    """
    existing = (
        await session.execute(
            select(User).where(User.tenant_id == church.id, User.email == admin.email)
        )
    ).scalar_one_or_none()
    if existing is not None:
        return existing

    user = User(
        tenant_id=church.id,
        first_name=admin.first_name,
        last_name=admin.last_name,
        email=admin.email,
        username=admin.username,
        password_hash=hash_password(admin.password),
        role_id=role.id,
        status=UserStatus.ACTIVE,
        # The founding administrator chose this password during onboarding, so
        # there is nothing to force a change of -- unlike an admin-created user,
        # whose password someone else picked.
        require_password_change=False,
    )
    session.add(user)
    await session.flush()
    return user


async def _ensure_branch_assignments(
    session: AsyncSession,
    church: Church,
    user: User,
    branches: Sequence[Branch],
    primary: Branch,
) -> None:
    assigned = set(
        (
            await session.execute(
                select(UserBranchAssignment.branch_id).where(
                    UserBranchAssignment.user_id == user.id
                )
            )
        )
        .scalars()
        .all()
    )

    for branch in branches:
        if branch.id in assigned:
            continue
        session.add(
            UserBranchAssignment(
                tenant_id=church.id,
                user_id=user.id,
                branch_id=branch.id,
                is_primary=branch.id == primary.id and not assigned,
            )
        )
    await session.flush()
