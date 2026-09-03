"""Readiness endpoint."""

from __future__ import annotations

from http import HTTPStatus
from typing import Any

import pytest
from httpx import AsyncClient

from app.api.routes import system
from app.config import Settings
from app.config import settings as app_settings
from app.core.cache import check_redis


class TestReadinessWhenDependenciesAreUp:
    """GET /api/v1/ready against live PostgreSQL and Redis."""

    @pytest.fixture
    async def body(self, client: AsyncClient, api_prefix: str) -> dict[str, Any]:
        response = await client.get(f"{api_prefix}/ready")
        assert response.status_code == HTTPStatus.OK, response.text
        return dict(response.json())

    def test_reports_ready(self, body: dict[str, Any]) -> None:
        assert body["status"] == "ready"

    def test_identifies_the_service(self, body: dict[str, Any], settings: Settings) -> None:
        assert body["service"] == settings.PROJECT_NAME
        assert body["version"] == settings.VERSION
        assert body["environment"] == settings.ENVIRONMENT.value

    def test_checks_database_and_redis(self, body: dict[str, Any]) -> None:
        checked = {dep["name"] for dep in body["dependencies"]}
        assert checked == {"database", "redis"}

    def test_every_dependency_is_up(self, body: dict[str, Any]) -> None:
        for dependency in body["dependencies"]:
            assert dependency["status"] == "up", dependency

    def test_reports_latency_in_camel_case(self, body: dict[str, Any]) -> None:
        """The frontend consumes camelCase throughout (lib/types/**)."""
        for dependency in body["dependencies"]:
            assert isinstance(dependency["latencyMs"], (int, float))
            assert "latency_ms" not in dependency


class TestReadinessWhenADependencyIsDown:
    """A failing dependency must produce 503, not a 500 or a hang."""

    @pytest.fixture
    def _break_database(self, monkeypatch: pytest.MonkeyPatch) -> None:
        async def failing_check(*_args: object, **_kwargs: object) -> None:
            raise ConnectionRefusedError("connection refused")

        monkeypatch.setattr(
            system,
            "_REQUIRED_DEPENDENCIES",
            (("database", failing_check), ("redis", check_redis)),
        )

    @pytest.mark.usefixtures("_break_database")
    async def test_returns_service_unavailable(self, client: AsyncClient, api_prefix: str) -> None:
        response = await client.get(f"{api_prefix}/ready")
        assert response.status_code == HTTPStatus.SERVICE_UNAVAILABLE

    @pytest.mark.usefixtures("_break_database")
    async def test_names_the_failing_dependency(self, client: AsyncClient, api_prefix: str) -> None:
        body = (await client.get(f"{api_prefix}/ready")).json()
        assert body["status"] == "not_ready"

        by_name = {dep["name"]: dep for dep in body["dependencies"]}
        assert by_name["database"]["status"] == "down"
        assert by_name["database"]["error"] == "ConnectionRefusedError"

    @pytest.mark.usefixtures("_break_database")
    async def test_still_reports_healthy_dependencies(
        self, client: AsyncClient, api_prefix: str
    ) -> None:
        """One failure must not mask the state of the others."""
        body = (await client.get(f"{api_prefix}/ready")).json()
        by_name = {dep["name"]: dep for dep in body["dependencies"]}
        assert by_name["redis"]["status"] == "up"

    async def test_does_not_leak_connection_details(
        self, client: AsyncClient, api_prefix: str, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """The error field carries a type name, never a DSN or credentials."""
        secret_dsn = "postgresql://admin:hunter2@db.internal:5432/prod"  # noqa: S105

        async def failing_check(*_args: object, **_kwargs: object) -> None:
            raise ConnectionRefusedError(f"could not connect to {secret_dsn}")

        monkeypatch.setattr(system, "_REQUIRED_DEPENDENCIES", (("database", failing_check),))

        response = await client.get(f"{api_prefix}/ready")
        assert "hunter2" not in response.text
        assert "db.internal" not in response.text

    async def test_a_hanging_dependency_times_out(
        self, client: AsyncClient, api_prefix: str, monkeypatch: pytest.MonkeyPatch
    ) -> None:
        """A probe must not hang the readiness endpoint indefinitely."""
        import asyncio

        async def hanging_check(*_args: object, **_kwargs: object) -> None:
            await asyncio.sleep(60)

        monkeypatch.setattr(app_settings, "READINESS_TIMEOUT_SECONDS", 0.05)
        monkeypatch.setattr(system, "_REQUIRED_DEPENDENCIES", (("database", hanging_check),))

        response = await client.get(f"{api_prefix}/ready")
        assert response.status_code == HTTPStatus.SERVICE_UNAVAILABLE
        assert "timed out" in response.json()["dependencies"][0]["error"]
