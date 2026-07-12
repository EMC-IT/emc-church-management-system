import * as React from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle,
  Clock,
  Info,
  Pause,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

import {
  Badge,
  type BadgeProps,
  type BadgeSize,
  type BadgeVariant,
} from '@/components/ui/badge';
import {
  getStatusBadgeVariant,
  normalizeStatus,
  type KnownStatus,
} from '@/lib/status-badge';
import { cn } from '@/lib/utils';

export type StatusType = KnownStatus | (string & {});

export interface StatusBadgeProps
  extends Omit<BadgeProps, 'variant' | 'size'> {
  status: StatusType;
  variant?: BadgeVariant;
  size?: BadgeSize;
  showIcon?: boolean;
}

const statusIcons: Partial<Record<KnownStatus, LucideIcon>> = {
  active: CheckCircle,
  approved: CheckCircle,
  completed: CheckCircle,
  confirmed: CheckCircle,
  delivered: CheckCircle,
  paid: CheckCircle,
  verified: CheckCircle,
  pending: Clock,
  late: Clock,
  overdue: AlertCircle,
  failed: XCircle,
  error: XCircle,
  cancelled: XCircle,
  rejected: XCircle,
  archived: Archive,
  inactive: Pause,
  info: Info,
};

function formatStatusLabel(status: string): string {
  return normalizeStatus(status)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function StatusBadge({
  status,
  variant,
  size = 'md',
  showIcon = false,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  const normalized = normalizeStatus(status) as KnownStatus;
  const Icon = statusIcons[normalized];

  return (
    <Badge
      variant={variant ?? getStatusBadgeVariant(status)}
      size={size}
      className={cn('capitalize', className)}
      {...props}
    >
      {showIcon && Icon ? <Icon aria-hidden="true" className="h-3 w-3" /> : null}
      {children ?? formatStatusLabel(status)}
    </Badge>
  );
}

export function MemberStatusBadge(
  props: Omit<StatusBadgeProps, 'status'> & {
    status: 'new' | 'active' | 'inactive' | 'transferred' | 'deceased';
  }
) {
  return <StatusBadge {...props} />;
}

export function PaymentStatusBadge(
  props: Omit<StatusBadgeProps, 'status'> & {
    status: 'paid' | 'unpaid' | 'overdue' | 'refunded' | 'pending';
  }
) {
  return <StatusBadge {...props} />;
}

export function EventStatusBadge(
  props: Omit<StatusBadgeProps, 'status'> & {
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  }
) {
  return <StatusBadge {...props} />;
}

export function AttendanceStatusBadge(
  props: Omit<StatusBadgeProps, 'status'> & {
    status: 'present' | 'absent' | 'late' | 'excused';
  }
) {
  return <StatusBadge {...props} />;
}

export function CommunicationStatusBadge(
  props: Omit<StatusBadgeProps, 'status'> & {
    status: 'sent' | 'delivered' | 'failed' | 'pending';
  }
) {
  return <StatusBadge {...props} />;
}

export function PriorityBadge(
  props: Omit<StatusBadgeProps, 'status'> & {
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }
) {
  const { priority, ...badgeProps } = props;
  return <StatusBadge status={priority} {...badgeProps} />;
}

export interface StatusBadgeGroupProps {
  statuses: Array<{ status: StatusType; count?: number; label?: string }>;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadgeGroup({
  statuses,
  size = 'md',
  showIcon = false,
  className,
}: StatusBadgeGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statuses.map(({ status, count, label }) => (
        <StatusBadge
          key={`${status}-${label ?? ''}`}
          status={status}
          size={size}
          showIcon={showIcon}
        >
          {label ?? formatStatusLabel(status)}
          {count !== undefined ? <span>({count})</span> : null}
        </StatusBadge>
      ))}
    </div>
  );
}
