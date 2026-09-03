"""Structured logging and request context."""

from __future__ import annotations

import json
import logging
from collections.abc import Iterator

import pytest

from app.config import Settings
from app.core.context import (
    RequestContext,
    get_request_id,
    new_request_id,
    reset_request_id,
    set_request_id,
)
from app.core.logging import JsonFormatter, RequestIdFilter, configure_logging, get_logger


def _record(**extra: object) -> logging.LogRecord:
    record = logging.LogRecord(
        name="app.test",
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg="member_created",
        args=(),
        exc_info=None,
    )
    for key, value in extra.items():
        setattr(record, key, value)
    return record


class TestRequestContext:
    """Request id storage."""

    def test_absent_outside_a_request(self) -> None:
        assert get_request_id() is None

    def test_set_and_read(self) -> None:
        token = set_request_id("abc-123")
        try:
            assert get_request_id() == "abc-123"
        finally:
            reset_request_id(token)

    def test_reset_restores_the_previous_value(self) -> None:
        outer = set_request_id("outer")
        inner = set_request_id("inner")
        assert get_request_id() == "inner"
        reset_request_id(inner)
        assert get_request_id() == "outer"
        reset_request_id(outer)
        assert get_request_id() is None

    def test_generated_ids_are_unique(self) -> None:
        assert new_request_id() != new_request_id()

    def test_snapshot(self) -> None:
        token = set_request_id("snap-1")
        try:
            assert RequestContext.current() == RequestContext(request_id="snap-1")
        finally:
            reset_request_id(token)


class TestJsonFormatter:
    """Deployed environments emit one JSON object per line."""

    def test_emits_valid_json(self) -> None:
        payload = json.loads(JsonFormatter().format(_record()))
        assert payload["message"] == "member_created"
        assert payload["level"] == "INFO"
        assert payload["logger"] == "app.test"

    def test_timestamp_is_timezone_aware(self) -> None:
        payload = json.loads(JsonFormatter().format(_record()))
        assert payload["timestamp"].endswith("+00:00")

    def test_includes_structured_extras(self) -> None:
        payload = json.loads(JsonFormatter().format(_record(member_id="m-1", duration_ms=12.5)))
        assert payload["member_id"] == "m-1"
        assert payload["duration_ms"] == 12.5

    def test_includes_the_request_id(self) -> None:
        payload = json.loads(JsonFormatter().format(_record(request_id="req-9")))
        assert payload["request_id"] == "req-9"

    def test_omits_the_request_id_when_absent(self) -> None:
        payload = json.loads(JsonFormatter().format(_record(request_id=None)))
        assert "request_id" not in payload

    def test_renders_exceptions(self) -> None:
        try:
            raise ValueError("boom")
        except ValueError:
            import sys

            record = _record()
            record.exc_info = sys.exc_info()

        payload = json.loads(JsonFormatter().format(record))
        assert "ValueError: boom" in payload["exception"]

    def test_serializes_unusual_types(self) -> None:
        """A log call must never fail because a value is not JSON-native."""
        payload = json.loads(JsonFormatter().format(_record(obj=object())))
        assert isinstance(payload["obj"], str)


class TestRequestIdFilter:
    """The filter injects the ambient request id."""

    def test_attaches_the_current_id(self) -> None:
        token = set_request_id("filter-1")
        try:
            record = _record()
            assert RequestIdFilter().filter(record) is True
            assert getattr(record, "request_id", None) == "filter-1"
        finally:
            reset_request_id(token)

    def test_attaches_none_outside_a_request(self) -> None:
        record = _record()
        RequestIdFilter().filter(record)
        assert getattr(record, "request_id", "missing") is None


class TestConfigureLogging:
    @pytest.fixture(autouse=True)
    def _restore(self, settings: Settings) -> Iterator[None]:
        yield
        configure_logging(settings)

    def test_applies_the_configured_level(self) -> None:
        configure_logging(Settings(LOG_LEVEL="ERROR"))
        assert logging.getLogger().level == logging.ERROR

    def test_json_format_is_selectable(self) -> None:
        configure_logging(Settings(LOG_FORMAT="json", LOG_LEVEL="INFO"))
        handler = logging.getLogger().handlers[0]
        assert isinstance(handler.formatter, JsonFormatter)

    def test_is_idempotent(self) -> None:
        """Both the API process and Celery workers call it."""
        settings = Settings(LOG_LEVEL="INFO")
        configure_logging(settings)
        configure_logging(settings)
        assert len(logging.getLogger().handlers) == 1

    def test_uvicorn_access_log_is_disabled(self) -> None:
        """RequestLoggingMiddleware records access events instead."""
        configure_logging(Settings())
        access = logging.getLogger("uvicorn.access")
        assert access.handlers == []
        assert access.propagate is False

    def test_get_logger_returns_a_named_logger(self) -> None:
        assert get_logger("app.domains.members").name == "app.domains.members"
