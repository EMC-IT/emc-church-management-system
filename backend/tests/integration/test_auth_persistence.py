"""Authentication writes survive the request that made them.

Every other API test overrides ``get_db`` with a session that is rolled back,
so a write only has to be *flushed* to satisfy its assertions. That is exactly
the blind spot which let ``last_login_at``, the transparent hash upgrade and
the password change all answer 200 while persisting nothing.

These tests deliberately do **not** override ``get_db``. They drive the real
dependency, then read the row back through a separate session that never saw
the write -- which it can only find if the request actually committed. They
clean up after themselves, because by construction nothing rolls them back.
"""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import session_factory
from app.core.security import create_access_token
from app.core.security.passwords import hash_password, verify_password
from app.domains.churches.models import Church
from app.domains.identity.models import Permission, Role, RolePermission, User, UserStatus
from app.main import create_app

pytestmark = [pytest.mark.requires_db, pytest.mark.usefixtures("clear_login_rate_limit")]

PASSWORD = "correct horse battery staple"
NEW_PASSWORD = "a genuinely different passphrase"
LOGIN = "/api/v1/auth/login"
CHANGE_PASSWORD = "/api/v1/auth/change-password"
CHURCH_PREFIX = "Persistence Church"


class Account:
    """Identifiers only. Holding an ORM instance across sessions would let a
    stale identity map answer a question these tests exist to ask the
    database."""

    def __init__(self, church_id: uuid.UUID, user_id: uuid.UUID, email: str) -> None:
        self.church_id = church_id
        self.user_id = user_id
        self.email = email


@pytest.fixture
async def account() -> AsyncGenerator[Account]:
    """A committed church, role and user, removed afterwards."""
    suffix = uuid.uuid4().hex[:12]
    email = f"ama-{suffix}@persistence.example"

    async with session_factory() as setup:
        church = Church(
            name=f"{CHURCH_PREFIX} {suffix}",
            vision="A vision statement at least twenty characters long.",
            mission="A mission statement at least twenty characters long.",
            core_values="Core values at least twenty characters long.",
            email=f"info-{suffix}@persistence.example",
            phone="0244000000",
            street="12 Liberation Rd",
            city="Accra",
            state="Greater Accra",
            postal_code="00233",
            country="Ghana",
            senior_pastor="Rev. Ama Owusu",
        )
        setup.add(church)
        await setup.flush()

        role = Role(tenant_id=church.id, key="Admin", name="Admin", is_system=True)
        setup.add(role)
        await setup.flush()

        # `permissions` is a global catalogue with UNIQUE(code), so an existing
        # row is reused -- and only a row this fixture created is removed again,
        # or the teardown would delete catalogue state it does not own.
        permission = (
            await setup.execute(select(Permission).where(Permission.code == "profile.security"))
        ).scalar_one_or_none()
        borrowed_permission = permission is not None
        if permission is None:
            permission = Permission(code="profile.security")
            setup.add(permission)
            await setup.flush()
        permission_id = permission.id
        setup.add(RolePermission(role_id=role.id, permission_id=permission_id))

        user = User(
            tenant_id=church.id,
            first_name="Ama",
            last_name="Owusu",
            email=email,
            username=f"ama-{suffix}",
            password_hash=hash_password(PASSWORD),
            status=UserStatus.ACTIVE,
            role_id=role.id,
            require_password_change=True,
        )
        setup.add(user)
        await setup.commit()
        created = Account(church.id, user.id, email)

    try:
        yield created
    finally:
        async with session_factory() as teardown:
            await teardown.execute(
                delete(RolePermission).where(
                    RolePermission.role_id.in_(
                        select(Role.id).where(Role.tenant_id == created.church_id)
                    )
                )
            )
            await teardown.execute(delete(User).where(User.tenant_id == created.church_id))
            await teardown.execute(delete(Role).where(Role.tenant_id == created.church_id))
            await teardown.execute(delete(Church).where(Church.id == created.church_id))
            if not borrowed_permission:
                await teardown.execute(delete(Permission).where(Permission.id == permission_id))
            await teardown.commit()


