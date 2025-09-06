"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Pause,
  Play,
  User,
  Users,
  Building,
  Home,
  Calendar,
  BadgeCent,
  Heart,
  Star,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Download,
  Upload,
  Send,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Settings,
  Edit,
  Trash,
  Archive,
  RefreshCw,
  Zap,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

export type StatusType = 
  // General statuses
  | 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'published' | 'archived'
  // Process statuses
  | 'processing' | 'success' | 'error' | 'warning' | 'info'
  // Member statuses
  | 'new' | 'active' | 'inactive' | 'transferred' | 'deceased'
  // Financial statuses
  | 'paid' | 'unpaid' | 'overdue' | 'refunded' | 'pending'
  // Event statuses
  | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  // Attendance statuses
  | 'present' | 'absent' | 'late' | 'excused'
  // Communication statuses
  | 'sent' | 'delivered' | 'failed' | 'pending'
  // Priority levels
  | 'low' | 'medium' | 'high' | 'urgent'
  // Custom statuses
  | 'online' | 'offline' | 'busy' | 'available' | 'unavailable';

export interface StatusBadgeProps {
  status: StatusType;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const statusConfig: Record<StatusType, {
  label: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
  // General statuses
  active: {
    label: 'Active',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  inactive: {
    label: 'Inactive',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Pause,
    variant: 'secondary'
  },
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Clock,
    variant: 'secondary'
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: CheckCircle,
    variant: 'default'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle,
    variant: 'destructive'
  },
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Edit,
    variant: 'secondary'
  },
  published: {
    label: 'Published',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Archive,
    variant: 'secondary'
  },

  // Process statuses
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: RefreshCw,
    variant: 'default'
  },
  success: {
    label: 'Success',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  error: {
    label: 'Error',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle,
    variant: 'destructive'
  },
  warning: {
    label: 'Warning',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: AlertCircle,
    variant: 'secondary'
  },
  info: {
    label: 'Info',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: AlertCircle,
    variant: 'default'
  },

  // Member statuses
  new: {
    label: 'New',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: User,
    variant: 'default'
  },
  transferred: {
    label: 'Transferred',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    icon: Users,
    variant: 'secondary'
  },
  deceased: {
    label: 'Deceased',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Heart,
    variant: 'secondary'
  },

  // Financial statuses
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  unpaid: {
    label: 'Unpaid',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle,
    variant: 'destructive'
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: AlertCircle,
    variant: 'destructive'
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: RefreshCw,
    variant: 'default'
  },

  // Event statuses
  upcoming: {
    label: 'Upcoming',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: Calendar,
    variant: 'default'
  },
  ongoing: {
    label: 'Ongoing',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: Play,
    variant: 'default'
  },

  // Attendance statuses
  present: {
    label: 'Present',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  absent: {
    label: 'Absent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle,
    variant: 'destructive'
  },
  late: {
    label: 'Late',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Clock,
    variant: 'secondary'
  },
  excused: {
    label: 'Excused',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: AlertCircle,
    variant: 'default'
  },

  // Communication statuses
  sent: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: Send,
    variant: 'default'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: XCircle,
    variant: 'destructive'
  },

  // Priority levels
  low: {
    label: 'Low',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: Minus,
    variant: 'secondary'
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: AlertCircle,
    variant: 'secondary'
  },
  high: {
    label: 'High',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    icon: TrendingUp,
    variant: 'default'
  },
  urgent: {
    label: 'Urgent',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: Zap,
    variant: 'destructive'
  },

  // Custom statuses
  online: {
    label: 'Online',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  offline: {
    label: 'Offline',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: XCircle,
    variant: 'secondary'
  },
  busy: {
    label: 'Busy',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Clock,
    variant: 'secondary'
  },
  available: {
    label: 'Available',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    variant: 'default'
  },
  unavailable: {
    label: 'Unavailable',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    icon: XCircle,
    variant: 'secondary'
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function StatusBadge({
  status,
  variant,
  size = 'md',
  showIcon = true,
  className,
  children,
}: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;
  
  const badgeVariant = variant || config.variant || 'default';
  const badgeColor = badgeVariant === 'default' ? config.color : '';

  return (
    <Badge
      variant={badgeVariant}
      className={cn(
        sizeClasses[size],
        badgeColor,
        'capitalize font-medium',
        className
      )}
    >
      {showIcon && Icon && <Icon className="mr-1 h-3 w-3" />}
      {children || config.label}
    </Badge>
  );
}

// Specialized Status Badge Components
export function MemberStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'new' | 'active' | 'inactive' | 'transferred' | 'deceased' }) {
  return <StatusBadge status={status} {...props} />;
}

export function PaymentStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'paid' | 'unpaid' | 'overdue' | 'refunded' | 'pending' }) {
  return <StatusBadge status={status} {...props} />;
}

export function EventStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled' }) {
  return <StatusBadge status={status} {...props} />;
}

export function AttendanceStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'present' | 'absent' | 'late' | 'excused' }) {
  return <StatusBadge status={status} {...props} />;
}

export function CommunicationStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'status'> & { status: 'sent' | 'delivered' | 'failed' | 'pending' }) {
  return <StatusBadge status={status} {...props} />;
}

export function PriorityBadge({ priority, ...props }: Omit<StatusBadgeProps, 'status'> & { priority: 'low' | 'medium' | 'high' | 'urgent' }) {
  return <StatusBadge status={priority} {...props} />;
}

// Status Badge Group Component
export interface StatusBadgeGroupProps {
  statuses: Array<{
    status: StatusType;
    count?: number;
    label?: string;
  }>;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function StatusBadgeGroup({
  statuses,
  size = 'md',
  showIcon = true,
  className,
}: StatusBadgeGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {statuses.map(({ status, count, label }, index) => (
        <StatusBadge
          key={index}
          status={status}
          size={size}
          showIcon={showIcon}
        >
          {label || statusConfig[status]?.label}
          {count !== undefined && (
            <span className="ml-1 font-bold">({count})</span>
          )}
        </StatusBadge>
      ))}
    </div>
  );
}