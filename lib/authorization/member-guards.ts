import { AuthorizationError } from '../errors';
import { MemberPermission, DEFAULT_MEMBER_PERMISSIONS } from './member-permissions';

export function hasMemberPermission(
  grantedPermissions: string[] = DEFAULT_MEMBER_PERMISSIONS,
  requiredPermission: MemberPermission
): boolean {
  return grantedPermissions.includes(requiredPermission);
}

export function assertMemberPermission(
  grantedPermissions: string[] = DEFAULT_MEMBER_PERMISSIONS,
  requiredPermission: MemberPermission,
  errorMessage?: string
): void {
  if (!hasMemberPermission(grantedPermissions, requiredPermission)) {
    throw new AuthorizationError(
      errorMessage || `Forbidden: Missing required member permission '${requiredPermission}'`
    );
  }
}
