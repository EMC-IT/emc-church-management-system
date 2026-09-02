import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function GivingSkeleton() {
  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36" />
          </Card>
        ))}
      </div>

      {/* 2-Column Trend and Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-7 xl:col-span-8 p-5">
          <CardHeader className="p-0 pb-4">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="p-0">
            <Skeleton className="h-[220px] w-full" />
          </CardContent>
        </Card>

        <Card className="lg:col-span-5 xl:col-span-4 p-5">
          <CardHeader className="p-0 pb-4">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="p-0 space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      {/* History Datatable */}
      <Card className="p-5 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="space-y-2 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
