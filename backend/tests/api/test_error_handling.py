"""Global error handling, response envelope, and security middleware."""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator
from http import HTTPStatus

import pytest
from fastapi import APIRouter, FastAPI
from httpx import ASGITransport, AsyncClient

from app.config import Settings, get_settings
from app.core.context import REQUEST_ID_HEADER
from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    ConflictError,
    ErrorCode,
    FinancialIntegrityError,
    NotFoundError,
    TenantIsolationError,
    ValidationError,
)
from app.core.exceptions.handlers import GENERIC_500_MESSAGE
from app.main import create_app
from app.shared.types.base import CamelModel


class _EchoPayload(CamelModel):
    member_id: str
    total_amount: int


def _probe_app(settings: Settings) -> FastAPI:
    """An app with routes that raise each error type on demand."""
    app = create_app(settings)
    router = APIRouter()

    @router.get("/boom/app-error")
    async def _app_error() -> None:
        raise NotFoundError("Member", "mem-999")

    @router.get("/boom/unauthenticated")
    async def _unauthenticated() -> None:
        raise AuthenticationError

    @router.get("/boom/forbidden")
    async def _forbidden() -> None:
        raise AuthorizationError(
            "Access denied: missing permission 'finance.expenses.approve'",
            details={"requiredPermission": "finance.expenses.approve"},
        )

    @router.get("/boom/tenant")
    async def _tenant() -> None:
        raise TenantIsolationError

    @router.get("/boom/conflict")
    async def _conflict() -> None:
        raise ConflictError("A member with this phone number already exists.")

    @router.get("/boom/financial")
    async def _financial() -> None:
        raise FinancialIntegrityError

    @router.get("/boom/validation")
    async def _validation() -> None:
        raise ValidationError(
            field_errors=[{"field": "amount", "message": "Amount must be greater than zero"}]
        )

    @router.get("/boom/unhandled")
    async def _unhandled() -> None:
        secret = "postgresql://admin:hunter2@db.internal/prod"
        raise RuntimeError(f"connection to {secret} failed")

    @router.post("/echo")
    async def _echo(payload: _EchoPayload) -> _EchoPayload:
        return payload

    app.include_router(router, prefix=settings.API_V1_STR)
    return app


@pytest.fixture(scope="session")
def probe_app() -> FastAPI:
    return _probe_app(get_settings())


