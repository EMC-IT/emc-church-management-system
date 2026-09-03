"""Background job processing (Celery)."""

from app.jobs.worker import celery_app

__all__ = ["celery_app"]
