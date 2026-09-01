import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DashboardGivingSummaryWidget } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MyGivingCardProps {
  givingWidget: DashboardGivingSummaryWidget;
  className?: string;
}

export function MyGivingCard({ givingWidget, className }: MyGivingCardProps) {
  // Circular progress math for 75%
  const percentage = givingWidget.goalProgressPercent;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">My Giving</CardTitle>
          <Link
            href="/portal/giving"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-4">
        {/* Top Summary + Circular Gauge */}
        <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="space-y-1 min-w-0">
            <span className="text-xs text-muted-foreground font-medium block">
              Total Giving (This Year)
            </span>
            <span className="text-xl sm:text-2xl font-bold text-foreground font-heading tracking-tight block truncate">
              {givingWidget.currency} {givingWidget.totalYtd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>{givingWidget.yearComparisonPercent}% vs last year</span>
            </div>
          </div>

          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center shrink-0 w-20 h-20">
            <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 80 80">
              {/* Background Track */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-muted-foreground/15 dark:stroke-muted"
                strokeWidth="6"
                fill="none"
              />
              {/* Active Progress Arc */}
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-primary transition-all duration-700 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Gauge Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none">
              <span className="text-xs sm:text-sm font-bold text-foreground leading-none">
                {percentage}%
              </span>
              <span className="text-[9px] font-medium text-muted-foreground leading-tight mt-0.5 max-w-[48px]">
                of yearly goal
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Transactions
          </h4>
          <div className="space-y-2">
            {givingWidget.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-medium min-w-[70px]">
                    {tx.date}
                  </span>
                  <span className="font-semibold text-foreground">
                    {tx.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {givingWidget.currency} {tx.amount.toFixed(2)}
                  </span>
                  <StatusBadge status={tx.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <Link
          href="/portal/giving"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline w-full justify-center"
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Go to My Giving</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
