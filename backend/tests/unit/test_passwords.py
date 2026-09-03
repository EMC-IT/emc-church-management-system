"""Password hashing: Argon2id via pwdlib (ADR-004)."""

from __future__ import annotations

from app.core.security.passwords import hash_password, verify_and_rehash, verify_password


class TestHashPassword:
    def test_produces_an_argon2id_hash(self) -> None:
        assert hash_password("correct horse battery staple").startswith("$argon2id$")

    def test_never_stores_the_plaintext(self) -> None:
        password = "correct horse battery staple"
        assert password not in hash_password(password)

    def test_same_password_hashes_differently_each_time(self) -> None:
        """A random salt per hash -- two users with the same password must
        not be detectable by comparing stored hashes."""
        password = "correct horse battery staple"
        assert hash_password(password) != hash_password(password)


class TestVerifyPassword:
    def test_correct_password_verifies(self) -> None:
        password_hash = hash_password("correct horse battery staple")
        assert verify_password("correct horse battery staple", password_hash) is True

    def test_incorrect_password_is_rejected(self) -> None:
        password_hash = hash_password("correct horse battery staple")
        assert verify_password("wrong password", password_hash) is False


class TestVerifyAndRehash:
    def test_valid_password_with_current_parameters_needs_no_rehash(self) -> None:
        password_hash = hash_password("correct horse battery staple")
        verified, new_hash = verify_and_rehash("correct horse battery staple", password_hash)

        assert verified is True
        assert new_hash is None

    def test_incorrect_password_is_rejected_without_a_rehash(self) -> None:
        password_hash = hash_password("correct horse battery staple")
        verified, new_hash = verify_and_rehash("wrong password", password_hash)

        assert verified is False
        assert new_hash is None
