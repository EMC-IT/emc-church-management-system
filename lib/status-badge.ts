import type { BadgeVariant } from '@/components/ui/badge';

export const statusBadgeVariants = {
  active: 'success',
  approved: 'success',
  answered: 'success',
  completed: 'success',
  completed_successfully: 'success',
  confirmed: 'success',
  delivered: 'success',
  excellent: 'success',
  paid: 'success',
  published: 'success',
  received: 'success',
  success: 'success',
  successful: 'success',
  valid: 'success',
  verified: 'success',

  awaiting_review: 'warning',
  high: 'warning',
  incomplete: 'warning',
  late: 'warning',
  maintenance: 'warning',
  near_limit: 'warning',
  needs_attention: 'warning',
  over_budget: 'warning',
  pending: 'warning',
  unpaid: 'warning',
  waitlisted: 'warning',

  absent: 'danger',
  cancelled: 'danger',
  critical: 'danger',
  error: 'danger',
  exceeded: 'danger',
  failed: 'danger',
  invalid: 'danger',
  overdue: 'danger',
  rejected: 'danger',
  suspended: 'danger',
  urgent: 'danger',

  draft: 'info',
  in_progress: 'info',
  info: 'info',
  new: 'info',
  ongoing: 'info',
  planning: 'info',
  processing: 'info',
  scheduled: 'info',
  sent: 'info',
  upcoming: 'info',
  uploading: 'info',

  archived: 'neutral',
  away: 'neutral',
  deceased: 'neutral',
  excused: 'neutral',
  inactive: 'neutral',
  low: 'neutral',
  normal: 'neutral',
  offline: 'neutral',
  refunded: 'neutral',
  returned: 'neutral',
  transferred: 'neutral',
  unknown: 'neutral',
} as const satisfies Record<string, BadgeVariant>;

export type KnownStatus = keyof typeof statusBadgeVariants;

export function normalizeStatus(status: unknown): string {
  if (typeof status !== 'string') return 'unknown';

  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || 'unknown';
}

export function getStatusBadgeVariant(status: unknown): BadgeVariant {
  const normalized = normalizeStatus(status);
  return statusBadgeVariants[normalized as KnownStatus] ?? 'neutral';
}
