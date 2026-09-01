import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading member profile"
      className={cn('space-y-6 animate-pulse', className)}
    >
      {/* Profile Header skeleton */}
      <Card>
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-muted/70" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted/80 rounded" />
              <div className="h-4 w-32 bg-muted/50 rounded" />
            </div>
          </div>
          <div className="h-9 w-28 bg-muted/60 rounded-md" />
        </CardContent>
      </Card>

      {/* Grid of information cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="h-5 w-40 bg-muted/70 rounded" />
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-border/40">
            <div className="h-5 w-40 bg-muted/70 rounded" />
          </CardHeader>
          <CardContent className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
              <div className="h-10 bg-muted/40 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>

      <span className="sr-only">Loading profile...</span>
    </div>
  );
}
