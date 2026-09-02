'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DiscoverableGroup } from '@/lib/types/member';
import { joinGroupSchema, JoinGroupFormData } from '@/lib/validation/member';
import { memberGroupsService } from '@/services/member';

export interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: DiscoverableGroup | null;
  onSuccess?: () => void;
}

export function JoinGroupDialog({
  open,
  onOpenChange,
  group,
  onSuccess,
}: JoinGroupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinGroupFormData>({
    resolver: zodResolver(joinGroupSchema),
    values: {
      groupId: group?.id || '',
      message: '',
    },
  });

  const onSubmit = async (data: JoinGroupFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const res = await memberGroupsService.requestToJoinGroup(data);
      setSuccessMessage(res.message);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        onOpenChange(false);
      }, 1200);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request to Join {group.name}</DialogTitle>
          <DialogDescription className="text-xs">
            Led by {group.leaderName} • Meets {group.meetingDay}s at {group.meetingTime}
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <input type="hidden" {...register('groupId')} />

          <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs space-y-1">
            <div className="font-semibold text-foreground">{group.name}</div>
            <div className="text-muted-foreground">{group.description}</div>
            <div className="text-muted-foreground pt-1 text-[11px]">
              Venue: <strong className="text-foreground">{group.venue}</strong>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="joinMessage" className="text-xs">
              Note to Group Leader (Optional)
            </Label>
            <Textarea
              id="joinMessage"
              placeholder="e.g., Hello Leader, I recently moved into the neighborhood and would love to join fellowship."
              rows={3}
              className="text-xs"
              {...register('message')}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Request to Join'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
