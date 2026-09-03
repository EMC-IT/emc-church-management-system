"""Password hashing: Argon2id via pwdlib, per ADR-004.

Isolated here, with no dependency on any domain, so the login flow that will
consume it (a later phase) has one tested entry point rather than every call
site re-deriving Argon2 parameters. This module intentionally stops at
hashing -- it does not authenticate, issue tokens, or touch the database.
"""

from __future__ import annotations

from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

_password_hash = PasswordHash((Argon2Hasher(),))


def hash_password(password: str) -> str:
    """Hash a plaintext password. The result is what gets persisted."""
    return _password_hash.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check a plaintext password against a stored hash."""
    return _password_hash.verify(password, password_hash)


def verify_and_rehash(password: str, password_hash: str) -> tuple[bool, str | None]:
    """Verify a password, and return a rehash if the stored hash is outdated.

    The second element is a new hash to persist when Argon2 parameters have
    moved on since this hash was created, or ``None`` when the existing hash
    is still current. The login flow that consumes this should persist a
    non-``None`` result -- a transparent parameter upgrade on next successful
    login, with no bulk migration required.
    """
    return _password_hash.verify_and_update(password, password_hash)
