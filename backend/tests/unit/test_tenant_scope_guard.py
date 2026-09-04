"""Architectural guard: every tenant-scoped table carries its integrity constraints.

A model composing ``TenantScopedMixin`` gets a ``branch_id`` column, but the
composite foreign key proving that branch belongs to the same church comes from
declaring ``__table_args__ = tenant_scoped_table_args(...)``. Omit that and the
table still builds -- no exception, no warning, no type error -- and it accepts
a ``branch_id`` belonging to a different church.

A second, closely related mistake is referencing another *tenant-scoped* table
by a plain single-column foreign key -- ``user_id -> users.id`` rather than
``(tenant_id, user_id) -> users(tenant_id, id)``. That form also builds, also
type-checks, and also silently accepts a row belonging to another church;
``users.role_id`` is the sharpest instance, since a role from the wrong tenant
is privilege escalation rather than merely bad data (ADR-008).

Nothing in SQLAlchemy makes either omission fail loudly, so both are checked
here instead: the whole of ``Base.metadata`` is swept, and any table whose
columns promise tenant scoping without the matching foreign keys is reported.
See ``backend/docs/adr/007-member-composite-tenant-integrity.md``.
"""

from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, ForeignKeyConstraint, Index, String, Table, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

import app.models  # noqa: F401  -- registers every domain's tables on Base.metadata
from app.core.database.base import Base, TenantScopedMixin, UUIDPrimaryKeyMixin

TENANT_ROOT_TABLE = "churches"
BRANCH_TABLE = "branches"


def _foreign_key_shapes(table: Table) -> list[tuple[frozenset[tuple[str, str]], str]]:
    """Each FK as (local column -> referenced column) pairs, plus its target table.

    Compared as an unordered set so a constraint declared with its columns in a
    different order is still recognised.
    """
    shapes = []
    for constraint in table.constraints:
        if not isinstance(constraint, ForeignKeyConstraint):
            continue
        pairs = frozenset(
            (element.parent.name, f"{element.column.table.name}.{element.column.name}")
            for element in constraint.elements
        )
        target = next(iter(constraint.elements)).column.table.name
        shapes.append((pairs, target))
    return shapes


def _has_unique_constraint(table: Table, columns: tuple[str, ...]) -> bool:
    """A *constraint*, not merely a unique index.

    Postgres will only let a foreign key reference columns covered by a unique
    constraint or a total unique index; a partial one (``WHERE deleted_at IS
    NULL``, as several tables here use) does not qualify.
    """
    return any(
        isinstance(constraint, UniqueConstraint)
        and {column.name for column in constraint.columns} == set(columns)
        for constraint in table.constraints
    )


def tenant_scope_violations(table: Table) -> list[str]:
    """Report how ``table`` fails the tenant-scoping contract, if at all."""
    if "tenant_id" not in table.c:
        return []

    violations = []
    shapes = _foreign_key_shapes(table)

    tenant_fk = frozenset({("tenant_id", f"{TENANT_ROOT_TABLE}.id")})
    if not any(pairs == tenant_fk for pairs, _ in shapes):
        violations.append(
            f"{table.name}.tenant_id has no foreign key to {TENANT_ROOT_TABLE}.id "
            f"-- compose TenantScopedMixin instead of declaring the column by hand"
        )

    if "branch_id" in table.c:
        branch_fk = frozenset(
            {
                ("tenant_id", f"{BRANCH_TABLE}.tenant_id"),
                ("branch_id", f"{BRANCH_TABLE}.id"),
            }
        )
        if not any(pairs == branch_fk for pairs, _ in shapes):
            violations.append(
                f"{table.name} has a branch_id with no (tenant_id, branch_id) -> "
                f"{BRANCH_TABLE}(tenant_id, id) foreign key, so it accepts a branch "
                f"from another church -- build __table_args__ with "
                f"tenant_scoped_table_args() rather than a plain tuple"
            )

    for pairs, target in shapes:
        referenced = dict(pairs)
        if referenced.get("tenant_id") != f"{target}.tenant_id":
            continue
        if not _has_unique_constraint(table.metadata.tables[target], ("tenant_id", "id")):
            violations.append(
                f"{table.name} references {target} by (tenant_id, id), but {target} "
                f"has no UNIQUE(tenant_id, id) for that foreign key to target"
            )

    for pairs, target in shapes:
        if target == TENANT_ROOT_TABLE or "tenant_id" in dict(pairs):
            continue
        if "tenant_id" not in table.metadata.tables[target].c:
            continue
        columns = ", ".join(sorted(local for local, _ in pairs))
        violations.append(
            f"{table.name}.({columns}) references tenant-scoped {target} by a "
            f"single-column foreign key, so it accepts a {target} row belonging "
            f"to another church -- use a composite (tenant_id, ...) -> "
            f"{target}(tenant_id, id) ForeignKeyConstraint instead"
        )

    return violations


