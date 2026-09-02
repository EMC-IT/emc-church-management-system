'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Share2,
  CalendarPlus,
  Ticket,
  Ban,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberEvent, MemberEventRegistration } from '@/lib/types/member';
import { EventSchedule } from './event-schedule';
import { EventRegistrationDialog } from './event-registration-dialog';
import { CancelRegistrationDialog } from './cancel-registration-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface EventDetailsProps {
  event: MemberEvent;
  registration?: MemberEventRegistration | null;
  onRefresh?: () => void;
  className?: string;
}

export function EventDetails({
  event,
  registration: initialRegistration = null,
  onRefresh,
  className,
}: EventDetailsProps) {
  const [currentRegistration, setCurrentRegistration] = useState<MemberEventRegistration | null>(
    initialRegistration
  );
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const { toast } = useToast();

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const formattedDateRange = `${format(startDate, 'EEEE, MMMM d, yyyy')}`;
  const formattedTimeRange = `${format(startDate, 'h:mm a')} – ${format(endDate, 'h:mm a')}`;

  const isRegistered = !!currentRegistration || event.registrationStatus === 'registered';
  const isFull = event.registrationStatus === 'full';
  const isClosed = event.registrationStatus === 'closed';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or fallback
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Event link copied to your clipboard.',
      });
    }
  };

  const handleAddToCalendar = () => {
    // Generate .ics calendar payload
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EMC Church//Member Portal//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, ' ')}`,
      `LOCATION:${event.venue}, ${event.branch}`,
      `DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTEND:${format(endDate, "yyyyMMdd'T'HHmmss'Z'")}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Calendar Event Downloaded',
      description: 'The .ics file has been downloaded. Import it to your calendar.',
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Back Link */}
      <Link
        href="/portal/events"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Events</span>
      </Link>

      {/* Main Grid: Left Details & Right Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="neutral" size="sm">
                  {event.category}
                </Badge>
                {event.isOnline && (
                  <Badge variant="info" size="sm">
                    Online Broadcast Available
                  </Badge>
                )}
                {isRegistered ? (
                  <StatusBadge status="Registered" size="sm" />
                ) : isFull ? (
                  <StatusBadge status="Full" size="sm" />
                ) : isClosed ? (
                  <StatusBadge status="Closed" size="sm" />
                ) : null}
              </div>

              <h2 className="font-heading font-bold text-lg sm:text-xl text-foreground leading-tight">
                {event.title}
              </h2>


              {/* Date & Location Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground border-t border-border/40">
                <div className="flex items-start gap-2.5">
                  <CalendarIcon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">{formattedDateRange}</span>
                    <span>{formattedTimeRange}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-foreground block">{event.venue}</span>
                    <span>{event.branch} {event.address ? `• ${event.address}` : ''}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 pt-0 space-y-4 text-xs">
              <div className="space-y-1.5 border-t border-border/40 pt-4">
                <h2 className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
                  About This Event
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {event.description}
                </p>
              </div>

              {event.isOnline && event.onlineLink && (
                <div className="p-3.5 rounded-lg bg-info/10 border border-info/20 space-y-1">
                  <span className="font-semibold text-foreground text-xs block">
                    Online Livestream Access
                  </span>
                  <p className="text-muted-foreground text-xs">
                    This gathering will also be streamed online for remote members. Stream link will be live 15 minutes before the start time:
                  </p>
                  <a
                    href={event.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium text-xs break-all block pt-0.5"
                  >
                    {event.onlineLink}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Host / Minister Card */}
          {event.host && (
            <Card>
              <CardHeader className="p-4 sm:p-5 border-b border-border/40">
                <CardTitle className="text-sm font-semibold text-foreground font-heading">
                  Event Host & Minister
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 flex items-center gap-3.5">
                <Avatar className="h-10 w-10">
                  {event.host.avatarUrl && (
                    <AvatarImage src={event.host.avatarUrl} alt={event.host.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                    {event.host.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{event.host.name}</h3>
                  <p className="text-xs text-muted-foreground">{event.host.title}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Multi-Session Schedule Timeline */}
          {event.schedule && event.schedule.length > 0 && (
            <EventSchedule schedule={event.schedule} />
          )}
        </div>

        {/* Right Col: Registration & Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 sm:p-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold text-foreground font-heading">
                Registration & Access
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              {/* Registration / Admission Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Admission:</span>
                  <span className="font-semibold text-foreground">
                    {event.fee && !event.fee.isFree
                      ? `${event.fee.currency} ${event.fee.amount}`
                      : 'Free Entry'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {isRegistered ? (
                    <StatusBadge status="Confirmed" size="sm" />
                  ) : isFull ? (
                    <StatusBadge status="Full" size="sm" />
                  ) : isClosed ? (
                    <StatusBadge status="Closed" size="sm" />
                  ) : (
                    <Badge variant="success" size="sm">
                      Open
                    </Badge>
                  )}
                </div>

                {event.capacity && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Capacity:</span>
                    <span>{event.registeredCount} / {event.capacity} Registered</span>
                  </div>
                )}
              </div>

              {/* Already Registered Ticket Card */}
              {isRegistered && currentRegistration && (
                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <Ticket className="h-4 w-4" />
                    <span>Your Ticket Code</span>
                  </div>
                  <p className="font-mono font-bold text-base text-foreground tracking-wider">
                    {currentRegistration.ticketReference}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Type: {currentRegistration.attendanceType}
                  </p>
                </div>
              )}

              {/* Primary Action Button */}
              {event.requiresRegistration ? (
                isRegistered ? (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full text-xs font-medium"
                      disabled
                    >
                      You are Registered
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsCancelOpen(true)}
                      className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Ban className="h-3.5 w-3.5 mr-1" />
                      <span>Cancel Registration</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    disabled={isFull || isClosed}
                    onClick={() => setIsRegisterOpen(true)}
                    className="w-full text-xs font-medium"
                  >
                    {isFull ? 'Event Full' : isClosed ? 'Registration Closed' : 'Register for Event'}
                  </Button>
                )
              ) : (
                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-center text-muted-foreground">
                  No advance registration required. All are welcome!
                </div>
              )}

              {/* Utility Actions: Add to Calendar & Share */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddToCalendar}
                  className="w-full text-xs gap-1.5 font-medium"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Add to Calendar (.ics)</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="w-full text-xs gap-1.5 font-medium"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Event</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registration Modal Dialog */}
      <EventRegistrationDialog
        open={isRegisterOpen}
        onOpenChange={setIsRegisterOpen}
        event={event}
        onSuccess={(newReg) => {
          setCurrentRegistration(newReg);
          if (onRefresh) onRefresh();
        }}
      />

      {/* Cancel Registration Confirmation Dialog */}
      <CancelRegistrationDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        registration={currentRegistration}
        onSuccess={() => {
          setCurrentRegistration(null);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
}
