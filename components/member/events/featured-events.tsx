'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MemberEvent } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface FeaturedEventsProps {
  events: MemberEvent[];
  onRegisterClick?: (event: MemberEvent) => void;
  className?: string;
}

export function FeaturedEvents({ events, onRegisterClick, className }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Featured Events" className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground font-heading">
          Featured Church Events
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => {
          const startDate = parseISO(event.startDate);
          const month = format(startDate, 'MMM');
          const day = format(startDate, 'dd');
          const weekdayAndTime = format(startDate, 'EEE, h:mm a');
          const isRegistered = event.registrationStatus === 'registered';

          return (
            <Card
              key={event.id}
              className="flex flex-col justify-between border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors"
            >
              <CardContent className="p-5 space-y-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {event.category}
                    </Badge>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                  {event.fee && !event.fee.isFree ? (
                    <Badge variant="neutral" size="sm">
                      GH₵{event.fee.amount}
                    </Badge>
                  ) : (
                    <Badge variant="success" size="sm">
                      Free Entry
                    </Badge>
                  )}
                </div>

                <div className="space-y-1">
                  <Link href={`/portal/events/${event.id}`}>
                    <h3 className="font-heading font-bold text-base text-foreground leading-snug hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Date & Location */}
                <div className="flex items-start gap-3 p-2.5 rounded-md bg-background/80 border border-border/40 text-xs">
                  <div className="w-11 py-1 rounded bg-muted/60 border border-border/60 text-center shrink-0">
                    <span className="text-[9px] font-bold uppercase text-muted-foreground block leading-tight">
                      {month}
                    </span>
                    <span className="text-sm font-bold text-foreground block leading-none pt-0.5">
                      {day}
                    </span>
                  </div>

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">{weekdayAndTime}</p>
                    <p className="text-muted-foreground truncate">{event.venue}</p>
                  </div>
                </div>
              </CardContent>

              <div className="p-5 pt-0 flex items-center gap-2">
                <Link href={`/portal/events/${event.id}`} className="flex-1">
                  <Button type="button" variant="outline" size="sm" className="w-full text-xs font-medium">
                    Details
                  </Button>
                </Link>

                {event.requiresRegistration && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isRegistered}
                    onClick={() => onRegisterClick?.(event)}
                    className="flex-1 text-xs font-medium"
                    variant={isRegistered ? 'secondary' : 'default'}
                  >
                    {isRegistered ? 'Registered' : 'Register Now'}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
