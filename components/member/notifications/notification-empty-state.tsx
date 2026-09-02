import { Bell, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface NotificationEmptyStateProps {
  isUnreadOnly?: boolean;
  className?: string;
}

export function NotificationEmptyState({
  isUnreadOnly,
  className,
}: NotificationEmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-4">
          {isUnreadOnly ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" aria-hidden="true" />
          ) : (
            <Bell className="h-6 w-6" aria-hidden="true" />
          )}
        </div>

        <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
          {isUnreadOnly ? "You're all caught up!" : 'No notifications yet'}
        </h3>

        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {isUnreadOnly
            ? 'You have read all your personal notifications and updates.'
            : 'Personal updates, event confirmations, giving receipts, and care notifications will appear here.'}
        </p>
      </CardContent>
    </Card>
  );
}
