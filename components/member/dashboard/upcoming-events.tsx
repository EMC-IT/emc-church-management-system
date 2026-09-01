import Link from 'next/link';
import { MapPin, ArrowRight, Video } from 'lucide-react';
import { MemberEvent } from '@/lib/types/member';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

export interface UpcomingEventsProps {
  events?: MemberEvent[];
  className?: string;
}

export function UpcomingEvents({ events = [], className }: UpcomingEventsProps) {
  const displayEvents = events.slice(0, 3);

  return (
    <Card className={cn('flex flex-col justify-between', className)}>
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold">Upcoming Events</CardTitle>
          <Link
            href="/portal/events"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="py-4">
        {displayEvents.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
            <p>No upcoming church events scheduled.</p>
            <Link href="/portal/events" className="text-primary font-medium hover:underline inline-block pt-1">
              Explore what&apos;s happening at church →
            </Link>
          </div>
        ) : (
          <div className="space-y-3 divide-y divide-border/30">
            {displayEvents.map((event) => {
              const startDate = new Date(event.startDate);
              const formattedDate = new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
              }).format(startDate);
              const formattedTime = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              }).format(startDate);

              return (
                <div key={event.id} className="pt-3 first:pt-0 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm">
                          {event.category}
                        </Badge>
                        {event.registrationStatus && (
                          <StatusBadge status={event.registrationStatus} size="sm" />
                        )}
                      </div>
                      <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                        <span className="font-medium text-foreground/80">
                          {formattedDate} • {formattedTime}
                        </span>
                        <span className="flex items-center gap-1">
                          {event.isOnline ? (
                            <>
                              <Video className="h-3 w-3 text-sky-500" />
                              <span>Online Live Stream</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[160px]">{event.location}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t border-border/30">
        <Link
          href="/portal/events"
          className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center justify-between w-full"
        >
          <span>Explore event calendar & tickets</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardFooter>
    </Card>
  );
}
