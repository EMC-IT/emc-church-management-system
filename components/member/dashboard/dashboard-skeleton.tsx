import { cn } from '@/lib/utils';

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading member dashboard"
      className={cn('space-y-6 animate-pulse', className)}
    >
      {/* 1. Welcome Greeting skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-64 bg-muted/70 rounded-lg" />
        <div className="h-4 w-48 bg-muted/50 rounded" />
      </div>

      {/* 2. Top 4 Metric Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-card rounded-xl border border-border/50 p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-muted/70 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-24 bg-muted/60 rounded" />
              <div className="h-5 w-32 bg-muted/80 rounded" />
              <div className="h-2.5 w-20 bg-muted/40 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Dashboard Layout Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Left / Center Major Column (2 cols width) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Verse Banner skeleton */}
          <div className="h-52 bg-card rounded-2xl border border-border/50 p-6 sm:p-8" />

          {/* Giving & Announcements skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72 bg-card rounded-xl border border-border/50" />
            <div className="h-72 bg-card rounded-xl border border-border/50" />
          </div>

          {/* Ministries Grid skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-40 bg-muted/60 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-card rounded-xl border border-border/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 col width) */}
        <div className="xl:col-span-1 space-y-6">
          <div className="h-80 bg-card rounded-xl border border-border/50" />
          <div className="h-52 bg-card rounded-xl border border-border/50" />
        </div>
      </div>

      <span className="sr-only">Loading dashboard content...</span>
    </div>
  );
}
