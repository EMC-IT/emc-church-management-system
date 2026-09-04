"""RBAC schema: roles, permissions, grants, role assignment and branch scope.

The tests that matter most here are the cross-tenant ones. RBAC is the one
place where a missing constraint is not a data-quality problem but a privilege
escalation: a user in church A holding a role belonging to church B would carry
that church's permissions. ``lib/authorization/scope.ts`` checks this in the
frontend, but per ``backend/CLAUDE.md`` §6 that is a UX affordance only, and
the security plan §4 requires the boundary to hold in the database.

So every "rejected" test below asserts that *Postgres* refuses the write, with
no service-layer validation in the picture at all -- these models are written
directly through the session.
"""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.passwords import hash_password
from app.domains.churches.models import Branch, BranchStatus, BranchType, Church
from app.domains.identity.models import (
    Permission,
    PermissionCategory,
    Role,
    RolePermission,
    User,
    UserBranchAssignment,
    UserStatus,
)

pytestmark = pytest.mark.requires_db


def _church(**overrides: object) -> Church:
    defaults: dict[str, object] = {
        "name": "Grace Chapel",
        "vision": "A vision statement at least twenty characters long.",
        "mission": "A mission statement at least twenty characters long.",
        "core_values": "Core values at least twenty characters long.",
        "email": "info@gracechapel.example",
        "phone": "0244000000",
        "street": "12 Liberation Rd",
        "city": "Accra",
        "state": "Greater Accra",
        "postal_code": "00233",
        "country": "Ghana",
        "senior_pastor": "Rev. Ama Owusu",
    }
    defaults.update(overrides)
    return Church(**defaults)


def _other_church() -> Church:
    return _church(name="Mercy Assembly", email="info@mercyassembly.example")


def _branch(tenant_id: uuid.UUID, **overrides: object) -> Branch:
    defaults: dict[str, object] = {
        "tenant_id": tenant_id,
        "name": "Adenta (HQ)",
        "type": BranchType.HEADQUARTERS,
        "established": "2005",
        "email": "adenta@gracechapel.example",
        "phone": "0244000001",
        "street": "5 Adenta Rd",
        "city": "Accra",
        "state": "Greater Accra",
        "postal_code": "00233",
        "country": "Ghana",
        "pastor": "Rev. Kofi Mensah",
        "capacity": 500,
        "status": BranchStatus.ACTIVE,
    }
    defaults.update(overrides)
    return Branch(**defaults)


def _user(tenant_id: uuid.UUID, **overrides: object) -> User:
    defaults: dict[str, object] = {
        "tenant_id": tenant_id,
        "first_name": "Ama",
        "last_name": "Owusu",
        "email": "ama.owusu@gracechapel.example",
        "username": "ama.owusu",
        "password_hash": hash_password("correct horse battery staple"),
        "status": UserStatus.ACTIVE,
    }
    defaults.update(overrides)
    return User(**defaults)


def _role(tenant_id: uuid.UUID, **overrides: object) -> Role:
    defaults: dict[str, object] = {
        "tenant_id": tenant_id,
        "key": "Admin",
        "name": "Admin",
        "is_system": True,
    }
    defaults.update(overrides)
    return Role(**defaults)


async def _two_churches(session: AsyncSession) -> tuple[Church, Church]:
    church_a, church_b = _church(), _other_church()
    session.add_all([church_a, church_b])
    await session.flush()
    return church_a, church_b


