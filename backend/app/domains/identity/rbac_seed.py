"""Idempotent seeding of the canonical RBAC registry.

Two separate operations, because the two halves have different lifetimes:

``sync_permission_registry`` writes the global permission catalogue, which is
identical for every church and is owned entirely by
:mod:`app.domains.identity.rbac_registry`. It runs once per deployment.

``seed_tenant_roles`` gives one church its own instances of the six canonical
roles. It runs per tenant, at provisioning time, because roles are per-tenant
rows (ADR-008) rather than global definitions.

Both are safe to run repeatedly. Both match on the stable canonical
identifiers -- category ``key``, permission ``code``, role ``key`` -- never on
display names, so a renamed role does not cause a re-run to create a second
copy of it.

Neither ever overwrites a tenant's edits. ``seed_tenant_roles`` fills in roles
a church is missing and leaves every role that already exists exactly as it
is, including its name, description and permission grants: an admin may
legitimately rename ``Admin`` or narrow its permissions
(``settings.roles.edit``), and a re-run must not silently undo that.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.identity.models import (
    Permission,
    PermissionCategory,
    Role,
    RolePermission,
)
from app.domains.identity.rbac_registry import (
    CANONICAL_ROLES,
    PERMISSION_CATEGORIES,
    ROLE_PERMISSIONS,
    UNCATEGORISED_PERMISSION_CODES,
)


@dataclass(frozen=True, slots=True)
class PermissionRegistrySync:
    """What :func:`sync_permission_registry` changed."""

    categories_created: int
    permissions_created: int
    permissions_updated: int


@dataclass(frozen=True, slots=True)
class TenantRoleSeed:
    """What :func:`seed_tenant_roles` changed for one church."""

    roles_created: int
    roles_left_alone: int
    grants_created: int


async def sync_permission_registry(session: AsyncSession) -> PermissionRegistrySync:
    """Bring ``permission_categories`` and ``permissions`` in line with the registry.

    Existing rows are matched by ``key``/``code`` and refreshed in place, so a
    permission that gains a description upstream picks it up without losing
    the ``permission_id`` that ``role_permissions`` rows already point at.

    Codes that are removed upstream are **not** deleted here: dropping one
    would silently revoke it from every role that grants it. Retiring a
    permission is a deliberate migration, not a side effect of a seed run.
    """
    categories = {
        category.key: category
        for category in (await session.execute(select(PermissionCategory))).scalars()
    }
    permissions = {
        permission.code: permission
        for permission in (await session.execute(select(Permission))).scalars()
    }

    categories_created = permissions_created = permissions_updated = 0

    for canonical_category in PERMISSION_CATEGORIES:
        category = categories.get(canonical_category.key)
        if category is None:
            category = PermissionCategory(key=canonical_category.key)
            session.add(category)
            categories[canonical_category.key] = category
            categories_created += 1
        category.name = canonical_category.name
        category.description = canonical_category.description

    # Categories are flushed before permissions so every `category_id` below
    # resolves; the models carry no ORM relationships, by codebase convention.
    await session.flush()

    for canonical_category in PERMISSION_CATEGORIES:
        category_id = categories[canonical_category.key].id
        for canonical_permission in canonical_category.permissions:
            permission = permissions.get(canonical_permission.code)
            if permission is None:
                permission = Permission(code=canonical_permission.code)
                session.add(permission)
                permissions[canonical_permission.code] = permission
                permissions_created += 1
            else:
                permissions_updated += 1
            permission.category_id = category_id
            permission.name = canonical_permission.name
            permission.description = canonical_permission.description

    # Codes the canonical source defines but files under no category. They are
    # granted by ROLE_PERMISSIONS, so they must exist as rows or those grants
    # cannot be seeded -- but the source gives them no name, description or
    # category, and none is invented here. Currently empty; see ADR-009.
    for code in UNCATEGORISED_PERMISSION_CODES:
        if code not in permissions:
            permission = Permission(code=code)
            session.add(permission)
            permissions[code] = permission
            permissions_created += 1

    await session.flush()
    return PermissionRegistrySync(
        categories_created=categories_created,
        permissions_created=permissions_created,
        permissions_updated=permissions_updated,
    )


async def seed_tenant_roles(session: AsyncSession, tenant_id: uuid.UUID) -> TenantRoleSeed:
    """Give one church its instances of the six canonical roles.

    Requires :func:`sync_permission_registry` to have run: the grants are
    resolved against the ``permissions`` table, and a canonical code with no
    row raises rather than being skipped, so a partially-seeded registry
    cannot quietly produce under-privileged roles.
    """
    permission_ids = dict(
        (await session.execute(select(Permission.code, Permission.id))).tuples().all()
    )
    existing = {
        role.key: role
        for role in (
            await session.execute(select(Role).where(Role.tenant_id == tenant_id))
        ).scalars()
        if role.key is not None
    }

    roles_created = roles_left_alone = grants_created = 0

    for canonical_role in CANONICAL_ROLES:
        if canonical_role.key in existing:
            roles_left_alone += 1
            continue

        role = Role(
            tenant_id=tenant_id,
            key=canonical_role.key,
            name=canonical_role.name,
            is_system=True,
        )
        session.add(role)
        await session.flush()
        roles_created += 1

        for code in sorted(ROLE_PERMISSIONS[canonical_role.key]):
            permission_id = permission_ids.get(code)
            if permission_id is None:
                raise LookupError(
                    f"ROLE_PERMISSIONS grants {canonical_role.key!r} the permission "
                    f"{code!r}, which is not in the permissions table -- run "
                    f"sync_permission_registry() first"
                )
            session.add(RolePermission(role_id=role.id, permission_id=permission_id))
            grants_created += 1

    await session.flush()
    return TenantRoleSeed(
        roles_created=roles_created,
        roles_left_alone=roles_left_alone,
        grants_created=grants_created,
    )
