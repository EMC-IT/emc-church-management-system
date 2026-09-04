"""The church-profile security boundary, end to end through the real application.

The church profile is **tenant-wide reference data** (`backend-domain-map.md`
§5, `backend-security-plan.md` §4.2, ADR-011 Decision 4), so this is the first
endpoint with no branch axis at all. Two consequences drive these tests.

First, the tenant predicate stands alone. Phase 2B-8 found that ``members``'
tenant predicate was masked by the branch predicate and only enforced
transitively; here there is nothing to mask it, so removing it is a
cross-tenant read and must fail loudly.

Second, ADR-011 promises that an unassigned principal "is not locked out of
the application". That promise had never been executed against a real endpoint
before this one, so it is asserted here rather than assumed.

The resource is a singleton addressed from the security context, so there is
no identifier to tamper with. The tests prove that too: the *only* way to
reach another church's profile would be for the predicate to be missing.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, utcnow
from app.core.exceptions import ValidationError
from app.core.security import SecurityContext
from app.domains.churches import service as churches_service
from app.domains.churches.models import Church
from app.domains.churches.schemas import ChurchProfileUpdateRequest
from app.domains.identity.authorization import resolve_security_context
from app.domains.identity.models import RolePermission, UserBranchAssignment, UserStatus
from app.main import create_app
from tests.integration.test_members_authorization import make_church, make_principal

pytestmark = pytest.mark.requires_db

OK = 200
UNAUTHENTICATED = 401
FORBIDDEN = 403
UNPROCESSABLE = 422

PROFILE = "/api/v1/settings/church-profile"

MANAGE = "settings.church-profile"
VIEW_SETTINGS = "settings.view"
BRANCHES_VIEW = "settings.branches.view"


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


class TestAuthenticationIsRequired:
    """Before any permission question, there must be a principal."""

    @pytest.mark.parametrize("method", ["get", "put"])
    async def test_no_token_is_rejected(self, client: AsyncClient, method: str) -> None:
        kwargs = {} if method == "get" else {"json": {"name": "Anything"}}
        response = await getattr(client, method)(PROFILE, **kwargs)

        assert response.status_code == UNAUTHENTICATED

    @pytest.mark.parametrize("method", ["get", "put"])
    async def test_a_garbage_token_is_rejected(self, client: AsyncClient, method: str) -> None:
        kwargs = {} if method == "get" else {"json": {"name": "Anything"}}
        response = await getattr(client, method)(
            PROFILE, headers={"Authorization": "Bearer not-a-token"}, **kwargs
        )

        assert response.status_code == UNAUTHENTICATED

    async def test_a_suspended_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        headers = principal.headers
        principal.user.status = UserStatus.SUSPENDED
        await db_session.flush()

        assert (await client.get(PROFILE, headers=headers)).status_code == UNAUTHENTICATED

    async def test_a_soft_deleted_user_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        headers = principal.headers
        principal.user.deleted_at = utcnow()
        await db_session.flush()

        assert (await client.get(PROFILE, headers=headers)).status_code == UNAUTHENTICATED


class TestPermissionEnforcement:
    """``settings.church-profile`` and nothing else opens this endpoint."""

    async def test_the_permission_allows_the_read(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        response = await client.get(PROFILE, headers=principal.headers)

        assert response.status_code == OK
        assert response.json()["data"]["id"] == str(principal.church.id)

    async def test_the_permission_allows_the_write(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        response = await client.put(
            PROFILE, headers=principal.headers, json={"motto": "Serving in love"}
        )

        assert response.status_code == OK
        assert response.json()["data"]["motto"] == "Serving in love"

    @pytest.mark.parametrize("method", ["get", "put"])
    async def test_a_principal_without_the_permission_is_refused(
        self, client: AsyncClient, db_session: AsyncSession, method: str
    ) -> None:
        principal = await make_principal(db_session)
        kwargs = {} if method == "get" else {"json": {"name": "Anything"}}

        response = await getattr(client, method)(PROFILE, headers=principal.headers, **kwargs)

        assert response.status_code == FORBIDDEN

    @pytest.mark.parametrize("method", ["get", "put"])
    async def test_neighbouring_settings_permissions_do_not_open_it(
        self, client: AsyncClient, db_session: AsyncSession, method: str
    ) -> None:
        """``settings.view`` is the ``Pastor`` role's settings access.

        It must not reach the church profile: that would be an implementation
        deciding a product question (OQ-SEC-21).
        """
        principal = await make_principal(db_session, VIEW_SETTINGS, BRANCHES_VIEW)
        kwargs = {} if method == "get" else {"json": {"name": "Anything"}}

        response = await getattr(client, method)(PROFILE, headers=principal.headers, **kwargs)

        assert response.status_code == FORBIDDEN

    async def test_a_role_less_user_is_refused(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        headers = principal.headers
        principal.user.role_id = None
        await db_session.flush()

        assert (await client.get(PROFILE, headers=headers)).status_code == FORBIDDEN

    async def test_revoking_the_permission_denies_the_same_token(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Authority is re-derived per request, never read from the token."""
        principal = await make_principal(db_session, MANAGE)
        headers = principal.headers
        assert (await client.get(PROFILE, headers=headers)).status_code == OK

        await db_session.execute(
            delete(RolePermission).where(RolePermission.role_id == principal.user.role_id)
        )
        await db_session.flush()

        assert (await client.get(PROFILE, headers=headers)).status_code == FORBIDDEN