class _BrokenScopeProbe(UUIDPrimaryKeyMixin, TenantScopedMixin, Base):
    """A tenant-scoped model that declares __table_args__ without the helper.

    Underscore-prefixed like every other probe in the suite, so no migration
    creates it and the sweep below skips it.
    """

    __tablename__ = "_broken_scope_probe"
    __table_args__ = (Index("ix__broken_scope_probe_name", "name"),)

    name: Mapped[str] = mapped_column(String(50))


class _PlainCrossTableProbe(UUIDPrimaryKeyMixin, Base):
    """Tenant-scoped, and references another tenant-scoped table by a plain
    single-column foreign key.

    This is the mistake the composite-reference rule exists for: it builds, it
    type-checks, it looks right, and Postgres will happily accept a ``user_id``
    belonging to a different church (ADR-007).
    """

    __tablename__ = "_plain_cross_table_probe"
    __table_args__ = (ForeignKeyConstraint(["user_id"], ["users.id"]),)

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("churches.id"), nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)


class TestGuardDetectsTheFootgun:
    """The guard is only worth having if it catches the mistake it exists for."""

    def test_omitting_the_helper_loses_the_branch_foreign_key(self) -> None:
        table = Base.metadata.tables["_broken_scope_probe"]
        assert "branch_id" in table.c
        assert not any(
            len(constraint.elements) == 2
            for constraint in table.constraints
            if isinstance(constraint, ForeignKeyConstraint)
        )

    def test_guard_reports_the_missing_branch_foreign_key(self) -> None:
        violations = tenant_scope_violations(Base.metadata.tables["_broken_scope_probe"])
        assert len(violations) == 1
        assert "branch_id" in violations[0]

    def test_guard_passes_a_correctly_scoped_table(self) -> None:
        assert tenant_scope_violations(Base.metadata.tables["members"]) == []

    def test_guard_reports_a_single_column_reference_to_a_tenant_scoped_table(self) -> None:
        violations = tenant_scope_violations(Base.metadata.tables["_plain_cross_table_probe"])
        assert len(violations) == 1
        assert "single-column foreign key" in violations[0]

    def test_the_composite_form_of_the_same_reference_passes(self) -> None:
        """``user_branch_assignments`` is the correct shape: the same
        reference, carried by (tenant_id, user_id) -> users(tenant_id, id)."""
        table = Base.metadata.tables["user_branch_assignments"]
        assert tenant_scope_violations(table) == []
        assert any(
            {element.parent.name for element in constraint.elements} == {"tenant_id", "user_id"}
            for constraint in table.constraints
            if isinstance(constraint, ForeignKeyConstraint)
        )

    def test_a_reference_to_a_global_table_is_not_flagged(self) -> None:
        """``permissions`` is a global catalogue with no tenant_id, so a plain
        foreign key to it is correct, not a violation."""
        permissions = Base.metadata.tables["permissions"]
        assert "tenant_id" not in permissions.c


class TestEveryMappedTable:
    def test_no_table_violates_the_tenant_scoping_contract(self) -> None:
        """Sweeps the real schema. Probe tables (``_``-prefixed, created by no
        migration) are excluded -- one of them is deliberately broken above."""
        violations = [
            violation
            for name, table in sorted(Base.metadata.tables.items())
            if not name.startswith("_")
            for violation in tenant_scope_violations(table)
        ]
        assert violations == []

    def test_the_sweep_actually_covers_the_tenant_scoped_tables(self) -> None:
        """A guard that silently stops matching any table would pass forever."""
        swept = {
            name
            for name, table in Base.metadata.tables.items()
            if not name.startswith("_") and "tenant_id" in table.c
        }
        assert {
            "branches",
            "users",
            "members",
            "roles",
            "user_branch_assignments",
        } <= swept

    def test_the_tenant_root_is_not_flagged(self) -> None:
        """``churches`` rows are the tenants themselves and carry no tenant_id."""
        churches = Base.metadata.tables[TENANT_ROOT_TABLE]
        assert "tenant_id" not in churches.c
        assert tenant_scope_violations(churches) == []

    def test_a_branchless_tenant_scoped_table_is_not_flagged(self) -> None:
        """``users`` is tenant-scoped but not branch-scoped; only the
        churches FK applies to it."""
        users = Base.metadata.tables["users"]
        assert "branch_id" not in users.c
        assert tenant_scope_violations(users) == []
