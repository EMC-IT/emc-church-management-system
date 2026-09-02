'use client';

import { format, parseISO } from 'date-fns';
import { Calendar, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberPastoralCareRequest } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface PastoralCareOverviewProps {
  requests: MemberPastoralCareRequest[];
  className?: string;
}

export function PastoralCareOverview({
  requests,
  className,
}: PastoralCareOverviewProps) {
  const scheduledSession = requests.find((r) => r.status === 'Scheduled');
  const activeCount = requests.filter(
    (r) => r.status === 'Requested' || r.status === 'In Progress'
  ).length;
  const completedCount = requests.filter((r) => r.status === 'Completed').length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Scheduled Session Highlight if any */}
      {scheduledSession && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="p-4 sm:p-5 pb-2 flex flex-row items-center justify-between gap-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-semibold text-foreground font-heading">
                Upcoming Appointment: {scheduledSession.category}
              </CardTitle>
              <Badge variant="info" size="sm">
                {scheduledSession.preferredMode}
              </Badge>
            </div>
            <StatusBadge status="Scheduled" size="sm" />
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-3 space-y-2 text-xs">
            {scheduledSession.scheduledDateTime && (
              <div className="flex items-center gap-2 text-primary font-medium">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  {format(parseISO(scheduledSession.scheduledDateTime), 'EEEE, MMMM d, yyyy @ h:mm a')}
                </span>
              </div>
            )}

            {scheduledSession.locationOrLink && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{scheduledSession.locationOrLink}</span>
              </div>
            )}

            {scheduledSession.assignedPastor && (
              <p className="text-muted-foreground text-[11px] pt-1">
                Pastor: <strong className="text-foreground">{scheduledSession.assignedPastor}</strong>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">
              Total Care Requests
            </span>
            <span className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              {requests.length}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">
              Active / Scheduled
            </span>
            <span className="text-xl sm:text-2xl font-bold font-heading text-primary">
              {activeCount + (scheduledSession ? 1 : 0)}
            </span>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="p-4 sm:p-5 space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">
              Completed Sessions
            </span>
            <span className="text-xl sm:text-2xl font-bold font-heading text-muted-foreground">
              {completedCount}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
