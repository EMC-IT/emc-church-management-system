'use client';

import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Video, Phone, UserCheck, Ban } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberPastoralCareRequest } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface PastoralCareRequestCardProps {
  request: MemberPastoralCareRequest;
  onViewDetails: (request: MemberPastoralCareRequest) => void;
  onCancel?: (request: MemberPastoralCareRequest) => void;
  className?: string;
}

export function PastoralCareRequestCard({
  request,
  onViewDetails,
  onCancel,
  className,
}: PastoralCareRequestCardProps) {
  let formattedCreatedDate = 'Recently';
  try {
    formattedCreatedDate = format(parseISO(request.createdAt), 'MMM d, yyyy');
  } catch {
    formattedCreatedDate = request.createdAt;
  }

  const isScheduled = request.status === 'Scheduled';
  const isCancelled = request.status === 'Cancelled';
  const isRequested = request.status === 'Requested';

  return (
    <Card
      className={cn(
        'flex flex-col justify-between hover:border-primary/40 transition-colors',
        isScheduled && 'border-primary/30 bg-primary/5',
        isCancelled && 'opacity-60',
        className
      )}
    >
      <CardHeader className="p-5 pb-3 space-y-2">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="neutral" size="sm">
              {request.category}
            </Badge>
            <Badge variant="info" size="sm">
              {request.preferredMode}
            </Badge>
            {request.urgency === 'Urgent' && (
              <Badge variant="danger" size="sm">
                Urgent
              </Badge>
            )}
          </div>

          <StatusBadge status={request.status} size="sm" />
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(request)}
          className="text-left font-heading font-semibold text-base text-foreground leading-snug hover:text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          {request.category} Request
        </button>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {request.reason || request.summaryNotes}
        </p>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-2 flex-1 text-xs">
        {/* Scheduled details banner if active */}
        {isScheduled && request.scheduledDateTime && (
          <div className="p-3 rounded-lg bg-background/90 border border-border/50 space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {format(parseISO(request.scheduledDateTime), 'EEEE, MMMM d @ h:mm a')}
              </span>
            </div>
            {request.locationOrLink && (
              <p className="text-muted-foreground text-[11px] truncate">
                Location / Link: {request.locationOrLink}
              </p>
            )}
          </div>
        )}

        {!isScheduled && request.preferredDate && (
          <div className="text-muted-foreground text-[11px]">
            Preferred Date: {request.preferredDate} {request.preferredTimeSlot ? `(${request.preferredTimeSlot})` : ''}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Requested on {formattedCreatedDate}</span>

        <div className="flex items-center gap-2">
          {isRequested && onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onCancel(request)}
              className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              <span>Cancel</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(request)}
            className="h-8 text-xs font-medium"
          >
            Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
