"""Member: the church membership/domain identity, distinct from User
(ADR-001). A Member represents a person's relationship to the church,
independent of whether they have portal/system access.

See ``backend/docs/adr/007-member-composite-tenant-integrity.md`` for why
``user_id`` and ``TenantScopedMixin.branch_id`` both use composite foreign
keys, and the ``ON DELETE`` choice for each.

Field provenance: every persisted field traces to ``Member``/``MemberFormData``
in ``lib/types/members.ts`` -- the shape ``services/members/members-service.ts``
actually sends and receives over HTTP, the one genuinely wired member
contract. Two other schemas in the repo were deliberately not used as
evidence, despite both naming a much richer field set:

- ``memberFullFormSchema`` (``lib/validation/members.ts``) drives the admin
  "Add Member" page, but that page's ``onSubmit`` never calls any API --
  it builds a ``FormData`` object and shows a success toast. UI-only mock
  behaviour, not a wire contract.
- ``memberCreateSchema`` (``lib/validation/members.ts``) is not referenced
  by any component or service found in the codebase.

Fields unique to either (title, ageGroup, lifeDevelopment, occupation,
maritalStatus, departments[], groups[], waterBaptism, holyGhostBaptism,
leadershipRole, specialGuestInvitedBy, location) are excluded on that
basis -- an unwired form schema is exactly the "the UI has it" evidence
``backend/CLAUDE.md`` §19 warns against trusting.

Also deliberately excluded:

- ``family_id`` -- the Families domain does not exist yet; same reasoning
  as excluding ``role_id`` from ``User``.
- ``full_name`` -- derived from first/last name, not stored; same reasoning
  as ``User``'s un-stored display ``name``.
- A GIN full-text search index (``backend-database-plan.md`` documents one
  for ``/members/search``) -- deferred to whichever phase builds that
  endpoint; an index with no query to serve is exactly the speculative
  infrastructure ``backend/CLAUDE.md`` §17 warns against.

``department`` stays free text, not ``department_id``: ``backend-domain-map.md``
§3 says both ``department`` and ``branch`` "must key on ids," but only
``branches`` exists yet. ``branch`` becomes ``branch_id``; ``department``
stays an interim free-text column pending the Departments domain, tracked
here rather than silently left as a gap.

``membership_status`` is ``VARCHAR`` with a CHECK against the union of every
candidate value set found -- ``Member.membershipStatus``
(New/Active/Inactive/Transferred/Archived) and ``memberCreateSchema``'s
(Active/Inactive/Pending/Suspended/Deceased) disagree on 6 of 8 values, and
domain OQ-04 is unresolved. The CHECK rules out garbage without picking a
winner; narrow it to a native ENUM once OQ-04 resolves.
"""

from __future__ import annotations

import uuid
from datetime import date
from enum import StrEnum

from sqlalchemy import (
    CheckConstraint,
    Date,
    Enum,
    ForeignKeyConstraint,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import CITEXT, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database.base import (
    Base,
    SoftDeleteMixin,
    TenantScopedMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    tenant_scoped_table_args,
)

MEMBERSHIP_STATUS_CANDIDATES = (
    "New",
    "Active",
    "Inactive",
    "Transferred",
    "Archived",
    "Pending",
    "Suspended",
    "Deceased",
)


class Gender(StrEnum):
    """Settled -- ``Member.gender``/``memberCreateSchema.gender`` agree exactly."""

    MALE = "Male"
    FEMALE = "Female"


class Member(UUIDPrimaryKeyMixin, TenantScopedMixin, TimestampMixin, SoftDeleteMixin, Base):
    """The first domain table to compose ``TenantScopedMixin`` as-is: its
    ``tenant_id`` and ``branch_id`` (with same-tenant composite FK) apply
    unchanged.

    ``user_id`` is a second, independent optional link, deliberately not
    part of ``TenantScopedMixin`` (that mixin is about tenant/branch scope,
    not identity linkage). ``ON DELETE RESTRICT``, not ``SET NULL``: Postgres
    applies a composite FK's ``SET NULL`` to *every* column in the key,
    which would null out ``tenant_id`` too -- not just ``user_id`` -- and
    ``tenant_id`` is `NOT NULL` (confirmed by a failing integration test
    before this was caught). Column-scoped ``SET NULL (user_id)`` exists in
    Postgres 15+, but the project's own minimum supported version is 14
    (``tests/integration/test_database.py``), so it isn't portable here.
    ``RESTRICT`` blocks hard-deleting a User while a Member still links to
    it -- matching every other FK in this schema -- rather than silently
    corrupting the row; a User is normally deactivated via
    ``SoftDeleteMixin`` anyway, which never triggers this FK at all. The
    Member itself is never at risk either way (ADR-001, ADR-007).
    """

    __tablename__ = "members"
    __table_args__ = tenant_scoped_table_args(
        ForeignKeyConstraint(
            ["tenant_id", "user_id"],
            ["users.tenant_id", "users.id"],
            ondelete="RESTRICT",
        ),
        CheckConstraint(
            f"membership_status IN {MEMBERSHIP_STATUS_CANDIDATES!r}",
            name="membership_status_candidate",
        ),
        Index("ix_members_tenant_id_user_id", "tenant_id", "user_id"),
        Index(
            "ix_members_tenant_id_branch_id_membership_status",
            "tenant_id",
            "branch_id",
            "membership_status",
        ),
        Index(
            "uq_members_tenant_id_email",
            "tenant_id",
            "email",
            unique=True,
            postgresql_where=text("email IS NOT NULL AND deleted_at IS NULL"),
        ),
        Index(
            "uq_members_tenant_id_phone",
            "tenant_id",
            "phone",
            unique=True,
            postgresql_where=text("deleted_at IS NULL"),
        ),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    first_name: Mapped[str] = mapped_column(String(255), nullable=False)
    last_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(CITEXT)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[Gender] = mapped_column(
        Enum(
            Gender,
            name="member_gender",
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
    )
    membership_status: Mapped[str] = mapped_column(String(50), nullable=False, default="Active")
    join_date: Mapped[date | None] = mapped_column(Date)
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    department: Mapped[str | None] = mapped_column(String(255))

    emergency_contact_name: Mapped[str | None] = mapped_column(String(255))
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(32))
    emergency_contact_relationship: Mapped[str | None] = mapped_column(String(255))

    custom_fields: Mapped[dict[str, object] | None] = mapped_column(JSONB)
