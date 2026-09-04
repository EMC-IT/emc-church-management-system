"""The Members security boundary, end to end through the real application.

Members are INTERNAL data: tenant + branch + RBAC, per the classification in
``backend-security-plan.md`` §6. These tests assert that boundary from the
outside -- over HTTP, against a real database, with no mocked authorization --
because the parts that matter are the query predicates and the route
dependencies, and a stubbed context would exercise neither.

The negative cases are the point. A permission bypass through a second church,
an unassigned branch, or an update that relocates a record is still a bypass
even when the obvious endpoint is correct.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, utcnow
from app.core.security import SecurityContext, create_access_token
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
from app.domains.members import service as members_service
from app.domains.members.models import Gender, Member
from app.main import create_app

pytestmark = pytest.mark.requires_db

OK = 200
CREATED = 201
UNAUTHENTICATED = 401
FORBIDDEN = 403
NOT_FOUND = 404
UNPROCESSABLE = 422

MEMBERS = "/api/v1/members"
PASSWORD = "correct horse battery staple"

VIEW = "members.view"
CREATE = "members.create"
EDIT = "members.edit"
ALL_MEMBER_CODES = (VIEW, CREATE, EDIT)


@pytest.fixture
def api(db_session: AsyncSession) -> FastAPI:
    app = create_app()

    async def _session_override() -> AsyncGenerator[AsyncSession]:
        yield db_session

    app.dependency_overrides[get_db] = _session_override
    return app


@pytest.fixture
async def client(api: FastAPI) -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=api)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client


class Principal:
    """A user plus everything a request needs to act as them."""

    def __init__(self, user: User, church: Church, branches: list[Branch]) -> None:
        self.user = user
        self.church = church
        self.branches = branches

    @property
    def headers(self) -> dict[str, str]:
        token = create_access_token(user_id=self.user.id, tenant_id=self.user.tenant_id)
        return {"Authorization": f"Bearer {token}"}

    @property
    def branch_id(self) -> uuid.UUID:
        return self.branches[0].id


async def make_church(
    session: AsyncSession, name: str, *branch_names: str
) -> tuple[Church, list[Branch]]:
    suffix = uuid.uuid4().hex[:8]
    church = Church(
        name=f"{name} {suffix}",
        vision="A vision statement at least twenty characters long.",
        mission="A mission statement at least twenty characters long.",
        core_values="Core values at least twenty characters long.",
        email=f"info-{suffix}@{name.lower().replace(' ', '')}.example",
        phone="0244000000",
        street="12 Liberation Rd",
        city="Accra",
        state="Greater Accra",
        postal_code="00233",
        country="Ghana",
        senior_pastor="Rev. Ama Owusu",
    )
    session.add(church)
    await session.flush()

    branches = []
    for index, branch_name in enumerate(branch_names or ("HQ",)):
        branch = Branch(
            tenant_id=church.id,
            name=f"{branch_name} {suffix}",
            # `uq_branches_one_headquarters_per_tenant` permits exactly one.
            type=BranchType.HEADQUARTERS if index == 0 else BranchType.BRANCH,
            established="2005",
            email=f"{branch_name.lower()}-{suffix}@church.example",
            phone="0244000001",
            street="5 Adenta Rd",
            city="Accra",
            state="Greater Accra",
            postal_code="00233",
            country="Ghana",
            pastor="Rev. Kofi Mensah",
            capacity=500,
            status=BranchStatus.ACTIVE,
        )
        session.add(branch)
        branches.append(branch)
    await session.flush()
    return church, branches


async def grant(session: AsyncSession, role: Role, *codes: str) -> None:
    for code in codes:
        permission = (
            await session.execute(select(Permission).where(Permission.code == code))
        ).scalar_one_or_none()
        if permission is None:
            permission = Permission(code=code)
            session.add(permission)
            await session.flush()
        session.add(RolePermission(role_id=role.id, permission_id=permission.id))
    await session.flush()


async def make_principal(
    session: AsyncSession,
    *codes: str,
    church: Church | None = None,
    branches: list[Branch] | None = None,
    assigned: list[Branch] | None = None,
    church_name: str = "Grace Chapel",
) -> Principal:
    """A user holding ``codes``, assigned to ``assigned`` (default: all branches)."""
    if church is None or branches is None:
        church, branches = await make_church(session, church_name, "HQ", "Satellite")

    suffix = uuid.uuid4().hex[:8]
    role = Role(tenant_id=church.id, key=None, name=f"Role {suffix}", is_system=False)
    session.add(role)
    await session.flush()
    await grant(session, role, *codes)

    user = User(
        tenant_id=church.id,
        first_name="Ama",
        last_name="Owusu",
        email=f"ama-{suffix}@church.example",
        username=f"ama-{suffix}",
        password_hash=hash_password(PASSWORD),
        status=UserStatus.ACTIVE,
        role_id=role.id,
    )
    session.add(user)
    await session.flush()

    for index, branch in enumerate(branches if assigned is None else assigned):
        session.add(
            UserBranchAssignment(
                tenant_id=church.id,
                user_id=user.id,
                branch_id=branch.id,
                is_primary=index == 0,
            )
        )
    await session.flush()
    return Principal(user, church, branches)


async def make_member(
    session: AsyncSession, church: Church, branch: Branch | None, **overrides: object
) -> Member:
    suffix = uuid.uuid4().hex[:8]
    defaults: dict[str, object] = {
        "tenant_id": church.id,
        "branch_id": branch.id if branch is not None else None,
        "first_name": "Kofi",
        "last_name": "Mensah",
        "email": f"kofi-{suffix}@member.example",
        "phone": f"024{suffix[:7]}",
        "gender": Gender.MALE,
        "membership_status": "Active",
    }
    defaults.update(overrides)
    member = Member(**defaults)
    session.add(member)
    await session.flush()
    return member


def payload(**overrides: object) -> dict[str, object]:
    body: dict[str, object] = {
        "firstName": "Yaa",
        "lastName": "Asante",
        "phone": f"055{uuid.uuid4().hex[:7]}",
        "gender": "Female",
    }
    body.update(overrides)
    return body


class TestAuthenticationIsRequired:
    """Before any permission question, there must be a principal."""

    @pytest.mark.parametrize(
        ("method", "path"),
        [
            ("get", MEMBERS),
            ("get", f"{MEMBERS}/{uuid.uuid4()}"),
            ("post", MEMBERS),
            ("put", f"{MEMBERS}/{uuid.uuid4()}"),
        ],
    )
    async def test_no_token_is_rejected(self, client: AsyncClient, method: str, path: str) -> None:
        kwargs = {} if method == "get" else {"json": payload()}
        response = await getattr(client, method)(path, **kwargs)

        assert response.status_code == UNAUTHENTICATED

    async def test_a_suspended_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, *ALL_MEMBER_CODES)
        headers = principal.headers
        principal.user.status = UserStatus.SUSPENDED
        await db_session.flush()

        assert (await client.get(MEMBERS, headers=headers)).status_code == UNAUTHENTICATED

    async def test_a_soft_deleted_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, *ALL_MEMBER_CODES)
        headers = principal.headers
        principal.user.deleted_at = utcnow()
        await db_session.flush()

        assert (await client.get(MEMBERS, headers=headers)).status_code == UNAUTHENTICATED


class TestPermissionEnforcement:
    async def test_the_granted_permission_allows_the_read(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)

        assert (await client.get(MEMBERS, headers=principal.headers)).status_code == OK

    @pytest.mark.parametrize(
        ("method", "needs"),
        [("get", VIEW), ("post", CREATE)],
    )
    async def test_a_missing_permission_is_403(
        self, client: AsyncClient, db_session: AsyncSession, method: str, needs: str
    ) -> None:
        """403, not 404: the caller is authenticated and the route exists --
        what they lack is the capability."""
        others = [code for code in ALL_MEMBER_CODES if code != needs]
        principal = await make_principal(db_session, *others)

        kwargs = {} if method == "get" else {"json": payload()}
        response = await getattr(client, method)(MEMBERS, headers=principal.headers, **kwargs)

        assert response.status_code == FORBIDDEN
        assert response.json()["code"] == "FORBIDDEN"

    async def test_a_role_less_user_is_denied(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)
        principal.user.role_id = None
        await db_session.flush()

        assert (await client.get(MEMBERS, headers=principal.headers)).status_code == FORBIDDEN

    async def test_a_revoked_permission_is_denied_on_the_next_request(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """No caching: the grant is re-read from the database every request."""
        principal = await make_principal(db_session, VIEW)
        headers = principal.headers
        assert (await client.get(MEMBERS, headers=headers)).status_code == OK

        await db_session.execute(
            delete(RolePermission).where(RolePermission.role_id == principal.user.role_id)
        )
        await db_session.flush()

        assert (await client.get(MEMBERS, headers=headers)).status_code == FORBIDDEN

    async def test_view_does_not_imply_create(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)

        response = await client.post(MEMBERS, headers=principal.headers, json=payload())

        assert response.status_code == FORBIDDEN

    async def test_view_does_not_imply_edit(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)
        member = await make_member(db_session, principal.church, principal.branches[0])

        response = await client.put(
            f"{MEMBERS}/{member.id}", headers=principal.headers, json={"firstName": "Renamed"}
        )

        assert response.status_code == FORBIDDEN


class TestTenantIsolation:
    """The invariant the whole schema exists to protect."""

    async def test_another_churchs_member_is_not_listed(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, VIEW, church_name="Grace Chapel")
        theirs, their_branches = await make_church(db_session, "Mercy Assembly", "HQ")
        await make_member(db_session, theirs, their_branches[0], first_name="Invisible")
        await make_member(db_session, mine.church, mine.branches[0], first_name="Mine")

        body = (await client.get(MEMBERS, headers=mine.headers)).json()

        assert [m["firstName"] for m in body["data"]] == ["Mine"]
        assert body["total"] == 1

    async def test_another_churchs_member_is_404_by_id(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """404 rather than 403: 403 would confirm the id names a real record
        in some other church."""
        mine = await make_principal(db_session, VIEW)
        theirs, their_branches = await make_church(db_session, "Mercy Assembly", "HQ")
        member = await make_member(db_session, theirs, their_branches[0])

        response = await client.get(f"{MEMBERS}/{member.id}", headers=mine.headers)

        assert response.status_code == NOT_FOUND

    async def test_a_cross_tenant_id_is_indistinguishable_from_a_random_one(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, VIEW)
        theirs, their_branches = await make_church(db_session, "Mercy Assembly", "HQ")
        member = await make_member(db_session, theirs, their_branches[0])

        real = await client.get(f"{MEMBERS}/{member.id}", headers=mine.headers)
        invented = await client.get(f"{MEMBERS}/{uuid.uuid4()}", headers=mine.headers)

        assert real.status_code == invented.status_code
        assert real.json()["code"] == invented.json()["code"]
        assert real.json()["message"] == invented.json()["message"]

    async def test_another_churchs_member_cannot_be_updated(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, *ALL_MEMBER_CODES)
        theirs, their_branches = await make_church(db_session, "Mercy Assembly", "HQ")
        member = await make_member(db_session, theirs, their_branches[0], first_name="Untouched")

        response = await client.put(
            f"{MEMBERS}/{member.id}", headers=mine.headers, json={"firstName": "Hijacked"}
        )

        assert response.status_code == NOT_FOUND
        await db_session.refresh(member)
        assert member.first_name == "Untouched"

    async def test_a_created_member_lands_in_the_callers_own_tenant(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, *ALL_MEMBER_CODES)

        body = (await client.post(MEMBERS, headers=mine.headers, json=payload())).json()

        created = await db_session.get(Member, uuid.UUID(body["data"]["id"]))
        assert created is not None
        assert created.tenant_id == mine.church.id

    async def test_a_tenant_id_in_the_body_is_refused_outright(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The schema forbids extra fields, so a tenant cannot even be offered."""
        mine = await make_principal(db_session, *ALL_MEMBER_CODES)
        theirs, _ = await make_church(db_session, "Mercy Assembly", "HQ")

        response = await client.post(
            MEMBERS, headers=mine.headers, json=payload(tenantId=str(theirs.id))
        )

        assert response.status_code == UNPROCESSABLE

    async def test_the_response_never_names_another_church(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, VIEW)
        theirs, their_branches = await make_church(db_session, "Distinctive Assembly", "HQ")
        member = await make_member(db_session, theirs, their_branches[0])

        body = str((await client.get(f"{MEMBERS}/{member.id}", headers=mine.headers)).json())

        assert "Distinctive Assembly" not in body
        assert str(theirs.id) not in body
        assert str(their_branches[0].id) not in body


