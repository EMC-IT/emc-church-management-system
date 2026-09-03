"""Structured logging.

Emits one JSON object per line in deployed environments and a readable
single-line format in development. The current request id is injected into
every record automatically, so any log line can be correlated with the
request that produced it and with the audit trail (Phase 1 of the
implementation plan).
"""

from __future__ import annotations

import json
import logging
import logging.config
from datetime import UTC, datetime
from typing import Any, ClassVar

from app.config import Settings
from app.core.context import get_request_id

# Attributes present on every LogRecord. Anything else an caller attaches via
# `extra=` is treated as structured context and included in the output.
_RESERVED_RECORD_ATTRS: frozenset[str] = frozenset(
    {
        "args",
        "asctime",
        "created",
        "exc_info",
        "exc_text",
        "filename",
        "funcName",
        "levelname",
        "levelno",
        "lineno",
        "module",
        "msecs",
        "message",
        "msg",
        "name",
        "pathname",
        "process",
        "processName",
        "relativeCreated",
        "stack_info",
        "taskName",
        "thread",
        "threadName",
    }
)


class RequestIdFilter(logging.Filter):
    """Attach the current request id to every record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = get_request_id()
        return True


class JsonFormatter(logging.Formatter):
    """Render records as single-line JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(record.created, tz=UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        request_id = getattr(record, "request_id", None)
        if request_id:
            payload["request_id"] = request_id

        for key, value in record.__dict__.items():
            if key not in _RESERVED_RECORD_ATTRS and key != "request_id":
                payload[key] = value

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        if record.stack_info:
            payload["stack"] = self.formatStack(record.stack_info)

        return json.dumps(payload, default=str, separators=(",", ":"))


class ConsoleFormatter(logging.Formatter):
    """Readable development format with the request id inline."""

    default_fmt: ClassVar[str] = (
        "%(asctime)s %(levelname)-8s %(name)s%(request_suffix)s %(message)s"
    )

    def __init__(self) -> None:
        super().__init__(fmt=self.default_fmt, datefmt="%H:%M:%S")

    def format(self, record: logging.LogRecord) -> str:
        request_id = getattr(record, "request_id", None)
        record.request_suffix = f" [{request_id[:8]}]" if request_id else ""
        return super().format(record)


def configure_logging(settings: Settings) -> None:
    """Install the logging configuration for the process.

    Idempotent: calling it again replaces the previous configuration, which
    matters because both the API process and Celery workers call it.
    """
    formatter = "json" if settings.LOG_FORMAT == "json" else "console"

    logging.config.dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {
                "request_id": {"()": RequestIdFilter},
            },
            "formatters": {
                "json": {"()": JsonFormatter},
                "console": {"()": ConsoleFormatter},
            },
            "handlers": {
                "default": {
                    "class": "logging.StreamHandler",
                    "stream": "ext://sys.stdout",
                    "formatter": formatter,
                    "filters": ["request_id"],
                },
            },
            "root": {
                "handlers": ["default"],
                "level": settings.LOG_LEVEL,
            },
            "loggers": {
                # Access logging is handled by RequestLoggingMiddleware, which
                # records the request id, duration and status in one record.
                "uvicorn.access": {"handlers": [], "propagate": False, "level": "WARNING"},
                "uvicorn.error": {"handlers": ["default"], "propagate": False},
                "sqlalchemy.engine": {
                    "level": "INFO" if settings.DATABASE_ECHO else "WARNING",
                },
                "celery": {"level": settings.LOG_LEVEL},
            },
        }
    )


def get_logger(name: str) -> logging.Logger:
    """Return a module logger."""
    return logging.getLogger(name)
