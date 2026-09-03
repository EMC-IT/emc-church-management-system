"""Application configuration.

All runtime configuration is resolved here from environment variables via
pydantic-settings. Nothing in the application reads ``os.environ`` directly.
"""

from __future__ import annotations

import secrets
from enum import StrEnum
from functools import lru_cache
from typing import Annotated, Literal, Self

from pydantic import Field, PostgresDsn, RedisDsn, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# A development-only placeholder. Any deployment that is not `development` or
# `test` must override SECRET_KEY, and startup fails loudly if it does not.
_INSECURE_SECRET_KEY_SENTINEL = "insecure-development-only-secret-key-do-not-use-in-production"  # noqa: S105

MIN_SECRET_KEY_LENGTH = 32


class Environment(StrEnum):
    """Deployment environment."""

    DEVELOPMENT = "development"
    TEST = "test"
    STAGING = "staging"
    PRODUCTION = "production"

    @property
    def is_deployed(self) -> bool:
        """True for environments that serve real users and real data."""
        return self in (Environment.STAGING, Environment.PRODUCTION)


class Settings(BaseSettings):
    """Global application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "EMC Church Management System API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: Environment = Environment.DEVELOPMENT
    DEBUG: bool = False

    SECRET_KEY: str = _INSECURE_SECRET_KEY_SENTINEL
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ALGORITHM: str = "HS256"

    ENABLE_DOCS: bool | None = None

    BACKEND_CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )

    DATABASE_URL: PostgresDsn = Field(
        default=PostgresDsn("postgresql+asyncpg://postgres:postgres@localhost:5432/emc_church_db")
    )
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10
    DATABASE_POOL_TIMEOUT: int = 30
    DATABASE_POOL_RECYCLE: int = 1800
    DATABASE_ECHO: bool = False

    REDIS_URL: RedisDsn = Field(default=RedisDsn("redis://localhost:6379/0"))
    REDIS_MAX_CONNECTIONS: int = 20
    REDIS_SOCKET_TIMEOUT: float = 5.0

    CELERY_BROKER_URL: RedisDsn = Field(default=RedisDsn("redis://localhost:6379/1"))
    CELERY_RESULT_BACKEND: RedisDsn = Field(default=RedisDsn("redis://localhost:6379/2"))
    CELERY_TASK_ALWAYS_EAGER: bool = False

    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    S3_ENDPOINT_URL: str = ""
    S3_ACCESS_KEY_ID: str = ""
    S3_SECRET_ACCESS_KEY: str = ""
    S3_REGION: str = "us-east-1"
    S3_BUCKET_NAME: str = "emc-church-vault"

    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    LOG_FORMAT: Literal["json", "console"] = "json"
    # Health probes are noisy; excluded from access logs by default.
    LOG_EXCLUDE_PATHS: list[str] = Field(default_factory=lambda: ["/api/v1/health"])

    READINESS_TIMEOUT_SECONDS: float = 3.0

    @field_validator("BACKEND_CORS_ORIGINS", "LOG_EXCLUDE_PATHS", mode="before")
    @classmethod
    def _split_comma_separated(cls, value: object) -> object:
        """Accept either a JSON array or a plain comma-separated string."""
        if isinstance(value, str) and not value.startswith("["):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value

    @field_validator("API_V1_STR")
    @classmethod
    def _validate_api_prefix(cls, value: str) -> str:
        if not value.startswith("/"):
            raise ValueError("API_V1_STR must start with '/'")
        return value.rstrip("/")

    @model_validator(mode="after")
    def _enforce_deployment_invariants(self) -> Self:
        """Refuse to start a deployed environment with unsafe configuration.

        This is deliberately a hard failure rather than a warning: a production
        process running on the development signing key would issue forgeable
        tokens, and a warning in a log nobody reads is not a control.
        """
        if not self.ENVIRONMENT.is_deployed:
            return self

        problems: list[str] = []

        if self.SECRET_KEY == _INSECURE_SECRET_KEY_SENTINEL:
            problems.append("SECRET_KEY must be set to a generated value")
        if len(self.SECRET_KEY) < MIN_SECRET_KEY_LENGTH:
            problems.append(f"SECRET_KEY must be at least {MIN_SECRET_KEY_LENGTH} characters")
        if self.DEBUG:
            problems.append("DEBUG must be false")
        if "*" in self.BACKEND_CORS_ORIGINS:
            problems.append("BACKEND_CORS_ORIGINS must not contain '*' (credentials are allowed)")
        if self.DATABASE_ECHO:
            problems.append("DATABASE_ECHO must be false (it logs statement parameters)")
        if self.CELERY_TASK_ALWAYS_EAGER:
            problems.append("CELERY_TASK_ALWAYS_EAGER must be false")

        if problems:
            joined = "\n  - ".join(problems)
            raise ValueError(
                f"Refusing to start in ENVIRONMENT={self.ENVIRONMENT}:\n  - {joined}\n"
                'Generate a key with: python -c "import secrets; print(secrets.token_urlsafe(48))"'
            )
        return self

    @property
    def docs_enabled(self) -> bool:
        """Whether OpenAPI/Swagger/ReDoc are served."""
        if self.ENABLE_DOCS is not None:
            return self.ENABLE_DOCS
        return not self.ENVIRONMENT.is_deployed

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT is Environment.TEST

    @property
    def database_url_str(self) -> str:
        """DSN as a plain string for SQLAlchemy/Alembic."""
        return str(self.DATABASE_URL)

    def health_url(self) -> str:
        return f"{self.API_V1_STR}/health"

    def readiness_url(self) -> str:
        return f"{self.API_V1_STR}/ready"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the process-wide settings singleton.

    Cached so that configuration is parsed and validated exactly once. Tests
    that need to vary configuration should call ``get_settings.cache_clear()``.
    """
    return Settings()


def generate_secret_key() -> str:
    """Generate a signing key suitable for SECRET_KEY."""
    return secrets.token_urlsafe(48)


settings: Annotated[Settings, "process-wide settings"] = get_settings()
