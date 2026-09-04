"""Cross-cutting API routes that belong to no business domain."""

from app.api.routes.auth import router as auth_router
from app.api.routes.members import router as members_router
from app.api.routes.settings import router as settings_router
from app.api.routes.system import router as system_router

__all__ = ["auth_router", "members_router", "settings_router", "system_router"]
