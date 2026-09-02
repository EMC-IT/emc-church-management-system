'use client';

import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberEvent } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface EventCardProps {
  event: MemberEvent;
  onRegisterClick?: (event: MemberEvent) => void;
  className?: string;
}

export function EventCard({ event, onRegisterClick, className }: EventCardProps) {
  const startDate = parseISO(event.startDate);
  const month = format(startDate, 'MMM');
  const day = format(startDate, 'dd');
  const weekdayAndTime = format(startDate, 'EEE, h:mm a');

  const isRegistered = event.registrationStatus === 'registered';
  const isFull = event.registrationStatus === 'full';
  const isClosed = event.registrationStatus === 'closed';

  return (
    <Card
      className={cn(
        'flex flex-col justify-between hover:border-primary/40 transition-colors',
        className
      )}
    >
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="neutral" size="sm">
              {event.category}
            </Badge>
            {event.isOnline && (
              <Badge variant="info" size="sm">
                Online Option
              </Badge>
            )}
          </div>
          {isRegistered ? (
            <StatusBadge status="Registered" size="sm" />
          ) : isFull ? (
            <StatusBadge status="Full" size="sm" />
          ) : isClosed ? (
            <StatusBadge status="Closed" size="sm" />
          ) : event.fee && !event.fee.isFree ? (
            <Badge variant="neutral" size="sm" className="font-semibold">
              GH₵{event.fee.amount}
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Free
            </Badge>
          )}
        </div>

        <Link
          href={`/portal/events/${event.id}`}
          className="group block outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <h3 className="font-heading font-semibold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
            {event.title}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-3 flex-1">
        {/* Date, Time & Venue Highlight */}
        <div className="flex items-start gap-3.5 p-3 rounded-lg bg-muted/30 border border-border/40">
          <div className="w-12 py-1.5 rounded bg-background border border-border/60 text-center shrink-0 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-muted-foreground block leading-tight">
              {month}
            </span>
            <span className="text-base font-bold text-foreground block leading-none pt-0.5">
              {day}
            </span>
          </div>

          <div className="space-y-0.5 text-xs min-w-0 flex-1">
            <p className="font-medium text-foreground truncate">{weekdayAndTime}</p>
            <p className="text-muted-foreground truncate">{event.venue}</p>
            <p className="text-[11px] text-muted-foreground/80 truncate">{event.branch}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        <Link href={`/portal/events/${event.id}`} className="flex-1">
          <Button type="button" variant="outline" size="sm" className="w-full text-xs font-medium">
            View Details
          </Button>
        </Link>

        {event.requiresRegistration && (
          <Button
            type="button"
            size="sm"
            disabled={isRegistered || isFull || isClosed}
            onClick={() => onRegisterClick?.(event)}
            className="flex-1 text-xs font-medium"
            variant={isRegistered ? 'secondary' : 'default'}
          >
            {isRegistered ? 'Registered' : isFull ? 'Event Full' : isClosed ? 'Closed' : 'Register'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
