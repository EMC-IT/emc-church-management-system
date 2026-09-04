"""FastAPI application factory and entrypoint."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

from app import models as _model_registry  # noqa: F401 -- side effect; see below
from app.api.router import api_router
from app.config import Settings, settings
from app.core.cache import close_redis
from app.core.context import REQUEST_ID_HEADER
from app.core.database import dispose_engine
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.core.middleware import (
    BodySizeLimitMiddleware,
    RequestIDMiddleware,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
)

logger = get_logger(__name__)

# `app.models` is imported for its side effect: it registers every domain's
# tables on `Base.metadata`. Foreign keys are declared against table *names*
# (`"churches.id"`) so that core never imports a domain package, and SQLAlchemy
# resolves them at first flush -- which fails if the target's module was never
# imported. Reaching a domain model through a route is not enough: signing in
# touches `users`, whose `tenant_id` points at `churches`, a table nothing in
# the auth path imports. `migrations/env.py` imports this module for the same
# reason.

# Generous enough for member CSV imports and document uploads; per-endpoint
# limits tighten this in the files domain (Phase 3).
MAX_REQUEST_BODY_BYTES = 25 * 1024 * 1024

API_DESCRIPTION = """
REST API for the EMC Church Management System.

Multi-tenant and multi-branch. Tenant scope is always derived from the
authenticated session, never from the request.
"""


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    """Application startup and shutdown.

    Connections are opened lazily on first use rather than eagerly here, so a
    briefly unavailable database does not prevent the process from starting and
    reporting its state through ``/ready``.
    """
    config: Settings = app.state.settings
    logger.info(
        "application_starting",
        extra={
            "environment": config.ENVIRONMENT.value,
            "version": config.VERSION,
            "api_prefix": config.API_V1_STR,
            "docs_enabled": config.docs_enabled,
        },
    )
    try:
        yield
    finally:
        await dispose_engine()
        await close_redis()
        logger.info("application_stopped")


def create_app(config: Settings | None = None) -> FastAPI:
    """Build the application.

    A factory rather than a module-level singleton so tests can construct an
    app against test configuration without mutating global state.
    """
    config = config or settings
    configure_logging(config)

    docs_url = f"{config.API_V1_STR}/docs" if config.docs_enabled else None
    redoc_url = f"{config.API_V1_STR}/redoc" if config.docs_enabled else None
    openapi_url = f"{config.API_V1_STR}/openapi.json" if config.docs_enabled else None

    app = FastAPI(
        title=config.PROJECT_NAME,
        description=API_DESCRIPTION,
        version=config.VERSION,
        openapi_url=openapi_url,
        docs_url=docs_url,
        redoc_url=redoc_url,
        lifespan=lifespan,
    )
    app.state.settings = config

    _register_middleware(app, config)
    register_exception_handlers(app)
    app.include_router(api_router, prefix=config.API_V1_STR)

    return app


def _register_middleware(app: FastAPI, config: Settings) -> None:
    """Install the middleware stack.

    Starlette runs middleware in reverse registration order, so the last one
    added is outermost. Registration below is therefore innermost-first:
    RequestIDMiddleware ends up outermost, which is what we want -- every
    other layer, including CORS failures and security headers, is logged and
    tagged with a request id.
    """
    docs_paths = tuple(
        path for path in (app.docs_url, app.redoc_url, app.openapi_url) if path is not None
    )

    app.add_middleware(BodySizeLimitMiddleware, max_body_bytes=MAX_REQUEST_BODY_BYTES)

    app.add_middleware(GZipMiddleware, minimum_size=1024)

    app.add_middleware(
        SecurityHeadersMiddleware,
        enable_hsts=config.ENVIRONMENT.is_deployed,
        docs_paths=docs_paths,
    )

    # Credentials are allowed, so the origin list must be explicit; the
    # settings validator rejects "*" in deployed environments.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Accept", REQUEST_ID_HEADER],
        expose_headers=[REQUEST_ID_HEADER, "X-Response-Time-Ms"],
        max_age=600,
    )

    app.add_middleware(
        RequestLoggingMiddleware,
        exclude_paths=tuple(config.LOG_EXCLUDE_PATHS),
    )

    app.add_middleware(RequestIDMiddleware)


app = create_app()
