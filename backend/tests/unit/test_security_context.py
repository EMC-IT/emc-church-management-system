"""SecurityContext: the authorization primitives, and the shape of the type itself.

The structural tests matter as much as the behavioural ones. ADR-010 and
ADR-011 forbid a class of *implementation*, not just a class of outcome: no
``is_super_admin`` flag, and no authorization decision that reads a role name.
Those are properties of the code, so they are asserted against the code.
"""

from __future__ import annotations

import ast
import dataclasses
import pathlib
import uuid

import pytest

from app.core.exceptions import AuthorizationError, TenantIsolationError
from app.core.security.context import SecurityContext

APP_ROOT = pathlib.Path(__file__).resolve().parents[2] / "app"

TENANT_A = uuid.UUID("aaaaaaaa-0000-0000-0000-000000000001")
TENANT_B = uuid.UUID("bbbbbbbb-0000-0000-0000-000000000002")
BRANCH_ONE = uuid.UUID("11111111-0000-0000-0000-000000000001")
BRANCH_TWO = uuid.UUID("11111111-0000-0000-0000-000000000002")
BRANCH_OTHER = uuid.UUID("99999999-0000-0000-0000-000000000009")

BANNED_IDENTIFIERS = ("is_super_admin", "is_superadmin", "is_platform_operator", "bypass_tenant")
"""Names ADR-010 forbids: a flag whose only purpose is to skip a check."""

ROLE_ATTRIBUTES = ("role_key", "role_name", "role")
"""Attributes that must never appear on either side of an authorization comparison."""


def _holds_string_literal(node: ast.AST) -> bool:
    """A string constant, or a literal container of them."""
    if isinstance(node, ast.Constant):
        return isinstance(node.value, str)
    if isinstance(node, ast.Tuple | ast.List | ast.Set):
        return any(_holds_string_literal(element) for element in node.elts)
    return False


def _declared_name(node: ast.AST) -> tuple[str, int] | None:
    """The identifier a node introduces or reads, with its line, if it has one."""
    if isinstance(node, ast.Name):
        return node.id, node.lineno
    if isinstance(node, ast.Attribute):
        return node.attr, node.lineno
    if isinstance(node, ast.arg):
        return node.arg, node.lineno
    if isinstance(node, ast.keyword):
        return (node.arg, node.lineno) if node.arg else None
    if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
        return node.name, node.lineno
    return None


def _context(**overrides: object) -> SecurityContext:
    defaults: dict[str, object] = {
        "user_id": uuid.uuid4(),
        "tenant_id": TENANT_A,
        "role_id": uuid.uuid4(),
        "role_key": "Admin",
        "role_name": "Admin",
        "permissions": frozenset({"members.view", "members.create"}),
        "assigned_branch_ids": frozenset({BRANCH_ONE, BRANCH_TWO}),
        "primary_branch_id": BRANCH_ONE,
    }
    defaults.update(overrides)
    return SecurityContext(**defaults)  # type: ignore[arg-type]


class TestPermissionChecks:
    def test_granted_permission_passes(self) -> None:
        assert _context().has_permission("members.view")

    def test_missing_permission_denies(self) -> None:
        assert not _context().has_permission("members.delete")

    def test_unknown_code_denies(self) -> None:
        """A typo is simply not in the set, so it fails closed."""
        assert not _context().has_permission("members.viwe")
        assert not _context().has_permission("")

    def test_empty_permission_set_denies_everything(self) -> None:
        context = _context(permissions=frozenset())
        assert not context.has_permission("members.view")
        assert not context.has_any_permission("members.view", "members.create")

    def test_any_requires_at_least_one(self) -> None:
        context = _context()
        assert context.has_any_permission("members.delete", "members.view")
        assert not context.has_any_permission("members.delete", "finance.view")

    def test_all_requires_every_one(self) -> None:
        context = _context()
        assert context.has_all_permissions("members.view", "members.create")
        assert not context.has_all_permissions("members.view", "members.delete")

    def test_all_of_nothing_denies(self) -> None:
        """``all(())`` is True, which would silently authorize a caller that
        asked for no permission at all."""
        assert not _context().has_all_permissions()

    def test_require_permission_raises_403(self) -> None:
        with pytest.raises(AuthorizationError):
            _context().require_permission("members.delete")

    def test_require_permission_passes_silently_when_granted(self) -> None:
        _context().require_permission("members.view")  # must not raise


