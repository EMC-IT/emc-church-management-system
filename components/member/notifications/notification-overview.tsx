'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface NotificationOverviewProps {
  totalCount: number;
  unreadCount: number;
  announcementCount: number;
  className?: string;
}

export function NotificationOverview({
  totalCount,
  unreadCount,
  announcementCount,
  className,
}: NotificationOverviewProps) {
  return (
    <div className={cn('grid grid-cols-3 gap-3 sm:gap-4', className)}>
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block truncate">
            All Notifications
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {totalCount}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block truncate">
            Unread
          </span>
          <span
            className={cn(
              'text-xl sm:text-2xl font-bold font-heading',
              unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {unreadCount}
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5 space-y-1">
          <span className="text-xs text-muted-foreground font-medium block truncate">
            Announcements
          </span>
          <span className="text-xl sm:text-2xl font-bold font-heading text-foreground">
            {announcementCount}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
