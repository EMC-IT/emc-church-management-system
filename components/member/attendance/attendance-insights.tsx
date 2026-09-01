import { CheckCircle2, Info, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberAttendanceInsight } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface AttendanceInsightsProps {
  insights: MemberAttendanceInsight[];
  className?: string;
}

export function AttendanceInsights({ insights, className }: AttendanceInsightsProps) {
  const getIcon = (type: MemberAttendanceInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />;
      case 'info':
        return <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />;
      default:
        return <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />;
    }
  };

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground font-heading">
            Participation Insights
          </CardTitle>
          <span className="text-xs text-muted-foreground">Observed patterns</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="flex items-start gap-3 p-3 rounded-md bg-muted/40 border border-border/50 text-sm"
            >
              {getIcon(insight.type)}
              <div className="space-y-0.5 min-w-0">
                <h4 className="font-semibold text-foreground text-xs">{insight.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border/40 text-[11px] text-muted-foreground italic">
          Insights are automatically calculated from your recorded check-in attendance.
        </div>
      </CardContent>
    </Card>
  );
}
