import {
  Calendar,
  HandCoins,
  CalendarCheck,
  Heart,
  HeartHandshake,
  Users,
  Church,
  Compass,
  FileText,
  Megaphone,
  Bell,
  type LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow, parseISO, isToday, isYesterday, format } from 'date-fns';
import { NotificationType } from '@/lib/types/member';

export interface NotificationTypeConfig {
  label: string;
  icon: LucideIcon;
  badgeVariant: 'neutral' | 'primary' | 'success' | 'warning' | 'info';
}

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  NotificationTypeConfig
> = {
  event: {
    label: 'Event Update',
    icon: Calendar,
    badgeVariant: 'primary',
  },
  giving: {
    label: 'Giving & Tithe',
    icon: HandCoins,
    badgeVariant: 'success',
  },
  attendance: {
    label: 'Attendance',
    icon: CalendarCheck,
    badgeVariant: 'info',
  },
  prayer: {
    label: 'Prayer Need',
    icon: Heart,
    badgeVariant: 'info',
  },
  care: {
    label: 'Pastoral Care',
    icon: HeartHandshake,
    badgeVariant: 'warning',
  },
  group: {
    label: 'Cell Group',
    icon: Users,
    badgeVariant: 'neutral',
  },
  ministry: {
    label: 'Ministry',
    icon: Church,
    badgeVariant: 'neutral',
  },
  journey: {
    label: 'Milestone',
    icon: Compass,
    badgeVariant: 'primary',
  },
  resource: {
    label: 'Resource Library',
    icon: FileText,
    badgeVariant: 'neutral',
  },
  announcement: {
    label: 'Church Announcement',
    icon: Megaphone,
    badgeVariant: 'primary',
  },
  system: {
    label: 'System Notification',
    icon: Bell,
    badgeVariant: 'neutral',
  },
};

export function formatNotificationTime(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  } catch {
    return dateString;
  }
}
