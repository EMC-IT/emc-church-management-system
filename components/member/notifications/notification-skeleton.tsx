import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function NotificationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Metric Counters Skeletons */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 sm:p-5 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </Card>
        ))}
      </div>

      {/* Tabs & Action Bar */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* Notification Items */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4 sm:p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-24 pt-1" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