class TestRoleCreation:
    async def test_can_be_created_for_a_church(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        role = _role(church.id)
        db_session.add(role)
        await db_session.flush()

        assert role.id is not None
        assert role.tenant_id == church.id
        assert role.is_system is True

    async def test_tenant_is_required(self, db_session: AsyncSession) -> None:
        db_session.add(Role(key="Admin", name="Admin", is_system=True))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_name_is_required(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(Role(tenant_id=church.id, key="Admin"))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_cannot_reference_a_nonexistent_church(self, db_session: AsyncSession) -> None:
        db_session.add(_role(uuid.uuid4()))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_tenant_created_role_needs_no_canonical_key(
        self, db_session: AsyncSession
    ) -> None:
        """Custom roles (``settings.roles.create``) have no canonical identity."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        role = Role(
            tenant_id=church.id,
            key=None,
            name="Youth Leader",
            description="Runs the youth ministry.",
            is_system=False,
        )
        db_session.add(role)
        await db_session.flush()

        assert role.key is None
        assert role.is_system is False

    async def test_a_system_role_without_a_key_is_rejected(self, db_session: AsyncSession) -> None:
        """The seed matches on ``key``; an unkeyed system role would be
        invisible to it and get duplicated on the next run."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(Role(tenant_id=church.id, key=None, name="Admin", is_system=True))
        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestRoleUniqueness:
    async def test_the_same_key_cannot_repeat_within_one_church(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_role(church.id))
        db_session.add(_role(church.id, name="Administrator"))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_the_same_name_cannot_repeat_within_one_church(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_role(church.id))
        db_session.add(_role(church.id, key="Pastor"))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_the_same_canonical_role_exists_once_per_church(
        self, db_session: AsyncSession
    ) -> None:
        """Roles are per-tenant instances, so ``Admin`` legitimately exists in
        every church at once -- the point of ADR-008."""
        church_a, church_b = await _two_churches(db_session)

        role_a, role_b = _role(church_a.id), _role(church_b.id)
        db_session.add_all([role_a, role_b])
        await db_session.flush()

        assert role_a.id != role_b.id
        assert role_a.key == role_b.key == "Admin"

    async def test_many_custom_roles_may_have_no_key(self, db_session: AsyncSession) -> None:
        """``UNIQUE(tenant_id, key)`` must not collapse unkeyed custom roles:
        Postgres treats NULLs as distinct, which is what makes the nullable
        key workable at all."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add_all(
            [
                Role(tenant_id=church.id, name="Youth Leader", is_system=False),
                Role(tenant_id=church.id, name="Media Team", is_system=False),
            ]
        )
        await db_session.flush()

        roles = (
            (await db_session.execute(select(Role).where(Role.tenant_id == church.id)))
            .scalars()
            .all()
        )
        assert len(roles) == 2
        assert all(role.key is None for role in roles)


class TestPermissionRegistry:
    async def test_a_permission_can_be_created_with_a_canonical_code(
        self, db_session: AsyncSession
    ) -> None:
        permission = Permission(code="members.view", name="View Members Directory")
        db_session.add(permission)
        await db_session.flush()

        assert permission.id is not None
        assert permission.code == "members.view"

    async def test_the_code_is_globally_unique(self, db_session: AsyncSession) -> None:
        """Permissions are canonical definitions shared by every church, so
        uniqueness is on ``code`` alone, not scoped per tenant."""
        db_session.add_all([Permission(code="members.view"), Permission(code="members.view")])
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_code_is_required(self, db_session: AsyncSession) -> None:
        db_session.add(Permission(name="Nameless"))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_permission_may_have_no_category(self, db_session: AsyncSession) -> None:
        """A code the canonical source defines but does not categorise is
        storable as exactly that. ``pastoral-care.view``/``.manage`` were in
        that state until ADR-009 closed the gap; the columns stay nullable so
        the next such code is recordable rather than forced to invent text."""
        permission = Permission(code="some.uncategorised.code")
        db_session.add(permission)
        await db_session.flush()

        assert permission.category_id is None
        assert permission.name is None

    async def test_a_permission_can_be_grouped_into_a_category(
        self, db_session: AsyncSession
    ) -> None:
        category = PermissionCategory(
            key="members", name="Members & Converts Management", description="Member directory."
        )
        db_session.add(category)
        await db_session.flush()

        permission = Permission(code="members.view", category_id=category.id)
        db_session.add(permission)
        await db_session.flush()

        assert permission.category_id == category.id

    async def test_category_key_is_unique(self, db_session: AsyncSession) -> None:
        db_session.add_all(
            [
                PermissionCategory(key="members", name="Members", description="One."),
                PermissionCategory(key="members", name="Members Again", description="Two."),
            ]
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_category_with_permissions_cannot_be_deleted(
        self, db_session: AsyncSession
    ) -> None:
        category = PermissionCategory(key="members", name="Members", description="Directory.")
        db_session.add(category)
        await db_session.flush()
        db_session.add(Permission(code="members.view", category_id=category.id))
        await db_session.flush()

        await db_session.delete(category)
        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestRolePermissionGrants:
    async def test_a_permission_can_be_granted_to_a_role(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role, permission = _role(church.id), Permission(code="members.view")
        db_session.add_all([role, permission])
        await db_session.flush()

        db_session.add(RolePermission(role_id=role.id, permission_id=permission.id))
        await db_session.flush()

        granted = (
            (
                await db_session.execute(
                    select(RolePermission.permission_id).where(RolePermission.role_id == role.id)
                )
            )
            .scalars()
            .all()
        )
        assert granted == [permission.id]

    async def test_the_same_permission_cannot_be_granted_twice(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role, permission = _role(church.id), Permission(code="members.view")
        db_session.add_all([role, permission])
        await db_session.flush()

        db_session.add(RolePermission(role_id=role.id, permission_id=permission.id))
        await db_session.flush()
        db_session.add(RolePermission(role_id=role.id, permission_id=permission.id))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_granting_a_nonexistent_permission_is_rejected(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role = _role(church.id)
        db_session.add(role)
        await db_session.flush()

        db_session.add(RolePermission(role_id=role.id, permission_id=uuid.uuid4()))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_granting_to_a_nonexistent_role_is_rejected(
        self, db_session: AsyncSession
    ) -> None:
        permission = Permission(code="members.view")
        db_session.add(permission)
        await db_session.flush()

        db_session.add(RolePermission(role_id=uuid.uuid4(), permission_id=permission.id))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_granted_permission_cannot_be_deleted(self, db_session: AsyncSession) -> None:
        """Deleting a canonical permission out from under a role would silently
        narrow that role's authority."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role, permission = _role(church.id), Permission(code="members.view")
        db_session.add_all([role, permission])
        await db_session.flush()
        db_session.add(RolePermission(role_id=role.id, permission_id=permission.id))
        await db_session.flush()

        await db_session.delete(permission)
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_deleting_a_role_removes_its_grants(self, db_session: AsyncSession) -> None:
        """A grant has no meaning without its role, so it cascades rather than
        blocking the delete."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role, permission = _role(church.id), Permission(code="members.view")
        db_session.add_all([role, permission])
        await db_session.flush()
        db_session.add(RolePermission(role_id=role.id, permission_id=permission.id))
        await db_session.flush()

        await db_session.execute(delete(Role).where(Role.id == role.id))
        await db_session.flush()

        remaining = (
            (
                await db_session.execute(
                    select(RolePermission).where(RolePermission.role_id == role.id)
                )
            )
            .scalars()
            .all()
        )
        assert remaining == []
        assert await db_session.get(Permission, permission.id) is not None


class TestUserRoleAssignment:
    async def test_a_user_can_hold_a_role_from_their_own_church(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role = _role(church.id)
        db_session.add(role)
        await db_session.flush()

        user = _user(church.id, role_id=role.id)
        db_session.add(user)
        await db_session.flush()

        assert user.role_id == role.id

    async def test_a_user_may_have_no_role_yet(self, db_session: AsyncSession) -> None:
        """MATCH SIMPLE exempts the row while ``role_id`` is NULL, which is what
        lets this column be added to a populated ``users`` table."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        user = _user(church.id)
        db_session.add(user)
        await db_session.flush()

        assert user.role_id is None

    async def test_a_role_from_another_church_is_rejected(self, db_session: AsyncSession) -> None:
        """The privilege-escalation boundary. A plain ``role_id -> roles.id``
        foreign key would accept this write."""
        church_a, church_b = await _two_churches(db_session)
        role_b = _role(church_b.id)
        db_session.add(role_b)
        await db_session.flush()

        db_session.add(_user(church_a.id, role_id=role_b.id))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_nonexistent_role_is_rejected(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        db_session.add(_user(church.id, role_id=uuid.uuid4()))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_role_still_held_by_a_user_cannot_be_deleted(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        role = _role(church.id)
        db_session.add(role)
        await db_session.flush()
        db_session.add(_user(church.id, role_id=role.id))
        await db_session.flush()

        with pytest.raises(IntegrityError):
            await db_session.execute(delete(Role).where(Role.id == role.id))

    async def test_moving_a_user_to_another_church_cannot_smuggle_their_role(
        self, db_session: AsyncSession
    ) -> None:
        """The composite key is re-checked on UPDATE, not only on INSERT, so
        rewriting ``tenant_id`` alone cannot carry the old role across."""
        church_a, church_b = await _two_churches(db_session)
        role_a = _role(church_a.id)
        db_session.add(role_a)
        await db_session.flush()
        user = _user(church_a.id, role_id=role_a.id)
        db_session.add(user)
        await db_session.flush()

        user.tenant_id = church_b.id
        with pytest.raises(IntegrityError):
            await db_session.flush()


class TestUserBranchAssignment:
    async def test_a_user_can_be_assigned_to_a_branch_of_their_own_church(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        branch, user = _branch(church.id), _user(church.id)
        db_session.add_all([branch, user])
        await db_session.flush()

        assignment = UserBranchAssignment(
            tenant_id=church.id, user_id=user.id, branch_id=branch.id, is_primary=True
        )
        db_session.add(assignment)
        await db_session.flush()

        assert assignment.id is not None
        assert assignment.is_primary is True

    async def test_a_branch_from_another_church_is_rejected(self, db_session: AsyncSession) -> None:
        """``assignedBranchIds`` drives every branch-scope decision, so an
        assignment naming another church's branch is a scope escape."""
        church_a, church_b = await _two_churches(db_session)
        branch_b, user_a = _branch(church_b.id), _user(church_a.id)
        db_session.add_all([branch_b, user_a])
        await db_session.flush()

        db_session.add(
            UserBranchAssignment(tenant_id=church_a.id, user_id=user_a.id, branch_id=branch_b.id)
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_user_from_another_church_is_rejected(self, db_session: AsyncSession) -> None:
        church_a, church_b = await _two_churches(db_session)
        branch_a, user_b = _branch(church_a.id), _user(church_b.id)
        db_session.add_all([branch_a, user_b])
        await db_session.flush()

        db_session.add(
            UserBranchAssignment(tenant_id=church_a.id, user_id=user_b.id, branch_id=branch_a.id)
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_the_same_branch_cannot_be_assigned_twice(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        branch, user = _branch(church.id), _user(church.id)
        db_session.add_all([branch, user])
        await db_session.flush()

        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_user_may_hold_several_branches(self, db_session: AsyncSession) -> None:
        """``assignedBranchIds`` is a list, which is why this is a join table
        rather than a column on ``users``."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        hq = _branch(church.id)
        east = _branch(church.id, name="East Campus", type=BranchType.BRANCH)
        user = _user(church.id)
        db_session.add_all([hq, east, user])
        await db_session.flush()

        db_session.add_all(
            [
                UserBranchAssignment(
                    tenant_id=church.id, user_id=user.id, branch_id=hq.id, is_primary=True
                ),
                UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=east.id),
            ]
        )
        await db_session.flush()

        assigned = (
            (
                await db_session.execute(
                    select(UserBranchAssignment.branch_id).where(
                        UserBranchAssignment.user_id == user.id
                    )
                )
            )
            .scalars()
            .all()
        )
        assert set(assigned) == {hq.id, east.id}

    async def test_only_one_branch_can_be_primary(self, db_session: AsyncSession) -> None:
        """``SecurityContext.branchId`` is a single active branch."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        hq = _branch(church.id)
        east = _branch(church.id, name="East Campus", type=BranchType.BRANCH)
        user = _user(church.id)
        db_session.add_all([hq, east, user])
        await db_session.flush()

        db_session.add_all(
            [
                UserBranchAssignment(
                    tenant_id=church.id, user_id=user.id, branch_id=hq.id, is_primary=True
                ),
                UserBranchAssignment(
                    tenant_id=church.id, user_id=user.id, branch_id=east.id, is_primary=True
                ),
            ]
        )
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_a_branch_with_users_assigned_cannot_be_deleted(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        branch, user = _branch(church.id), _user(church.id)
        db_session.add_all([branch, user])
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        await db_session.flush()

        with pytest.raises(IntegrityError):
            await db_session.execute(delete(Branch).where(Branch.id == branch.id))

    async def test_deleting_a_user_removes_their_assignments(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        branch, user = _branch(church.id), _user(church.id)
        db_session.add_all([branch, user])
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        await db_session.flush()

        await db_session.execute(delete(User).where(User.id == user.id))
        await db_session.flush()

        remaining = (
            (
                await db_session.execute(
                    select(UserBranchAssignment).where(UserBranchAssignment.user_id == user.id)
                )
            )
            .scalars()
            .all()
        )
        assert remaining == []


class TestCrossTenantEscalationIsImpossible:
    """The composed statement of §17: tenant A's user cannot reach tenant B's
    role, and therefore cannot reach the permissions that role grants."""

    async def test_a_user_cannot_reach_another_churchs_permissions_through_a_role(
        self, db_session: AsyncSession
    ) -> None:
        church_a, church_b = await _two_churches(db_session)

        role_b = _role(church_b.id, key="SuperAdmin", name="SuperAdmin")
        permission = Permission(code="settings.permissions.manage")
        db_session.add_all([role_b, permission])
        await db_session.flush()
        db_session.add(RolePermission(role_id=role_b.id, permission_id=permission.id))
        await db_session.flush()

        # Church B's SuperAdmin genuinely holds the permission.
        granted = (
            (
                await db_session.execute(
                    select(RolePermission.permission_id).where(RolePermission.role_id == role_b.id)
                )
            )
            .scalars()
            .all()
        )
        assert granted == [permission.id]

        # A church A user reaching for it is refused by the database.
        db_session.add(_user(church_a.id, role_id=role_b.id))
        with pytest.raises(IntegrityError):
            await db_session.flush()

    async def test_roles_do_not_leak_across_the_tenant_boundary_in_queries(
        self, db_session: AsyncSession
    ) -> None:
        church_a, church_b = await _two_churches(db_session)
        db_session.add_all([_role(church_a.id), _role(church_b.id, name="Admin")])
        await db_session.flush()

        visible = (
            (await db_session.execute(select(Role).where(Role.tenant_id == church_a.id)))
            .scalars()
            .all()
        )

        assert len(visible) == 1
        assert visible[0].tenant_id == church_a.id
