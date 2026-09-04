"""Authentication request and response schemas.

Shapes are fixed by the canonical contract in ``API_DOCUMENTATION.md`` §Auth
and ``api-documentations/Auth_Authentication_Endpoints.md``, summarised in
``docs/backend-api-map.md`` §1::

    POST /auth/login            -> {success, data: {user, token}, message}
    GET  /auth/me               -> {success, data: user}
    PUT  /auth/change-password  -> {success, message}

``user.role.permissions`` is the flat dot-notation array the frontend's
``hasPermission()`` reads, and is **resolved server-side on every request**
rather than carried in the token (ADR-011). The login response echoes it for
UI convenience only; it is never an authorization input on the way back in.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from app.core.security.context import SecurityContext
from app.domains.identity.models import User
from app.shared.types.base import ResponseModel, StrictCamelModel

MIN_PASSWORD_LENGTH = 8
"""From ``changePasswordSchema``/``registerSchema`` in ``lib/validation/auth.ts``.

Deliberately not applied to :class:`LoginRequest`, whose own minimum of 6
comes from ``loginSchema``: tightening the rule at login would lock out any
account whose password predates the stricter rule, without making that
password any weaker or stronger.
"""


class ChangePasswordRequest(StrictCamelModel):
    """``PUT /auth/change-password``: ``{currentPassword, newPassword}``.

    ``currentPassword`` is required even though the caller is already
    authenticated -- it is what makes a stolen token insufficient to take
    permanent ownership of an account.
    """

    current_password: str = Field(min_length=1, max_length=1024)
    new_password: str = Field(min_length=MIN_PASSWORD_LENGTH, max_length=1024)


class LoginRequest(StrictCamelModel):
    """``loginSchema`` in ``lib/validation/auth.ts``: an email and a password.

    ``email`` is a plain string, deliberately **not** ``EmailStr``. At login
    the address is a lookup key for an account that already exists, not new
    data entering the system, so a format rule here can only do harm: it is
    stricter than the ``CITEXT`` column it queries and stricter than the
    frontend's ``z.string().email()``, and any address it rejects but
    admin-created user records allow becomes an account nobody can sign into.
    (``email-validator``, which backs ``EmailStr``, rejects RFC 2606 reserved
    domains such as ``@example.test`` outright.) Format validation belongs on
    user *creation*, where an address first enters the system.

    ``password``'s minimum matches ``loginSchema`` exactly.
    """

    email: str = Field(min_length=1, max_length=320)
    password: str = Field(min_length=6)


class RoleEnvelope(ResponseModel):
    """``user.role`` as ``lib/types/auth.ts``'s ``Role`` and the API docs define it.

    ``branch_id`` is the principal's *primary* branch -- the single active
    branch the frontend's ``SecurityContext.branchId`` represents. It is not
    the full assignment list, which stays server-side: the frontend has no
    branch-scope decision to make, since every endpoint re-checks
    (``backend/CLAUDE.md`` §6).
    """

    name: str
    tenant_id: uuid.UUID
    branch_id: uuid.UUID | None = None
    permissions: list[str]

    @classmethod
    def of(cls, context: SecurityContext) -> RoleEnvelope | None:
        """``None`` for a user holding no role.

        A placeholder role would have to invent a name, and the frontend reads
        this with optional chaining (``user?.role?.permissions``), so absence
        is both honest and safe.
        """
        if context.role_name is None:
            return None
        return cls(
            name=context.role_name,
            tenant_id=context.tenant_id,
            branch_id=context.primary_branch_id,
            permissions=sorted(context.permissions),
        )


class UserEnvelope(ResponseModel):
    """``user`` as ``lib/types/auth.ts``'s ``User`` defines it.

    ``name`` is derived from ``first_name``/``last_name`` rather than stored,
    per the ``User`` model's note on not persisting a second copy that could
    drift. ``password_hash`` has no field here and cannot be serialised.
    """

    id: uuid.UUID
    email: str
    name: str
    role: RoleEnvelope | None
    avatar: str | None
    created_at: datetime
    updated_at: datetime
    require_password_change: bool

    @classmethod
    def of(cls, user: User, context: SecurityContext) -> UserEnvelope:
        return cls(
            id=user.id,
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip(),
            role=RoleEnvelope.of(context),
            avatar=user.avatar_url,
            created_at=user.created_at,
            updated_at=user.updated_at,
            require_password_change=user.require_password_change,
        )


class AuthPayload(ResponseModel):
    """The ``data`` of a successful login.

    No ``refreshToken``: it is optional in the frontend's ``AuthResponse``,
    nothing reads one that login did not store, and issuing one requires the
    ``refresh_tokens`` table that ADR-011's addendum defers along with the
    session model.
    """

    user: UserEnvelope
    token: str
