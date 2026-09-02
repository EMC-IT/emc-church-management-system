'use client';

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MemberEvent } from '@/lib/types/member';
import { EventCard } from './event-card';
import { cn } from '@/lib/utils';

export interface EventsCalendarViewProps {
  events: MemberEvent[];
  onRegisterClick?: (event: MemberEvent) => void;
  className?: string;
}

export function EventsCalendarView({
  events,
  onRegisterClick,
  className,
}: EventsCalendarViewProps) {
  // Anchor month for realistic mock
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date('2026-09-01T00:00:00Z'));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date('2026-09-18T00:00:00Z'));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Map events to date string keys (yyyy-MM-dd)
  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(parseISO(event.startDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, MemberEvent[]>);

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const eventsForSelectedDate = eventsByDate[selectedDateKey] || [];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="overflow-hidden">
        {/* Calendar Month Header */}
        <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold text-foreground font-heading">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a date to view scheduled gatherings and conferences.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-8 w-8"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-8 w-8"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-5">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground pb-2 border-b border-border/30">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {daysInCalendar.map((day) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayEvents = eventsByDate[dayKey] || [];
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonthDay = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'min-h-[56px] sm:min-h-[70px] p-1.5 sm:p-2 rounded-lg text-left transition-colors flex flex-col justify-between border outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : isCurrentMonthDay
                        ? 'border-transparent hover:bg-muted/40'
                        : 'border-transparent text-muted-foreground/40 hover:bg-muted/20',
                    dayEvents.length > 0 && !isSelected && 'bg-muted/20 border-border/40'
                  )}
                >
                  <span
                    className={cn(
                      'text-xs font-medium inline-block w-6 h-6 leading-6 text-center rounded-full',
                      isSelected && 'bg-primary text-primary-foreground font-bold'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Event indicator dots / badges */}
                  {dayEvents.length > 0 && (
                    <div className="mt-1 flex flex-col gap-0.5">
                      <span className="hidden sm:block text-[10px] font-medium text-foreground truncate px-1 py-0.5 rounded bg-background border border-border/40">
                        {dayEvents[0].title}
                      </span>
                      <div className="flex items-center gap-1 sm:hidden">
                        {dayEvents.slice(0, 3).map((_, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-primary inline-block"
                          />
                        ))}
                      </div>
                      {dayEvents.length > 1 && (
                        <span className="hidden sm:block text-[9px] text-muted-foreground pl-1">
                          +{dayEvents.length - 1} more
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events List */}
      <section aria-label="Events on selected date" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground font-heading">
            Events on {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <Badge variant="neutral" size="sm">
            {eventsForSelectedDate.length} Event{eventsForSelectedDate.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {eventsForSelectedDate.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventsForSelectedDate.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRegisterClick={onRegisterClick}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-xs text-muted-foreground border-dashed">
            No church events scheduled for this day.
          </Card>
        )}
      </section>
    </div>
  );
}
