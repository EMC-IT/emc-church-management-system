'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, ShieldCheck } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  pastoralCareRequestSchema,
  PastoralCareRequestFormData,
} from '@/lib/validation/member';
import { memberPastoralCareService } from '@/services/member';
import {
  MemberPastoralCareRequest,
  PastoralCareCategory,
  PastoralCareMode,
} from '@/lib/types/member';

export interface PastoralCareRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newRequest: MemberPastoralCareRequest) => void;
}

const CARE_CATEGORIES: PastoralCareCategory[] = [
  'Counseling',
  'Hospital Visit',
  'Bereavement',
  'Home Visit',
  'Spiritual Guidance',
  'Dedication / Blessing',
  'Other',
];

export function PastoralCareRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: PastoralCareRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] =
    useState<MemberPastoralCareRequest | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PastoralCareRequestFormData>({
    resolver: zodResolver(pastoralCareRequestSchema),
    defaultValues: {
      category: 'Counseling',
      preferredMode: 'In-Person',
      preferredDate: '',
      preferredTimeSlot: '',
      reason: '',
      isUrgent: false,
    },
  });

  const category = watch('category');
  const preferredMode = watch('preferredMode');
  const isUrgent = watch('isUrgent');

  const onSubmit = async (data: PastoralCareRequestFormData) => {
    setIsSubmitting(true);
    try {
      const res = await memberPastoralCareService.requestPastoralCare(data);
      setSubmittedRequest(res);
      if (onSuccess) onSuccess(res);
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmittedRequest(null);
    reset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setSubmittedRequest(null);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {submittedRequest ? (
          /* Confirmation View */
          <div className="py-4 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Check className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-foreground">
                Pastoral Care Request Received
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your request has been confidentially submitted to the pastoral team. A pastor will reach out to you to confirm appointment details.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {submittedRequest.category} Care
                </span>
                <span className="text-muted-foreground text-[11px]">
                  Mode: {submittedRequest.preferredMode}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2">
                {submittedRequest.reason || submittedRequest.summaryNotes}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button size="sm" onClick={handleClose} className="font-medium">
                Done
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                New Request
              </Button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader className="border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-lg font-bold text-foreground">
                  Request Pastoral Care Session
                </DialogTitle>
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              </div>
              <DialogDescription className="text-xs">
                Submit a confidential request for pastoral counseling, hospital visitation, or spiritual guidance.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1 text-xs">
              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs">
                  Nature of Support / Category *
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) =>
                    setValue('category', val as PastoralCareCategory)
                  }
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select care category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Preferred Mode */}
              <div className="space-y-2">
                <Label className="text-xs">Preferred Meeting Mode *</Label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['In-Person', 'Phone Call', 'Video Call'] as PastoralCareMode[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setValue('preferredMode', mode)}
                        className={`p-2.5 rounded-lg border text-center font-medium transition-colors ${
                          preferredMode === mode
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Preferred Date & Time Window */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="preferredDate" className="text-xs">
                    Preferred Date (Optional)
                  </Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    className="h-9 text-xs"
                    {...register('preferredDate')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="preferredTimeSlot" className="text-xs">
                    Preferred Time Window (Optional)
                  </Label>
                  <Input
                    id="preferredTimeSlot"
                    placeholder="e.g. Morning (9am-12pm)..."
                    className="h-9 text-xs"
                    {...register('preferredTimeSlot')}
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-xs">
                  Brief Details / Reason for Care Request *
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe what you would like to discuss or receive support with..."
                  rows={4}
                  className="text-xs"
                  {...register('reason')}
                />
                {errors.reason && (
                  <p className="text-xs text-destructive">{errors.reason.message}</p>
                )}
              </div>

              {/* Urgent Flag Checkbox */}
              <div className="flex items-center space-x-2 pt-1 border-t border-border/40">
                <Checkbox
                  id="isUrgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setValue('isUrgent', !!checked)}
                />
                <Label
                  htmlFor="isUrgent"
                  className="text-xs font-normal text-muted-foreground cursor-pointer"
                >
                  This is an urgent situation requiring prompt pastoral attention (e.g. bereavement, emergency admission)
                </Label>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border/40 flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 text-xs font-medium"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Care Request</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
