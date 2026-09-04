"""Regenerate ``app/domains/identity/rbac_registry.py`` from the canonical source.

``lib/authorization/permissions.ts`` and ``lib/authorization/roles.ts`` are the
authoritative role and permission taxonomies (ADR-003). This script transcribes
them into Python so the backend can seed them without a second, hand-maintained
copy that could drift.

Run from the repository root after either TypeScript file changes::

    uv run --project backend python backend/scripts/generate_rbac_registry.py

``tests/unit/test_rbac_registry.py`` re-parses the same two files and fails when
the committed module no longer matches them, so forgetting to re-run this is
caught by the test suite rather than discovered in production.
"""

from __future__ import annotations

import pathlib
import re
import sys
from dataclasses import dataclass, field

REPO_ROOT = pathlib.Path(__file__).resolve().parents[2]
PERMISSIONS_TS = REPO_ROOT / "lib/authorization/permissions.ts"
ROLES_TS = REPO_ROOT / "lib/authorization/roles.ts"
TARGET = REPO_ROOT / "backend/app/domains/identity/rbac_registry.py"

ROLE_ORDER = ["SUPER_ADMIN", "ADMIN", "PASTOR", "ACCOUNTANT", "SECRETARY", "TEACHER"]
LINE_LENGTH = 100


@dataclass(frozen=True, slots=True)
class ParsedPermission:
    """One ``PermissionItem`` literal."""

    code: str
    name: str
    description: str


@dataclass(slots=True)
class ParsedCategory:
    """One ``PermissionCategory`` literal, filled in as its lines are read."""

    key: str
    name: str = ""
    description: str = ""
    permissions: list[ParsedPermission] = field(default_factory=list)


def parse_categories(source: str) -> list[ParsedCategory]:
    """Read the ``PERMISSION_CATEGORIES`` array literal."""
    block = source[source.index("export const PERMISSION_CATEGORIES") :]
    categories: list[ParsedCategory] = []
    current: ParsedCategory | None = None
    for line in block.splitlines():
        matched = re.match(r"\s*id: '([a-z0-9\-]+)',\s*$", line)
        if matched:
            current = ParsedCategory(key=matched.group(1))
            categories.append(current)
            continue
        if current is None:
            continue
        matched = re.match(r"\s*name: '(.*?)',\s*$", line)
        if matched and not current.name:
            current.name = matched.group(1)
            continue
        matched = re.match(r"\s*description: '(.*?)',?\s*$", line)
        if matched and not current.description:
            current.description = matched.group(1)
            continue
        matched = re.match(
            r"\s*\{ id: '([^']+)', name: '(.*?)', description: '(.*?)' \},?\s*$", line
        )
        if matched:
            current.permissions.append(
                ParsedPermission(matched.group(1), matched.group(2), matched.group(3))
            )
    return categories


def parse_flat_codes(source: str) -> list[str]:
    """Read the codes from the flat ``PERMISSIONS`` const."""
    block = source[
        source.index("export const PERMISSIONS = {") : source.index(
            "export const PERMISSION_CATEGORIES"
        )
    ]
    return [value for _, value in re.findall(r"^\s*([A-Z0-9_]+):\s*'([^']+)',", block, re.M)]


def parse_roles(source: str, categorised: list[str]) -> tuple[dict[str, str], dict[str, list[str]]]:
    """Read ``ROLES`` and ``ROLE_PERMISSIONS``.

    ``SuperAdmin``'s array is a ``flatMap`` over the categories rather than a
    literal, so it is reproduced as exactly that computation's result.
    """
    names: dict[str, str] = dict(
        re.findall(
            r"^\s*([A-Z_]+):\s*'([^']+)',",
            source[source.index("export const ROLES") : source.index("export type SystemRole")],
            re.M,
        )
    )
    grants: dict[str, list[str]] = {}
    current: str | None = None
    for line in source[source.index("export const ROLE_PERMISSIONS") :].splitlines():
        matched = re.match(r"\s*\[ROLES\.([A-Z_]+)\]:\s*(.*)$", line)
        if matched:
            current = names[matched.group(1)]
            grants[current] = list(categorised) if "flatMap" in matched.group(2) else []
            continue
        if current and "flatMap" not in line:
            grants[current].extend(re.findall(r"'([^']+)'", line))
    return names, grants


def quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def literal(prefix: str, raw: str, indent: int) -> list[str]:
    """Emit ``prefix="value",``, splitting a long value into adjacent literals."""
    single = " " * indent + prefix + "=" + quote(raw) + ","
    if len(single) <= LINE_LENGTH - 1:
        return [single]
    width = LINE_LENGTH - 5 - (indent + 4) - 2
    chunks: list[str] = []
    current = ""
    for word in raw.split(" "):
        candidate = word if not current else current + " " + word
        if len(candidate) > width and current:
            chunks.append(current + " ")
            current = word
        else:
            current = candidate
    chunks.append(current)
    return [
        " " * indent + prefix + "=(",
        *(" " * (indent + 4) + quote(chunk) for chunk in chunks),
        " " * indent + "),",
    ]


