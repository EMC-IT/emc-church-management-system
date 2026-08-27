'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { incomeService } from '@/services';
import { IncomeCategory, IncomeFormData, IncomeStatus } from '@/lib/types';

export default function RecordIncomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);

  const [form, setForm] = useState({
    description: '',
    categoryId: '',
    source: '',
    amount: '',
    currency: 'GHS',
    paymentMethod: 'Bank Transfer',
    date: new Date(),
    status: 'received' as IncomeStatus,
    reference: '',
    notes: '',
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await incomeService.getCategories();
        const activeCats = res.data.filter((c) => c.isActive);
        setCategories(activeCats);
        if (activeCats.length > 0) {
          setForm((prev) => ({ ...prev, categoryId: activeCats[0].id }));
        }
      } catch {
        // Fallback handled by service
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description / Purpose is required.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please select an income category.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.source.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Source / Payer is required.',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter an amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: IncomeFormData = {
        description: form.description.trim(),
        categoryId: form.categoryId,
        source: form.source.trim(),
        amount: amountNum,
        currency: form.currency,
        paymentMethod: form.paymentMethod,
        date: form.date.toISOString().split('T')[0],
        status: form.status,
        reference: form.reference.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      await incomeService.createIncome(payload);

      toast({
        title: 'Income Recorded',
        description: `Recorded ${form.currency} ${amountNum.toFixed(2)} from ${form.source}.`,
      });

      router.push('/dashboard/finance/income');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to record income.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/income" aria-label="Back to Income">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader title="Record Income" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Income Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">
                Description / Purpose <span className="text-destructive">*</span>
              </Label>
              <Input
                id="description"
                placeholder="e.g. Wedding Event Hall Rental / Sunday Book Sales"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Income Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => setForm({ ...form, categoryId: val })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source / Payer */}
            <div className="space-y-2">
              <Label htmlFor="source">
                Source / Payer <span className="text-destructive">*</span>
              </Label>
              <Input
                id="source"
                placeholder="e.g. Johnson Family, Bookstore, City Council, NGO"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                required
              />
            </div>

            {/* Amount & Currency */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  value={form.currency}
                  onValueChange={(val) => setForm({ ...form, currency: val })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="flex-1"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="method">
                Payment Method <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.paymentMethod}
                onValueChange={(val) => setForm({ ...form, paymentMethod: val })}
              >
                <SelectTrigger id="method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>
                Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                value={form.date}
                onChange={(d) => d && setForm({ ...form, date: d })}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val as IncomeStatus })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reference">Reference / Invoice # (Optional)</Label>
              <Input
                id="reference"
                placeholder="e.g. INV-2024-001, RCT-482"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes / Purpose</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this income transaction..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/finance/income">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-1.5 h-4 w-4" />
            {isSubmitting ? 'Recording...' : 'Record Income'}
          </Button>
        </div>
      </form>
    </div>
  );
}
