import { TenantIsolationError } from '../errors';

export interface SecurityContext {
  tenantId: string;
  branchId?: string;
  userId: string;
  userEmail: string;
  role: string;
  permissions: string[];
  assignedBranchIds: string[];
  isSuperAdmin: boolean;
}

/**
 * Validates that an operation attempting to access a tenant resource belongs to the active tenant.
 */
export function validateTenantScope(context: SecurityContext, targetTenantId: string): void {
  if (context.isSuperAdmin) {
    return;
  }
  if (!context.tenantId || context.tenantId !== targetTenantId) {
    throw new TenantIsolationError(`Tenant isolation violation: user belongs to tenant '${context.tenantId}' but requested access to '${targetTenantId}'`);
  }
}

/**
 * Validates that an operation attempting to access a branch resource is permitted for the active user.
 */
export function validateBranchScope(context: SecurityContext, targetBranchId?: string): void {
  if (context.isSuperAdmin || !targetBranchId) {
    return;
  }
  // If user is assigned to specific branches, ensure target is in their assigned list
  if (context.assignedBranchIds.length > 0 && !context.assignedBranchIds.includes(targetBranchId)) {
    throw new TenantIsolationError(`Branch isolation violation: user does not have permission to access branch '${targetBranchId}'`);
  }
}

/**
 * Derives a trusted scoped filter payload for service and query execution.
 */
export function applyScopeFilters<T extends Record<string, any>>(
  context: SecurityContext,
  params: T
): T & { tenantId: string; branchId?: string } {
  const scoped: T & { tenantId: string; branchId?: string } = {
    ...params,
    tenantId: context.tenantId,
  };

  if (context.branchId && !context.isSuperAdmin) {
    scoped.branchId = context.branchId;
  }

  return scoped;
}
