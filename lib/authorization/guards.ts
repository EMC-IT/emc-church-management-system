import { AuthorizationError } from '../errors';
import { hasPermission, hasAnyPermission } from './policies';

export function assertPermission(
  userPermissions: string[] = [],
  requiredPermission: string,
  roleName?: string,
  errorMessage?: string
): void {
  if (!hasPermission(userPermissions, requiredPermission, roleName)) {
    throw new AuthorizationError(
      errorMessage || `Forbidden: Missing required permission '${requiredPermission}'`
    );
  }
}

export function assertAnyPermission(
  userPermissions: string[] = [],
  requiredPermissions: string[] = [],
  roleName?: string,
  errorMessage?: string
): void {
  if (!hasAnyPermission(userPermissions, requiredPermissions, roleName)) {
    throw new AuthorizationError(
      errorMessage || `Forbidden: Requires at least one of permissions: [${requiredPermissions.join(', ')}]`
    );
  }
}

export function assertRole(
  userRole: string | undefined,
  allowedRoles: string[],
  errorMessage?: string
): void {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new AuthorizationError(
      errorMessage || `Forbidden: Role '${userRole || 'anonymous'}' is not authorized. Allowed: [${allowedRoles.join(', ')}]`
    );
  }
}
