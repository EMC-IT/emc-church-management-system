'use client';

import { format, parseISO } from 'date-fns';
import { Calendar, MapPin, Video, Phone, ShieldCheck, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MemberPastoralCareRequest } from '@/lib/types/member';

export interface PastoralCareDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MemberPastoralCareRequest | null;
  onCancel?: (request: MemberPastoralCareRequest) => void;
}

export function PastoralCareDetailsDialog({
  open,
  onOpenChange,
  request,
  onCancel,
}: PastoralCareDetailsDialogProps) {
  if (!request) return null;

  let formattedCreatedDate = 'Recently';
  try {
    formattedCreatedDate = format(parseISO(request.createdAt), 'MMMM d, yyyy');
  } catch {
    formattedCreatedDate = request.createdAt;
  }

  const isScheduled = request.status === 'Scheduled';
  const isRequested = request.status === 'Requested';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="neutral" size="sm">
              {request.category}
            </Badge>
            <Badge variant="info" size="sm">
              {request.preferredMode}
            </Badge>
            <StatusBadge status={request.status} size="sm" />
          </div>

          <DialogTitle className="text-lg font-bold">
            {request.category} Pastoral Care
          </DialogTitle>
          <DialogDescription className="text-xs">
            Submitted on {formattedCreatedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Scheduled Session Banner if Active */}
          {isScheduled && request.scheduledDateTime && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <span className="font-semibold text-primary uppercase tracking-wider text-[11px] block">
                Scheduled Session Details
              </span>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>
                    {format(parseISO(request.scheduledDateTime), 'EEEE, MMMM d, yyyy @ h:mm a')}
                  </span>
                </div>

                {request.locationOrLink && (
                  <div className="flex items-center gap-2 text-muted-foreground pt-0.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{request.locationOrLink}</span>
                  </div>
                )}

                {request.assignedPastor && (
                  <p className="text-[11px] text-muted-foreground pt-1">
                    Meeting with: <strong className="text-foreground">{request.assignedPastor}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reason / Care Request Purpose */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              Reason for Care Request
            </span>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
              {request.reason || request.summaryNotes}
            </p>
          </div>

          {/* Preferences Summary */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-2">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              Contact & Mode Preferences
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="text-muted-foreground block text-[11px]">Preferred Mode</span>
                <span className="font-medium text-foreground">{request.preferredMode}</span>
              </div>
              {request.preferredDate && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Preferred Date</span>
                  <span className="font-medium text-foreground">
                    {request.preferredDate} {request.preferredTimeSlot ? `(${request.preferredTimeSlot})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Discretion & Privacy Notice */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              All pastoral counseling discussions are strictly confidential between you and the pastoral team.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border/40 flex items-center justify-between">
          {isRequested && onCancel ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onCancel(request);
                onOpenChange(false);
              }}
              className="text-xs text-destructive hover:text-destructive"
            >
              <Ban className="h-3.5 w-3.5 mr-1" />
              <span>Cancel Request</span>
            </Button>
          ) : (
            <div />
          )}

          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
