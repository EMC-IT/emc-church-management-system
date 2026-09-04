"""JWT access tokens.

The claim set is the security-relevant part: a token carries identity only, so
that role and permission changes take effect immediately rather than at token
expiry (ADR-011). Tests here assert both what a token contains and, just as
importantly, what it must never contain.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
import pytest

from app.config import get_settings
from app.core.exceptions import AuthenticationError
from app.core.security.tokens import (
    TOKEN_TYPE_ACCESS,
    create_access_token,
    decode_access_token,
)

USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")
TENANT_ID = uuid.UUID("22222222-2222-2222-2222-222222222222")

FORBIDDEN_CLAIMS = ("rid", "role", "role_id", "role_key", "permissions", "perms", "scopes")
"""Claims ADR-011 forbids: authorization state a stale token could carry."""


def _token(**overrides: Any) -> str:
    kwargs: dict[str, Any] = {"user_id": USER_ID, "tenant_id": TENANT_ID}
    kwargs.update(overrides)
    return create_access_token(**kwargs)


def _payload(token: str) -> dict[str, Any]:
    decoded: dict[str, Any] = jwt.decode(token, options={"verify_signature": False})
    return decoded


class TestClaims:
    def test_carries_exactly_the_intended_claims(self) -> None:
        assert set(_payload(_token())) == {"sub", "tid", "typ", "iat", "exp"}

    def test_subject_and_tenant_round_trip(self) -> None:
        claims = decode_access_token(_token())
        assert claims.user_id == USER_ID
        assert claims.tenant_id == TENANT_ID

    @pytest.mark.parametrize("claim", FORBIDDEN_CLAIMS)
    def test_carries_no_authorization_state(self, claim: str) -> None:
        """Permissions in a token cannot be revoked before it expires."""
        assert claim not in _payload(_token())

    def test_marks_itself_an_access_token(self) -> None:
        """So a refresh token, signed by the same key in a later phase, cannot
        be replayed here."""
        assert _payload(_token())["typ"] == TOKEN_TYPE_ACCESS

    def test_expiry_follows_configured_lifetime(self) -> None:
        settings = get_settings()
        claims = decode_access_token(_token())
        lifetime = claims.expires_at - claims.issued_at
        assert lifetime == timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)


class TestVerification:
    def test_accepts_a_token_it_issued(self) -> None:
        assert decode_access_token(_token()).user_id == USER_ID

    def test_rejects_a_tampered_payload(self) -> None:
        header, _own_payload, signature = _token().split(".")
        forged = create_access_token(user_id=uuid.uuid4(), tenant_id=uuid.uuid4())
        with pytest.raises(AuthenticationError):
            decode_access_token(f"{header}.{forged.split('.')[1]}.{signature}")

    def test_rejects_a_token_signed_with_another_key(self) -> None:
        settings = get_settings()
        forged = jwt.encode(
            {
                "sub": str(USER_ID),
                "tid": str(TENANT_ID),
                "typ": TOKEN_TYPE_ACCESS,
                "iat": datetime.now(UTC),
                "exp": datetime.now(UTC) + timedelta(minutes=5),
            },
            "an-attacker-controlled-signing-key",
            algorithm=settings.ALGORITHM,
        )
        with pytest.raises(AuthenticationError):
            decode_access_token(forged)

    def test_rejects_an_unsigned_token(self) -> None:
        """``alg: none`` is refused because decode names its algorithm rather
        than trusting the token header."""
        forged = jwt.encode(
            {
                "sub": str(USER_ID),
                "tid": str(TENANT_ID),
                "typ": TOKEN_TYPE_ACCESS,
                "iat": datetime.now(UTC),
                "exp": datetime.now(UTC) + timedelta(minutes=5),
            },
            key="",
            algorithm="none",
        )
        with pytest.raises(AuthenticationError):
            decode_access_token(forged)

    def test_rejects_an_expired_token(self) -> None:
        with pytest.raises(AuthenticationError):
            decode_access_token(_token(expires_in=timedelta(minutes=-1)))

    def test_rejects_garbage(self) -> None:
        with pytest.raises(AuthenticationError):
            decode_access_token("not-a-jwt")

    def test_rejects_an_empty_token(self) -> None:
        with pytest.raises(AuthenticationError):
            decode_access_token("")

    @pytest.mark.parametrize("missing", ["sub", "tid", "typ", "exp", "iat"])
    def test_rejects_a_token_missing_a_required_claim(self, missing: str) -> None:
        settings = get_settings()
        payload = {
            "sub": str(USER_ID),
            "tid": str(TENANT_ID),
            "typ": TOKEN_TYPE_ACCESS,
            "iat": datetime.now(UTC),
            "exp": datetime.now(UTC) + timedelta(minutes=5),
        }
        del payload[missing]
        forged = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        with pytest.raises(AuthenticationError):
            decode_access_token(forged)

    def test_rejects_a_token_of_another_type(self) -> None:
        settings = get_settings()
        forged = jwt.encode(
            {
                "sub": str(USER_ID),
                "tid": str(TENANT_ID),
                "typ": "refresh",
                "iat": datetime.now(UTC),
                "exp": datetime.now(UTC) + timedelta(minutes=5),
            },
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )
        with pytest.raises(AuthenticationError):
            decode_access_token(forged)

    @pytest.mark.parametrize("claim", ["sub", "tid"])
    def test_rejects_a_non_uuid_identifier(self, claim: str) -> None:
        settings = get_settings()
        payload = {
            "sub": str(USER_ID),
            "tid": str(TENANT_ID),
            "typ": TOKEN_TYPE_ACCESS,
            "iat": datetime.now(UTC),
            "exp": datetime.now(UTC) + timedelta(minutes=5),
        }
        payload[claim] = "'; DROP TABLE users; --"
        forged = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        with pytest.raises(AuthenticationError):
            decode_access_token(forged)

    def test_failures_reveal_nothing_specific(self) -> None:
        """Every rejection carries the same message: which check failed helps
        only someone probing for valid identifiers."""
        messages = set()
        for bad in ("not-a-jwt", "", "a.b.c"):
            try:
                decode_access_token(bad)
            except AuthenticationError as exc:
                messages.add(str(exc))
        assert len(messages) == 1
