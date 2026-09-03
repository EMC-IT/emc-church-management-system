"""Database engine, session management and model conventions."""

from app.core.database.base import (
    NAMING_CONVENTION,
    Base,
    SoftDeleteMixin,
    TenantScopedMixin,
    TimestampMixin,
    UUIDPrimaryKeyMixin,
    utcnow,
)
from app.core.database.session import (
    check_database,
    create_engine,
    dispose_engine,
    engine,
    get_db,
    session_factory,
)
from app.core.database.transaction import transaction_scope

__all__ = [
    "NAMING_CONVENTION",
    "Base",
    "SoftDeleteMixin",
    "TenantScopedMixin",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "check_database",
    "create_engine",
    "dispose_engine",
    "engine",
    "get_db",
    "session_factory",
    "transaction_scope",
    "utcnow",
]
