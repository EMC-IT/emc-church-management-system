import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberGivingCategoryBreakdown } from '@/lib/types/member';
import { formatCurrency, cn } from '@/lib/utils';

export interface GivingBreakdownProps {
  breakdown: MemberGivingCategoryBreakdown[];
  className?: string;
}

export function GivingBreakdown({ breakdown, className }: GivingBreakdownProps) {
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground font-heading">
            Giving Breakdown
          </CardTitle>
          <span className="text-xs text-muted-foreground">By category</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {breakdown.slice(0, 5).map((item) => (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.category}</span>
                <span className="text-muted-foreground">
                  {formatCurrency(item.amount, 'GHS')} ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground italic">
          Tithes and general offerings form the foundation of your ongoing church stewardship.
        </div>
      </CardContent>
    </Card>
  );
}