class TestBranchScope:
    def test_assigned_branch_passes(self) -> None:
        assert _context().can_access_branch(BRANCH_ONE)

    def test_unassigned_branch_denies(self) -> None:
        assert not _context().can_access_branch(BRANCH_OTHER)

    def test_no_assignments_denies_every_branch(self) -> None:
        """The frontend treats an empty list as unrestricted; ADR-003 requires
        the server to invert that."""
        context = _context(assigned_branch_ids=frozenset(), primary_branch_id=None)
        assert not context.can_access_branch(BRANCH_ONE)
        assert not context.can_access_branch(BRANCH_OTHER)

    def test_multiple_assignments_all_pass(self) -> None:
        context = _context()
        assert context.can_access_branch(BRANCH_ONE)
        assert context.can_access_branch(BRANCH_TWO)

    def test_require_branch_raises_403(self) -> None:
        with pytest.raises(AuthorizationError):
            _context().require_branch(BRANCH_OTHER)

    def test_holding_every_permission_does_not_widen_branch_scope(self) -> None:
        """Branch scope is assignment data, not a consequence of privilege."""
        context = _context(
            permissions=frozenset({"members.view", "settings.system"}),
            assigned_branch_ids=frozenset({BRANCH_ONE}),
        )
        assert not context.can_access_branch(BRANCH_TWO)


class TestTenantScope:
    def test_own_tenant_passes(self) -> None:
        _context().require_tenant(TENANT_A)  # must not raise

    def test_other_tenant_raises(self) -> None:
        with pytest.raises(TenantIsolationError):
            _context().require_tenant(TENANT_B)

    def test_permissions_do_not_widen_tenant_scope(self) -> None:
        """No permission set makes another tenant reachable (ADR-010)."""
        context = _context(
            permissions=frozenset({"settings.system", "settings.permissions.manage"})
        )
        with pytest.raises(TenantIsolationError):
            context.require_tenant(TENANT_B)


class TestImmutability:
    def test_context_is_frozen(self) -> None:
        with pytest.raises(dataclasses.FrozenInstanceError):
            _context().permissions = frozenset({"settings.system"})  # type: ignore[misc]

    def test_permissions_cannot_be_widened_in_place(self) -> None:
        context = _context()
        with pytest.raises(AttributeError):
            context.permissions.add("members.delete")  # type: ignore[attr-defined]

    def test_branch_assignments_cannot_be_widened_in_place(self) -> None:
        context = _context()
        with pytest.raises(AttributeError):
            context.assigned_branch_ids.add(BRANCH_OTHER)  # type: ignore[attr-defined]


