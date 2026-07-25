import * as React from 'react';

import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { normalizeStatus } from '@/lib/status-badge';
import { cn } from '@/lib/utils';

/**
 * Identity badges: the value names *what something is* — an action, a role, a
 * category — rather than what state it is in. Anything that describes state
 * belongs in @/components/ui/status-badge instead.
 *
 * The palette has six variants, so a long list of categories will reuse
 * colours. That is intentional: the goal is that every badge in the app draws
 * from the same six, not that every value gets a unique one.
 */
type CategoryVariants = Record<string, BadgeVariant>;

function lookupVariant(variants: CategoryVariants, value: unknown): BadgeVariant {
  return variants[normalizeStatus(value)] ?? 'neutral';
}

function humanize(value: unknown): string {
  return String(value ?? '').replace(/_/g, ' ').toLowerCase();
}

interface CategoryBadgeProps {
  className?: string;
  children?: React.ReactNode;
}

// --- Activity logs ----------------------------------------------------------

const actionVariants: CategoryVariants = {
  create: 'success',
  approve: 'success',
  update: 'info',
  delete: 'danger',
  reject: 'danger',
  login: 'primary',
  logout: 'primary',
  export: 'warning',
  import: 'warning',
  view: 'neutral',
};

export function ActionBadge({
  action,
  className,
  children,
}: CategoryBadgeProps & { action: string }) {
  return (
    <Badge variant={lookupVariant(actionVariants, action)} className={cn('capitalize', className)}>
      {children ?? humanize(action)}
    </Badge>
  );
}

// --- Departments ------------------------------------------------------------

const departmentRoleVariants: CategoryVariants = {
  head: 'primary',
  assistant_head: 'primary',
  secretary: 'info',
  treasurer: 'success',
  coordinator: 'warning',
  member: 'neutral',
};

export function DepartmentRoleBadge({
  role,
  className,
  children,
}: CategoryBadgeProps & { role: string }) {
  return (
    <Badge
      variant={lookupVariant(departmentRoleVariants, role)}
      className={cn('capitalize', className)}
    >
      {children ?? humanize(role)}
    </Badge>
  );
}

// Permissions are graded by how much damage they allow rather than looked up by
// name, so this one is a predicate instead of a map.
export function PermissionBadge({
  permission,
  className,
  children,
}: CategoryBadgeProps & { permission: string }) {
  const normalized = normalizeStatus(permission);
  const variant: BadgeVariant = /manage|admin|delete/.test(normalized)
    ? 'danger'
    : /edit|create|update/.test(normalized)
      ? 'warning'
      : 'info';

  return (
    <Badge variant={variant} size="sm" className={cn('capitalize', className)}>
      {children ?? humanize(permission)}
    </Badge>
  );
}

// --- Events -----------------------------------------------------------------

const eventCategoryVariants: CategoryVariants = {
  worship: 'primary',
  study: 'success',
  conference: 'info',
  social: 'info',
  outreach: 'warning',
  training: 'warning',
};

export function EventCategoryBadge({
  category,
  className,
  children,
}: CategoryBadgeProps & { category: string }) {
  return (
    <Badge
      variant={lookupVariant(eventCategoryVariants, category)}
      className={cn('capitalize', className)}
    >
      {children ?? humanize(category)}
    </Badge>
  );
}

const eventGroupRoleVariants: CategoryVariants = {
  leading: 'primary',
  coordinating: 'primary',
  supporting: 'success',
  technical: 'info',
  assisting: 'warning',
};

export function EventGroupRoleBadge({
  role,
  className,
  children,
}: CategoryBadgeProps & { role: string }) {
  return (
    <Badge
      variant={lookupVariant(eventGroupRoleVariants, role)}
      className={cn('capitalize', className)}
    >
      {children ?? humanize(role)}
    </Badge>
  );
}
