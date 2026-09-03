"""Base Pydantic model conventions.

Every schema crossing the HTTP boundary derives from :class:`CamelModel`.

The existing Next.js frontend consumes camelCase JSON throughout
(``lib/types/**``), while Python code is snake_case. Rather than renaming
fields by hand on every model, the alias generator handles the translation in
one place: Python code says ``total_pages``, the wire says ``totalPages``, and
both spellings are accepted on input.
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base schema: camelCase on the wire, snake_case in Python."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
        str_strip_whitespace=True,
        extra="forbid",
    )

    def to_wire(self) -> dict[str, Any]:
        """Serialize using wire (camelCase) names, dropping unset fields."""
        return self.model_dump(by_alias=True, exclude_none=True)


class StrictCamelModel(CamelModel):
    """A :class:`CamelModel` that also rejects unknown input fields.

    ``extra="forbid"`` is already the default above; this alias exists to make
    the intent explicit at request-schema definition sites.
    """


class ResponseModel(CamelModel):
    """Base for outbound schemas.

    Outbound models permit unknown attributes on the source object (they are
    simply ignored) but never echo them, so an ORM row gaining a column does
    not silently widen an API response.
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
        from_attributes=True,
        extra="ignore",
    )
