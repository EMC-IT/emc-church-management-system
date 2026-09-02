'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Ticket, Ban } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberEventRegistration } from '@/lib/types/member';
import { CancelRegistrationDialog } from './cancel-registration-dialog';
import { cn } from '@/lib/utils';

export interface MyRegistrationsViewProps {
  registrations: MemberEventRegistration[];
  onRegistrationCancelled?: () => void;
  className?: string;
}

export function MyRegistrationsView({
  registrations,
  onRegistrationCancelled,
  className,
}: MyRegistrationsViewProps) {
  const [selectedRegToCancel, setSelectedRegToCancel] = useState<MemberEventRegistration | null>(
    null
  );
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');
  const pastOrCancelled = registrations.filter((r) => r.status !== 'confirmed');

  const handleCancelClick = (reg: MemberEventRegistration) => {
    setSelectedRegToCancel(reg);
    setIsCancelOpen(true);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Active / Upcoming Registrations */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-border/40 flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground font-heading">
            Confirmed Event Tickets ({activeRegistrations.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-border/40">
          {activeRegistrations.length > 0 ? (
            activeRegistrations.map((reg) => {
              const startDate = parseISO(reg.eventStartDate);
              const month = format(startDate, 'MMM');
              const day = format(startDate, 'dd');
              const weekdayAndTime = format(startDate, 'EEE, h:mm a');

              return (
                <div
                  key={reg.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-muted/10 transition-colors"
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Date Badge */}
                    <div className="w-12 py-1.5 rounded-md bg-muted/70 border border-border/50 text-center shrink-0">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground block leading-tight">
                        {month}
                      </span>
                      <span className="text-base font-bold text-foreground block leading-none pt-0.5">
                        {day}
                      </span>
                    </div>

                    {/* Registration details */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/portal/events/${reg.eventId}`}>
                          <h4 className="text-sm font-semibold text-foreground font-heading hover:text-primary transition-colors">
                            {reg.eventTitle}
                          </h4>
                        </Link>
                        <Badge variant="neutral" size="sm">
                          {reg.eventCategory}
                        </Badge>
                        <StatusBadge status="Confirmed" size="sm" />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        <span>{weekdayAndTime}</span>
                        <span>•</span>
                        <span>{reg.venue}</span>
                        <span>•</span>
                        <span>Type: <strong className="text-foreground font-medium">{reg.attendanceType}</strong></span>
                      </div>

                      {/* Ticket Reference Code */}
                      <div className="flex items-center gap-1.5 text-xs text-primary font-mono pt-1">
                        <Ticket className="h-3.5 w-3.5" />
                        <span>Ticket Code: <strong className="font-bold tracking-wider">{reg.ticketReference}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <Link href={`/portal/events/${reg.eventId}`}>
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-medium">
                        View Event
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelClick(reg)}
                      className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Ban className="h-3.5 w-3.5 mr-1" />
                      <span>Cancel</span>
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-muted-foreground">
              You do not have any active upcoming event registrations.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past / Cancelled History */}
      {pastOrCancelled.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:p-5 border-b border-border/40">
            <CardTitle className="text-sm font-semibold text-muted-foreground font-heading">
              Past & Cancelled Registrations ({pastOrCancelled.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border/40">
            {pastOrCancelled.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between gap-4 p-4 text-xs text-muted-foreground opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="space-y-0.5">
                  <span className="font-medium text-foreground">{reg.eventTitle}</span>
                  <div>
                    {format(parseISO(reg.eventStartDate), 'MMM dd, yyyy')} • Ticket: {reg.ticketReference}
                  </div>
                </div>
                <StatusBadge status={reg.status} size="sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Cancel Registration Dialog */}
      <CancelRegistrationDialog
        open={isCancelOpen}
        onOpenChange={setIsCancelOpen}
        registration={selectedRegToCancel}
        onSuccess={onRegistrationCancelled}
      />
    </div>
  );
}
