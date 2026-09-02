'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, Heart, ShieldCheck } from 'lucide-react';
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
  prayerRequestSchema,
  PrayerRequestFormData,
} from '@/lib/validation/member';
import { memberPrayerService } from '@/services/member';
import { MemberPrayerRequest } from '@/lib/types/member';

export interface PrayerRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newRequest: MemberPrayerRequest) => void;
}

const PRAYER_CATEGORIES = [
  'General',
  'Family',
  'Health & Healing',
  'Work & Career',
  'Finances',
  'Relationships',
  'Spiritual Growth',
  'Thanksgiving',
  'Guidance',
  'Other',
];

export function PrayerRequestDialog({
  open,
  onOpenChange,
  onSuccess,
}: PrayerRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] =
    useState<MemberPrayerRequest | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: {
      title: '',
      category: 'General',
      description: '',
      privacy: 'Pastoral Team Only',
      isUrgent: false,
    },
  });

  const category = watch('category');
  const privacy = watch('privacy');
  const isUrgent = watch('isUrgent');

  const onSubmit = async (data: PrayerRequestFormData) => {
    setIsSubmitting(true);
    try {
      const res = await memberPrayerService.createPrayerRequest(data);
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
                Prayer Request Submitted
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Thank you for sharing your prayer burden with us. Our pastoral intercessors and prayer team will stand in faith with you.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-muted/40 border border-border/40 text-left text-xs space-y-1">
              <span className="font-semibold text-foreground block truncate">
                {submittedRequest.title}
              </span>
              <p className="text-muted-foreground line-clamp-2">
                {submittedRequest.description}
              </p>
              <div className="text-[11px] text-muted-foreground/80 pt-1">
                Visibility: <strong className="text-foreground">{submittedRequest.privacy}</strong>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button size="sm" onClick={handleClose} className="font-medium">
                Done
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader className="border-b border-border/40 pb-3">
              <DialogTitle className="text-lg font-bold text-foreground">
                Submit a Prayer Request
              </DialogTitle>
              <DialogDescription className="text-xs">
                Share your prayer requests with our church prayer team and pastors.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-1 text-xs">
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs">
                  Request Title / Topic *
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. Healing for my mother, Guidance in job transition..."
                  className="h-9 text-xs"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs">
                  Prayer Category *
                </Label>
                <Select
                  value={category}
                  onValueChange={(val) => setValue('category', val)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_CATEGORIES.map((cat) => (
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

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">
                  Prayer Details *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Share details so our prayer intercessors can pray specifically with you..."
                  rows={4}
                  className="text-xs"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-xs text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Privacy Preferences */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <Label className="text-xs">Privacy & Visibility Preference</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setValue('privacy', 'Pastoral Team Only')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      privacy === 'Pastoral Team Only'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <span className="font-semibold block text-foreground">
                      Pastoral Team Only
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Shared confidentially with pastors only
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue('privacy', 'Church Prayer Team')}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      privacy === 'Church Prayer Team'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 hover:bg-muted/30 text-muted-foreground'
                    }`}
                  >
                    <span className="font-semibold block text-foreground">
                      Church Prayer Team
                    </span>
                    <span className="text-[11px] text-muted-foreground block mt-0.5">
                      Lifted by intercessory prayer group
                    </span>
                  </button>
                </div>
              </div>

              {/* Urgent Flag Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <Checkbox
                  id="isUrgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setValue('isUrgent', !!checked)}
                />
                <Label
                  htmlFor="isUrgent"
                  className="text-xs font-normal text-muted-foreground cursor-pointer"
                >
                  Mark as urgent intercession need (e.g. emergency surgery, crisis)
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
                  <span>Submit Prayer Request</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
