import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function MinistriesSkeleton() {
  return (
    <div className="space-y-6">
      {/* 2 Ministry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-5 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-48" />
            </div>
          </Card>
        ))}
      </div>

      {/* Service Schedule Card */}
      <Card className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </Card>
    </div>
  );
}
