import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MemberNotification } from '@/lib/types/member';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface RecentNotificationsProps {
  notifications?: MemberNotification[];
  className?: string;
}

export function RecentNotifications({
  notifications = [],
  className,
}: RecentNotificationsProps) {
  const displayNotifications = notifications.slice(0, 3);

  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Notifications & News</CardTitle>
          <Link
            href="/portal/notifications"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4">
        {displayNotifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
            <p>You&apos;re all caught up with church notifications.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayNotifications.map((notif) => (
              <Link
                key={notif.id}
                href={notif.actionUrl || '/portal/notifications'}
                className={cn(
                  'block p-2.5 rounded-md transition-colors text-left border',
                  !notif.isRead
                    ? 'bg-primary/[0.04] border-primary/20 hover:bg-primary/[0.08]'
                    : 'bg-muted/30 border-transparent hover:bg-muted/60'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {!notif.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                      <h3 className="text-xs font-semibold text-foreground truncate">
                        {notif.title}
                      </h3>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <Link
          href="/portal/notifications"
          className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-between w-full"
        >
          <span>Notification center & history</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
