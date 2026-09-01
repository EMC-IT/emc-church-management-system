import Link from 'next/link';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MemberEvent } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface UpcomingEventsCardProps {
  events?: MemberEvent[];
  className?: string;
}

export function UpcomingEventsCard({ events = [], className }: UpcomingEventsCardProps) {
  const displayEvents = events.slice(0, 3);

  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
          <Link
            href="/portal/events"
            className="text-xs font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-3.5">
        {displayEvents.map((evt) => {
          const startDate = new Date(evt.startDate);
          const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(startDate).toUpperCase();
          const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(startDate);
          const startTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(startDate);
          const endTime = evt.endDate
            ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(evt.endDate))
            : '10:30 AM';
          const isGoing = evt.registrationStatus === 'Going' || evt.registrationStatus === 'Registered';
          const badgeLabel = evt.registrationStatus || (isGoing ? 'Going' : 'Interested');

          return (
            <div
              key={evt.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Date Square Badge */}
                <div className="flex flex-col items-center justify-center h-12 w-12 rounded-xl bg-card border border-border/50 text-center shrink-0 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary leading-none">
                    {month}
                  </span>
                  <span className="text-base font-bold text-foreground leading-none mt-1">
                    {day}
                  </span>
                </div>

                {/* Event Details */}
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                    {evt.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{startTime} - {endTime}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                </div>
              </div>

              {/* RSVP Action Status Pill */}
              <div className="shrink-0">
                <Badge
                  variant={isGoing ? 'primary' : 'warning'}
                  size="sm"
                  className="rounded-lg px-2 py-0.5 font-semibold text-[11px]"
                >
                  {badgeLabel}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <Link
          href="/portal/events"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline w-full justify-center"
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>View Full Calendar</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
