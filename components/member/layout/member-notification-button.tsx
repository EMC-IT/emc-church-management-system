'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberNotification } from '@/lib/types/member';
import {
  NOTIFICATION_TYPE_CONFIG,
  formatNotificationTime,
} from '@/lib/config/member/notifications';
import { cn } from '@/lib/utils';

export interface MemberNotificationButtonProps {
  notifications?: MemberNotification[];
  onMarkAllRead?: () => void;
  className?: string;
}

export function MemberNotificationButton({
  notifications = [],
  onMarkAllRead,
  className,
}: MemberNotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-9 w-9 rounded-full hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary',
            className
          )}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : 'Notifications, no unread notifications'
          }
        >
          <Bell className="h-4 w-4 text-foreground/80" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-background"
              aria-hidden="true"
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 sm:w-96 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground font-heading">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <Badge variant="primary" size="sm">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={() => {
                onMarkAllRead();
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              You&apos;re all caught up. No new notifications.
            </div>
          ) : (
            notifications.slice(0, 4).map((notification) => {
              const typeConfig =
                NOTIFICATION_TYPE_CONFIG[notification.type] ||
                NOTIFICATION_TYPE_CONFIG.system;
              const TypeIcon = typeConfig.icon;
              const href =
                notification.action?.href ||
                notification.actionUrl ||
                '/portal/notifications';

              return (
                <Link
                  key={notification.id}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left',
                    !notification.isRead && 'bg-primary/[0.03]'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-0.5',
                      !notification.isRead
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}
                    aria-hidden="true"
                  >
                    <TypeIcon className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={cn(
                          'text-xs leading-snug line-clamp-1',
                          !notification.isRead
                            ? 'font-semibold text-foreground'
                            : 'font-medium text-foreground/80'
                        )}
                      >
                        {notification.title}
                      </span>
                      {!notification.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>

                    <span className="text-[10px] text-muted-foreground block pt-0.5">
                      {formatNotificationTime(notification.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="p-2.5 border-t border-border/40 text-center bg-muted/20">
          <Link
            href="/portal/notifications"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline block py-0.5"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
