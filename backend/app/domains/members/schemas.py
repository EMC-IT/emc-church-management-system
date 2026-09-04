"""Member request and response schemas.

Shapes follow ``lib/validation/members.ts`` and the `/members` contract in
``docs/backend-api-map.md`` §2, restricted to the fields the ``members`` table
actually stores. ``memberCreateSchema`` additionally carries ``maritalStatus``,
``occupation``, ``familyId`` and a ``branch`` *name*, none of which exist as
columns; they are deliberately **not** accepted here rather than accepted and
silently dropped, which would look like a successful write that lost data.
That divergence is recorded as a blocked item, not resolved by inventing
columns.

``tenantId`` appears on no schema in either direction. It is never an input --
tenant comes from the authenticated principal (ADR-011) -- and echoing it back
would only tell a caller something it already knows.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import Field

from app.domains.members.models import MEMBERSHIP_STATUS_CANDIDATES, Gender, Member
from app.shared.types.base import ResponseModel, StrictCamelModel

MembershipStatus = str


class EmergencyContact(StrictCamelModel):
    """``emergencyContactSchema``, stored flat on ``members``."""

    name: str = Field(min_length=2, max_length=255)
    phone: str = Field(min_length=5, max_length=32)
    relationship: str = Field(min_length=2, max_length=255)


class EmergencyContactEnvelope(ResponseModel):
    name: str
    phone: str
    relationship: str


class MemberCreateRequest(StrictCamelModel):
    """``POST /members``.

    ``branchId`` is optional here because ``memberCreateSchema`` makes it
    optional. It is resolved server-side either way: a supplied branch must be
    one the caller is assigned to, and an omitted one falls back to the
    caller's primary branch. A member is never created into a branch the
    caller cannot reach, and never created with no branch at all -- that would
    be a row nobody can read back (see ``service.resolve_branch``).
    """

    first_name: str = Field(min_length=2, max_length=255)
    last_name: str = Field(min_length=2, max_length=255)
    email: str | None = Field(default=None, max_length=320)
    phone: str = Field(min_length=5, max_length=32)
    address: str | None = None
    date_of_birth: date | None = None
    gender: Gender
    membership_status: str = Field(default="Active")
    join_date: date | None = None
    avatar_url: str | None = Field(default=None, max_length=255)
    department: str | None = Field(default=None, max_length=255)
    branch_id: uuid.UUID | None = None
    emergency_contact: EmergencyContact | None = None
    custom_fields: dict[str, object] | None = None


class MemberUpdateRequest(StrictCamelModel):
    """``PUT /members/{id}`` -- ``memberUpdateSchema`` is the create shape,
    partial. Every field is optional; only those present are written.

    ``branchId`` is accepted, so this is the operation that could move a member
    between branches. It cannot move one *out* of the caller's reach or into a
    branch the caller lacks: both the current and the requested branch are
    checked (§13's mutation-boundary invariant).
    """

    first_name: str | None = Field(default=None, min_length=2, max_length=255)
    last_name: str | None = Field(default=None, min_length=2, max_length=255)
    email: str | None = Field(default=None, max_length=320)
    phone: str | None = Field(default=None, min_length=5, max_length=32)
    address: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    membership_status: str | None = None
    join_date: date | None = None
    avatar_url: str | None = Field(default=None, max_length=255)
    department: str | None = Field(default=None, max_length=255)
    branch_id: uuid.UUID | None = None
    emergency_contact: EmergencyContact | None = None
    custom_fields: dict[str, object] | None = None


class MemberEnvelope(ResponseModel):
    """One member, as the API returns it.

    ``branchId`` is included: it is the field the caller's own access to this
    record was decided on, and a client that cannot see it cannot render or
    reason about branch scope at all.
    """

    id: uuid.UUID
    first_name: str
    last_name: str
    email: str | None
    phone: str
    address: str | None
    date_of_birth: date | None
    gender: Gender
    membership_status: str
    join_date: date | None
    avatar_url: str | None
    department: str | None
    branch_id: uuid.UUID | None
    emergency_contact: EmergencyContactEnvelope | None
    custom_fields: dict[str, object] | None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def of(cls, member: Member) -> MemberEnvelope:
        contact = (
            EmergencyContactEnvelope(
                name=member.emergency_contact_name,
                phone=member.emergency_contact_phone or "",
                relationship=member.emergency_contact_relationship or "",
            )
            if member.emergency_contact_name
            else None
        )
        return cls(
            id=member.id,
            first_name=member.first_name,
            last_name=member.last_name,
            email=member.email,
            phone=member.phone,
            address=member.address,
            date_of_birth=member.date_of_birth,
            gender=member.gender,
            membership_status=member.membership_status,
            join_date=member.join_date,
            avatar_url=member.avatar_url,
            department=member.department,
            branch_id=member.branch_id,
            emergency_contact=contact,
            custom_fields=member.custom_fields,
            created_at=member.created_at,
            updated_at=member.updated_at,
        )


def validate_membership_status(value: str) -> str:
    """Reject a status the table's CHECK constraint would refuse anyway.

    Catching it here turns a 409 from a constraint violation -- which says
    nothing useful -- into a 422 naming the field.
    """
    if value not in MEMBERSHIP_STATUS_CANDIDATES:
        raise ValueError(
            f"{value!r} is not a membership status. Expected one of: "
            f"{', '.join(MEMBERSHIP_STATUS_CANDIDATES)}."
        )
    return value


__all__ = [
    "EmergencyContact",
    "EmergencyContactEnvelope",
    "MemberCreateRequest",
    "MemberEnvelope",
    "MemberUpdateRequest",
    "validate_membership_status",
]
