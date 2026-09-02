import { EventSessionScheduleItem } from '@/lib/types/member';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface EventScheduleProps {
  schedule?: EventSessionScheduleItem[];
  className?: string;
}

export function EventSchedule({ schedule = [], className }: EventScheduleProps) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/40">
        <CardTitle className="text-base font-semibold text-foreground font-heading">
          Event Schedule & Agenda
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/40">
        {schedule.map((session) => (
          <div
            key={session.id}
            className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 p-4 sm:p-5 hover:bg-muted/10 transition-colors"
          >
            {/* Time badge */}
            <div className="sm:w-48 shrink-0">
              <span className="text-xs font-semibold text-primary block">
                {session.time}
              </span>
              {session.venue && (
                <span className="text-[11px] text-muted-foreground block mt-0.5">
                  Venue: {session.venue}
                </span>
              )}
            </div>

            {/* Session details */}
            <div className="space-y-1 flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground">
                {session.title}
              </h4>
              {session.speaker && (
                <p className="text-xs text-muted-foreground font-medium">
                  Speaker / Lead: <strong className="text-foreground">{session.speaker}</strong>
                </p>
              )}
              {session.description && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                  {session.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
