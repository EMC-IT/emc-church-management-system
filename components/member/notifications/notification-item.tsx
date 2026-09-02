'use client';

import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MemberNotification } from '@/lib/types/member';
import {
  NOTIFICATION_TYPE_CONFIG,
  formatNotificationTime,
} from '@/lib/config/member/notifications';
import { cn } from '@/lib/utils';

export interface NotificationItemProps {
  notification: MemberNotification;
  onMarkAsRead?: (id: string) => void;
  className?: string;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  className,
}: NotificationItemProps) {
  const typeConfig =
    NOTIFICATION_TYPE_CONFIG[notification.type] ||
    NOTIFICATION_TYPE_CONFIG.system;
  const TypeIcon = typeConfig.icon;
  const action = notification.action || (notification.actionUrl ? { label: 'View Details', href: notification.actionUrl } : undefined);

  return (
    <Card
      className={cn(
        'transition-colors',
        !notification.isRead
          ? 'bg-muted/30 border-border/80 dark:bg-muted/15'
          : 'bg-card border-border/40 opacity-90',
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        {/* Type Icon */}
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border',
            !notification.isRead
              ? 'bg-primary/10 border-primary/20 text-primary'
              : 'bg-muted/50 border-border/50 text-muted-foreground'
          )}
          aria-hidden="true"
        >
          <TypeIcon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 min-w-0">
              <h4
                className={cn(
                  'text-sm font-heading leading-snug truncate',
                  !notification.isRead
                    ? 'font-semibold text-foreground'
                    : 'font-medium text-foreground/85'
                )}
              >
                {notification.title}
              </h4>

              {!notification.isRead && (
                <span
                  className="inline-block h-2 w-2 rounded-full bg-primary shrink-0"
                  title="Unread notification"
                  aria-label="Unread"
                />
              )}
            </div>

            <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>

          {/* Action Row */}
          <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
            {action ? (
              <Link
                href={action.href}
                onClick={() => !notification.isRead && onMarkAsRead?.(notification.id)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <span>{action.label}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <span />
            )}

            {!notification.isRead && onMarkAsRead && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              >
                <Check className="h-3 w-3" />
                <span>Mark as read</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
