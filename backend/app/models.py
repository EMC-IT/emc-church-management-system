"""Model registry.

Alembic autogenerate only sees tables that have been imported. Rather than
have ``migrations/env.py`` import twenty domain packages, each domain adds its
models module here as it lands, and env.py imports this one module.

Phase 1 defines no domain models -- only the base and mixins they will use.
"""

from __future__ import annotations

from app.core.database.base import (
    Base,
    SoftDeleteMixin,
    TenantScopedMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
)

__all__ = [
    "Base",
    "SoftDeleteMixin",
    "TenantScopedMixin",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
]
