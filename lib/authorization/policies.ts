import { ROLES } from './roles';

export function hasPermission(userPermissions: string[] = [], requiredPermission: string, roleName?: string): boolean {
  if (roleName === ROLES.SUPER_ADMIN || roleName === 'super_admin') {
    return true;
  }
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[] = [], requiredPermissions: string[] = [], roleName?: string): boolean {
  if (roleName === ROLES.SUPER_ADMIN || roleName === 'super_admin') {
    return true;
  }
  return requiredPermissions.some(perm => userPermissions.includes(perm));
}

export function hasAllPermissions(userPermissions: string[] = [], requiredPermissions: string[] = [], roleName?: string): boolean {
  if (roleName === ROLES.SUPER_ADMIN || roleName === 'super_admin') {
    return true;
  }
  return requiredPermissions.every(perm => userPermissions.includes(perm));
}

export function canAccessFinancials(roleName?: string, userPermissions: string[] = []): boolean {
  if (roleName === ROLES.SUPER_ADMIN || roleName === 'super_admin' || roleName === ROLES.ACCOUNTANT) {
    return true;
  }
  return hasAnyPermission(userPermissions, [
    'finance.view',
    'canViewFinance',
    'finance.giving.view',
    'finance.income.view',
    'finance.expenses.view',
    'finance.budgets.view',
  ]);
}

export function canManageMembers(roleName?: string, userPermissions: string[] = []): boolean {
  if (roleName === ROLES.SUPER_ADMIN || roleName === 'super_admin' || roleName === ROLES.ADMIN || roleName === ROLES.SECRETARY) {
    return true;
  }
  return hasAnyPermission(userPermissions, [
    'members.create',
    'members.edit',
    'members.delete',
    'members.import',
    'canEditMembers',
    'canDeleteMembers',
  ]);
}
