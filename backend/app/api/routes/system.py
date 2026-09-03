"""System probes: liveness and readiness."""

from __future__ import annotations

import asyncio
import time
from collections.abc import Awaitable, Callable
from http import HTTPStatus

from fastapi import APIRouter, Response

from app.config import settings
from app.core.cache import check_redis
from app.core.database import check_database
from app.core.logging import get_logger
from app.shared.types.responses import DependencyStatus, HealthResponse, ReadinessResponse

logger = get_logger(__name__)

router = APIRouter(tags=["System"])

STATUS_HEALTHY = "healthy"
STATUS_READY = "ready"
STATUS_NOT_READY = "not_ready"
STATUS_UP = "up"
STATUS_DOWN = "down"

ProbeFn = Callable[..., Awaitable[None]]

# Dependencies whose failure means the instance cannot serve traffic.
_REQUIRED_DEPENDENCIES: tuple[tuple[str, ProbeFn], ...] = (
    ("database", check_database),
    ("redis", check_redis),
)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Liveness probe",
    description=(
        "Reports that the process is running and able to serve HTTP. "
        "Checks no dependencies -- an orchestrator should restart the "
        "container only if this fails."
    ),
)
async def health() -> HealthResponse:
    """Liveness: is this process alive?"""
    return HealthResponse(
        status=STATUS_HEALTHY,
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT.value,
    )


@router.get(
    "/ready",
    response_model=ReadinessResponse,
    response_model_exclude_none=True,
    summary="Readiness probe",
    description=(
        "Reports whether every dependency needed to serve a request is "
        "reachable. Returns 503 when any is down, so a load balancer removes "
        "the instance instead of restarting it."
    ),
    responses={
        HTTPStatus.SERVICE_UNAVAILABLE: {
            "model": ReadinessResponse,
            "description": "One or more dependencies are unavailable",
        }
    },
)
async def ready(response: Response) -> ReadinessResponse:
    """Readiness: can this process actually do work?"""
    results = await asyncio.gather(*(_probe(name, probe) for name, probe in _REQUIRED_DEPENDENCIES))

    all_up = all(dep.status == STATUS_UP for dep in results)
    if not all_up:
        response.status_code = HTTPStatus.SERVICE_UNAVAILABLE
        logger.warning(
            "readiness_check_failed",
            extra={"down": [dep.name for dep in results if dep.status != STATUS_UP]},
        )

    return ReadinessResponse(
        status=STATUS_READY if all_up else STATUS_NOT_READY,
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT.value,
        dependencies=list(results),
    )


async def _probe(name: str, probe: ProbeFn) -> DependencyStatus:
    """Run one dependency check, converting any failure into a status.

    A readiness probe must answer quickly even when a dependency is hanging,
    so each check is bounded by ``READINESS_TIMEOUT_SECONDS``. The error text
    is truncated and never includes a DSN or credentials.
    """
    started = time.perf_counter()
    try:
        await asyncio.wait_for(probe(), timeout=settings.READINESS_TIMEOUT_SECONDS)
    except TimeoutError:
        return DependencyStatus(
            name=name,
            status=STATUS_DOWN,
            latency_ms=_elapsed_ms(started),
            error=f"timed out after {settings.READINESS_TIMEOUT_SECONDS}s",
        )
    except Exception as exc:
        logger.warning("dependency_check_failed", exc_info=exc, extra={"dependency": name})
        return DependencyStatus(
            name=name,
            status=STATUS_DOWN,
            latency_ms=_elapsed_ms(started),
            error=type(exc).__name__,
        )

    return DependencyStatus(name=name, status=STATUS_UP, latency_ms=_elapsed_ms(started))


def _elapsed_ms(started: float) -> float:
    return round((time.perf_counter() - started) * 1000, 2)
