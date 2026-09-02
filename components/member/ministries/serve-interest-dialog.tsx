'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, HeartHandshake } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DiscoverableMinistry } from '@/lib/types/member';
import { serveInterestSchema, ServeInterestFormData } from '@/lib/validation/member';
import { memberMinistriesService } from '@/services/member';

export interface ServeInterestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministry: DiscoverableMinistry | null;
  onSuccess?: () => void;
}

export function ServeInterestDialog({
  open,
  onOpenChange,
  ministry,
  onSuccess,
}: ServeInterestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServeInterestFormData>({
    resolver: zodResolver(serveInterestSchema),
    values: {
      ministryId: ministry?.id || '',
      areaOfInterest: ministry?.openRoles?.[0] || '',
      experience: '',
      availability: 'Sunday Services',
      message: '',
    },
  });

  const selectedArea = watch('areaOfInterest');

  const onSubmit = async (data: ServeInterestFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const res = await memberMinistriesService.submitMinistryInterest(data);
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

  if (!ministry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Serve in {ministry.name}</DialogTitle>
          <DialogDescription className="text-xs">
            Led by {ministry.leaderName} ({ministry.leaderTitle})
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <input type="hidden" {...register('ministryId')} />

          <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs space-y-1">
            <div className="font-semibold text-foreground">{ministry.name}</div>
            <div className="text-muted-foreground">{ministry.description}</div>
            <div className="text-muted-foreground pt-1 text-[11px]">
              Service Commitment: <strong className="text-foreground">{ministry.serviceTime}</strong>
            </div>
          </div>

          {/* Area of Interest */}
          <div className="space-y-1.5">
            <Label htmlFor="areaOfInterest" className="text-xs">
              Area / Role of Interest *
            </Label>
            {ministry.openRoles && ministry.openRoles.length > 0 ? (
              <Select
                value={selectedArea}
                onValueChange={(val) =>
                  setValue('areaOfInterest', val, { shouldValidate: true })
                }
              >
                <SelectTrigger id="areaOfInterest" className="text-xs">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ministry.openRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                  <SelectItem value="General Volunteer">General Volunteer / Other</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="areaOfInterest"
                placeholder="e.g. Stage Logistics / Sound Mixing"
                className="text-xs"
                {...register('areaOfInterest')}
              />
            )}
            {errors.areaOfInterest && (
              <p className="text-xs text-destructive">{errors.areaOfInterest.message}</p>
            )}
          </div>

          {/* Relevant Experience */}
          <div className="space-y-1.5">
            <Label htmlFor="serveExperience" className="text-xs">
              Prior Experience or Skills (Optional)
            </Label>
            <Input
              id="serveExperience"
              placeholder="e.g., 2 years audio mixing / choir tenor"
              className="text-xs"
              {...register('experience')}
            />
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Label htmlFor="serveMessage" className="text-xs">
              Message to Ministry Leader (Optional)
            </Label>
            <Textarea
              id="serveMessage"
              placeholder="Share your heart or motivation for wanting to serve in this ministry..."
              rows={2}
              className="text-xs"
              {...register('message')}
            />
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
                  Submitting Interest...
                </>
              ) : (
                'Submit Interest to Serve'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