class TestNoSuperAdminBypassExists:
    """Structural: the bypass must be absent from the code, not merely unused."""

    def test_context_has_no_super_admin_field(self) -> None:
        fields = {field.name for field in dataclasses.fields(SecurityContext)}
        assert not [name for name in fields if "super" in name or "bypass" in name]

    def test_no_banned_identifier_anywhere_in_the_application(self) -> None:
        """Identifiers, via the AST -- prose explaining why the flag does not
        exist is not itself the flag."""
        offenders: list[str] = []
        for path in APP_ROOT.rglob("*.py"):
            tree = ast.parse(path.read_text(), filename=str(path))
            for node in ast.walk(tree):
                found = _declared_name(node)
                if found is not None and found[0] in BANNED_IDENTIFIERS:
                    offenders.append(f"{path.relative_to(APP_ROOT)}:{found[1]} {found[0]}")
        assert offenders == []

    def test_no_code_compares_a_role_attribute_to_a_role_name(self) -> None:
        """Walks the AST for ``x.role_key == "Admin"`` and friends.

        A role-name check ignores the customisation the schema exists to
        support: a church's own role granted ``members.view`` would be denied,
        and an ``Admin`` role deliberately stripped of a permission would still
        pass (ADR-011).

        The rule is *role attribute against a string literal*, in either
        position and including membership tests. Comparing one against a set
        derived from the canonical registry -- as provisioning does to validate
        a requested founding role -- is input validation, not an authorization
        decision, and is deliberately not flagged.
        """
        offenders: list[str] = []
        for path in APP_ROOT.rglob("*.py"):
            tree = ast.parse(path.read_text(), filename=str(path))
            for node in ast.walk(tree):
                if not isinstance(node, ast.Compare):
                    continue
                sides = (node.left, *node.comparators)
                names_a_role = any(
                    isinstance(side, ast.Attribute) and side.attr in ROLE_ATTRIBUTES
                    for side in sides
                )
                if names_a_role and any(_holds_string_literal(side) for side in sides):
                    offenders.append(f"{path.relative_to(APP_ROOT)}:{node.lineno}")
        assert offenders == []

    def test_super_admin_is_authorized_by_its_permissions_alone(self) -> None:
        """Two contexts with identical permissions authorize identically,
        whatever their roles are called."""
        everything = frozenset({"members.view", "members.delete", "settings.system"})
        super_admin = _context(
            role_key="SuperAdmin", role_name="SuperAdmin", permissions=everything
        )
        custom_role = _context(role_key=None, role_name="Youth Pastor", permissions=everything)

        for code in everything:
            assert super_admin.has_permission(code) == custom_role.has_permission(code)

    def test_a_super_admin_named_role_with_no_grants_is_denied(self) -> None:
        """The name confers nothing; only the grants do."""
        context = _context(role_key="SuperAdmin", role_name="SuperAdmin", permissions=frozenset())
        assert not context.has_permission("members.view")
        with pytest.raises(AuthorizationError):
            context.require_permission("members.view")


class TestRateLimitIdentityIsNotClientControlled:
    """A limit an attacker can reset at will is not a limit.

    Client-supplied forwarding headers are the standard way to do exactly
    that: read ``X-Forwarded-For`` directly and every caller gets an unlimited
    supply of distinct identities by varying one header. The trust decision
    belongs to the ASGI server's proxy configuration, which only honours the
    header from addresses an operator listed.
    """

    FORWARDING_HEADERS = ("x-forwarded-for", "x-real-ip", "x-client-ip", "forwarded")

    def test_no_module_reads_a_client_supplied_forwarding_header(self) -> None:
        offenders: list[str] = []
        for path in APP_ROOT.rglob("*.py"):
            tree = ast.parse(path.read_text(), filename=str(path))
            for node in ast.walk(tree):
                if not isinstance(node, ast.Constant) or not isinstance(node.value, str):
                    continue
                if node.value.lower() in self.FORWARDING_HEADERS:
                    offenders.append(f"{path.relative_to(APP_ROOT)}:{node.lineno} {node.value}")
        assert offenders == []

    def test_the_login_limiter_keys_on_the_connection_peer(self) -> None:
        source = (APP_ROOT / "api" / "dependencies.py").read_text()
        assert "request.client.host" in source

    def test_no_credential_is_used_as_a_rate_limit_identifier(self) -> None:
        """Identifiers become Redis keys, which persist and are readable by
        anything with access to the instance."""
        source = (APP_ROOT / "api" / "dependencies.py").read_text()
        tree = ast.parse(source)
        for node in ast.walk(tree):
            if isinstance(node, ast.keyword) and node.arg == "identifier":
                rendered = ast.unparse(node.value)
                assert "password" not in rendered.lower()
                assert "token" not in rendered.lower()
