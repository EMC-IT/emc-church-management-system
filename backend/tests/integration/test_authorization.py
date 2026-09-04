"""The authorization pipeline, end to end over HTTP.

    token -> user -> tenant -> role -> permissions -> branches

Every test drives the real dependency chain through the real exception
handlers, so the assertions cover status codes and the error envelope as well
as the allow/deny decision.

The regression tests are the point of the file. Authorization must depend on
current server-side state, not on what a token said when it was issued, so
several tests mutate the database *after* minting a token and assert the next
request reflects the change.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from datetime import timedelta

import pytest
from fastapi import Depends, FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import (
    CurrentSecurityContext,
    require_branch_access,
    require_permission,
)
from app.core.database import get_db
from app.core.exceptions import register_exception_handlers
from app.core.security import create_access_token
from app.core.security.passwords import hash_password
from app.domains.churches.models import Branch, BranchStatus, BranchType, Church
from app.domains.identity.models import (
    Permission,
    Role,
    RolePermission,
    User,
    UserBranchAssignment,
    UserStatus,
)
from app.domains.identity.rbac_registry import PERMISSION_CODES
from app.domains.identity.rbac_seed import seed_tenant_roles, sync_permission_registry

pytestmark = pytest.mark.requires_db

UNAUTHENTICATED = 401
FORBIDDEN = 403
OK = 200


# --------------------------------------------------------------------------
# Fixtures: a minimal app whose only purpose is to exercise the dependencies.
# --------------------------------------------------------------------------


@pytest.fixture
def auth_app(db_session: AsyncSession) -> FastAPI:
    """Routes guarded by the real dependencies, sharing the test's session.

    Overriding ``get_db`` is what lets a test write a role and have the request
    it then makes see it, without committing.
    """
    app = FastAPI()
    register_exception_handlers(app)

    async def _session_override() -> AsyncGenerator[AsyncSession]:
        yield db_session

    app.dependency_overrides[get_db] = _session_override

    @app.get("/whoami")
    async def whoami(context: CurrentSecurityContext) -> dict[str, object]:
        return {
            "user_id": str(context.user_id),
            "tenant_id": str(context.tenant_id),
            "role_key": context.role_key,
            "role_name": context.role_name,
            "permissions": sorted(context.permissions),
            "assigned_branch_ids": sorted(str(b) for b in context.assigned_branch_ids),
            "primary_branch_id": (
                str(context.primary_branch_id) if context.primary_branch_id else None
            ),
        }

    @app.get("/members", dependencies=[Depends(require_permission("members.view"))])
    async def list_members() -> dict[str, bool]:
        return {"ok": True}

    @app.delete("/members", dependencies=[Depends(require_permission("members.delete"))])
    async def delete_member() -> dict[str, bool]:
        return {"ok": True}

    @app.get("/branches/{branch_id}")
    async def read_branch(branch_id: uuid.UUID, context: CurrentSecurityContext) -> dict[str, bool]:
        require_branch_access(context, branch_id)
        return {"ok": True}

    @app.get("/tenants/{tenant_id}/scope")
    async def tenant_scoped(
        tenant_id: uuid.UUID, context: CurrentSecurityContext
    ) -> dict[str, bool]:
        context.require_tenant(tenant_id)
        return {"ok": True}

    return app


@pytest.fixture
async def client(auth_app: FastAPI) -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=auth_app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client


def bearer(user: User, *, tenant_id: uuid.UUID | None = None, **kwargs: object) -> dict[str, str]:
    token = create_access_token(
        user_id=user.id,
        tenant_id=tenant_id if tenant_id is not None else user.tenant_id,
        **kwargs,  # type: ignore[arg-type]
    )
    return {"Authorization": f"Bearer {token}"}


# --------------------------------------------------------------------------
# Fixtures: domain data.
# --------------------------------------------------------------------------


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


async def make_role(
    session: AsyncSession,
    tenant_id: uuid.UUID,
    *codes: str,
    key: str | None = "Admin",
    name: str = "Admin",
    is_system: bool = True,
) -> Role:
    """A role granting exactly ``codes``, creating the permission rows it needs."""
    role = Role(tenant_id=tenant_id, key=key, name=name, is_system=is_system)
    session.add(role)
    await session.flush()

    for code in codes:
        permission = Permission(code=code)
        session.add(permission)
        await session.flush()
        session.add(RolePermission(role_id=role.id, permission_id=permission.id))
    await session.flush()
    return role


async def make_principal(
    session: AsyncSession, *codes: str, **user_overrides: object
) -> tuple[Church, User, Role]:
    """A church with one role granting ``codes`` and one user holding it."""
    church = _church()
    session.add(church)
    await session.flush()
    role = await make_role(session, church.id, *codes)
    user = _user(church.id, role_id=role.id, **user_overrides)
    session.add(user)
    await session.flush()
    return church, user, role


# --------------------------------------------------------------------------


class TestAuthentication:
    async def test_valid_token_is_accepted(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "members.view")

        response = await client.get("/whoami", headers=bearer(user))

        assert response.status_code == OK
        assert response.json()["user_id"] == str(user.id)

    async def test_missing_authorization_header_is_rejected(self, client: AsyncClient) -> None:
        response = await client.get("/whoami")

        assert response.status_code == UNAUTHENTICATED
        assert response.json()["code"] == "UNAUTHENTICATED"

    async def test_malformed_token_is_rejected(self, client: AsyncClient) -> None:
        response = await client.get("/whoami", headers={"Authorization": "Bearer not-a-jwt"})
        assert response.status_code == UNAUTHENTICATED

    async def test_empty_bearer_is_rejected(self, client: AsyncClient) -> None:
        response = await client.get("/whoami", headers={"Authorization": "Bearer "})
        assert response.status_code == UNAUTHENTICATED

    async def test_expired_token_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "members.view")

        response = await client.get(
            "/whoami", headers=bearer(user, expires_in=timedelta(minutes=-1))
        )

        assert response.status_code == UNAUTHENTICATED

    async def test_token_for_a_nonexistent_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()

        token = create_access_token(user_id=uuid.uuid4(), tenant_id=church.id)
        response = await client.get("/whoami", headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == UNAUTHENTICATED

    async def test_soft_deleted_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        from app.core.database import utcnow

        _, user, _ = await make_principal(db_session, "members.view")
        headers = bearer(user)
        user.deleted_at = utcnow()
        await db_session.flush()

        assert (await client.get("/whoami", headers=headers)).status_code == UNAUTHENTICATED

    @pytest.mark.parametrize("status", [UserStatus.INACTIVE, UserStatus.SUSPENDED])
    async def test_non_active_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession, status: UserStatus
    ) -> None:
        """401 rather than 403: the account cannot authenticate at all, and the
        frontend's interceptor should end the session."""
        _, user, _ = await make_principal(db_session, "members.view")
        headers = bearer(user)
        user.status = status
        await db_session.flush()

        assert (await client.get("/whoami", headers=headers)).status_code == UNAUTHENTICATED

    async def test_suspension_takes_effect_on_the_next_request(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "members.view")
        headers = bearer(user)
        assert (await client.get("/whoami", headers=headers)).status_code == OK

        user.status = UserStatus.SUSPENDED
        await db_session.flush()

        assert (await client.get("/whoami", headers=headers)).status_code == UNAUTHENTICATED