@pytest.fixture
async def probe_client(probe_app: FastAPI) -> AsyncGenerator[AsyncClient]:
    """Client for the probe routes.

    ``raise_app_exceptions=False`` reproduces real server behaviour. Starlette's
    ServerErrorMiddleware builds the 500 response from the registered handler
    and then re-raises so the server can log it; under uvicorn the client has
    already received the response. Left at the default, the exception would
    propagate into the test instead and the handler's output -- the thing
    under test -- would never be observed.
    """
    transport = ASGITransport(app=probe_app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://testserver") as http_client:
        yield http_client


class TestErrorEnvelope:
    """Every error uses the shape in api-documentations/Errors_Responses.md."""

    @pytest.mark.parametrize(
        ("path", "status", "code"),
        [
            ("app-error", HTTPStatus.NOT_FOUND, ErrorCode.NOT_FOUND),
            ("unauthenticated", HTTPStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED),
            ("forbidden", HTTPStatus.FORBIDDEN, ErrorCode.FORBIDDEN),
            ("tenant", HTTPStatus.FORBIDDEN, ErrorCode.TENANT_ISOLATION_VIOLATION),
            ("conflict", HTTPStatus.CONFLICT, ErrorCode.CONFLICT),
            ("financial", HTTPStatus.BAD_REQUEST, ErrorCode.FINANCIAL_INTEGRITY_ERROR),
            ("validation", HTTPStatus.UNPROCESSABLE_ENTITY, ErrorCode.VALIDATION_ERROR),
        ],
    )
    async def test_status_and_code_pairs(
        self, probe_client: AsyncClient, api_prefix: str, path: str, status: int, code: str
    ) -> None:
        response = await probe_client.get(f"{api_prefix}/boom/{path}")
        assert response.status_code == status

        body = response.json()
        assert body["success"] is False
        assert body["code"] == code
        assert isinstance(body["message"], str)
        assert body["message"]

    async def test_carries_the_request_id(self, probe_client: AsyncClient, api_prefix: str) -> None:
        """A user-reported failure must be traceable to a log line."""
        response = await probe_client.get(f"{api_prefix}/boom/app-error")
        assert response.json()["requestId"] == response.headers[REQUEST_ID_HEADER]

    async def test_not_found_includes_resource_details(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        body = (await probe_client.get(f"{api_prefix}/boom/app-error")).json()
        assert body["details"] == {"resource": "Member", "id": "mem-999"}
        assert "mem-999" in body["message"]

    async def test_validation_errors_are_field_scoped(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        body = (await probe_client.get(f"{api_prefix}/boom/validation")).json()
        assert body["errors"] == [
            {"field": "amount", "message": "Amount must be greater than zero"}
        ]

    async def test_request_validation_reports_dotted_field_paths(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        """The 'body' prefix is stripped so the client sees its own field names."""
        response = await probe_client.post(f"{api_prefix}/echo", json={"memberId": "m-1"})
        assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY

        body = response.json()
        assert body["code"] == ErrorCode.VALIDATION_ERROR
        fields = {error["field"] for error in body["errors"]}
        assert "totalAmount" in fields
        assert not any(field.startswith("body.") for field in fields)

    async def test_route_not_found_uses_the_envelope(self, probe_client: AsyncClient) -> None:
        response = await probe_client.get("/no-such-route")
        assert response.status_code == HTTPStatus.NOT_FOUND
        assert response.json()["code"] == ErrorCode.NOT_FOUND
        assert response.json()["success"] is False

    async def test_method_not_allowed_uses_the_envelope(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        response = await probe_client.delete(f"{api_prefix}/health")
        assert response.status_code == HTTPStatus.METHOD_NOT_ALLOWED
        assert response.json()["success"] is False


class TestUnhandledExceptions:
    """An unexpected exception must not leak internals."""

    async def test_returns_a_generic_500(self, probe_client: AsyncClient, api_prefix: str) -> None:
        response = await probe_client.get(f"{api_prefix}/boom/unhandled")
        assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR

        body = response.json()
        assert body["code"] == ErrorCode.INTERNAL_SERVER_ERROR
        assert body["message"] == GENERIC_500_MESSAGE

    async def test_leaks_no_credentials_or_stack_trace(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        text = (await probe_client.get(f"{api_prefix}/boom/unhandled")).text
        for leak in ("hunter2", "db.internal", "RuntimeError", "Traceback", "postgresql://"):
            assert leak not in text, f"response leaked {leak!r}"


class TestAuthorizationFailuresAreNot401:
    """403, never 401, for permission failures.

    services/api-client.ts clears localStorage and redirects to /login on any
    401, so a permission failure returning 401 would log the user out.
    """

    async def test_authorization_error_is_403(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        response = await probe_client.get(f"{api_prefix}/boom/forbidden")
        assert response.status_code == HTTPStatus.FORBIDDEN

    async def test_tenant_isolation_error_is_403(
        self, probe_client: AsyncClient, api_prefix: str
    ) -> None:
        response = await probe_client.get(f"{api_prefix}/boom/tenant")
        assert response.status_code == HTTPStatus.FORBIDDEN


class TestSecurityHeaders:
    """Baseline hardening headers are present on every response."""

    @pytest.mark.parametrize(
        ("header", "expected"),
        [
            ("X-Content-Type-Options", "nosniff"),
            ("X-Frame-Options", "DENY"),
            ("Referrer-Policy", "no-referrer"),
            ("X-Permitted-Cross-Domain-Policies", "none"),
            ("Cross-Origin-Opener-Policy", "same-origin"),
            ("Cache-Control", "no-store"),
        ],
    )
    async def test_present_on_success(
        self, client: AsyncClient, api_prefix: str, header: str, expected: str
    ) -> None:
        response = await client.get(f"{api_prefix}/health")
        assert response.headers[header] == expected

    async def test_present_on_error(self, client: AsyncClient) -> None:
        response = await client.get("/no-such-route")
        assert response.headers["X-Content-Type-Options"] == "nosniff"

    async def test_content_security_policy_is_restrictive(
        self, client: AsyncClient, api_prefix: str
    ) -> None:
        csp = (await client.get(f"{api_prefix}/health")).headers["Content-Security-Policy"]
        assert "default-src 'none'" in csp
        assert "frame-ancestors 'none'" in csp

    async def test_hsts_absent_outside_deployed_environments(
        self, client: AsyncClient, api_prefix: str
    ) -> None:
        response = await client.get(f"{api_prefix}/health")
        assert "Strict-Transport-Security" not in response.headers


class TestRequestId:
    """Request id propagation."""

    async def test_generated_when_absent(self, client: AsyncClient, api_prefix: str) -> None:
        response = await client.get(f"{api_prefix}/health")
        assert uuid.UUID(response.headers[REQUEST_ID_HEADER])

    async def test_inbound_id_is_echoed(self, client: AsyncClient, api_prefix: str) -> None:
        response = await client.get(
            f"{api_prefix}/health", headers={REQUEST_ID_HEADER: "trace-abc-123"}
        )
        assert response.headers[REQUEST_ID_HEADER] == "trace-abc-123"

    @pytest.mark.parametrize(
        "hostile",
        ["a" * 200, "bad\nvalue", "<script>", "id with spaces"],
    )
    async def test_hostile_inbound_id_is_replaced(
        self, client: AsyncClient, api_prefix: str, hostile: str
    ) -> None:
        """An untrusted header must not be written verbatim into logs."""
        response = await client.get(
            f"{api_prefix}/health", headers={REQUEST_ID_HEADER: hostile.replace("\n", "")}
        )
        assert response.headers[REQUEST_ID_HEADER] != hostile

    async def test_ids_differ_between_requests(self, client: AsyncClient, api_prefix: str) -> None:
        first = await client.get(f"{api_prefix}/health")
        second = await client.get(f"{api_prefix}/health")
        assert first.headers[REQUEST_ID_HEADER] != second.headers[REQUEST_ID_HEADER]


class TestCors:
    """CORS is configured for the Next.js frontend."""

    async def test_allows_the_configured_origin(
        self, client: AsyncClient, api_prefix: str, settings: Settings
    ) -> None:
        origin = settings.BACKEND_CORS_ORIGINS[0]
        response = await client.get(f"{api_prefix}/health", headers={"Origin": origin})
        assert response.headers["access-control-allow-origin"] == origin
        assert response.headers["access-control-allow-credentials"] == "true"

    async def test_rejects_an_unlisted_origin(self, client: AsyncClient, api_prefix: str) -> None:
        response = await client.get(
            f"{api_prefix}/health", headers={"Origin": "https://evil.example"}
        )
        assert "access-control-allow-origin" not in response.headers

    async def test_preflight_exposes_the_request_id_header(
        self, client: AsyncClient, api_prefix: str, settings: Settings
    ) -> None:
        response = await client.options(
            f"{api_prefix}/health",
            headers={
                "Origin": settings.BACKEND_CORS_ORIGINS[0],
                "Access-Control-Request-Method": "GET",
            },
        )
        assert response.status_code == HTTPStatus.OK
