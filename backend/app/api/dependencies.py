"""Shared FastAPI dependencies.

Phase 1 provides infrastructure dependencies only.

Authentication, tenant resolution and authorization arrive in Phase 2. The
previous scaffold shipped a ``get_current_principal`` that accepted any
non-empty bearer string and returned a hard-coded SuperAdmin with
``permissions=["*"]`` and a random tenant id. It has been removed rather than
left in place: a placeholder that authorizes everything is worse than no
authentication at all, because a router mounted against it looks protected
while being wide open.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_redis
from app.core.database import get_db
from app.shared.pagination import PaginationParams, pagination_params

DbSession = Annotated[AsyncSession, Depends(get_db)]
"""Request-scoped database session."""

RedisClient = Annotated[Redis, Depends(get_redis)]
"""Shared Redis client."""

Pagination = Annotated[PaginationParams, Depends(pagination_params)]
"""Validated page, size and sort parameters."""

__all__ = ["DbSession", "Pagination", "RedisClient"]
