import { describe, it, expect } from 'vitest';
import {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  assertPermission,
  assertRole,
  validateTenantScope,
  validateBranchScope,
  applyScopeFilters,
  SecurityContext,
} from '../../lib/authorization';
import { AuthorizationError, TenantIsolationError } from '../../lib/errors';

describe('Authorization Architecture & Guards', () => {
  it('SuperAdmin should have universal access across all permissions', () => {
    const isPermitted = hasPermission(['dashboard.view'], 'finance.view', ROLES.SUPER_ADMIN);
    expect(isPermitted).toBe(true);
  });

  it('Admin should have member management permissions but not finance if not assigned', () => {
    const adminPermissions = ROLE_PERMISSIONS[ROLES.ADMIN];
    expect(hasPermission(adminPermissions, 'members.create')).toBe(true);
    expect(hasPermission(adminPermissions, 'members.delete')).toBe(false);
  });

  it('Accountant should have finance permissions', () => {
    const accountantPermissions = ROLE_PERMISSIONS[ROLES.ACCOUNTANT];
    expect(hasPermission(accountantPermissions, 'finance.expenses.create')).toBe(true);
    expect(hasPermission(accountantPermissions, 'finance.income.view')).toBe(true);
  });

  it('assertPermission should throw AuthorizationError when permission is missing', () => {
    expect(() => {
      assertPermission(['attendance.view'], 'finance.expenses.create', 'Member');
    }).toThrow(AuthorizationError);
  });

  it('assertRole should throw AuthorizationError when role is not in allowed list', () => {
    expect(() => {
      assertRole('Member', [ROLES.SUPER_ADMIN, ROLES.ADMIN]);
    }).toThrow(AuthorizationError);
  });
});

describe('Tenant & Branch Isolation Engine', () => {
  const baseContext: SecurityContext = {
    tenantId: 'tenant_emc_accra',
    branchId: 'branch_hq',
    userId: 'usr_001',
    userEmail: 'pastor@church.com',
    role: ROLES.ADMIN,
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN],
    assignedBranchIds: ['branch_hq', 'branch_east'],
    isSuperAdmin: false,
  };

  it('validateTenantScope should succeed for matching tenant', () => {
    expect(() => {
      validateTenantScope(baseContext, 'tenant_emc_accra');
    }).not.toThrow();
  });

  it('validateTenantScope should throw TenantIsolationError for cross-tenant access', () => {
    expect(() => {
      validateTenantScope(baseContext, 'tenant_other_church');
    }).toThrow(TenantIsolationError);
  });

  it('validateBranchScope should permit assigned branch', () => {
    expect(() => {
      validateBranchScope(baseContext, 'branch_east');
    }).not.toThrow();
  });

  it('validateBranchScope should reject unassigned branch', () => {
    expect(() => {
      validateBranchScope(baseContext, 'branch_north');
    }).toThrow(TenantIsolationError);
  });

  it('applyScopeFilters should inject trusted server-side tenantId and branchId', () => {
    const filter = applyScopeFilters(baseContext, { page: 1, search: 'John' });
    expect(filter.tenantId).toBe('tenant_emc_accra');
    expect(filter.branchId).toBe('branch_hq');
    expect(filter.search).toBe('John');
  });
});
