import type { BadgeVariant } from '@/components/ui/badge';

export const statusBadgeVariants = {
  active: 'primary',

  approved: 'success',
  answered: 'success',
  completed: 'success',
  completed_successfully: 'success',
  confirmed: 'success',
  delivered: 'success',
  excellent: 'success',
  faithful: 'success',
  on_target: 'success',
  on_track: 'success',
  paid: 'success',
  present: 'success',
  published: 'success',
  received: 'success',
  success: 'success',
  successful: 'success',
  valid: 'success',
  verified: 'success',

  awaiting_review: 'warning',
  fair: 'warning',
  high: 'warning',
  incomplete: 'warning',
  late: 'warning',
  maintenance: 'warning',
  near_limit: 'warning',
  needs_attention: 'warning',
  partial: 'warning',
  pending: 'warning',
  unpaid: 'warning',
  waitlisted: 'warning',

  absent: 'danger',
  cancelled: 'danger',
  critical: 'danger',
  damaged: 'danger',
  disposed: 'danger',
  lost: 'danger',
  error: 'danger',
  exceeded: 'danger',
  failed: 'danger',
  invalid: 'danger',
  over_budget: 'danger',
  overdue: 'danger',
  poor: 'danger',
  rejected: 'danger',
  suspended: 'danger',
  urgent: 'danger',

  consistent: 'info',
  draft: 'info',
  // One tier below `excellent` on quality/condition scales, so it stays visually
  // distinct from it rather than both rendering green.
  good: 'info',
  in_progress: 'info',
  info: 'info',
  medium: 'info',
  new: 'info',
  ongoing: 'info',
  planning: 'info',
  processing: 'info',
  reserved: 'info',
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
  on_hold: 'neutral',
  offline: 'neutral',
  refunded: 'neutral',
  regular: 'neutral',
  retired: 'neutral',
  returned: 'neutral',
  transferred: 'neutral',
  under_budget: 'neutral',
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
