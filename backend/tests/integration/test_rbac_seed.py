"""Seeding the canonical registry: correctness, idempotency, tenant safety.

The seed runs more than once in practice -- on every deploy for the global
catalogue, and on every church provisioned for the per-tenant roles -- so
"running it twice changes nothing" is a correctness requirement, not a nicety.
It also must never overwrite what a church has customised through
``settings.roles.edit``.
"""

from __future__ import annotations

import uuid

import pytest
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.churches.models import Church
from app.domains.identity.models import Permission, PermissionCategory, Role, RolePermission
from app.domains.identity.rbac_registry import (
    CANONICAL_ROLES,
    PERMISSION_CATEGORIES,
    PERMISSION_CODES,
    ROLE_PERMISSIONS,
    UNCATEGORISED_PERMISSION_CODES,
)
from app.domains.identity.rbac_seed import seed_tenant_roles, sync_permission_registry

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


async def _count(session: AsyncSession, model: type) -> int:
    return (await session.execute(select(func.count()).select_from(model))).scalar_one()


async def _granted_codes(session: AsyncSession, role_id: uuid.UUID) -> set[str]:
    result = await session.execute(
        select(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role_id)
    )
    return set(result.scalars().all())


class TestPermissionRegistrySync:
    async def test_first_run_creates_the_whole_catalogue(self, db_session: AsyncSession) -> None:
        result = await sync_permission_registry(db_session)

        assert result.categories_created == len(PERMISSION_CATEGORIES)
        assert result.permissions_created == len(PERMISSION_CODES)
        assert await _count(db_session, PermissionCategory) == len(PERMISSION_CATEGORIES)
        assert await _count(db_session, Permission) == len(PERMISSION_CODES)

    async def test_seeded_codes_are_the_canonical_codes(self, db_session: AsyncSession) -> None:
        await sync_permission_registry(db_session)

        codes = set((await db_session.execute(select(Permission.code))).scalars().all())
        assert codes == set(PERMISSION_CODES)

    async def test_names_and_descriptions_come_from_the_canonical_source(
        self, db_session: AsyncSession
    ) -> None:
        await sync_permission_registry(db_session)
        canonical = PERMISSION_CATEGORIES[0].permissions[0]

        stored = (
            await db_session.execute(select(Permission).where(Permission.code == canonical.code))
        ).scalar_one()
        assert stored.name == canonical.name
        assert stored.description == canonical.description

    async def test_permissions_are_linked_to_their_category(self, db_session: AsyncSession) -> None:
        await sync_permission_registry(db_session)
        canonical_category = PERMISSION_CATEGORIES[2]

        category = (
            await db_session.execute(
                select(PermissionCategory).where(PermissionCategory.key == canonical_category.key)
            )
        ).scalar_one()
        codes = set(
            (
                await db_session.execute(
                    select(Permission.code).where(Permission.category_id == category.id)
                )
            )
            .scalars()
            .all()
        )
        assert codes == {p.code for p in canonical_category.permissions}

    async def test_every_seeded_permission_carries_its_canonical_metadata(
        self, db_session: AsyncSession
    ) -> None:
        """True since ADR-009 closed the pastoral-care gap. The columns stay
        nullable so a future uncategorised code can still be recorded as one
        rather than forcing invented text -- this asserts there is none."""
        assert UNCATEGORISED_PERMISSION_CODES == ()
        await sync_permission_registry(db_session)

        incomplete = (
            (
                await db_session.execute(
                    select(Permission.code).where(
                        (Permission.category_id.is_(None))
                        | (Permission.name.is_(None))
                        | (Permission.description.is_(None))
                    )
                )
            )
            .scalars()
            .all()
        )
        assert incomplete == []

    async def test_running_twice_creates_nothing_new(self, db_session: AsyncSession) -> None:
        await sync_permission_registry(db_session)
        second = await sync_permission_registry(db_session)

        assert second.categories_created == 0
        assert second.permissions_created == 0
        assert await _count(db_session, Permission) == len(PERMISSION_CODES)
        assert await _count(db_session, PermissionCategory) == len(PERMISSION_CATEGORIES)

    async def test_a_rerun_keeps_permission_ids_stable(self, db_session: AsyncSession) -> None:
        """``role_permissions`` rows point at these ids; re-creating them would
        silently detach every grant."""
        await sync_permission_registry(db_session)
        before = dict(
            (await db_session.execute(select(Permission.code, Permission.id))).tuples().all()
        )

        await sync_permission_registry(db_session)
        after = dict(
            (await db_session.execute(select(Permission.code, Permission.id))).tuples().all()
        )

        assert before == after

    async def test_a_rerun_repairs_drifted_metadata(self, db_session: AsyncSession) -> None:
        await sync_permission_registry(db_session)
        canonical = PERMISSION_CATEGORIES[0].permissions[0]
        stored = (
            await db_session.execute(select(Permission).where(Permission.code == canonical.code))
        ).scalar_one()
        stored.name = "stale"
        await db_session.flush()

        await sync_permission_registry(db_session)
        await db_session.refresh(stored)

        assert stored.name == canonical.name


