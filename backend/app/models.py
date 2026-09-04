"""Model registry.

Alembic autogenerate only sees tables that have been imported. Rather than
have ``migrations/env.py`` import twenty domain packages, each domain adds its
models module here as it lands, and env.py imports this one module.
"""

from __future__ import annotations

from app.core.database.base import (
    Base,
    SoftDeleteMixin,
    TenantScopedMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
)
from app.domains.churches.models import Branch, BranchStatus, BranchType, Church
from app.domains.identity.models import (
    Permission,
    PermissionCategory,
    Role,
    RolePermission,
    User,
    UserBranchAssignment,
    UserStatus,
)
from app.domains.members.models import Gender, Member

__all__ = [
    "Base",
    "Branch",
    "BranchStatus",
    "BranchType",
    "Church",
    "Gender",
    "Member",
    "Permission",
    "PermissionCategory",
    "Role",
    "RolePermission",
    "SoftDeleteMixin",
    "TenantScopedMixin",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "User",
    "UserBranchAssignment",
    "UserStatus",
]
