"""Cross-cutting API routes that belong to no business domain."""

from app.api.routes.system import router as system_router

__all__ = ["system_router"]