def render(
    categories: list[ParsedCategory],
    uncategorised: list[str],
    roles: list[str],
    grants: dict[str, list[str]],
    categorised: list[str],
) -> str:
    out: list[str] = []
    add = out.append
    add('"""Canonical RBAC registry, transcribed from the authoritative frontend source.')
    add("")
    add("``lib/authorization/permissions.ts`` and ``lib/authorization/roles.ts`` are the")
    add("single source of truth for the role and permission taxonomies (ADR-003). This")
    add("module is their verbatim Python transcription -- it defines no role, permission")
    add("or naming scheme of its own.")
    add("")
    add("Generated by ``scripts/generate_rbac_registry.py``; do not hand-edit.")
    add("``tests/unit/test_rbac_registry.py`` re-parses both TypeScript files and fails")
    add("if this module has drifted from them, so the two taxonomies cannot silently")
    add("diverge.")
    add('"""')
    add("")
    add("from __future__ import annotations")
    add("")
    add("from collections.abc import Mapping")
    add("from dataclasses import dataclass")
    add("from types import MappingProxyType")
    add("from typing import Final")
    add("")
    add("")
    add("@dataclass(frozen=True, slots=True)")
    add("class CanonicalPermission:")
    add('    """One permission from ``PERMISSION_CATEGORIES``. ``code`` is its ``id``."""')
    add("")
    add("    code: str")
    add("    name: str")
    add("    description: str")
    add("")
    add("")
    add("@dataclass(frozen=True, slots=True)")
    add("class CanonicalPermissionCategory:")
    add('    """One grouping from ``PERMISSION_CATEGORIES``. ``key`` is its ``id``."""')
    add("")
    add("    key: str")
    add("    name: str")
    add("    description: str")
    add("    permissions: tuple[CanonicalPermission, ...]")
    add("")
    add("")
    add("@dataclass(frozen=True, slots=True)")
    add("class CanonicalRole:")
    add('    """One of the six roles in ``ROLES``.')
    add("")
    add("    ``key`` is the ``ROLES`` value verbatim (``SuperAdmin``, ...), which is also")
    add("    what ``ROLE_PERMISSIONS`` is keyed by and what the frontend compares against")
    add("    in ``lib/authorization/policies.ts``. The canonical source gives roles no")
    add("    description, so none is invented here.")
    add('    """')
    add("")
    add("    key: str")
    add("    name: str")
    add("")
    add("")
    add("PERMISSION_CATEGORIES: Final[tuple[CanonicalPermissionCategory, ...]] = (")
    for category in categories:
        add("    CanonicalPermissionCategory(")
        add(f"        key={quote(category.key)},")
        add(f"        name={quote(category.name)},")
        out.extend(literal("description", category.description, 8))
        add("        permissions=(")
        for permission in category.permissions:
            add("            CanonicalPermission(")
            add(f"                code={quote(permission.code)},")
            out.extend(literal("name", permission.name, 16))
            out.extend(literal("description", permission.description, 16))
            add("            ),")
        add("        ),")
        add("    ),")
    add(")")
    add("")
    add("CATEGORISED_PERMISSION_CODES: Final[tuple[str, ...]] = tuple(")
    add("    permission.code")
    add("    for category in PERMISSION_CATEGORIES")
    add("    for permission in category.permissions")
    add(")")
    add('"""Codes reachable through ``PERMISSION_CATEGORIES``, in declaration order."""')
    add("")
    if uncategorised:
        add("UNCATEGORISED_PERMISSION_CODES: Final[tuple[str, ...]] = (")
        for code in uncategorised:
            add(f"    {quote(code)},")
        add(")")
    else:
        add("UNCATEGORISED_PERMISSION_CODES: Final[tuple[str, ...]] = ()")
    add('"""Codes the flat ``PERMISSIONS`` const defines but that no category lists.')
    add("")
    add("Empty while the two lists agree, which is the intended state: a code here")
    add("is granted by ``ROLE_PERMISSIONS`` yet invisible to")
    add("``ROLE_PERMISSIONS[SuperAdmin]``, which is computed by flattening the")
    add("categories -- so SuperAdmin would lack a permission that lesser roles hold.")
    add("Such codes are still seeded, with name, description and category NULL rather")
    add("than invented text, so the gap is visible in the data. See ADR-009.")
    add('"""')
    add("")
    add("PERMISSION_CODES: Final[tuple[str, ...]] = (")
    add("    *CATEGORISED_PERMISSION_CODES,")
    add("    *UNCATEGORISED_PERMISSION_CODES,")
    add(")")
    add('"""Every canonical code: the union the ``permissions`` table is seeded from."""')
    add("")
    add("CANONICAL_ROLES: Final[tuple[CanonicalRole, ...]] = (")
    for role in roles:
        add(f"    CanonicalRole(key={quote(role)}, name={quote(role)}),")
    add(")")
    add("")
    add("ROLE_PERMISSIONS: Final[Mapping[str, frozenset[str]]] = MappingProxyType(")
    add("    {")
    for role in roles:
        add(f"        {quote(role)}: frozenset(")
        if grants[role] == categorised:
            add(
                "            CATEGORISED_PERMISSION_CODES  # exactly what ROLE_PERMISSIONS computes"
            )
            add("        ),")
            continue
        add("            (")
        for code in grants[role]:
            add(f"                {quote(code)},")
        add("            )")
        add("        ),")
    add("    }")
    add(")")
    return "\n".join(out) + "\n"


def main() -> int:
    permissions_source = PERMISSIONS_TS.read_text()
    roles_source = ROLES_TS.read_text()

    categories = parse_categories(permissions_source)
    categorised = [
        permission.code for category in categories for permission in category.permissions
    ]
    flat = parse_flat_codes(permissions_source)
    uncategorised = [code for code in flat if code not in set(categorised)]

    names, grants = parse_roles(roles_source, categorised)
    roles = [names[key] for key in ROLE_ORDER]

    TARGET.write_text(render(categories, uncategorised, roles, grants, categorised))

    print(f"wrote {TARGET.relative_to(REPO_ROOT)}")
    print(f"  {len(categories)} categories, {len(flat)} permission codes, {len(roles)} roles")
    if uncategorised:
        print(f"  uncategorised: {', '.join(uncategorised)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
