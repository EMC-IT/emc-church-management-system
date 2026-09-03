"""Configuration loading and deployment safety invariants."""

from __future__ import annotations

from typing import Any

import pytest
from pydantic import ValidationError as PydanticValidationError

from app.config import (
    _INSECURE_SECRET_KEY_SENTINEL as _PLACEHOLDER_SECRET,
)
from app.config import (
    MIN_SECRET_KEY_LENGTH,
    Environment,
    Settings,
    generate_secret_key,
    get_settings,
)

# Every field the deployment validator inspects is set explicitly, so these
# cases do not inherit the ambient test environment (which enables eager
# Celery) and change meaning depending on how the suite was invoked.
_SAFE_DEPLOYED: dict[str, Any] = {
    "ENVIRONMENT": "production",
    "SECRET_KEY": "x" * 64,
    "DEBUG": False,
    "BACKEND_CORS_ORIGINS": ["https://emc.church"],
    "DATABASE_ECHO": False,
    "CELERY_TASK_ALWAYS_EAGER": False,
}


def _deployed(**overrides: Any) -> Settings:
    """Build production settings with every validated field set explicitly."""
    return Settings(**{**_SAFE_DEPLOYED, **overrides})


def _deployed_without(field: str, **overrides: Any) -> Settings:
    """Build production settings with one field left at its default."""
    base = {k: v for k, v in _SAFE_DEPLOYED.items() if k != field}
    return Settings(**{**base, **overrides})


class TestDefaults:
    def test_api_prefix_is_versioned(self) -> None:
        assert Settings().API_V1_STR == "/api/v1"

    def test_trailing_slash_is_stripped(self) -> None:
        assert Settings(API_V1_STR="/api/v1/").API_V1_STR == "/api/v1"

    def test_prefix_must_be_absolute(self) -> None:
        with pytest.raises(PydanticValidationError, match="must start with"):
            Settings(API_V1_STR="api/v1")

    def test_probe_urls_use_the_prefix(self) -> None:
        settings = Settings()
        assert settings.health_url() == "/api/v1/health"
        assert settings.readiness_url() == "/api/v1/ready"

    def test_settings_are_cached(self) -> None:
        assert get_settings() is get_settings()


class TestCommaSeparatedLists:
    """Env vars arrive as strings; list fields accept both forms."""

    def test_cors_origins_from_comma_separated_string(self) -> None:
        settings = Settings.model_validate({"BACKEND_CORS_ORIGINS": "http://a.test, http://b.test"})
        assert settings.BACKEND_CORS_ORIGINS == ["http://a.test", "http://b.test"]

    def test_cors_origins_from_list(self) -> None:
        settings = Settings(BACKEND_CORS_ORIGINS=["http://a.test"])
        assert settings.BACKEND_CORS_ORIGINS == ["http://a.test"]

    def test_blank_entries_are_dropped(self) -> None:
        settings = Settings.model_validate({"BACKEND_CORS_ORIGINS": "http://a.test,,  ,"})
        assert settings.BACKEND_CORS_ORIGINS == ["http://a.test"]


class TestEnvironment:
    @pytest.mark.parametrize(
        ("environment", "deployed"),
        [
            (Environment.DEVELOPMENT, False),
            (Environment.TEST, False),
            (Environment.STAGING, True),
            (Environment.PRODUCTION, True),
        ],
    )
    def test_is_deployed(self, environment: Environment, deployed: bool) -> None:
        assert environment.is_deployed is deployed

    def test_docs_are_served_in_development(self) -> None:
        assert Settings.model_validate({"ENVIRONMENT": "development"}).docs_enabled is True

    def test_docs_are_hidden_in_production(self) -> None:
        assert _deployed().docs_enabled is False

    def test_docs_can_be_forced_on(self) -> None:
        assert _deployed(ENABLE_DOCS=True).docs_enabled is True


class TestDeploymentSafety:
    """Staging and production refuse to start with unsafe configuration.

    Each of these is a hard failure rather than a warning: a production process
    running on the development signing key would issue forgeable tokens, and a
    warning in a log nobody reads is not a control.
    """

    def test_development_tolerates_the_placeholder_key(self) -> None:
        assert Settings.model_validate({"ENVIRONMENT": "development"}).SECRET_KEY

    def test_production_rejects_the_placeholder_key(self) -> None:
        with pytest.raises(PydanticValidationError, match="SECRET_KEY must be set"):
            _deployed_without("SECRET_KEY")

    def test_production_rejects_a_short_key(self) -> None:
        with pytest.raises(PydanticValidationError, match="at least"):
            _deployed(SECRET_KEY="too-short")  # noqa: S106

    def test_production_rejects_debug(self) -> None:
        with pytest.raises(PydanticValidationError, match="DEBUG must be false"):
            _deployed(DEBUG=True)

    def test_production_rejects_wildcard_cors(self) -> None:
        """allow_credentials=True with '*' would expose every origin."""
        with pytest.raises(PydanticValidationError, match=r"must not contain"):
            _deployed(BACKEND_CORS_ORIGINS=["*"])

    def test_production_rejects_statement_echo(self) -> None:
        """DATABASE_ECHO logs bound parameters, including personal data."""
        with pytest.raises(PydanticValidationError, match="DATABASE_ECHO"):
            _deployed(DATABASE_ECHO=True)

    def test_production_rejects_eager_celery(self) -> None:
        with pytest.raises(PydanticValidationError, match="CELERY_TASK_ALWAYS_EAGER"):
            _deployed(CELERY_TASK_ALWAYS_EAGER=True)

    def test_staging_is_held_to_the_same_standard(self) -> None:
        with pytest.raises(PydanticValidationError, match="SECRET_KEY"):
            _deployed_without("SECRET_KEY", ENVIRONMENT="staging")

    def test_a_correctly_configured_production_starts(self) -> None:
        assert _deployed().ENVIRONMENT is Environment.PRODUCTION

    def test_all_problems_are_reported_at_once(self) -> None:
        """An operator fixing config should see every problem, not the first."""
        with pytest.raises(PydanticValidationError) as exc_info:
            _deployed(
                SECRET_KEY=_PLACEHOLDER_SECRET,
                DEBUG=True,
                BACKEND_CORS_ORIGINS=["*"],
            )

        message = str(exc_info.value)
        assert "SECRET_KEY" in message
        assert "DEBUG" in message
        assert "BACKEND_CORS_ORIGINS" in message


class TestSecretKeyGeneration:
    """The helper an operator is told to use."""

    def test_generates_a_sufficiently_long_key(self) -> None:
        assert len(generate_secret_key()) >= MIN_SECRET_KEY_LENGTH

    def test_generates_a_distinct_key_each_call(self) -> None:
        assert generate_secret_key() != generate_secret_key()

    def test_generated_key_satisfies_production(self) -> None:
        settings = _deployed(SECRET_KEY=generate_secret_key())
        assert settings.ENVIRONMENT is Environment.PRODUCTION


class TestTestEnvironment:
    """The suite runs against isolated infrastructure."""

    def test_environment_is_test(self, settings: Settings) -> None:
        assert settings.ENVIRONMENT is Environment.TEST
        assert settings.is_testing is True
