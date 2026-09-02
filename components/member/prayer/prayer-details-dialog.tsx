'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Check, CheckCircle2, Heart } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MemberPrayerRequest } from '@/lib/types/member';

export interface PrayerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MemberPrayerRequest | null;
  onMarkAnswered?: (request: MemberPrayerRequest, testimony?: string) => void;
}

export function PrayerDetailsDialog({
  open,
  onOpenChange,
  request,
  onMarkAnswered,
}: PrayerDetailsDialogProps) {
  const [isTestimonyMode, setIsTestimonyMode] = useState(false);
  const [testimonyText, setTestimonyText] = useState('');

  if (!request) return null;

  let formattedDate = 'Recently';
  try {
    formattedDate = format(parseISO(request.createdAt), 'MMMM d, yyyy');
  } catch {
    formattedDate = request.createdAt;
  }

  const isAnswered = request.status === 'Answered';

  const handleSaveAnswered = () => {
    if (onMarkAnswered) {
      onMarkAnswered(request, testimonyText.trim() || undefined);
    }
    setIsTestimonyMode(false);
    setTestimonyText('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="neutral" size="sm">
              {request.category}
            </Badge>
            <Badge variant="info" size="sm">
              {request.privacy}
            </Badge>
            <StatusBadge status={request.status} size="sm" />
          </div>

          <DialogTitle className="text-lg font-bold">{request.title}</DialogTitle>
          <DialogDescription className="text-xs">
            Submitted on {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Request Body */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              Prayer Request
            </span>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {/* Answered Testimony if recorded */}
          {isAnswered && request.testimony && (
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Praise Report & Answered Testimony</span>
              </div>
              <p className="text-foreground italic leading-relaxed text-xs">
                &ldquo;{request.testimony}&rdquo;
              </p>
              {request.answeredDate && (
                <span className="text-[10px] text-muted-foreground block pt-1">
                  Recorded on {format(parseISO(request.answeredDate), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          )}

          {/* In-Dialog Mark Answered Mode */}
          {!isAnswered && isTestimonyMode && (
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 space-y-2.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Heart className="h-4 w-4 text-emerald-600" />
                <span>Celebrate Answered Prayer</span>
              </div>
              <p className="text-muted-foreground text-xs">
                Would you like to write a short testimony or thanksgiving note? (Optional)
              </p>
              <Textarea
                placeholder="How did God answer your prayer?"
                value={testimonyText}
                onChange={(e) => setTestimonyText(e.target.value)}
                rows={3}
                className="text-xs"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsTestimonyMode(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveAnswered}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs"
                >
                  Confirm Answered
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t border-border/40 flex items-center justify-between">
          {!isAnswered && !isTestimonyMode && onMarkAnswered ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTestimonyMode(true)}
              className="text-xs text-emerald-600 hover:text-emerald-700"
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              <span>Mark as Answered</span>
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
