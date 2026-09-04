"""``POST /auth/login`` and ``GET /auth/me`` against the real application.

Driven through ``create_app()`` rather than a purpose-built test app, so the
middleware stack, the versioned prefix and the error envelope are all exactly
what a client would meet.

Authentication failures are asserted to be *indistinguishable*: a login
endpoint that answers differently for "no such email" and "wrong password" is
an account-enumeration oracle.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from datetime import timedelta

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient, Response
from redis.asyncio import Redis
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.cache import get_redis
from app.core.database import get_db, utcnow
from app.core.security import create_access_token
from app.core.security.passwords import hash_password, verify_and_rehash, verify_password
from app.domains.churches.models import Branch, BranchStatus, BranchType, Church
from app.domains.identity import authentication
from app.domains.identity.models import (
    Permission,
    Role,
    RolePermission,
    User,
    UserBranchAssignment,
    UserStatus,
)
from app.domains.identity.rbac_registry import ROLE_PERMISSIONS
from app.main import create_app

pytestmark = [
    pytest.mark.requires_db,
    pytest.mark.usefixtures("clear_login_rate_limit"),
]

OK = 200
UNAUTHENTICATED = 401
FORBIDDEN = 403
UNPROCESSABLE = 422
RATE_LIMITED = 429
SERVICE_UNAVAILABLE = 503

PASSWORD = "correct horse battery staple"
NEW_PASSWORD = "a genuinely different passphrase"
LOGIN = "/api/v1/auth/login"
ME = "/api/v1/auth/me"
CHANGE_PASSWORD = "/api/v1/auth/change-password"


@pytest.fixture
def api(db_session: AsyncSession) -> FastAPI:
    """The real app, sharing the test's uncommitted session."""
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


async def make_account(
    session: AsyncSession,
    *codes: str,
    email: str = "ama.owusu@gracechapel.example",
    password: str = PASSWORD,
    church: Church | None = None,
    **user_overrides: object,
) -> tuple[Church, User, Role]:
    """A church, a role granting ``codes``, and a user holding it."""
    if church is None:
        church = _church()
        session.add(church)
        await session.flush()

    role = Role(tenant_id=church.id, key="Admin", name="Admin", is_system=True)
    session.add(role)
    await session.flush()
    for code in codes:
        # `permissions` is global with UNIQUE(code), so a second church in the
        # same test reuses the row rather than inserting a duplicate.
        permission = (
            await session.execute(select(Permission).where(Permission.code == code))
        ).scalar_one_or_none()
        if permission is None:
            permission = Permission(code=code)
            session.add(permission)
            await session.flush()
        session.add(RolePermission(role_id=role.id, permission_id=permission.id))

    user = User(
        tenant_id=church.id,
        first_name="Ama",
        last_name="Owusu",
        email=email,
        username=email.split("@")[0],
        password_hash=hash_password(password),
        status=UserStatus.ACTIVE,
        role_id=role.id,
        **user_overrides,
    )
    session.add(user)
    await session.flush()
    return church, user, role


def credentials(email: str, password: str = PASSWORD) -> dict[str, str]:
    return {"email": email, "password": password}


def bearer(user: User) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {create_access_token(user_id=user.id, tenant_id=user.tenant_id)}"
    }


