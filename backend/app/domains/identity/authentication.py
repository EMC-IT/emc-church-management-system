"""Credential authentication: the login half of the identity domain.

Separate from ``authorization.py``, which answers "what may this principal
do". This module answers only "is this principal who they claim to be", and
deliberately knows nothing about roles, permissions or branches.

Every rejection is the same ``AuthenticationError`` with the same message.
That is a requirement, not tidiness: distinguishing "no such email" from
"wrong password" from "account suspended" turns the login endpoint into an
account-enumeration oracle, and none of those distinctions helps a legitimate
user, whose remedy is identical in every case.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import utcnow
from app.core.exceptions import AuthenticationError, ValidationError
from app.core.security.passwords import hash_password, verify_and_rehash, verify_password
from app.domains.identity.models import User, UserStatus

# Verified on every failed login so that a request for a nonexistent account
# costs the same Argon2 work as one for a real account. Without it, response
# time alone distinguishes the two.
_TIMING_EQUALISER_HASH = hash_password(str(uuid.uuid4()))


async def authenticate(session: AsyncSession, *, email: str, password: str) -> User:
    """Verify credentials and return the authenticated user.

    Raises :class:`AuthenticationError` -- indistinguishably -- when the email
    is unknown, the password is wrong, or the account is soft-deleted,
    inactive or suspended.

    On success the user's ``last_login_at`` is stamped and, if Argon2's
    parameters have moved on since the stored hash was made, the hash is
    transparently upgraded. Neither happens on a failed attempt.
    """
    user = await _find_by_email(session, email)

    if user is None:
        # Do the work anyway, then fail: an early return here is a timing
        # side channel that reveals which emails exist.
        verify_and_rehash(password, _TIMING_EQUALISER_HASH)
        raise AuthenticationError()

    matched, upgraded_hash = verify_and_rehash(password, user.password_hash)
    if not matched or not _is_usable(user):
        raise AuthenticationError()

    if upgraded_hash is not None:
        user.password_hash = upgraded_hash
    user.last_login_at = utcnow()
    await session.flush()

    return user


async def _find_by_email(session: AsyncSession, email: str) -> User | None:
    """Look a user up by email.

    ``users.email`` is ``CITEXT`` and unique per tenant, not globally
    (ADR-006), so the same address may exist in several churches. Login
    carries no tenant -- the frontend's ``loginSchema`` is ``{email,
    password}`` and nothing in the contract identifies a church -- so a
    genuinely ambiguous address cannot be resolved here and is rejected rather
    than guessed. See ADR-012.
    """
    result = await session.execute(
        select(User).where(User.email == email, User.deleted_at.is_(None)).limit(2)
    )
    users = result.scalars().all()
    return users[0] if len(users) == 1 else None


def _is_usable(user: User) -> bool:
    """Whether this account may hold a session at all.

    Mirrors ``load_authenticated_user``: an account that cannot carry a
    request must not be able to obtain a token for one either.
    """
    return user.deleted_at is None and user.status is UserStatus.ACTIVE


async def change_password(
    session: AsyncSession, user: User, *, current_password: str, new_password: str
) -> None:
    """Replace an authenticated user's password.

    A wrong ``current_password`` is reported as a **422 field error**, not a
    401: the caller's session is valid and 401 would log them out, because
    ``services/api-client.ts`` clears local storage and redirects on any 401
    (``backend-security-plan.md`` §2.3). There is no enumeration concern to
    trade against -- the caller is already authenticated as this account.

    Reusing the current password is refused. Otherwise a user whose
    ``require_password_change`` was set could clear the flag by "changing"
    their password to the one an administrator gave them, which is the exact
    state the flag exists to end.
    """
    if not verify_password(current_password, user.password_hash):
        raise ValidationError(
            "Current password is incorrect",
            field_errors=[{"field": "currentPassword", "message": "Current password is incorrect"}],
        )

    if verify_password(new_password, user.password_hash):
        raise ValidationError(
            "New password must differ from the current password",
            field_errors=[
                {
                    "field": "newPassword",
                    "message": "New password must differ from the current password",
                }
            ],
        )

    user.password_hash = hash_password(new_password)
    user.require_password_change = False
    await session.flush()
