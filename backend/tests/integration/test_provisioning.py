"""Provisioning a church: atomicity, idempotency, and the founding administrator.

The founding-administrator branch assignment is the reason this module exists.
ADR-011 made branch access assignment data with no role-based shortcut, which
means a church seeded with roles but no assignments has nobody who can act in
its branches. These tests pin that the provisioning transaction closes that
gap, and that it closes it with *data* rather than a special case.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator

import pytest
from fastapi import APIRouter, FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentSecurityContext, require_branch_access
from app.core.database import get_db
from app.core.security.passwords import verify_password
from app.domains.churches.models import Branch, BranchStatus, BranchType, Church
from app.domains.identity.models import (
    Permission,
    PermissionCategory,
    Role,
    RolePermission,
    User,
    UserBranchAssignment,
)
from app.domains.identity.provisioning import (
    FoundingAdmin,
    ProvisionedTenant,
    provision_church,
)
from app.domains.identity.rbac_registry import (
    CANONICAL_ROLES,
    PERMISSION_CATEGORIES,
    PERMISSION_CODES,
    ROLE_PERMISSIONS,
)
from app.main import create_app

pytestmark = [
    pytest.mark.requires_db,
    pytest.mark.usefixtures("clear_login_rate_limit"),
]

OK = 200
FORBIDDEN = 403
FOUNDER_PASSWORD = "correct horse battery staple"


@pytest.fixture(autouse=True)
async def _outer_transaction(db_session: AsyncSession) -> AsyncGenerator[None]:
    """Wrap each test in a transaction the fixture will roll back.

    ``provision_church`` commits -- it is a real unit of work, not a helper --
    so without an enclosing transaction its writes would survive the
    rollback-based ``db_session`` fixture and leak into later tests. Beginning
    one here makes ``transaction_scope`` take its nested SAVEPOINT path, which
    is the same code an inner unit of work hits in production.
    """
    if not db_session.in_transaction():
        await db_session.begin()
    yield


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


def _branch(**overrides: object) -> Branch:
    defaults: dict[str, object] = {
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
    return Branch(tenant_id=uuid.uuid4(), **defaults)


def _founder(**overrides: object) -> FoundingAdmin:
    defaults: dict[str, object] = {
        "first_name": "Ama",
        "last_name": "Owusu",
        "email": "ama.owusu@gracechapel.example",
        "username": "ama.owusu",
        "password": FOUNDER_PASSWORD,
    }
    defaults.update(overrides)
    return FoundingAdmin(**defaults)  # type: ignore[arg-type]


async def provision(
    session: AsyncSession,
    *,
    church: Church | None = None,
    branch_names: tuple[str, ...] = ("Adenta (HQ)",),
    founder: FoundingAdmin | None = None,
) -> ProvisionedTenant:
    return await provision_church(
        session,
        church=church if church is not None else _church(),
        branches=[
            _branch(
                name=name,
                type=BranchType.HEADQUARTERS if index == 0 else BranchType.BRANCH,
                email=f"branch{index}@gracechapel.example",
            )
            for index, name in enumerate(branch_names)
        ],
        founding_admin=founder or _founder(),
    )


async def _count(session: AsyncSession, model: type, *where: object) -> int:
    statement = select(func.count()).select_from(model)
    for clause in where:
        statement = statement.where(clause)  # type: ignore[arg-type]
    return (await session.execute(statement)).scalar_one()


class TestProvisioningEstablishesAUsableTenant:
    async def test_creates_church_branches_roles_user_and_assignments(
        self, db_session: AsyncSession
    ) -> None:
        result = await provision(db_session, branch_names=("Adenta (HQ)", "East Campus"))

        assert result.church.id is not None
        assert len(result.branches) == 2
        assert result.founding_user.id is not None
        assert await _count(db_session, Role, Role.tenant_id == result.church.id) == len(
            CANONICAL_ROLES
        )
        assert (
            await _count(
                db_session,
                UserBranchAssignment,
                UserBranchAssignment.user_id == result.founding_user.id,
            )
            == 2
        )

    async def test_seeds_the_canonical_registry_without_duplicating_it(
        self, db_session: AsyncSession
    ) -> None:
        """Provisioning calls the existing seed rather than restating 164
        permissions of its own."""
        await provision(db_session)

        assert await _count(db_session, Permission) == len(PERMISSION_CODES)
        assert await _count(db_session, PermissionCategory) == len(PERMISSION_CATEGORIES)

    async def test_founding_administrator_holds_the_super_admin_role(
        self, db_session: AsyncSession
    ) -> None:
        result = await provision(db_session)

        assert result.role.key == "SuperAdmin"
        assert result.founding_user.role_id == result.role.id
        granted = await _count(db_session, Role, Role.id == result.role.id)
        assert granted == 1

    async def test_founding_administrator_receives_the_canonical_grants(
        self, db_session: AsyncSession
    ) -> None:
        result = await provision(db_session)

        codes = set(
            (
                await db_session.execute(
                    select(Permission.code)
                    .join(RolePermission, RolePermission.permission_id == Permission.id)
                    .where(RolePermission.role_id == result.role.id)
                )
            )
            .scalars()
            .all()
        )
        assert codes == set(ROLE_PERMISSIONS["SuperAdmin"])
        assert result.role.is_system is True

    async def test_the_founding_password_authenticates(self, db_session: AsyncSession) -> None:
        result = await provision(db_session)

        assert verify_password(FOUNDER_PASSWORD, result.founding_user.password_hash)
        assert result.founding_user.password_hash != FOUNDER_PASSWORD

    async def test_the_founding_administrator_is_not_forced_to_change_password(
        self, db_session: AsyncSession
    ) -> None:
        """They chose it during onboarding, unlike an admin-created user."""
        result = await provision(db_session)

        assert result.founding_user.require_password_change is False

    async def test_rejects_a_church_with_no_branches(self, db_session: AsyncSession) -> None:
        with pytest.raises(ValueError, match="at least one branch"):
            await provision_church(
                db_session, church=_church(), branches=[], founding_admin=_founder()
            )

    async def test_rejects_a_non_canonical_founding_role(self, db_session: AsyncSession) -> None:
        with pytest.raises(ValueError, match="canonical role"):
            await provision(db_session, founder=_founder(role_key="Overlord"))


class TestFoundingAdministratorBranchAssignment:
    async def test_is_assigned_to_every_provisioned_branch(self, db_session: AsyncSession) -> None:
        result = await provision(db_session, branch_names=("Adenta (HQ)", "East", "West"))

        assigned = set(
            (
                await db_session.execute(
                    select(UserBranchAssignment.branch_id).where(
                        UserBranchAssignment.user_id == result.founding_user.id
                    )
                )
            )
            .scalars()
            .all()
        )
        assert assigned == {branch.id for branch in result.branches}

    async def test_the_first_branch_becomes_primary(self, db_session: AsyncSession) -> None:
        result = await provision(db_session, branch_names=("Adenta (HQ)", "East Campus"))

        primary = (
            (
                await db_session.execute(
                    select(UserBranchAssignment.branch_id).where(
                        UserBranchAssignment.user_id == result.founding_user.id,
                        UserBranchAssignment.is_primary.is_(True),
                    )
                )
            )
            .scalars()
            .all()
        )

        assert primary == [result.branches[0].id]
        assert result.primary_branch.id == result.branches[0].id

    async def test_branch_scoped_authorization_succeeds_for_assigned_branches(
        self, db_session: AsyncSession, client: AsyncClient
    ) -> None:
        result = await provision(db_session, branch_names=("Adenta (HQ)", "East Campus"))
        headers = await _sign_in(client, result.founding_user.email)

        for branch in result.branches:
            response = await client.get(f"/api/v1/probe/branches/{branch.id}", headers=headers)
            assert response.status_code == OK, branch.name

    async def test_an_unassigned_branch_is_denied(
        self, db_session: AsyncSession, client: AsyncClient
    ) -> None:
        """Added after provisioning, so no assignment exists for it."""
        result = await provision(db_session)
        later = _branch(name="Later Campus", type=BranchType.BRANCH, email="l@gracechapel.example")
        later.tenant_id = result.church.id
        db_session.add(later)
        await db_session.flush()
        headers = await _sign_in(client, result.founding_user.email)

        response = await client.get(f"/api/v1/probe/branches/{later.id}", headers=headers)

        assert response.status_code == FORBIDDEN, response.text

    async def test_no_assignment_never_means_unrestricted(
        self, db_session: AsyncSession, client: AsyncClient
    ) -> None:
        """Stripping the founding administrator's assignments must lock them out
        of branches, not open all of them."""
        result = await provision(db_session)
        await db_session.execute(
            delete(UserBranchAssignment).where(
                UserBranchAssignment.user_id == result.founding_user.id
            )
        )
        await db_session.flush()
        headers = await _sign_in(client, result.founding_user.email)

        response = await client.get(
            f"/api/v1/probe/branches/{result.branches[0].id}", headers=headers
        )

        assert response.status_code == FORBIDDEN


class TestIdempotency:
    async def test_a_second_run_creates_nothing_new(self, db_session: AsyncSession) -> None:
        church = _church()
        first = await provision(db_session, church=church, branch_names=("Adenta (HQ)", "East"))
        second = await provision(db_session, church=church, branch_names=("Adenta (HQ)", "East"))

        assert second.church.id == first.church.id
        assert second.founding_user.id == first.founding_user.id
        assert await _count(db_session, Church) == 1
        assert await _count(db_session, Branch) == 2
        assert await _count(db_session, User) == 1
        assert await _count(db_session, Role) == len(CANONICAL_ROLES)
        assert await _count(db_session, Permission) == len(PERMISSION_CODES)
        assert await _count(db_session, PermissionCategory) == len(PERMISSION_CATEGORIES)
        assert await _count(db_session, UserBranchAssignment) == 2

    async def test_a_retry_completes_a_partially_provisioned_tenant(
        self, db_session: AsyncSession
    ) -> None:
        """The case this idempotency exists for: a first attempt that died
        after the church was written."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        result = await provision(db_session, church=church)

        assert result.church.id == church.id
        assert await _count(db_session, Church) == 1
        assert result.founding_user.id is not None

    async def test_a_retry_does_not_overwrite_a_customised_role(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        first = await provision(db_session, church=church)
        first.role.name = "Church Owner"
        await db_session.flush()

        await provision(db_session, church=church)
        await db_session.refresh(first.role)

        assert first.role.name == "Church Owner"
        assert await _count(db_session, Role, Role.tenant_id == church.id) == len(CANONICAL_ROLES)

    async def test_a_retry_does_not_reset_the_administrators_password(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        first = await provision(db_session, church=church)
        first.founding_user.password_hash = "$argon2id$rotated-by-the-church"
        await db_session.flush()

        await provision(db_session, church=church)
        await db_session.refresh(first.founding_user)

        assert first.founding_user.password_hash == "$argon2id$rotated-by-the-church"

    async def test_a_retry_adds_a_branch_that_did_not_exist_before(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        await provision(db_session, church=church, branch_names=("Adenta (HQ)",))
        second = await provision(
            db_session, church=church, branch_names=("Adenta (HQ)", "East Campus")
        )

        assert await _count(db_session, Branch) == 2
        assert (
            await _count(
                db_session,
                UserBranchAssignment,
                UserBranchAssignment.user_id == second.founding_user.id,
            )
            == 2
        )

    async def test_a_retry_does_not_create_a_second_primary_branch(
        self, db_session: AsyncSession
    ) -> None:
        """A partial unique index would reject it, so this also proves the
        retry path does not attempt one."""
        church = _church()
        await provision(db_session, church=church, branch_names=("Adenta (HQ)", "East"))
        result = await provision(db_session, church=church, branch_names=("Adenta (HQ)", "East"))

        primary_count = await _count(
            db_session,
            UserBranchAssignment,
            UserBranchAssignment.user_id == result.founding_user.id,
            UserBranchAssignment.is_primary.is_(True),
        )
        assert primary_count == 1


class TestProvisionedTenantsAreIsolated:
    async def test_two_churches_get_separate_roles_users_and_branches(
        self, db_session: AsyncSession
    ) -> None:
        first = await provision(db_session)
        second = await provision(
            db_session,
            church=_church(name="Mercy Assembly", email="info@mercyassembly.example"),
            founder=_founder(email="kofi@mercyassembly.example", username="kofi"),
        )

        assert first.church.id != second.church.id
        assert first.role.id != second.role.id
        assert first.founding_user.id != second.founding_user.id
        assert first.branches[0].id != second.branches[0].id
        assert await _count(db_session, Role) == 2 * len(CANONICAL_ROLES)

    async def test_the_permission_registry_is_shared_not_duplicated(
        self, db_session: AsyncSession
    ) -> None:
        """Permissions are global canonical definitions (ADR-008); a second
        church reuses them."""
        await provision(db_session)
        await provision(
            db_session,
            church=_church(name="Mercy Assembly", email="info@mercyassembly.example"),
            founder=_founder(email="kofi@mercyassembly.example", username="kofi"),
        )

        assert await _count(db_session, Permission) == len(PERMISSION_CODES)

    async def test_a_founder_cannot_reach_the_other_churchs_branch(
        self, db_session: AsyncSession, client: AsyncClient
    ) -> None:
        first = await provision(db_session)
        second = await provision(
            db_session,
            church=_church(name="Mercy Assembly", email="info@mercyassembly.example"),
            founder=_founder(email="kofi@mercyassembly.example", username="kofi"),
        )
        headers = await _sign_in(client, first.founding_user.email)

        response = await client.get(
            f"/api/v1/probe/branches/{second.branches[0].id}", headers=headers
        )

        assert response.status_code == FORBIDDEN

    async def test_a_founder_cannot_reach_the_other_churchs_tenant_scope(
        self, db_session: AsyncSession, client: AsyncClient
    ) -> None:
        first = await provision(db_session)
        second = await provision(
            db_session,
            church=_church(name="Mercy Assembly", email="info@mercyassembly.example"),
            founder=_founder(email="kofi@mercyassembly.example", username="kofi"),
        )
        headers = await _sign_in(client, first.founding_user.email)

        response = await client.get(f"/api/v1/probe/tenants/{second.church.id}", headers=headers)

        assert response.status_code == FORBIDDEN

    async def test_a_role_cannot_be_borrowed_across_churches(
        self, db_session: AsyncSession
    ) -> None:
        """The database refuses it, independently of any service check
        (ADR-007, ADR-008)."""
        first = await provision(db_session)
        second = await provision(
            db_session,
            church=_church(name="Mercy Assembly", email="info@mercyassembly.example"),
            founder=_founder(email="kofi@mercyassembly.example", username="kofi"),
        )

        first.founding_user.role_id = second.role.id
        with pytest.raises(IntegrityError):
            await db_session.flush()


# --------------------------------------------------------------------------
# A probe app exposing the branch/tenant checks over HTTP, so the assertions
# above go through the real dependency chain rather than calling the context
# directly.
# --------------------------------------------------------------------------


@pytest.fixture
def api(db_session: AsyncSession) -> FastAPI:
    app = create_app()

    async def _session_override() -> AsyncGenerator[AsyncSession]:
        yield db_session

    app.dependency_overrides[get_db] = _session_override

    probe = APIRouter(prefix="/api/v1/probe")

    @probe.get("/branches/{branch_id}")
    async def read_branch(branch_id: uuid.UUID, context: CurrentSecurityContext) -> dict[str, bool]:
        require_branch_access(context, branch_id)
        return {"ok": True}

    @probe.get("/tenants/{tenant_id}")
    async def read_tenant(tenant_id: uuid.UUID, context: CurrentSecurityContext) -> dict[str, bool]:
        context.require_tenant(tenant_id)
        return {"ok": True}

    app.include_router(probe)
    return app


@pytest.fixture
async def client(api: FastAPI) -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=api)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client


async def _sign_in(client: AsyncClient, email: str) -> dict[str, str]:
    response = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": FOUNDER_PASSWORD}
    )
    assert response.status_code == OK, response.text
    return {"Authorization": f"Bearer {response.json()['data']['token']}"}
