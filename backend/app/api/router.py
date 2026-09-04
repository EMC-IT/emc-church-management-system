"""Master API router.

Every domain router is mounted here under the versioned prefix. Domain
routers arrive from Phase 2 onward, in the order set out in
``docs/backend-implementation-plan.md`` §9.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.routes import auth_router, members_router, settings_router, system_router

api_router = APIRouter()

api_router.include_router(system_router)
api_router.include_router(auth_router)
api_router.include_router(members_router)
api_router.include_router(settings_router)