class TestSuccessfulLogin:
    async def test_returns_the_documented_envelope(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view", "dashboard.view")

        response = await client.post(LOGIN, json=credentials(user.email))

        assert response.status_code == OK
        body = response.json()
        assert body["success"] is True
        assert body["message"] == "Login successful"
        assert set(body["data"]) == {"user", "token"}

    async def test_user_object_matches_the_frontend_contract(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, role = await make_account(db_session, "members.view", "dashboard.view")

        body = (await client.post(LOGIN, json=credentials(user.email))).json()
        returned = body["data"]["user"]

        assert returned["id"] == str(user.id)
        assert returned["email"] == user.email
        assert returned["name"] == "Ama Owusu"
        assert returned["role"]["name"] == role.name
        assert returned["role"]["tenantId"] == str(church.id)
        assert sorted(returned["role"]["permissions"]) == ["dashboard.view", "members.view"]

    async def test_token_is_accepted_by_the_current_user_dependency(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        token = (await client.post(LOGIN, json=credentials(user.email))).json()["data"]["token"]
        response = await client.get(ME, headers={"Authorization": f"Bearer {token}"})

        assert response.status_code == OK
        assert response.json()["data"]["id"] == str(user.id)

    async def test_response_never_carries_credential_material(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        raw = (await client.post(LOGIN, json=credentials(user.email))).text

        assert "passwordHash" not in raw
        assert "password_hash" not in raw
        assert "argon2" not in raw.lower()

    async def test_primary_branch_is_reported_as_role_branch_id(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_account(db_session, "members.view")
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(
                tenant_id=church.id, user_id=user.id, branch_id=branch.id, is_primary=True
            )
        )
        await db_session.flush()

        body = (await client.post(LOGIN, json=credentials(user.email))).json()

        assert body["data"]["user"]["role"]["branchId"] == str(branch.id)

    async def test_require_password_change_is_surfaced(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view", require_password_change=True)

        body = (await client.post(LOGIN, json=credentials(user.email))).json()

        assert body["data"]["user"]["requirePasswordChange"] is True

    async def test_a_user_with_no_role_can_still_sign_in(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Authenticated, authorized for nothing -- not locked out of login."""
        _, user, _ = await make_account(db_session)
        user.role_id = None
        await db_session.flush()

        body = (await client.post(LOGIN, json=credentials(user.email))).json()

        assert body["data"]["user"]["role"] is None


class TestFailedLogin:
    async def test_unknown_email_is_rejected(self, client: AsyncClient) -> None:
        response = await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))

        assert response.status_code == UNAUTHENTICATED
        assert response.json()["code"] == "UNAUTHENTICATED"

    async def test_wrong_password_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        response = await client.post(LOGIN, json=credentials(user.email, "wrong password"))

        assert response.status_code == UNAUTHENTICATED

    @pytest.mark.parametrize("status", [UserStatus.INACTIVE, UserStatus.SUSPENDED])
    async def test_non_active_account_cannot_obtain_a_token(
        self, client: AsyncClient, db_session: AsyncSession, status: UserStatus
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        user.status = status
        await db_session.flush()

        assert (
            await client.post(LOGIN, json=credentials(user.email))
        ).status_code == UNAUTHENTICATED

    async def test_soft_deleted_account_cannot_obtain_a_token(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        user.deleted_at = utcnow()
        await db_session.flush()

        assert (
            await client.post(LOGIN, json=credentials(user.email))
        ).status_code == UNAUTHENTICATED

    async def test_every_rejection_is_indistinguishable(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The security requirement, asserted directly: an attacker must not be
        able to tell which of these an account is."""
        _, active, _ = await make_account(db_session, "members.view")
        _, suspended, _ = await make_account(
            db_session,
            "members.view",
            email="suspended@gracechapel.example",
            church=await self._second_church(db_session),
        )
        suspended.status = UserStatus.SUSPENDED
        await db_session.flush()

        responses = [
            await client.post(LOGIN, json=credentials("nobody@gracechapel.example")),
            await client.post(LOGIN, json=credentials(active.email, "wrong password")),
            await client.post(LOGIN, json=credentials(suspended.email)),
        ]

        assert {response.status_code for response in responses} == {UNAUTHENTICATED}
        bodies = [response.json() for response in responses]
        assert len({(body["code"], body["message"]) for body in bodies}) == 1

    @staticmethod
    async def _second_church(session: AsyncSession) -> Church:
        church = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        session.add(church)
        await session.flush()
        return church

    @pytest.mark.parametrize(
        "payload",
        [
            {"email": "a@b.example"},
            {"password": PASSWORD},
            {},
            {"email": "a@b.example", "password": "short"},
        ],
    )
    async def test_malformed_credentials_are_rejected(
        self, client: AsyncClient, payload: dict[str, str]
    ) -> None:
        response = await client.post(LOGIN, json=payload)

        assert response.status_code == UNPROCESSABLE
        assert response.json()["code"] == "VALIDATION_ERROR"

    async def test_a_client_supplied_tenant_is_refused_outright(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The login schema forbids extra fields, so a tenant cannot even be
        offered, let alone trusted."""
        _, user, _ = await make_account(db_session, "members.view")

        response = await client.post(
            LOGIN, json={**credentials(user.email), "tenantId": str(uuid.uuid4())}
        )

        assert response.status_code == UNPROCESSABLE


class TestLastLoginAndRehash:
    async def test_successful_login_stamps_last_login_at(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        assert user.last_login_at is None

        before = utcnow()
        await client.post(LOGIN, json=credentials(user.email))

        stamped = (
            await db_session.execute(select(User.last_login_at).where(User.id == user.id))
        ).scalar_one()
        assert stamped is not None
        assert stamped >= before

    async def test_failed_login_does_not_stamp_last_login_at(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        await client.post(LOGIN, json=credentials(user.email, "wrong password"))
        await db_session.refresh(user)

        assert user.last_login_at is None

    async def test_an_outdated_hash_is_upgraded_on_successful_login(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``verify_and_rehash`` returns a replacement when Argon2's parameters
        have moved on; login persists it, transparently to the user."""
        from pwdlib import PasswordHash
        from pwdlib.hashers.argon2 import Argon2Hasher

        _, user, _ = await make_account(db_session, "members.view")
        weak = PasswordHash((Argon2Hasher(memory_cost=8 * 1024, time_cost=1),))
        user.password_hash = weak.hash(PASSWORD)
        await db_session.flush()
        stale_hash = user.password_hash

        assert (await client.post(LOGIN, json=credentials(user.email))).status_code == OK
        await db_session.refresh(user)

        assert user.password_hash != stale_hash
        assert verify_password(PASSWORD, user.password_hash)

    async def test_the_password_still_works_after_a_rehash(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        from pwdlib import PasswordHash
        from pwdlib.hashers.argon2 import Argon2Hasher

        _, user, _ = await make_account(db_session, "members.view")
        weak = PasswordHash((Argon2Hasher(memory_cost=8 * 1024, time_cost=1),))
        user.password_hash = weak.hash(PASSWORD)
        await db_session.flush()

        await client.post(LOGIN, json=credentials(user.email))
        second = await client.post(LOGIN, json=credentials(user.email))

        assert second.status_code == OK


class TestCurrentUserEndpoint:
    async def test_requires_authentication(self, client: AsyncClient) -> None:
        response = await client.get(ME)

        assert response.status_code == UNAUTHENTICATED
        assert response.json()["code"] == "UNAUTHENTICATED"

    async def test_returns_the_authenticated_user(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        headers = await self._sign_in(client, user)

        body = (await client.get(ME, headers=headers)).json()

        assert body["success"] is True
        assert body["data"]["id"] == str(user.id)
        assert "passwordHash" not in body["data"]

    async def test_reflects_a_role_reassigned_after_the_token_was_issued(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_account(db_session, "members.view")
        headers = await self._sign_in(client, user)

        narrower = Role(tenant_id=church.id, key="Teacher", name="Teacher", is_system=True)
        db_session.add(narrower)
        await db_session.flush()
        user.role_id = narrower.id
        await db_session.flush()

        body = (await client.get(ME, headers=headers)).json()

        assert body["data"]["role"]["name"] == "Teacher"
        assert body["data"]["role"]["permissions"] == []

    async def test_reflects_a_permission_revoked_after_the_token_was_issued(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, role = await make_account(db_session, "members.view")
        headers = await self._sign_in(client, user)

        await db_session.execute(delete(RolePermission).where(RolePermission.role_id == role.id))
        await db_session.flush()

        body = (await client.get(ME, headers=headers)).json()

        assert body["data"]["role"]["permissions"] == []

    async def test_reflects_a_branch_assignment_removed_after_the_token_was_issued(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_account(db_session, "members.view")
        branch = _branch(church.id)
        db_session.add(branch)
        await db_session.flush()
        db_session.add(
            UserBranchAssignment(
                tenant_id=church.id, user_id=user.id, branch_id=branch.id, is_primary=True
            )
        )
        await db_session.flush()
        headers = await self._sign_in(client, user)
        assert (await client.get(ME, headers=headers)).json()["data"]["role"][
            "branchId"
        ] is not None

        await db_session.execute(
            delete(UserBranchAssignment).where(UserBranchAssignment.user_id == user.id)
        )
        await db_session.flush()

        body = (await client.get(ME, headers=headers)).json()

        assert body["data"]["role"]["branchId"] is None

    async def test_suspension_after_issuance_returns_401(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        headers = await self._sign_in(client, user)

        user.status = UserStatus.SUSPENDED
        await db_session.flush()

        assert (await client.get(ME, headers=headers)).status_code == UNAUTHENTICATED

    async def test_a_tampered_tenant_claim_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        other = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(other)
        await db_session.flush()

        forged = create_access_token(user_id=user.id, tenant_id=other.id)

        assert (
            await client.get(ME, headers={"Authorization": f"Bearer {forged}"})
        ).status_code == UNAUTHENTICATED

    async def test_an_expired_token_is_rejected(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        stale = create_access_token(
            user_id=user.id, tenant_id=user.tenant_id, expires_in=timedelta(minutes=-1)
        )

        assert (
            await client.get(ME, headers={"Authorization": f"Bearer {stale}"})
        ).status_code == UNAUTHENTICATED

    @staticmethod
    async def _sign_in(client: AsyncClient, user: User) -> dict[str, str]:
        response = await client.post(LOGIN, json=credentials(user.email))
        return {"Authorization": f"Bearer {response.json()['data']['token']}"}


class TestCrossTenantEmailAmbiguity:
    async def test_an_email_shared_by_two_churches_cannot_sign_in(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``users.email`` is unique per tenant, not globally (ADR-006), and
        login carries no tenant. Rather than guess a church, the ambiguous
        address is refused -- see ADR-012."""
        shared = "pastor@shared.example"
        await make_account(db_session, "members.view", email=shared)
        second = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(second)
        await db_session.flush()
        await make_account(db_session, "members.view", email=shared, church=second)

        response = await client.post(LOGIN, json=credentials(shared))

        assert response.status_code == UNAUTHENTICATED

    async def test_the_same_address_still_works_while_unique(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view", email="solo@shared.example")

        assert (await client.post(LOGIN, json=credentials(user.email))).status_code == OK

    async def test_a_soft_deleted_duplicate_does_not_block_the_live_account(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Deleted rows are excluded from the lookup, so an old account in
        another church cannot lock a live user out."""
        shared = "pastor@shared.example"
        _, retired, _ = await make_account(db_session, "members.view", email=shared)
        retired.deleted_at = utcnow()
        await db_session.flush()
        second = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add(second)
        await db_session.flush()
        await make_account(db_session, "members.view", email=shared, church=second)

        assert (await client.post(LOGIN, json=credentials(shared))).status_code == OK

    async def test_a_users_own_tenant_is_the_one_in_the_token(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        church, user, _ = await make_account(db_session, "members.view")

        body = (await client.post(LOGIN, json=credentials(user.email))).json()
        me = await client.get(ME, headers={"Authorization": f"Bearer {body['data']['token']}"})

        assert me.json()["data"]["role"]["tenantId"] == str(church.id)
        assert (
            await db_session.execute(select(User.tenant_id).where(User.id == user.id))
        ).scalar_one() == church.id


class TestLoginRateLimit:
    """The throttle is asserted through the real route, not against the
    limiter directly: what matters is that it is actually mounted on
    ``/auth/login`` and renders through the standard error envelope."""

    @staticmethod
    def _tighten(monkeypatch: pytest.MonkeyPatch, *, attempts: int) -> None:
        """Shrink the configured budget rather than sending a hundred requests."""
        monkeypatch.setattr(settings, "LOGIN_RATE_LIMIT_ATTEMPTS", attempts)

    async def test_attempts_beyond_the_budget_are_refused(
        self, client: AsyncClient, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        self._tighten(monkeypatch, attempts=3)

        for _ in range(3):
            await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))
        response = await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))

        assert response.status_code == RATE_LIMITED
        assert response.json()["code"] == "RATE_LIMITED"

    async def test_a_refusal_carries_retry_after(
        self, client: AsyncClient, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        self._tighten(monkeypatch, attempts=1)

        await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))
        response = await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))

        assert int(response.headers["Retry-After"]) >= 1

    async def test_successful_logins_are_counted_too(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """Otherwise an attacker who guesses one password in a batch keeps an
        unlimited budget for every remaining account."""
        self._tighten(monkeypatch, attempts=2)
        _, user, _ = await make_account(db_session, "members.view")

        first = await client.post(LOGIN, json=credentials(user.email))
        second = await client.post(LOGIN, json=credentials(user.email))
        third = await client.post(LOGIN, json=credentials(user.email))

        assert (first.status_code, second.status_code) == (OK, OK)
        assert third.status_code == RATE_LIMITED

    async def test_a_valid_password_does_not_reopen_the_endpoint(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """Succeeding must not clear the counter: that would make the limit
        trivially resettable by anyone holding one working credential."""
        self._tighten(monkeypatch, attempts=2)
        _, user, _ = await make_account(db_session, "members.view")

        await client.post(LOGIN, json=credentials(user.email, "wrong password"))
        assert (await client.post(LOGIN, json=credentials(user.email))).status_code == OK

        assert (await client.post(LOGIN, json=credentials(user.email))).status_code == RATE_LIMITED

    async def test_the_refusal_reveals_no_limiter_internals(
        self, client: AsyncClient, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """An unauthenticated caller learns that it must wait, and nothing
        about the size of the budget or how much of it is left."""
        self._tighten(monkeypatch, attempts=1)

        await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))
        refused = await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))

        assert refused.status_code == RATE_LIMITED
        body = refused.json()
        assert "remaining" not in str(body).lower()
        assert str(settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS) not in body["message"]
        assert str(settings.LOGIN_RATE_LIMIT_ATTEMPTS) not in body["message"]

    async def test_the_throttle_does_not_leak_across_endpoints(
        self, client: AsyncClient, db_session: AsyncSession, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """An exhausted login budget must not lock an already-authenticated
        user out of the rest of the API."""
        self._tighten(monkeypatch, attempts=1)
        _, user, _ = await make_account(db_session, "members.view")
        token = create_access_token(user_id=user.id, tenant_id=user.tenant_id)

        await client.post(LOGIN, json=credentials(user.email))
        assert (await client.post(LOGIN, json=credentials(user.email))).status_code == RATE_LIMITED

        me = await client.get(ME, headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == OK


class TestLoginRateLimitBackendFailure:
    """Redis is where the counters live. If it cannot be reached the limit
    cannot be applied, and the configured choice decides what that means."""

    @pytest.fixture
    def unreachable_redis(self, api: FastAPI) -> FastAPI:
        async def _override() -> AsyncGenerator[Redis]:
            client = Redis(host="127.0.0.1", port=1, socket_connect_timeout=0.2)
            try:
                yield client
            finally:
                await client.aclose()

        api.dependency_overrides[get_redis] = _override
        return api

    @pytest.fixture
    async def failing_client(self, unreachable_redis: FastAPI) -> AsyncGenerator[AsyncClient]:
        transport = ASGITransport(app=unreachable_redis)
        async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
            yield http_client

    async def test_fails_closed_by_default(
        self, failing_client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """A Redis outage must not quietly become an unthrottled login
        endpoint."""
        _, user, _ = await make_account(db_session, "members.view")

        response = await failing_client.post(LOGIN, json=credentials(user.email))

        assert response.status_code == SERVICE_UNAVAILABLE
        assert response.json()["code"] == "SERVICE_UNAVAILABLE"

    async def test_no_token_is_issued_when_the_limit_cannot_be_applied(
        self, failing_client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        body = (await failing_client.post(LOGIN, json=credentials(user.email))).json()

        assert "token" not in str(body)

    async def test_fail_open_is_available_but_must_be_chosen(
        self,
        failing_client: AsyncClient,
        db_session: AsyncSession,
        monkeypatch: pytest.MonkeyPatch,
    ) -> None:
        """Availability over enforcement is a legitimate trade, but only as a
        deliberate configuration -- never the default."""
        monkeypatch.setattr(settings, "LOGIN_RATE_LIMIT_FAIL_OPEN", True)
        _, user, _ = await make_account(db_session, "members.view")

        assert (await failing_client.post(LOGIN, json=credentials(user.email))).status_code == OK

    def test_the_shipped_default_is_fail_closed(self) -> None:
        assert settings.LOGIN_RATE_LIMIT_FAIL_OPEN is False


class TestAmbiguousTenantDisclosesNothing:
    """An address held by two churches cannot be resolved, so it is refused.
    The refusal must look exactly like every other one: telling a caller that
    an address is *ambiguous* discloses that it exists in more than one
    church, which is a fact about a tenant they have no relationship with."""

    async def test_ambiguity_is_indistinguishable_from_an_unknown_address(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        shared = "pastor@shared.example"
        first = _church(name="First Church", email="info@first.example")
        second = _church(name="Second Church", email="info@second.example")
        db_session.add_all([first, second])
        await db_session.flush()
        await make_account(db_session, "members.view", email=shared, church=first)
        await make_account(db_session, "members.view", email=shared, church=second)

        ambiguous = await client.post(LOGIN, json=credentials(shared))
        unknown = await client.post(LOGIN, json=credentials("nobody@nowhere.example"))

        assert ambiguous.status_code == unknown.status_code == UNAUTHENTICATED
        assert _comparable(ambiguous) == _comparable(unknown)

    async def test_a_correct_password_does_not_resolve_the_ambiguity(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Knowing one tenant's password must not select that tenant: the
        server would be choosing a church from a credential, which is exactly
        the guess that must never happen."""
        shared = "pastor@shared.example"
        first = _church(name="First Church", email="info@first.example")
        second = _church(name="Second Church", email="info@second.example")
        db_session.add_all([first, second])
        await db_session.flush()
        await make_account(db_session, "members.view", email=shared, church=first)
        await make_account(
            db_session, "members.view", email=shared, church=second, password="a different password"
        )

        assert (await client.post(LOGIN, json=credentials(shared))).status_code == UNAUTHENTICATED
        assert (
            await client.post(LOGIN, json=credentials(shared, "a different password"))
        ).status_code == UNAUTHENTICATED

    async def test_the_response_never_names_a_church(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        shared = "pastor@shared.example"
        first = _church(name="Distinctive Church Name", email="info@first.example")
        second = _church(name="Second Church", email="info@second.example")
        db_session.add_all([first, second])
        await db_session.flush()
        await make_account(db_session, "members.view", email=shared, church=first)
        await make_account(db_session, "members.view", email=shared, church=second)

        body = str((await client.post(LOGIN, json=credentials(shared))).json())

        assert "Distinctive Church Name" not in body
        assert str(first.id) not in body and str(second.id) not in body


def _comparable(response: Response) -> tuple[int, str, str]:
    """A response reduced to what an attacker can actually compare.

    ``requestId`` differs per request by design, so it is excluded.
    """
    body = response.json()
    return response.status_code, body["code"], body["message"]


class TestChangePassword:
    async def test_changes_the_password(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "profile.security")

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        assert response.status_code == OK
        await db_session.refresh(user)
        assert verify_password(NEW_PASSWORD, user.password_hash)

    async def test_returns_the_documented_envelope(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``{success, message}`` with no ``data`` -- the contract in
        ``Auth_Authentication_Endpoints.md``."""
        _, user, _ = await make_account(db_session, "profile.security")

        body = (
            await client.put(
                CHANGE_PASSWORD,
                json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
                headers=bearer(user),
            )
        ).json()

        assert body == {"success": True, "message": "Password changed successfully"}

    async def test_the_old_password_stops_working(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "profile.security")
        await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        assert (await client.post(LOGIN, json=credentials(user.email))).status_code == (
            UNAUTHENTICATED
        )
        assert (
            await client.post(LOGIN, json=credentials(user.email, NEW_PASSWORD))
        ).status_code == OK

    async def test_requires_authentication(self, client: AsyncClient) -> None:
        response = await client.put(
            CHANGE_PASSWORD, json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD}
        )

        assert response.status_code == UNAUTHENTICATED

    async def test_a_wrong_current_password_is_refused(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """A stolen token alone must not be enough to take permanent
        ownership of an account."""
        _, user, _ = await make_account(db_session, "profile.security")

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": "not the password", "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        assert response.status_code == UNPROCESSABLE
        await db_session.refresh(user)
        assert verify_password(PASSWORD, user.password_hash)

    async def test_a_wrong_current_password_does_not_log_the_user_out(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """``services/api-client.ts`` clears local storage and redirects on any
        401, so a mistyped current password must not answer with one."""
        _, user, _ = await make_account(db_session, "profile.security")

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": "not the password", "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        assert response.status_code != UNAUTHENTICATED
        assert response.json()["errors"][0]["field"] == "currentPassword"

    async def test_reusing_the_current_password_is_refused(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "profile.security")

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": PASSWORD},
            headers=bearer(user),
        )

        assert response.status_code == UNPROCESSABLE

    async def test_the_forced_change_flag_cannot_be_cleared_by_a_no_op(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The exact state the flag exists to end is "still using the password
        somebody else chose"."""
        _, user, _ = await make_account(
            db_session, "profile.security", require_password_change=True
        )

        await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": PASSWORD},
            headers=bearer(user),
        )

        await db_session.refresh(user)
        assert user.require_password_change is True

    async def test_a_real_change_clears_the_forced_change_flag(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(
            db_session, "profile.security", require_password_change=True
        )

        await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        await db_session.refresh(user)
        assert user.require_password_change is False

    @pytest.mark.parametrize(
        "payload",
        [
            {"currentPassword": PASSWORD, "newPassword": "short"},
            {"currentPassword": PASSWORD},
            {"newPassword": NEW_PASSWORD},
            {"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD, "userId": "smuggled"},
        ],
    )
    async def test_malformed_requests_are_rejected(
        self, client: AsyncClient, db_session: AsyncSession, payload: dict[str, str]
    ) -> None:
        """The 8-character minimum is ``changePasswordSchema``'s, and no extra
        field -- a user id above all -- may ride along."""
        _, user, _ = await make_account(db_session, "profile.security")

        response = await client.put(CHANGE_PASSWORD, json=payload, headers=bearer(user))

        assert response.status_code == UNPROCESSABLE

    async def test_the_response_never_carries_credential_material(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "profile.security")

        body = str(
            (
                await client.put(
                    CHANGE_PASSWORD,
                    json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
                    headers=bearer(user),
                )
            ).json()
        )

        assert NEW_PASSWORD not in body
        assert PASSWORD not in body
        assert "argon2" not in body.lower()

    async def test_a_suspended_user_cannot_change_a_password(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "profile.security")
        headers = bearer(user)
        user.status = UserStatus.SUSPENDED
        await db_session.flush()

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=headers,
        )

        assert response.status_code == UNAUTHENTICATED

    async def test_one_users_change_does_not_touch_another(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The account changed is the one the token names, never one the body
        could nominate."""
        church, user, role = await make_account(db_session, "profile.security")
        other = User(
            tenant_id=church.id,
            first_name="Kofi",
            last_name="Mensah",
            email="other@gracechapel.example",
            username="kofi.mensah",
            password_hash=hash_password(PASSWORD),
            status=UserStatus.ACTIVE,
            role_id=role.id,
        )
        db_session.add(other)
        await db_session.flush()

        await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        await db_session.refresh(other)
        assert verify_password(PASSWORD, other.password_hash)


class TestChangePasswordAuthorization:
    """Gated on ``profile.security`` -- "Update password, enable 2FA, and
    inspect active sessions" in the canonical catalogue, and the permission
    ``backend-api-map.md`` marks binding for this endpoint. All six canonical
    roles hold it, so no ordinary user is affected."""

    async def test_a_user_without_the_permission_is_forbidden(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        assert response.status_code == FORBIDDEN

    async def test_the_refusal_is_403_not_401(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Lacking a permission must not log the user out
        (``backend-security-plan.md`` §2.3)."""
        _, user, _ = await make_account(db_session, "members.view")

        response = await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        assert response.json()["code"] == "FORBIDDEN"

    async def test_a_forbidden_attempt_does_not_change_the_password(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")

        await client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=bearer(user),
        )

        await db_session.refresh(user)
        assert verify_password(PASSWORD, user.password_hash)

    def test_every_canonical_role_can_change_its_own_password(self) -> None:
        """Otherwise gating this endpoint would lock a whole role out of its
        own credentials."""
        assert all("profile.security" in permissions for permissions in ROLE_PERMISSIONS.values())


class TestFailurePathsDoEqualWork:
    """No timing distinction between failure modes -- §14's one property that
    response bodies alone cannot demonstrate.

    Asserted as *work performed* rather than elapsed time. Argon2 verification
    dominates the cost of a login by orders of magnitude, so "every failure
    path runs exactly one verification" is the property that makes the paths
    take the same time -- and unlike a wall-clock measurement it is
    deterministic, so it can be a build gate instead of a flaky one.

    The path that matters most here is the ambiguous address. An early return
    when two churches share an email would answer measurably faster than a
    wrong password, turning login into an oracle for "this address exists in
    more than one church" -- a fact about a tenant the caller has no
    relationship with.
    """

    @pytest.fixture
    def verifications(self, monkeypatch: pytest.MonkeyPatch) -> list[str]:
        """Records every Argon2 verification ``authenticate`` performs."""
        calls: list[str] = []

        def counting(password: str, password_hash: str) -> tuple[bool, str | None]:
            calls.append(password_hash)
            return verify_and_rehash(password, password_hash)

        monkeypatch.setattr(authentication, "verify_and_rehash", counting)
        return calls

    async def test_an_unknown_address_still_verifies_a_password(
        self, client: AsyncClient, verifications: list[str]
    ) -> None:
        await client.post(LOGIN, json=credentials("nobody@gracechapel.example"))

        assert len(verifications) == 1

    async def test_an_ambiguous_address_still_verifies_a_password(
        self, client: AsyncClient, db_session: AsyncSession, verifications: list[str]
    ) -> None:
        """The regression this class exists for."""
        shared = "pastor@shared.example"
        first = _church(name="First Church", email="info@first.example")
        second = _church(name="Second Church", email="info@second.example")
        db_session.add_all([first, second])
        await db_session.flush()
        await make_account(db_session, "members.view", email=shared, church=first)
        await make_account(db_session, "members.view", email=shared, church=second)
        verifications.clear()

        response = await client.post(LOGIN, json=credentials(shared))

        assert response.status_code == UNAUTHENTICATED
        assert len(verifications) == 1

    async def test_an_ambiguous_address_verifies_against_neither_account(
        self, client: AsyncClient, db_session: AsyncSession, verifications: list[str]
    ) -> None:
        """It verifies against the throwaway equaliser hash, so no real stored
        hash is exercised and no account is singled out."""
        shared = "pastor@shared.example"
        first = _church(name="First Church", email="info@first.example")
        second = _church(name="Second Church", email="info@second.example")
        db_session.add_all([first, second])
        await db_session.flush()
        _, one, _ = await make_account(db_session, "members.view", email=shared, church=first)
        _, two, _ = await make_account(db_session, "members.view", email=shared, church=second)
        stored = {one.password_hash, two.password_hash}
        verifications.clear()

        await client.post(LOGIN, json=credentials(shared))

        assert set(verifications).isdisjoint(stored)

    @pytest.mark.parametrize("status", [UserStatus.INACTIVE, UserStatus.SUSPENDED])
    async def test_an_unusable_account_still_verifies_a_password(
        self,
        client: AsyncClient,
        db_session: AsyncSession,
        verifications: list[str],
        status: UserStatus,
    ) -> None:
        """The status check deliberately sits *after* verification, so
        rejecting a suspended account costs the same as a wrong password."""
        _, user, _ = await make_account(db_session, "members.view")
        user.status = status
        await db_session.flush()
        verifications.clear()

        await client.post(LOGIN, json=credentials(user.email))

        assert len(verifications) == 1

    async def test_a_soft_deleted_account_still_verifies_a_password(
        self, client: AsyncClient, db_session: AsyncSession, verifications: list[str]
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        user.deleted_at = utcnow()
        await db_session.flush()
        verifications.clear()

        await client.post(LOGIN, json=credentials(user.email))

        assert len(verifications) == 1

    async def test_a_wrong_password_verifies_exactly_once(
        self, client: AsyncClient, db_session: AsyncSession, verifications: list[str]
    ) -> None:
        _, user, _ = await make_account(db_session, "members.view")
        verifications.clear()

        await client.post(LOGIN, json=credentials(user.email, "wrong password"))

        assert len(verifications) == 1


class TestAmbiguityIsComputedOverLiveAccounts:
    """Which rows make an address ambiguous, and which do not.

    Ambiguity is decided over rows that still exist -- soft deletion removes a
    row from consideration, account status does not. Status is reversible
    administrative state: if an inactive account did not count, reactivating it
    would silently break login for a completely different church, with nothing
    in either tenant to explain why.
    """

    @staticmethod
    async def _two_churches(session: AsyncSession) -> tuple[Church, Church]:
        first = _church(name="First Church", email="info@first.example")
        second = _church(name="Second Church", email="info@second.example")
        session.add_all([first, second])
        await session.flush()
        return first, second

    @pytest.mark.parametrize("status", [UserStatus.INACTIVE, UserStatus.SUSPENDED])
    async def test_an_unusable_duplicate_still_makes_the_address_ambiguous(
        self, client: AsyncClient, db_session: AsyncSession, status: UserStatus
    ) -> None:
        shared = "pastor@shared.example"
        first, second = await self._two_churches(db_session)
        await make_account(db_session, "members.view", email=shared, church=first)
        _, other, _ = await make_account(db_session, "members.view", email=shared, church=second)
        other.status = status
        await db_session.flush()

        assert (await client.post(LOGIN, json=credentials(shared))).status_code == (UNAUTHENTICATED)

    async def test_reactivating_an_account_cannot_silently_break_another_church(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """The consequence of the rule above, stated directly: because status
        never affected ambiguity, changing it cannot change who can log in."""
        shared = "pastor@shared.example"
        first, second = await self._two_churches(db_session)
        await make_account(db_session, "members.view", email=shared, church=first)
        _, other, _ = await make_account(db_session, "members.view", email=shared, church=second)
        other.status = UserStatus.INACTIVE
        await db_session.flush()
        before = (await client.post(LOGIN, json=credentials(shared))).status_code

        other.status = UserStatus.ACTIVE
        await db_session.flush()
        after = (await client.post(LOGIN, json=credentials(shared))).status_code

        assert before == after == UNAUTHENTICATED
