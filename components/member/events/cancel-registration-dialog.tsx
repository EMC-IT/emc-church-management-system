'use client';

import { useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MemberEventRegistration } from '@/lib/types/member';
import { memberEventsService } from '@/services/member';
import { useToast } from '@/hooks/use-toast';

export interface CancelRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: MemberEventRegistration | null;
  onSuccess?: () => void;
}

export function CancelRegistrationDialog({
  open,
  onOpenChange,
  registration,
  onSuccess,
}: CancelRegistrationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!registration) return null;

  const handleCancel = async () => {
    setIsSubmitting(true);
    try {
      const res = await memberEventsService.cancelRegistration(registration.id);
      toast({
        title: 'Registration Cancelled',
        description: res.message,
      });
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Event Registration?</DialogTitle>
          <DialogDescription className="text-xs">
            Are you sure you want to release your seat for{' '}
            <strong className="text-foreground font-semibold">{registration.eventTitle}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              Ticket <strong className="text-foreground font-mono">{registration.ticketReference}</strong> will be invalidated and released for other attendees.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border/40 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Keep Registration
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isSubmitting}
            onClick={handleCancel}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                <span>Cancelling...</span>
              </>
            ) : (
              <span>Yes, Cancel Registration</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
