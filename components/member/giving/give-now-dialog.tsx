'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Check, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberGivingTransaction, GivingCategory, GivingPaymentMethod } from '@/lib/types/member';
import { giveNowSchema, GiveNowFormData } from '@/lib/validation/member';
import { memberGivingService } from '@/services/member';

export interface GiveNowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGivingSuccess: (transaction: MemberGivingTransaction) => void;
}

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];

export function GiveNowDialog({
  open,
  onOpenChange,
  onGivingSuccess,
}: GiveNowDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<GiveNowFormData>({
    resolver: zodResolver(giveNowSchema),
    defaultValues: {
      amount: 100,
      category: 'Offering',
      paymentMethod: 'Mobile Money',
      note: '',
      phone: '',
    },
  });

  const selectedCategory = watch('category');
  const selectedPaymentMethod = watch('paymentMethod');
  const currentAmount = watch('amount');

  const onSubmit = async (data: GiveNowFormData) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      const newTransaction = await memberGivingService.initiateGiving(data);
      setSuccessMessage('Thank you for your generous contribution!');
      onGivingSuccess(newTransaction);

      setTimeout(() => {
        setSuccessMessage(null);
        reset();
        onOpenChange(false);
      }, 1000);
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Give Online</DialogTitle>
          <DialogDescription>
            Support church ministries, tithes, building projects, and global missions.
          </DialogDescription>
        </DialogHeader>

        {/* Development Environment Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Simulation Mode:</strong> No actual financial charge will occur in this preview environment.
          </span>
        </div>

        {successMessage && (
          <div className="flex items-center gap-2 p-3 text-xs font-semibold text-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
            <Check className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Amount Field with Quick Selection */}
          <div className="space-y-2">
            <Label htmlFor="giveAmount">Giving Amount (GH₵) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                GH₵
              </span>
              <Input
                id="giveAmount"
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                className="pl-12 font-bold text-base"
                {...register('amount')}
                aria-invalid={!!errors.amount}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {QUICK_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  size="sm"
                  variant={Number(currentAmount) === amt ? 'default' : 'outline'}
                  className="h-7 text-xs px-2.5"
                  onClick={() => setValue('amount', amt, { shouldValidate: true })}
                >
                  GH₵ {amt}
                </Button>
              ))}
            </div>
          </div>

          {/* Giving Category */}
          <div className="space-y-1.5">
            <Label htmlFor="giveCategory">Giving Category *</Label>
            <Select
              value={selectedCategory}
              onValueChange={(val) =>
                setValue('category', val as GivingCategory, { shouldValidate: true })
              }
            >
              <SelectTrigger id="giveCategory">
                <SelectValue placeholder="Select giving type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tithe">Tithe (10%)</SelectItem>
                <SelectItem value="Offering">Sunday Offering</SelectItem>
                <SelectItem value="Building Fund">Building Expansion Fund</SelectItem>
                <SelectItem value="Missions">Global & Local Missions</SelectItem>
                <SelectItem value="Thanksgiving">Thanksgiving Seed</SelectItem>
                <SelectItem value="Welfare">Benevolence & Welfare</SelectItem>
                <SelectItem value="Special Seed">Special Seed Offering</SelectItem>
                <SelectItem value="Other">Other Contribution</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label htmlFor="givePaymentMethod">Payment Method *</Label>
            <Select
              value={selectedPaymentMethod}
              onValueChange={(val) =>
                setValue('paymentMethod', val as 'Mobile Money' | 'Card' | 'Bank Transfer', {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="givePaymentMethod">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mobile Money">Mobile Money (MTN / Telecel / AT)</SelectItem>
                <SelectItem value="Card">Credit / Debit Card</SelectItem>
                <SelectItem value="Bank Transfer">Direct Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Phone for Mobile Money */}
          {selectedPaymentMethod === 'Mobile Money' && (
            <div className="space-y-1.5">
              <Label htmlFor="givePhone">MoMo Phone Number</Label>
              <Input
                id="givePhone"
                placeholder="+233 24 000 0000"
                {...register('phone')}
              />
            </div>
          )}

          {/* Note / Purpose */}
          <div className="space-y-1.5">
            <Label htmlFor="giveNote">Note / Prayer Dedication (Optional)</Label>
            <Textarea
              id="giveNote"
              placeholder="e.g., In honor of family thanksgiving"
              rows={2}
              {...register('note')}
            />
          </div>

          <DialogFooter className="gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed with Giving'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
