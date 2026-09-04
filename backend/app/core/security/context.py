"""The authenticated principal's effective authorization state.

One representation, built once per request from current database state, used
by every authorization decision. Domains consume it; none of them re-derives
tenant, role, permission or branch state of their own (ADR-011).

There is deliberately **no** ``is_super_admin`` field. ``SuperAdmin`` is a
tenant role like any other and is authorized through exactly the same path --
it passes checks because its role genuinely grants every permission code, not
because a branch is taken (ADR-010). A boolean whose only purpose is to skip
checks is an invitation to skip them.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from app.core.exceptions import AuthorizationError, TenantIsolationError


@dataclass(frozen=True, slots=True)
class SecurityContext:
    """Who the caller is and what they may do, as of this request.

    Frozen, with ``frozenset`` collections, so nothing downstream can widen its
    own authority by mutating the context it was handed.

    ``role_key`` and ``role_name`` are carried for audit records
    (``audit_logs.actor_role``) and for the login response's
    ``user.role.name``. **Branching on either is an ADR-011 violation** --
    authorization reads :attr:`permissions`, which is what makes a church's
    custom role work identically to a built-in one.
    """

    user_id: uuid.UUID
    tenant_id: uuid.UUID
    role_id: uuid.UUID | None
    role_key: str | None
    role_name: str | None
    permissions: frozenset[str]
    assigned_branch_ids: frozenset[uuid.UUID]
    primary_branch_id: uuid.UUID | None

    def has_permission(self, code: str) -> bool:
        """Whether this principal holds ``code``.

        An unknown or misspelled code is simply not in the set, so it denies.
        """
        return code in self.permissions

    def has_any_permission(self, *codes: str) -> bool:
        return any(code in self.permissions for code in codes)

    def has_all_permissions(self, *codes: str) -> bool:
        # An empty requirement must not authorize; a caller asking for nothing
        # is a bug, and returning True would silently pass the check.
        return bool(codes) and all(code in self.permissions for code in codes)

    def can_access_branch(self, branch_id: uuid.UUID) -> bool:
        """Whether this principal may act in ``branch_id``.

        Membership of :attr:`assigned_branch_ids` and nothing else. An empty
        assignment set therefore denies every branch -- the frontend's
        ``validateBranchScope`` treats empty as unrestricted, which ADR-003
        already requires be inverted server-side.
        """
        return branch_id in self.assigned_branch_ids

    def require_permission(self, code: str) -> None:
        """Raise 403 unless this principal holds ``code``."""
        if not self.has_permission(code):
            raise AuthorizationError()

    def require_branch(self, branch_id: uuid.UUID) -> None:
        """Raise 403 unless this principal is assigned to ``branch_id``."""
        if not self.can_access_branch(branch_id):
            raise AuthorizationError("Access denied for the requested branch")

    def require_tenant(self, tenant_id: uuid.UUID) -> None:
        """Raise 403 unless ``tenant_id`` is this principal's own tenant.

        For a tenant id that arrived in a path, query string or body: it is a
        resource identifier to be checked, never an authorization input
        (ADR-011). Callers that must not confirm the resource exists at all
        should catch this and raise ``NotFoundError`` instead.
        """
        if tenant_id != self.tenant_id:
            raise TenantIsolationError()
