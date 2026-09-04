"""The Python RBAC registry must stay identical to the canonical TypeScript.

``lib/authorization/permissions.ts`` and ``lib/authorization/roles.ts`` are
authoritative (ADR-003), and ``app/domains/identity/rbac_registry.py`` is their
transcription. Two copies of a taxonomy drift unless something compares them,
so this re-parses the TypeScript and asserts equality field by field.

If these fail after an intentional change to either TypeScript file, re-run
``scripts/generate_rbac_registry.py`` rather than editing the registry by hand.
"""

from __future__ import annotations

from dataclasses import dataclass

import pytest

from app.domains.identity.rbac_registry import (
    CANONICAL_ROLES,
    CATEGORISED_PERMISSION_CODES,
    PERMISSION_CATEGORIES,
    PERMISSION_CODES,
    ROLE_PERMISSIONS,
    UNCATEGORISED_PERMISSION_CODES,
)
from scripts.generate_rbac_registry import (
    PERMISSIONS_TS,
    ROLE_ORDER,
    ROLES_TS,
    ParsedCategory,
    parse_categories,
    parse_flat_codes,
    parse_roles,
)

pytestmark = pytest.mark.skipif(
    not PERMISSIONS_TS.exists() or not ROLES_TS.exists(),
    reason="canonical frontend sources are not present in this checkout",
)


@dataclass(frozen=True, slots=True)
class CanonicalSource:
    """The taxonomies as the TypeScript files actually spell them."""

    categories: list[ParsedCategory]
    categorised: list[str]
    flat: list[str]
    roles: list[str]
    grants: dict[str, list[str]]


@pytest.fixture(scope="module")
def canonical() -> CanonicalSource:
    """Parsed fresh from the authoritative sources, not from the registry."""
    permissions_source = PERMISSIONS_TS.read_text()
    categories = parse_categories(permissions_source)
    categorised = [
        permission.code for category in categories for permission in category.permissions
    ]
    names, grants = parse_roles(ROLES_TS.read_text(), categorised)
    return CanonicalSource(
        categories=categories,
        categorised=categorised,
        flat=parse_flat_codes(permissions_source),
        roles=[names[key] for key in ROLE_ORDER],
        grants=grants,
    )


class TestPermissionCatalogue:
    def test_categories_match_exactly(self, canonical: CanonicalSource) -> None:
        expected = [
            (category.key, category.name, category.description) for category in canonical.categories
        ]
        actual = [
            (category.key, category.name, category.description)
            for category in PERMISSION_CATEGORIES
        ]
        assert actual == expected

    def test_every_permission_matches_code_name_and_description(
        self, canonical: CanonicalSource
    ) -> None:
        expected = [
            (category.key, permission.code, permission.name, permission.description)
            for category in canonical.categories
            for permission in category.permissions
        ]
        actual = [
            (category.key, permission.code, permission.name, permission.description)
            for category in PERMISSION_CATEGORIES
            for permission in category.permissions
        ]
        assert actual == expected

    def test_categorised_codes_are_in_declaration_order(self, canonical: CanonicalSource) -> None:
        assert list(CATEGORISED_PERMISSION_CODES) == canonical.categorised

    def test_seeded_codes_are_the_union_of_both_canonical_lists(
        self, canonical: CanonicalSource
    ) -> None:
        """``PERMISSIONS`` is the definition list, ``PERMISSION_CATEGORIES`` the
        grouped presentation; the table is seeded from everything either names."""
        assert set(PERMISSION_CODES) == set(canonical.flat) | set(CATEGORISED_PERMISSION_CODES)

    def test_no_duplicate_codes(self) -> None:
        assert len(set(PERMISSION_CODES)) == len(PERMISSION_CODES)


class TestCatalogueIsInternallyConsistent:
    """The two canonical lists must agree, and SuperAdmin must really be super.

    These were failing pins before ADR-009: ``pastoral-care.view``/``.manage``
    were defined in the flat ``PERMISSIONS`` const and granted to Admin and
    Pastor, but belonged to no category -- so ``ROLE_PERMISSIONS[SuperAdmin]``,
    which is computed by flattening the categories, did not include them. They
    now assert the repaired state, and fail if the same shape of gap reappears.
    """

    def test_every_defined_code_belongs_to_a_category(self) -> None:
        assert UNCATEGORISED_PERMISSION_CODES == ()

    def test_super_admin_holds_every_permission_any_role_holds(self) -> None:
        """``policies.ts`` short-circuits SuperAdmin to universal access, so a
        SuperAdmin missing a permission a lesser role has is a contradiction
        between the role matrix and the guard that reads it."""
        for role_key, codes in ROLE_PERMISSIONS.items():
            assert codes <= ROLE_PERMISSIONS["SuperAdmin"], role_key


class TestDeferredPermissionFamilies:
    """Families ADR-003 named and ADR-009 formally deferred.

    Pinned as *absent* so that adding one is a deliberate act that updates this
    test and ADR-009 together, rather than a permission quietly appearing in
    the catalogue with no decision behind it.
    """

    @pytest.mark.parametrize(
        "code",
        ["finance.expenses.approve", "pastoral-care.view-confidential"],
    )
    def test_deferred_code_is_absent(self, code: str) -> None:
        assert code not in PERMISSION_CODES

    def test_file_vault_has_no_permission_family(self) -> None:
        """`/dashboard/files` is ungoverned; the family lands with that domain."""
        assert not [code for code in PERMISSION_CODES if code.startswith(("files.", "documents."))]


class TestRoles:
    def test_the_six_canonical_roles_match_in_order(self, canonical: CanonicalSource) -> None:
        assert [role.key for role in CANONICAL_ROLES] == canonical.roles

    def test_role_keys_are_the_display_names_verbatim(self) -> None:
        """``ROLES`` values double as the identifier ``ROLE_PERMISSIONS`` is
        keyed by and the string ``policies.ts`` compares against."""
        assert [role.key for role in CANONICAL_ROLES] == [
            "SuperAdmin",
            "Admin",
            "Pastor",
            "Accountant",
            "Secretary",
            "Teacher",
        ]
        assert all(role.key == role.name for role in CANONICAL_ROLES)

    def test_every_role_grants_exactly_what_role_permissions_grants(
        self, canonical: CanonicalSource
    ) -> None:
        for role in CANONICAL_ROLES:
            assert ROLE_PERMISSIONS[role.key] == frozenset(canonical.grants[role.key]), role.key

    def test_every_granted_code_is_seedable(self) -> None:
        """A grant naming a code with no ``permissions`` row cannot be seeded,
        so the seed would raise. Catch that here instead."""
        for role_key, codes in ROLE_PERMISSIONS.items():
            unknown = codes - set(PERMISSION_CODES)
            assert not unknown, f"{role_key} grants unseedable codes: {sorted(unknown)}"

    def test_super_admin_holds_every_categorised_permission(self) -> None:
        assert ROLE_PERMISSIONS["SuperAdmin"] == frozenset(CATEGORISED_PERMISSION_CODES)

    def test_roles_are_distinguished_by_their_permission_sets(self) -> None:
        """Two roles granting identical sets would make one of them pointless;
        this also catches a parse that silently produced empty sets."""
        sets = {role.key: ROLE_PERMISSIONS[role.key] for role in CANONICAL_ROLES}
        assert all(sets.values())
        assert len({frozenset(value) for value in sets.values()}) == len(sets)