class TestTenantIsolation:
    """The only church reachable is the caller's own."""

    async def test_the_read_returns_the_callers_own_church(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        other_church, _ = await make_church(db_session, "Other Church", "HQ")
        principal = await make_principal(db_session, MANAGE)

        response = await client.get(PROFILE, headers=principal.headers)

        body = response.json()["data"]
        assert body["id"] == str(principal.church.id)
        assert body["id"] != str(other_church.id)
        assert body["name"] == principal.church.name

    async def test_two_principals_in_different_churches_see_different_profiles(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        one = await make_principal(db_session, MANAGE, church_name="First Church")
        two = await make_principal(db_session, MANAGE, church_name="Second Church")

        first = (await client.get(PROFILE, headers=one.headers)).json()["data"]
        second = (await client.get(PROFILE, headers=two.headers)).json()["data"]

        assert first["id"] == str(one.church.id)
        assert second["id"] == str(two.church.id)
        assert first["id"] != second["id"]

    async def test_a_write_touches_only_the_callers_own_church(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        other = await make_principal(db_session, MANAGE, church_name="Other Church")
        other_name_before = other.church.name
        principal = await make_principal(db_session, MANAGE, church_name="Grace Chapel")

        response = await client.put(
            PROFILE, headers=principal.headers, json={"name": "Renamed Church"}
        )

        assert response.status_code == OK
        await db_session.refresh(other.church)
        assert other.church.name == other_name_before

    @pytest.mark.parametrize("field", ["id", "tenantId", "churchId"])
    async def test_an_identifier_cannot_be_smuggled_into_the_body(
        self, client: AsyncClient, db_session: AsyncSession, field: str
    ) -> None:
        """``extra="forbid"`` means there is no field to smuggle through."""
        other = await make_principal(db_session, MANAGE, church_name="Other Church")
        principal = await make_principal(db_session, MANAGE)

        response = await client.put(
            PROFILE,
            headers=principal.headers,
            json={"name": "Attempted Takeover", field: str(other.church.id)},
        )

        assert response.status_code == UNPROCESSABLE

    async def test_the_route_exposes_no_church_identifier_at_all(self) -> None:
        """The strongest form of "never trust a client-supplied tenant id".

        A path parameter would be an identifier to validate; having none means
        there is nothing to validate and nothing to get wrong.
        """
        schema = create_app().openapi()
        operations = schema["paths"]["/api/v1/settings/church-profile"]

        for operation in operations.values():
            names = {parameter["name"] for parameter in operation.get("parameters", [])}
            assert names == set()


class TestBranchScopeDoesNotApply:
    """Tenant-wide reference data is readable regardless of branch assignment.

    ADR-011 Decision 4 promises exactly this. It is the counterpart of the
    Members rule, not a contradiction of it: branch scope is opt-in per
    endpoint, and it applies where a resource carries a meaningful
    ``branch_id``. ``churches`` has no such column.
    """

    async def test_a_principal_with_no_branch_assignments_can_read(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE, assigned=[])

        response = await client.get(PROFILE, headers=principal.headers)

        assert response.status_code == OK
        assert response.json()["data"]["id"] == str(principal.church.id)

    async def test_a_principal_with_no_branch_assignments_can_write(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE, assigned=[])

        response = await client.put(
            PROFILE, headers=principal.headers, json={"motto": "Still reachable"}
        )

        assert response.status_code == OK

    async def test_removing_every_assignment_does_not_close_the_endpoint(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        headers = principal.headers
        assert (await client.get(PROFILE, headers=headers)).status_code == OK

        await db_session.execute(
            delete(UserBranchAssignment).where(UserBranchAssignment.user_id == principal.user.id)
        )
        await db_session.flush()

        assert (await client.get(PROFILE, headers=headers)).status_code == OK

    async def test_a_single_branch_principal_sees_the_whole_profile(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, branches = await make_church(db_session, "Grace Chapel", "HQ", "Satellite")
        principal = await make_principal(
            db_session, MANAGE, church=church, branches=branches, assigned=[branches[1]]
        )

        response = await client.get(PROFILE, headers=principal.headers)

        assert response.status_code == OK
        assert response.json()["data"]["name"] == church.name


class TestMutationBoundaries:
    """What a write may and may not change."""

    async def test_a_partial_write_leaves_other_fields_alone(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        before = (await client.get(PROFILE, headers=principal.headers)).json()["data"]

        await client.put(PROFILE, headers=principal.headers, json={"motto": "New motto"})
        after = (await client.get(PROFILE, headers=principal.headers)).json()["data"]

        assert after["motto"] == "New motto"
        assert after["vision"] == before["vision"]
        assert after["seniorPastor"] == before["seniorPastor"]

    async def test_an_optional_field_can_be_cleared(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        await client.put(PROFILE, headers=principal.headers, json={"motto": "Temporary"})

        response = await client.put(PROFILE, headers=principal.headers, json={"motto": None})

        assert response.status_code == OK
        assert response.json()["data"]["motto"] is None

    @pytest.mark.parametrize("field", ["name", "vision", "email", "seniorPastor"])
    async def test_a_required_field_cannot_be_cleared(
        self, client: AsyncClient, db_session: AsyncSession, field: str
    ) -> None:
        """A ``NOT NULL`` column refused loudly, not skipped silently."""
        principal = await make_principal(db_session, MANAGE)

        response = await client.put(PROFILE, headers=principal.headers, json={field: None})

        assert response.status_code == UNPROCESSABLE
        assert (await client.get(PROFILE, headers=principal.headers)).json()["data"][
            field
        ] is not None

    @pytest.mark.parametrize("field", ["createdAt", "updatedAt", "currentMembers", "notARealField"])
    async def test_an_unknown_field_is_refused(
        self, client: AsyncClient, db_session: AsyncSession, field: str
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        response = await client.put(PROFILE, headers=principal.headers, json={field: "x"})

        assert response.status_code == UNPROCESSABLE

    @pytest.mark.parametrize(
        ("wire_name", "column", "value"),
        [
            ("coreValues", "core_values", "Faith, love, service and integrity always."),
            ("postalCode", "postal_code", "GA-107"),
            ("seniorPastor", "senior_pastor", "Rev. Yaw Boateng"),
            ("alternativePhone", "alternative_phone", "0302000000"),
        ],
    )
    async def test_a_multi_word_field_round_trips(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        wire_name: str,
        column: str,
        value: str,
    ) -> None:
        """The regression test for the Phase 2B-8 alias defect.

        These models serialise by alias, so a dump that forgets
        ``by_alias=False`` yields camelCase keys. Most church-profile fields
        are single words, where camelisation is a no-op and the defect is
        invisible; these four are the ones that expose it. Without them the
        bug could reappear here silently, which is how it shipped the first
        time.
        """
        principal = await make_principal(db_session, MANAGE)

        response = await client.put(PROFILE, headers=principal.headers, json={wire_name: value})

        assert response.status_code == OK
        assert response.json()["data"][wire_name] == value
        await db_session.refresh(principal.church)
        assert getattr(principal.church, column) == value

    async def test_a_write_persists(self, client: AsyncClient, db_session: AsyncSession) -> None:
        principal = await make_principal(db_session, MANAGE)

        await client.put(PROFILE, headers=principal.headers, json={"denomination": "Pentecostal"})
        await db_session.refresh(principal.church)

        assert principal.church.denomination == "Pentecostal"

    async def test_a_rejected_write_changes_nothing(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The refusal must not leave the earlier fields of the body applied."""
        principal = await make_principal(db_session, MANAGE)
        before = principal.church.name

        response = await client.put(
            PROFILE, headers=principal.headers, json={"name": "Applied?", "vision": None}
        )

        assert response.status_code == UNPROCESSABLE
        await db_session.refresh(principal.church)
        assert principal.church.name == before

    async def test_validation_rules_from_the_form_are_enforced(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        response = await client.put(PROFILE, headers=principal.headers, json={"name": "ab"})

        assert response.status_code == UNPROCESSABLE


class TestResponseShape:
    """The envelope the frontend would consume."""

    async def test_the_read_returns_the_success_envelope(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        body = (await client.get(PROFILE, headers=principal.headers)).json()

        assert body["success"] is True
        assert set(body) == {"success", "data", "message"}

    async def test_the_payload_is_camel_case_and_complete(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        data = (await client.get(PROFILE, headers=principal.headers)).json()["data"]

        assert {"coreValues", "postalCode", "seniorPastor", "alternativePhone"} <= set(data)
        assert "core_values" not in data

    async def test_no_column_outside_the_profile_is_echoed(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)

        data = (await client.get(PROFILE, headers=principal.headers)).json()["data"]

        assert "tenantId" not in data
        assert "deletedAt" not in data


class TestTenantPredicateIsIndependentlyPresent:
    """The predicate asserted structurally, not only behaviourally.

    Phase 2B-8's lesson: a scope predicate that is only enforced transitively
    passes every behavioural test right up until the day the thing masking it
    goes away. Here nothing masks it, so the assertion is direct -- the
    compiled SQL must name the caller's tenant.
    """

    @staticmethod
    def _sql(context: SecurityContext) -> str:
        statement = churches_service.visible_church(context)
        return str(statement.compile(compile_kwargs={"literal_binds": True}))

    @pytest.fixture
    def context(self) -> SecurityContext:
        return SecurityContext(
            user_id=uuid.uuid4(),
            tenant_id=uuid.uuid4(),
            role_id=uuid.uuid4(),
            role_key=None,
            role_name="Role",
            permissions=frozenset({MANAGE}),
            assigned_branch_ids=frozenset(),
            primary_branch_id=None,
        )

    def test_the_query_filters_on_the_authenticated_tenant(self, context: SecurityContext) -> None:
        assert f"churches.id = '{context.tenant_id.hex}'" in self._sql(context)

    def test_the_query_has_no_branch_predicate(self, context: SecurityContext) -> None:
        """Branch scope is opt-in per endpoint, and this endpoint opts out."""
        assert "branch" not in self._sql(context).lower()


class TestTheWritableAllowListGuardsAgainstSchemaDrift:
    """The allow-list is defence-in-depth, so it needs a direct test.

    No HTTP request can reach it today: ``ChurchProfileUpdateRequest`` forbids
    unknown fields, and every field it declares is writable. That is precisely
    why it is tested here instead -- the guard exists for the day a field is
    added to the schema without a matching column, and a guard that only ever
    runs in a situation that cannot yet arise is one nobody notices deleting.

    The drifted model below is that day, made to happen now.
    """

    class _DriftedRequest(ChurchProfileUpdateRequest):
        """A future schema field with no column behind it."""

        marital_status: str | None = None

    async def test_a_field_with_no_column_is_refused(self, db_session: AsyncSession) -> None:
        principal = await make_principal(db_session, MANAGE)
        context = await resolve_security_context(db_session, principal.user)

        with pytest.raises(ValidationError) as raised:
            await churches_service.update_church_profile(
                db_session, context, self._DriftedRequest(marital_status="Married")
            )

        assert "maritalStatus" in str(raised.value)

    async def test_the_refusal_happens_before_anything_is_written(
        self, db_session: AsyncSession
    ) -> None:
        principal = await make_principal(db_session, MANAGE)
        context = await resolve_security_context(db_session, principal.user)
        before = principal.church.name

        with pytest.raises(ValidationError):
            await churches_service.update_church_profile(
                db_session,
                context,
                self._DriftedRequest(name="Should Not Stick", marital_status="Married"),
            )

        await db_session.refresh(principal.church)
        assert principal.church.name == before

    def test_every_writable_column_is_a_real_church_column(self) -> None:
        """The allow-list cannot drift the other way either."""
        columns = {column.key for column in Church.__table__.columns}

        assert columns >= churches_service._WRITABLE_COLUMNS
        assert churches_service._NULLABLE_COLUMNS <= churches_service._WRITABLE_COLUMNS

    def test_the_nullable_set_matches_the_tables_nullable_columns(self) -> None:
        """``null`` is accepted for exactly the columns that permit it."""
        nullable = {
            column.key
            for column in Church.__table__.columns
            if column.nullable and column.key in churches_service._WRITABLE_COLUMNS
        }

        assert nullable == churches_service._NULLABLE_COLUMNS