class TestBranchIsolation:
    """ADR-011: a principal's branch reach is exactly its assignments."""

    async def test_an_unassigned_branchs_member_is_not_listed(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, VIEW, church=church, branches=branches, assigned=[branches[0]]
        )
        await make_member(db_session, church, branches[0], first_name="Reachable")
        await make_member(db_session, church, branches[1], first_name="OtherBranch")

        body = (await client.get(MEMBERS, headers=principal.headers)).json()

        assert [m["firstName"] for m in body["data"]] == ["Reachable"]

    async def test_an_unassigned_branchs_member_is_404_by_id(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, VIEW, church=church, branches=branches, assigned=[branches[0]]
        )
        member = await make_member(db_session, church, branches[1])

        response = await client.get(f"{MEMBERS}/{member.id}", headers=principal.headers)

        assert response.status_code == NOT_FOUND

    async def test_every_assigned_branch_is_reachable(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(db_session, VIEW, church=church, branches=branches)
        await make_member(db_session, church, branches[0], first_name="First")
        await make_member(db_session, church, branches[1], first_name="Second")

        body = (await client.get(MEMBERS, headers=principal.headers)).json()

        assert sorted(m["firstName"] for m in body["data"]) == ["First", "Second"]

    async def test_no_assignments_means_no_members_not_all_members(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The rule ADR-011 exists for, asserted directly."""
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, VIEW, church=church, branches=branches, assigned=[]
        )
        await make_member(db_session, church, branches[0])
        await make_member(db_session, church, branches[1])

        body = (await client.get(MEMBERS, headers=principal.headers)).json()

        assert body["data"] == []
        assert body["total"] == 0

    async def test_a_removed_assignment_is_denied_on_the_next_request(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ")
        principal = await make_principal(db_session, VIEW, church=church, branches=branches)
        member = await make_member(db_session, church, branches[0])
        headers = principal.headers
        assert (await client.get(f"{MEMBERS}/{member.id}", headers=headers)).status_code == OK

        await db_session.execute(
            delete(UserBranchAssignment).where(UserBranchAssignment.user_id == principal.user.id)
        )
        await db_session.flush()

        assert (await client.get(f"{MEMBERS}/{member.id}", headers=headers)).status_code == (
            NOT_FOUND
        )

    async def test_a_member_with_no_branch_is_not_visible(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``branch_id IS NULL`` is in nobody's assignment set. Treating "no
        branch" as "every branch" would reopen fail-open scope through data."""
        church, branches = await make_church(db_session, "Grace Chapel", "HQ")
        principal = await make_principal(db_session, VIEW, church=church, branches=branches)
        orphan = await make_member(db_session, church, None, first_name="Unscoped")

        listed = (await client.get(MEMBERS, headers=principal.headers)).json()
        fetched = await client.get(f"{MEMBERS}/{orphan.id}", headers=principal.headers)

        assert listed["data"] == []
        assert fetched.status_code == NOT_FOUND

    async def test_another_churchs_branch_cannot_be_written_to(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, *ALL_MEMBER_CODES)
        _, their_branches = await make_church(db_session, "Mercy Assembly", "HQ")

        response = await client.post(
            MEMBERS, headers=mine.headers, json=payload(branchId=str(their_branches[0].id))
        )

        assert response.status_code == FORBIDDEN


class TestCreationBranchPlacement:
    async def test_an_omitted_branch_falls_back_to_the_primary_assignment(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, *ALL_MEMBER_CODES, church=church, branches=branches
        )

        body = (await client.post(MEMBERS, headers=principal.headers, json=payload())).json()

        assert body["data"]["branchId"] == str(branches[0].id)

    async def test_a_created_member_is_immediately_readable_by_its_author(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """A member created into no branch would be invisible to everyone,
        including whoever just created it."""
        principal = await make_principal(db_session, *ALL_MEMBER_CODES)

        created = (await client.post(MEMBERS, headers=principal.headers, json=payload())).json()
        fetched = await client.get(f"{MEMBERS}/{created['data']['id']}", headers=principal.headers)

        assert fetched.status_code == OK

    async def test_an_assigned_branch_may_be_chosen_explicitly(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, *ALL_MEMBER_CODES, church=church, branches=branches
        )

        body = (
            await client.post(
                MEMBERS, headers=principal.headers, json=payload(branchId=str(branches[1].id))
            )
        ).json()

        assert body["data"]["branchId"] == str(branches[1].id)

    async def test_an_unassigned_branch_cannot_be_chosen(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, *ALL_MEMBER_CODES, church=church, branches=branches, assigned=[branches[0]]
        )

        response = await client.post(
            MEMBERS, headers=principal.headers, json=payload(branchId=str(branches[1].id))
        )

        assert response.status_code == FORBIDDEN

    async def test_a_principal_with_no_branches_cannot_create(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ")
        principal = await make_principal(
            db_session, *ALL_MEMBER_CODES, church=church, branches=branches, assigned=[]
        )

        response = await client.post(MEMBERS, headers=principal.headers, json=payload())

        assert response.status_code == FORBIDDEN


class TestMutationBoundaries:
    """§13's invariant: an update must not relocate a record out of reach."""

    async def test_a_member_cannot_be_moved_to_an_unassigned_branch(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, *ALL_MEMBER_CODES, church=church, branches=branches, assigned=[branches[0]]
        )
        member = await make_member(db_session, church, branches[0])

        response = await client.put(
            f"{MEMBERS}/{member.id}",
            headers=principal.headers,
            json={"branchId": str(branches[1].id)},
        )

        assert response.status_code == FORBIDDEN
        await db_session.refresh(member)
        assert member.branch_id == branches[0].id

    async def test_a_member_cannot_be_moved_to_another_churchs_branch(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, *ALL_MEMBER_CODES)
        _, their_branches = await make_church(db_session, "Mercy Assembly", "HQ")
        member = await make_member(db_session, mine.church, mine.branches[0])

        response = await client.put(
            f"{MEMBERS}/{member.id}",
            headers=mine.headers,
            json={"branchId": str(their_branches[0].id)},
        )

        assert response.status_code == FORBIDDEN
        await db_session.refresh(member)
        assert member.tenant_id == mine.church.id

    async def test_a_member_may_be_moved_between_assigned_branches(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, *ALL_MEMBER_CODES, church=church, branches=branches
        )
        member = await make_member(db_session, church, branches[0])

        response = await client.put(
            f"{MEMBERS}/{member.id}",
            headers=principal.headers,
            json={"branchId": str(branches[1].id)},
        )

        assert response.status_code == OK
        await db_session.refresh(member)
        assert member.branch_id == branches[1].id

    async def test_a_tenant_id_cannot_be_smuggled_into_an_update(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        mine = await make_principal(db_session, *ALL_MEMBER_CODES)
        theirs, _ = await make_church(db_session, "Mercy Assembly", "HQ")
        member = await make_member(db_session, mine.church, mine.branches[0])

        response = await client.put(
            f"{MEMBERS}/{member.id}",
            headers=mine.headers,
            json={"tenantId": str(theirs.id)},
        )

        assert response.status_code == UNPROCESSABLE
        await db_session.refresh(member)
        assert member.tenant_id == mine.church.id

    async def test_an_ordinary_field_update_succeeds(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, *ALL_MEMBER_CODES)
        member = await make_member(db_session, principal.church, principal.branches[0])

        response = await client.put(
            f"{MEMBERS}/{member.id}", headers=principal.headers, json={"firstName": "Renamed"}
        )

        assert response.status_code == OK
        await db_session.refresh(member)
        assert member.first_name == "Renamed"


class TestResponseShape:
    async def test_the_list_uses_the_flat_paginated_envelope(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """What ``MembersService.getMembers`` destructures."""
        principal = await make_principal(db_session, VIEW)

        body = (await client.get(MEMBERS, headers=principal.headers)).json()

        assert set(body) == {"success", "data", "total", "page", "limit", "totalPages"}

    async def test_a_member_never_carries_another_tenants_identifiers(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)
        member = await make_member(db_session, principal.church, principal.branches[0])

        body = (await client.get(f"{MEMBERS}/{member.id}", headers=principal.headers)).json()

        assert "tenantId" not in body["data"]
        assert "deletedAt" not in body["data"]

    async def test_pagination_bounds_are_enforced(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)

        response = await client.get(f"{MEMBERS}?limit=500", headers=principal.headers)

        assert response.status_code == UNPROCESSABLE

    async def test_an_unknown_sort_field_does_not_reach_the_query(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``sortBy`` is resolved through an allow-list, so a hostile value is
        ignored rather than interpolated."""
        principal = await make_principal(db_session, VIEW)

        response = await client.get(
            f"{MEMBERS}?sortBy=id;DROP TABLE members", headers=principal.headers
        )

        assert response.status_code == OK


class TestSoftDeletedMembers:
    async def test_a_soft_deleted_member_is_not_listed(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)
        await make_member(db_session, principal.church, principal.branches[0], deleted_at=utcnow())

        body = (await client.get(MEMBERS, headers=principal.headers)).json()

        assert body["data"] == []

    async def test_a_soft_deleted_member_is_404_by_id(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, VIEW)
        member = await make_member(
            db_session, principal.church, principal.branches[0], deleted_at=utcnow()
        )

        response = await client.get(f"{MEMBERS}/{member.id}", headers=principal.headers)

        assert response.status_code == NOT_FOUND


class TestScopePredicatesAreIndependentlyPresent:
    """Both predicates must exist, even though one currently masks the other.

    `Member.branch_id.in_(assigned_branch_ids)` happens to enforce tenant
    isolation transitively today: branch ids are unique across the platform and
    `user_branch_assignments` is itself tenant-scoped by composite foreign key,
    so a caller can never hold a branch belonging to another church. Deleting
    the tenant predicate therefore changes no observable behaviour, and no
    behavioural test can catch it.

    That is exactly why it is asserted here instead. `backend/CLAUDE.md` §7
    requires the repository layer to re-apply tenant scope as the last line of
    defence, and the first endpoint that is tenant-wide rather than
    branch-scoped -- or any resource whose branch column is dropped -- would
    silently lose tenant isolation altogether if the predicate had quietly
    disappeared in the meantime.
    """

    @staticmethod
    def _sql(context: SecurityContext) -> str:
        statement = members_service.visible_members(context)
        return str(statement.compile(compile_kwargs={"literal_binds": True}))

    @pytest.fixture
    def context(self) -> SecurityContext:
        return SecurityContext(
            user_id=uuid.uuid4(),
            tenant_id=uuid.uuid4(),
            role_id=uuid.uuid4(),
            role_key=None,
            role_name="Role",
            permissions=frozenset({VIEW}),
            assigned_branch_ids=frozenset({uuid.uuid4()}),
            primary_branch_id=None,
        )

    def test_the_query_filters_on_the_authenticated_tenant(self, context: SecurityContext) -> None:
        assert f"members.tenant_id = '{context.tenant_id.hex}'" in self._sql(context)

    def test_the_query_filters_on_the_assigned_branches(self, context: SecurityContext) -> None:
        sql = self._sql(context)
        assert "members.branch_id IN" in sql
        for branch_id in context.assigned_branch_ids:
            assert branch_id.hex in sql

    def test_the_query_excludes_soft_deleted_rows(self, context: SecurityContext) -> None:
        assert "members.deleted_at IS NULL" in self._sql(context)

    def test_an_empty_assignment_set_cannot_match_any_row(self) -> None:
        """`IN ()` is a contradiction, not a wildcard."""
        context = SecurityContext(
            user_id=uuid.uuid4(),
            tenant_id=uuid.uuid4(),
            role_id=None,
            role_key=None,
            role_name=None,
            permissions=frozenset(),
            assigned_branch_ids=frozenset(),
            primary_branch_id=None,
        )

        sql = self._sql(context)

        assert "branch_id IN (NULL) AND (1 != 1)" in sql or "1 != 1" in sql
