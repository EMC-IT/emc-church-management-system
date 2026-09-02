'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2, Check, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { MemberPastoralCareRequest, PastoralCareCategory, PastoralCareMode } from '@/lib/types/member';

export interface PastoralCareRequestFormProps {
  onSuccess?: (newRequest: MemberPastoralCareRequest) => void;
  className?: string;
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

export function PastoralCareRequestForm({
  onSuccess,
  className,
}: PastoralCareRequestFormProps) {
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

  const handleReset = () => {
    setSubmittedRequest(null);
    reset();
  };

  return (
    <div className={className}>
      {submittedRequest ? (
        /* Submission Confirmation Card */
        <Card className="max-w-lg mx-auto text-center border-primary/30 bg-primary/5">
          <CardContent className="p-6 sm:p-8 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Check className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground">
                Pastoral Care Request Received
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Your request has been confidentially submitted to the pastoral team. A pastor will reach out to you to confirm appointment details.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-background/80 border border-border/40 text-left text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {submittedRequest.category} Care
                </span>
                <span className="text-muted-foreground text-[11px]">
                  {submittedRequest.preferredMode}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2">
                {submittedRequest.reason || submittedRequest.summaryNotes}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Link href="/portal/pastoral-care">
                <Button size="sm" className="font-medium">
                  View My Requests
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={handleReset}>
                New Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Submission Form Card */
        <Card className="max-w-xl mx-auto">
          <CardHeader className="p-5 sm:p-6 border-b border-border/40 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base sm:text-lg font-bold text-foreground font-heading">
                Request Pastoral Care Session
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-xs text-muted-foreground">
              Please let us know how we can best support you. All requests are strictly confidential.
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Category Select */}
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

              {/* Preferred Date & Time Slot */}
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
                    placeholder="e.g. Morning (9am-12pm), Evenings..."
                    className="h-9 text-xs"
                    {...register('preferredTimeSlot')}
                  />
                </div>
              </div>

              {/* Description / Reason */}
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
              <div className="flex items-center space-x-2 pt-2 border-t border-border/40">
                <Checkbox
                  id="isUrgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setValue('isUrgent', !!checked)}
                />
                <Label
                  htmlFor="isUrgent"
                  className="text-xs font-normal text-muted-foreground cursor-pointer"
                >
                  This is an urgent situation requiring prompt pastoral attention (e.g. bereavement, critical hospital admission)
                </Label>
              </div>
            </CardContent>

            <CardFooter className="p-5 sm:p-6 border-t border-border/40 flex items-center justify-between">
              <Link href="/portal/pastoral-care">
                <Button type="button" variant="ghost" size="sm" className="h-8 text-xs font-medium">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  <span>Cancel</span>
                </Button>
              </Link>

              <Button type="submit" size="sm" disabled={isSubmitting} className="h-9 font-medium">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Care Request</span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}
