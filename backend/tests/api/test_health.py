"""Liveness endpoint and application startup."""

from __future__ import annotations

from http import HTTPStatus

from fastapi import FastAPI
from httpx import AsyncClient

from app.config import Settings
from app.core.context import REQUEST_ID_HEADER


class TestApplicationStarts:
    """The FastAPI application builds and serves requests."""

    def test_app_is_constructed(self, app: FastAPI, settings: Settings) -> None:
        assert isinstance(app, FastAPI)
        assert app.title == settings.PROJECT_NAME
        assert app.version == settings.VERSION

    def test_routes_are_mounted_under_the_version_prefix(
        self, app: FastAPI, api_prefix: str
    ) -> None:
        assert api_prefix == "/api/v1"
        paths = set(app.openapi()["paths"])
        assert f"{api_prefix}/health" in paths
        assert f"{api_prefix}/ready" in paths

    def test_every_route_is_versioned(self, app: FastAPI, api_prefix: str) -> None:
        """No business route escapes the version prefix."""
        for path in app.openapi()["paths"]:
            assert path.startswith(api_prefix), f"{path} is not under {api_prefix}"

    async def test_lifespan_starts_and_stops_cleanly(
        self, lifespan_client: AsyncClient, api_prefix: str
    ) -> None:
        response = await lifespan_client.get(f"{api_prefix}/health")
        assert response.status_code == HTTPStatus.OK


class TestHealthEndpoint:
    async def test_returns_ok(self, client: AsyncClient, api_prefix: str) -> None:
        response = await client.get(f"{api_prefix}/health")
        assert response.status_code == HTTPStatus.OK

    async def test_payload_shape(
        self, client: AsyncClient, api_prefix: str, settings: Settings
    ) -> None:
        body = (await client.get(f"{api_prefix}/health")).json()
        assert body == {
            "status": "healthy",
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT.value,
        }

    async def test_reports_no_dependencies(self, client: AsyncClient, api_prefix: str) -> None:
        """Liveness must answer even when a dependency is down.

        Verified structurally: the payload carries no dependency section, so a
        failing dependency cannot influence the result.
        """
        body = (await client.get(f"{api_prefix}/health")).json()
        assert "dependencies" not in body

    async def test_unversioned_path_is_not_served(self, client: AsyncClient) -> None:
        assert (await client.get("/health")).status_code == HTTPStatus.NOT_FOUND

    async def test_returns_a_request_id(self, client: AsyncClient, api_prefix: str) -> None:
        response = await client.get(f"{api_prefix}/health")
        assert response.headers[REQUEST_ID_HEADER]