class TestTenantRoleSeed:
    async def test_first_run_creates_the_six_canonical_roles(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        await sync_permission_registry(db_session)

        result = await seed_tenant_roles(db_session, church.id)

        assert result.roles_created == len(CANONICAL_ROLES)
        assert result.roles_left_alone == 0
        roles = (
            (await db_session.execute(select(Role).where(Role.tenant_id == church.id)))
            .scalars()
            .all()
        )
        assert {role.key for role in roles} == {role.key for role in CANONICAL_ROLES}
        assert all(role.is_system for role in roles)

    async def test_each_role_is_granted_exactly_its_canonical_permissions(
        self, db_session: AsyncSession
    ) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        await sync_permission_registry(db_session)
        await seed_tenant_roles(db_session, church.id)

        for canonical_role in CANONICAL_ROLES:
            role = (
                await db_session.execute(
                    select(Role).where(Role.tenant_id == church.id, Role.key == canonical_role.key)
                )
            ).scalar_one()
            granted = await _granted_codes(db_session, role.id)
            assert granted == set(ROLE_PERMISSIONS[canonical_role.key]), canonical_role.key

    async def test_running_twice_creates_no_duplicates(self, db_session: AsyncSession) -> None:
        church = _church()
        db_session.add(church)
        await db_session.flush()
        await sync_permission_registry(db_session)
        await seed_tenant_roles(db_session, church.id)

        second = await seed_tenant_roles(db_session, church.id)

        assert second.roles_created == 0
        assert second.roles_left_alone == len(CANONICAL_ROLES)
        assert await _count(db_session, Role) == len(CANONICAL_ROLES)

    async def test_two_churches_each_get_their_own_instances(
        self, db_session: AsyncSession
    ) -> None:
        church_a = _church()
        church_b = _church(name="Mercy Assembly", email="info@mercyassembly.example")
        db_session.add_all([church_a, church_b])
        await db_session.flush()
        await sync_permission_registry(db_session)

        await seed_tenant_roles(db_session, church_a.id)
        await seed_tenant_roles(db_session, church_b.id)

        admin_a = (
            await db_session.execute(
                select(Role).where(Role.tenant_id == church_a.id, Role.key == "Admin")
            )
        ).scalar_one()
        admin_b = (
            await db_session.execute(
                select(Role).where(Role.tenant_id == church_b.id, Role.key == "Admin")
            )
        ).scalar_one()
        assert admin_a.id != admin_b.id
        assert await _count(db_session, Role) == 2 * len(CANONICAL_ROLES)

    async def test_a_renamed_role_is_not_duplicated_on_a_rerun(
        self, db_session: AsyncSession
    ) -> None:
        """Matching on ``key`` rather than the display name is what makes this
        hold -- a name-keyed seed would create a second ``Admin`` here."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        await sync_permission_registry(db_session)
        await seed_tenant_roles(db_session, church.id)

        admin = (
            await db_session.execute(
                select(Role).where(Role.tenant_id == church.id, Role.key == "Admin")
            )
        ).scalar_one()
        admin.name = "Church Administrator"
        await db_session.flush()

        result = await seed_tenant_roles(db_session, church.id)

        assert result.roles_created == 0
        assert await _count(db_session, Role) == len(CANONICAL_ROLES)
        await db_session.refresh(admin)
        assert admin.name == "Church Administrator"

    async def test_a_rerun_does_not_restore_permissions_an_admin_removed(
        self, db_session: AsyncSession
    ) -> None:
        """Narrowing a system role is a legitimate use of
        ``settings.roles.edit``; a seed run must not quietly undo it."""
        church = _church()
        db_session.add(church)
        await db_session.flush()
        await sync_permission_registry(db_session)
        await seed_tenant_roles(db_session, church.id)

        secretary = (
            await db_session.execute(
                select(Role).where(Role.tenant_id == church.id, Role.key == "Secretary")
            )
        ).scalar_one()
        grant = (
            await db_session.execute(
                select(RolePermission).where(RolePermission.role_id == secretary.id).limit(1)
            )
        ).scalar_one()
        removed_permission_id = grant.permission_id
        await db_session.delete(grant)
        await db_session.flush()

        await seed_tenant_roles(db_session, church.id)

        still_granted = (
            await db_session.execute(
                select(RolePermission).where(
                    RolePermission.role_id == secretary.id,
                    RolePermission.permission_id == removed_permission_id,
                )
            )
        ).scalar_one_or_none()
        assert still_granted is None

    async def test_a_missing_permission_registry_raises_rather_than_under_granting(
        self, db_session: AsyncSession
    ) -> None:
        """Silently skipping an unresolvable code would produce a role that
        looks seeded but is missing authority."""
        church = _church()
        db_session.add(church)
        await db_session.flush()

        with pytest.raises(LookupError, match="sync_permission_registry"):
            await seed_tenant_roles(db_session, church.id)

    async def test_seeding_a_nonexistent_church_is_rejected(self, db_session: AsyncSession) -> None:
        from sqlalchemy.exc import IntegrityError

        await sync_permission_registry(db_session)

        with pytest.raises(IntegrityError):
            await seed_tenant_roles(db_session, uuid.uuid4())
