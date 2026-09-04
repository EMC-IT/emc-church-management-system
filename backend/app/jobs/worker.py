"""Celery application.

Long-running work never blocks an HTTP request (``backend/CLAUDE.md`` §14):
bulk SMS, email campaigns, member imports, report generation, large exports and
PDF rendering all run here. Phase 1 registers no business tasks -- only the
application, its configuration and a diagnostic ping.
"""

from __future__ import annotations

from typing import Any

from celery import Celery
from celery.signals import setup_logging

from app.config import settings
from app.core.logging import configure_logging

celery_app = Celery(
    "emc_church_worker",
    broker=str(settings.CELERY_BROKER_URL),
    backend=str(settings.CELERY_RESULT_BACKEND),
    include=["app.jobs.tasks"],
)

celery_app.conf.update(
    # JSON only. Pickle would let a compromised broker execute arbitrary
    # code in a worker that holds database credentials.
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_track_started=True,
    worker_prefetch_multiplier=1,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    result_expires=60 * 60 * 24,
    # Runs tasks inline so test suites need no live worker.
    task_always_eager=settings.CELERY_TASK_ALWAYS_EAGER,
    task_eager_propagates=settings.CELERY_TASK_ALWAYS_EAGER,
    broker_connection_retry_on_startup=True,
)

# Domain task modules are discovered as each domain lands. A package without a
# `tasks` module is skipped silently, so listing them ahead of time is safe.
celery_app.autodiscover_tasks(
    [
        "app.domains.communications",
        "app.domains.analytics",
        "app.domains.finance",
        "app.domains.members",
        "app.domains.notifications",
        "app.domains.files",
    ]
)


@setup_logging.connect
def _configure_worker_logging(**_kwargs: Any) -> bool:
    """Use the application's structured logging in workers too.

    Returning a truthy value tells Celery not to install its own handlers.
    """
    configure_logging(settings)
    return True


@celery_app.task(name="app.jobs.ping")
def ping() -> str:
    """Diagnostic task proving the broker round-trips."""
    return "pong"
