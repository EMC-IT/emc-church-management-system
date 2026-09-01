import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function FamilySkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading family unit"
      className={cn('space-y-6 animate-pulse', className)}
    >
      {/* Family Header skeleton */}
      <Card>
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-muted/70" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted/80 rounded" />
              <div className="h-4 w-32 bg-muted/50 rounded" />
            </div>
          </div>
          <div className="h-9 w-36 bg-muted/60 rounded-md" />
        </CardContent>
      </Card>

      {/* Grid of family member cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted/70" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-28 bg-muted/80 rounded" />
                  <div className="h-3 w-16 bg-muted/50 rounded" />
                </div>
              </div>
              <div className="h-12 bg-muted/30 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <span className="sr-only">Loading family...</span>
    </div>
  );
}