@pytest.fixture
async def live_client() -> AsyncGenerator[AsyncClient]:
    """The real application, with the real ``get_db`` -- no session override."""
    transport = ASGITransport(app=create_app())
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


async def _reread(user_id: uuid.UUID) -> User:
    """The row as a session that never saw the write finds it."""
    async with session_factory() as reader:
        return (await reader.execute(select(User).where(User.id == user_id))).scalar_one()


def _credentials(email: str, password: str = PASSWORD) -> dict[str, str]:
    return {"email": email, "password": password}


class TestLoginWritesAreCommitted:
    async def test_last_login_at_survives_the_request(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        assert (await live_client.post(LOGIN, json=_credentials(account.email))).status_code == 200

        assert (await _reread(account.user_id)).last_login_at is not None

    async def test_an_outdated_hash_upgrade_survives_the_request(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        """An upgrade that is never committed is redone on every login and
        migrates nobody."""
        from pwdlib import PasswordHash
        from pwdlib.hashers.argon2 import Argon2Hasher

        weak = PasswordHash((Argon2Hasher(memory_cost=8 * 1024, time_cost=1),))
        stale = weak.hash(PASSWORD)
        async with session_factory() as weaken:
            user = (
                await weaken.execute(select(User).where(User.id == account.user_id))
            ).scalar_one()
            user.password_hash = stale
            await weaken.commit()

        assert (await live_client.post(LOGIN, json=_credentials(account.email))).status_code == 200

        stored = await _reread(account.user_id)
        assert stored.password_hash != stale
        assert verify_password(PASSWORD, stored.password_hash)

    async def test_a_failed_login_commits_nothing(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        assert (
            await live_client.post(LOGIN, json=_credentials(account.email, "wrong password"))
        ).status_code == 401

        assert (await _reread(account.user_id)).last_login_at is None


class TestPasswordChangeIsCommitted:
    @staticmethod
    def _bearer(account: Account, tenant_id: uuid.UUID) -> dict[str, str]:
        token = create_access_token(user_id=account.user_id, tenant_id=tenant_id)
        return {"Authorization": f"Bearer {token}"}

    async def test_the_new_password_survives_the_request(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        """The bug this file exists for: the endpoint answered 200 and
        "Password changed successfully" while the old password went on
        working."""
        response = await live_client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=self._bearer(account, account.church_id),
        )
        assert response.status_code == 200

        stored = await _reread(account.user_id)
        assert verify_password(NEW_PASSWORD, stored.password_hash)
        assert not verify_password(PASSWORD, stored.password_hash)

    async def test_the_old_password_really_stops_working(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        await live_client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=self._bearer(account, account.church_id),
        )

        assert (await live_client.post(LOGIN, json=_credentials(account.email))).status_code == 401
        assert (
            await live_client.post(LOGIN, json=_credentials(account.email, NEW_PASSWORD))
        ).status_code == 200

    async def test_clearing_the_forced_change_flag_survives_the_request(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        await live_client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": PASSWORD, "newPassword": NEW_PASSWORD},
            headers=self._bearer(account, account.church_id),
        )

        assert (await _reread(account.user_id)).require_password_change is False

    async def test_a_rejected_change_commits_nothing(
        self, live_client: AsyncClient, account: Account
    ) -> None:
        response = await live_client.put(
            CHANGE_PASSWORD,
            json={"currentPassword": "wrong", "newPassword": NEW_PASSWORD},
            headers=self._bearer(account, account.church_id),
        )
        assert response.status_code == 422

        stored = await _reread(account.user_id)
        assert verify_password(PASSWORD, stored.password_hash)
        assert stored.require_password_change is True


async def test_no_stray_rows_are_left_behind(db_session: AsyncSession) -> None:
    """These fixtures commit, so a leak would pollute every later run."""
    leaked = (
        (
            await db_session.execute(
                select(Church.name).where(Church.name.like(f"{CHURCH_PREFIX} %"))
            )
        )
        .scalars()
        .all()
    )

    assert list(leaked) == []
