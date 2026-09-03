"""Celery application configuration."""

from __future__ import annotations

from app.config import Settings
from app.jobs.worker import celery_app, ping


class TestCeleryConfiguration:
    """The worker is wired to Redis with safe defaults."""

    def test_broker_and_backend_point_at_redis(self, settings: Settings) -> None:
        assert celery_app.conf.broker_url == str(settings.CELERY_BROKER_URL)
        assert celery_app.conf.result_backend == str(settings.CELERY_RESULT_BACKEND)

    def test_broker_and_result_use_separate_databases(self, settings: Settings) -> None:
        """Keeps job state from colliding with the cache."""
        assert str(settings.CELERY_BROKER_URL) != str(settings.REDIS_URL)
        assert str(settings.CELERY_RESULT_BACKEND) != str(settings.CELERY_BROKER_URL)

    def test_serialization_is_json_only(self) -> None:
        """Pickle would let a compromised broker execute code in a worker."""
        assert celery_app.conf.task_serializer == "json"
        assert celery_app.conf.result_serializer == "json"
        assert celery_app.conf.accept_content == ["json"]
        assert "pickle" not in celery_app.conf.accept_content

    def test_runs_in_utc(self) -> None:
        assert str(celery_app.conf.timezone) == "UTC"
        assert celery_app.conf.enable_utc is True

    def test_acknowledges_late(self) -> None:
        """A task lost to a worker crash must be redelivered, not dropped."""
        assert celery_app.conf.task_acks_late is True
        assert celery_app.conf.task_reject_on_worker_lost is True

    def test_prefetch_is_one(self) -> None:
        """Long jobs (bulk SMS, exports) must not queue behind one worker."""
        assert celery_app.conf.worker_prefetch_multiplier == 1

    def test_time_limits_are_set(self) -> None:
        assert celery_app.conf.task_soft_time_limit < celery_app.conf.task_time_limit


class TestEagerModeInTests:
    """Tasks run inline so the suite needs no live worker."""

    def test_eager_mode_is_enabled(self, settings: Settings) -> None:
        assert settings.CELERY_TASK_ALWAYS_EAGER is True
        assert celery_app.conf.task_always_eager is True

    def test_eager_mode_propagates_failures(self) -> None:
        """Otherwise a failing task would pass silently in tests."""
        assert celery_app.conf.task_eager_propagates is True

    def test_ping_task_round_trips(self) -> None:
        assert ping.delay().get(timeout=5) == "pong"

    def test_ping_task_is_registered(self) -> None:
        assert "app.jobs.ping" in celery_app.tasks