class TestTenantResolution:
    async def test_tenant_comes_from_the_authenticated_user(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")

        response = await client.get("/whoami", headers=bearer(user))

        assert response.json()["tenant_id"] == str(church.id)

    async def test_a_token_claiming_another_tenant_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """A forged or stale ``tid`` cannot move a user between churches: the
        claim is checked against the user record, never used to scope the
        lookup."""
        _, user, _ = await make_principal(db_session, "members.view")
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()

        response = await client.get("/whoami", headers=bearer(user, tenant_id=other.id))

        assert response.status_code == UNAUTHENTICATED

    async def test_a_path_tenant_id_cannot_widen_scope(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """A tenant id in the URL is a resource identifier to be checked, not an
        authorization input."""
        _, user, _ = await make_principal(db_session, "members.view")
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()

        response = await client.get(f"/tenants/{other.id}/scope", headers=bearer(user))

        assert response.status_code == FORBIDDEN
        assert response.json()["code"] == "TENANT_ISOLATION_VIOLATION"

    async def test_own_tenant_id_in_the_path_is_accepted(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")

        response = await client.get(f"/tenants/{church.id}/scope", headers=bearer(user))

        assert response.status_code == OK


class TestRoleResolution:
    async def test_role_is_read_from_the_database(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, role = await make_principal(db_session, "members.view")

        body = (await client.get("/whoami", headers=bearer(user))).json()

        assert body["role_key"] == role.key
        assert body["role_name"] == role.name

    async def test_role_reassignment_takes_effect_without_a_new_token(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The reason ``rid`` is not a JWT claim."""
        church, user, _ = await make_principal(db_session, "members.view")
        headers = bearer(user)
        assert (await client.get("/members", headers=headers)).status_code == OK

        narrower = await make_role(
            db_session, church.id, "profile.view", key="Teacher", name="Teacher"
        )
        user.role_id = narrower.id
        await db_session.flush()

        assert (await client.get("/members", headers=headers)).status_code == FORBIDDEN
        assert (await client.get("/whoami", headers=headers)).json()["role_key"] == "Teacher"

    async def test_a_user_with_no_role_is_authenticated_but_authorized_for_nothing(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        user = _user(church.id)
        db_session.add(user)
        await db_session.flush()
        headers = bearer(user)

        assert (await client.get("/whoami", headers=headers)).json()["permissions"] == []
        assert (await client.get("/members", headers=headers)).status_code == FORBIDDEN

    async def test_removing_a_users_role_revokes_everything_immediately(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "members.view")
        headers = bearer(user)
        assert (await client.get("/members", headers=headers)).status_code == OK

        user.role_id = None
        await db_session.flush()

        assert (await client.get("/members", headers=headers)).status_code == FORBIDDEN


class TestPermissionResolution:
    async def test_granted_permission_allows_the_request(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "members.view")

        assert (await client.get("/members", headers=bearer(user))).status_code == OK

    async def test_missing_permission_is_forbidden_not_unauthenticated(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """403, never 401: the frontend logs out on any 401, so a mere
        permission failure must not end the session."""
        _, user, _ = await make_principal(db_session, "members.view")

        response = await client.delete("/members", headers=bearer(user))

        assert response.status_code == FORBIDDEN
        assert response.json()["code"] == "FORBIDDEN"

    async def test_revoking_a_grant_takes_effect_on_the_next_request(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, role = await make_principal(db_session, "members.view")
        headers = bearer(user)
        assert (await client.get("/members", headers=headers)).status_code == OK

        await db_session.execute(delete(RolePermission).where(RolePermission.role_id == role.id))
        await db_session.flush()

        assert (await client.get("/members", headers=headers)).status_code == FORBIDDEN

    async def test_a_custom_role_authorizes_exactly_like_a_built_in_one(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """A church's own role is not second-class: granting it the code is
        the whole mechanism."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        custom = await make_role(
            db_session, church.id, "members.view", key=None, name="Youth Pastor", is_system=False
        )
        user = _user(church.id, role_id=custom.id)
        db_session.add(user)
        await db_session.flush()

        assert (await client.get("/members", headers=bearer(user))).status_code == OK

    async def test_granting_an_unrelated_code_does_not_authorize(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "profile.view", "events.view")

        assert (await client.get("/members", headers=bearer(user))).status_code == FORBIDDEN

    async def test_an_uncanonical_permission_code_cannot_guard_a_route(self) -> None:
        """A typo would otherwise make the route permanently unreachable and
        silent about it; ADR-009's deferred codes are caught the same way."""
        with pytest.raises(ValueError, match="canonical permission code"):
            require_permission("members.viwe")
        with pytest.raises(ValueError, match="canonical permission code"):
            require_permission("finance.expenses.approve")

    async def test_permissions_do_not_leak_between_roles_in_one_tenant(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")
        await make_role(db_session, church.id, "members.delete", key="Other", name="Other")

        body = (await client.get("/whoami", headers=bearer(user))).json()

        assert body["permissions"] == ["members.view"]


class TestBranchScope:
    async def test_assigned_branch_is_accessible(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        await db_session.flush()

        response = await client.get(f"/branches/{branch.id}", headers=bearer(user))

        assert response.status_code == OK

    async def test_unassigned_branch_is_denied(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")
        assigned = _branch(church.id)
        unassigned = _branch(church.id, name="East Campus", type=BranchType.BRANCH)
        db_session.add_all([assigned, unassigned])
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=assigned.id)
        )
        await db_session.flush()

        response = await client.get(f"/branches/{unassigned.id}", headers=bearer(user))

        assert response.status_code == FORBIDDEN

    async def test_no_assignments_denies_every_branch(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Fail-closed. The frontend reads an empty list as unrestricted;
        ADR-003 requires the server to invert that."""
        church, user, _ = await make_principal(db_session, "members.view")
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()

        response = await client.get(f"/branches/{branch.id}", headers=bearer(user))

        assert response.status_code == FORBIDDEN

    async def test_another_tenants_branch_is_denied(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_principal(db_session, "members.view")
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()
        foreign_branch = _branch(other.id)
        db_session.add(foreign_branch)
        await db_session.flush()

        response = await client.get(f"/branches/{foreign_branch.id}", headers=bearer(user))

        assert response.status_code == FORBIDDEN

    async def test_multiple_assignments_and_primary_are_resolved(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")
        hq = _branch(church.id)
        east = _branch(church.id, name="East Campus", type=BranchType.BRANCH)
        db_session.add_all([hq, east])
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

        body = (await client.get("/whoami", headers=bearer(user))).json()

        assert set(body["assigned_branch_ids"]) == {str(hq.id), str(east.id)}
        assert body["primary_branch_id"] == str(hq.id)
        assert (await client.get(f"/branches/{east.id}", headers=bearer(user))).status_code == OK

    async def test_removing_an_assignment_takes_effect_immediately(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        await db_session.flush()
        headers = bearer(user)
        assert (await client.get(f"/branches/{branch.id}", headers=headers)).status_code == OK

        await db_session.execute(
            delete(UserBranchAssignment).where(UserBranchAssignment.user_id == user.id)
        )
        await db_session.flush()

        assert (
            await client.get(f"/branches/{branch.id}", headers=headers)
        ).status_code == FORBIDDEN

    async def test_a_user_with_no_primary_branch_reports_none(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_principal(db_session, "members.view")
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(tenant_id=church.id, user_id=user.id, branch_id=branch.id)
        )
        await db_session.flush()

        assert (await client.get("/whoami", headers=bearer(user))).json()[
            "primary_branch_id"
        ] is None


class TestSuperAdminIsAuthorizedLikeEveryOtherRole:
    """Seeded, canonical roles rather than synthetic ones.

    ``SuperAdmin`` passes checks because its role genuinely grants every
    permission code, resolved through the same path as any other role -- not
    because a branch is taken for it (ADR-010, ADR-011).
    """

    @staticmethod
    async def _seeded_church(session: AsyncSession, **overrides: object) -> Church:
        church = _church(**overrides)
        session.add(church)
        await session.flush()
        await sync_permission_registry(session)
        await seed_tenant_roles(session, church.id)
        return church

    @staticmethod
    async def _holder(session: AsyncSession, church: Church, role_key: str, **kw: object) -> User:
        role = (
            await session.execute(
                select(Role).where(Role.tenant_id == church.id, Role.key == role_key)
            )
        ).scalar_one()
        user = _user(church.id, role_id=role.id, **kw)
        session.add(user)
        await session.flush()
        return user

    async def test_super_admin_holds_the_whole_catalogue(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church = await self._seeded_church(db_session)
        user = await self._holder(db_session, church, "SuperAdmin")

        body = (await client.get("/whoami", headers=bearer(user))).json()

        assert set(body["permissions"]) == set(PERMISSION_CODES)

    async def test_super_admin_passes_a_permission_admin_lacks(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``members.delete`` is SuperAdmin-only in ``ROLE_PERMISSIONS``, which
        the frontend suite also asserts."""
        church = await self._seeded_church(db_session)
        super_admin = await self._holder(db_session, church, "SuperAdmin")
        admin = await self._holder(
            db_session,
            church,
            "Admin",
            email="admin@gracechapel.example",
            username="admin",
        )

        assert (await client.delete("/members", headers=bearer(super_admin))).status_code == OK
        assert (await client.delete("/members", headers=bearer(admin))).status_code == FORBIDDEN
        assert (await client.get("/members", headers=bearer(admin))).status_code == OK

    async def test_super_admin_cannot_reach_another_tenant(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The decisive case. Holding every permission confers no cross-church
        reach whatsoever."""
        church = await self._seeded_church(db_session)
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()
        user = await self._holder(db_session, church, "SuperAdmin")

        response = await client.get(f"/tenants/{other.id}/scope", headers=bearer(user))

        assert response.status_code == FORBIDDEN
        assert response.json()["code"] == "TENANT_ISOLATION_VIOLATION"

    async def test_a_super_admin_token_claiming_another_tenant_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church = await self._seeded_church(db_session)
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()
        user = await self._holder(db_session, church, "SuperAdmin")

        response = await client.get("/whoami", headers=bearer(user, tenant_id=other.id))

        assert response.status_code == UNAUTHENTICATED

    async def test_super_admin_cannot_see_another_tenants_branch(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church = await self._seeded_church(db_session)
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()
        foreign = _branch(other.id)
        db_session.add(foreign)
        await db_session.flush()
        user = await self._holder(db_session, church, "SuperAdmin")

        response = await client.get(f"/branches/{foreign.id}", headers=bearer(user))

        assert response.status_code == FORBIDDEN

    async def test_super_admin_branch_access_still_comes_from_assignments(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """No permission set widens branch scope: an unassigned SuperAdmin is
        denied, and assigning the branch is what grants access. This is the
        behaviour that would differ if a role-name bypass existed."""
        church = await self._seeded_church(db_session)
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()
        user = await self._holder(db_session, church, "SuperAdmin")
        headers = bearer(user)

        assert (
            await client.get(f"/branches/{branch.id}", headers=headers)
        ).status_code == FORBIDDEN

        db_session.add(
            UserBranchAssignment(
                tenant_id=church.id, user_id=user.id, branch_id=branch.id, is_primary=True
            )
        )
        await db_session.flush()

        assert (await client.get(f"/branches/{branch.id}", headers=headers)).status_code == OK

    async def test_a_custom_role_with_the_same_grants_behaves_identically(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Authorization depends on the grants, not on being called SuperAdmin."""
        church = await self._seeded_church(db_session)
        super_admin = await self._holder(db_session, church, "SuperAdmin")

        clone = Role(tenant_id=church.id, key=None, name="Everything", is_system=False)
        db_session.add(clone)
        await db_session.flush()
        source_role_id = (
            await db_session.execute(
                select(Role.id).where(Role.tenant_id == church.id, Role.key == "SuperAdmin")
            )
        ).scalar_one()
        grants = (
            (
                await db_session.execute(
                    select(RolePermission.permission_id).where(
                        RolePermission.role_id == source_role_id
                    )
                )
            )
            .scalars()
            .all()
        )
        db_session.add_all(RolePermission(role_id=clone.id, permission_id=pid) for pid in grants)
        twin = _user(
            church.id,
            role_id=clone.id,
            email="twin@gracechapel.example",
            username="twin",
        )
        db_session.add(twin)
        await db_session.flush()

        privileged = (await client.get("/whoami", headers=bearer(super_admin))).json()
        custom = (await client.get("/whoami", headers=bearer(twin))).json()

        assert set(custom["permissions"]) == set(privileged["permissions"])
        assert custom["role_key"] is None
        assert (await client.delete("/members", headers=bearer(twin))).status_code == OK

    async def test_renaming_the_role_changes_nothing_about_authorization(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church = await self._seeded_church(db_session)
        user = await self._holder(db_session, church, "SuperAdmin")
        headers = bearer(user)
        assert (await client.delete("/members", headers=headers)).status_code == OK

        role = (
            await db_session.execute(
                select(Role).where(Role.tenant_id == church.id, Role.key == "SuperAdmin")
            )
        ).scalar_one()
        role.name = "Owner"
        await db_session.flush()

        assert (await client.delete("/members", headers=headers)).status_code == OK
