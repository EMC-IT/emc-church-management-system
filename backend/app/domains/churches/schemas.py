"""Church profile request and response schemas.

Fields are ``churchProfileSchema`` (`lib/validation/settings.ts`), which is
also what ``Church``'s columns were traced from -- the two lists are the same
list, so nothing here is accepted that the table cannot store and nothing is
stored that the form cannot send.

``id`` is echoed even though it equals the caller's own ``tenant_id``. It
discloses nothing (the caller's token already carries ``tid``), and this is a
**singleton** resource -- the caller never names it in the URL -- so the
envelope is the only place the identity appears at all.

The one documented settings write in ``api-documentations/Settings_Endpoints.md``
sends a partial body, so :class:`ChurchProfileUpdateRequest` is partial too,
matching ``PUT /members/{id}``. Length and format rules are
``churchProfileSchema``'s, narrowed where a column is shorter.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from app.domains.churches.models import Church
from app.shared.types.base import ResponseModel, StrictCamelModel


class ChurchProfileUpdateRequest(StrictCamelModel):
    """``PUT /settings/church-profile`` -- ``churchProfileSchema``, partial.

    Every field is optional; only those present are written. There is no
    ``id`` and no ``tenantId``: the row updated is the caller's own church,
    resolved from the security context, so this schema has no way to name a
    different one (ADR-011).
    """

    name: str | None = Field(default=None, min_length=3, max_length=255)
    motto: str | None = Field(default=None, max_length=255)
    vision: str | None = Field(default=None, min_length=20)
    mission: str | None = Field(default=None, min_length=20)
    core_values: str | None = Field(default=None, min_length=20)
    history: str | None = None
    founded: str | None = Field(default=None, max_length=32)
    denomination: str | None = Field(default=None, max_length=255)

    email: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, min_length=10, max_length=32)
    alternative_phone: str | None = Field(default=None, max_length=32)
    website: str | None = Field(default=None, max_length=255)

    street: str | None = Field(default=None, min_length=5, max_length=255)
    city: str | None = Field(default=None, min_length=2, max_length=255)
    state: str | None = Field(default=None, min_length=2, max_length=255)
    postal_code: str | None = Field(default=None, min_length=3, max_length=32)
    country: str | None = Field(default=None, min_length=2, max_length=255)

    facebook: str | None = Field(default=None, max_length=255)
    twitter: str | None = Field(default=None, max_length=255)
    instagram: str | None = Field(default=None, max_length=255)
    youtube: str | None = Field(default=None, max_length=255)

    senior_pastor: str | None = Field(default=None, min_length=3, max_length=255)
    assistant_pastor: str | None = Field(default=None, max_length=255)
    secretary: str | None = Field(default=None, max_length=255)
    treasurer: str | None = Field(default=None, max_length=255)


class ChurchProfileEnvelope(ResponseModel):
    """One church profile, as the API returns it."""

    id: uuid.UUID
    name: str
    motto: str | None
    vision: str
    mission: str
    core_values: str
    history: str | None
    founded: str | None
    denomination: str | None

    email: str
    phone: str
    alternative_phone: str | None
    website: str | None

    street: str
    city: str
    state: str
    postal_code: str
    country: str

    facebook: str | None
    twitter: str | None
    instagram: str | None
    youtube: str | None

    senior_pastor: str
    assistant_pastor: str | None
    secretary: str | None
    treasurer: str | None

    created_at: datetime
    updated_at: datetime

    @classmethod
    def of(cls, church: Church) -> ChurchProfileEnvelope:
        return cls.model_validate(church)


__all__ = ["ChurchProfileEnvelope", "ChurchProfileUpdateRequest"]
