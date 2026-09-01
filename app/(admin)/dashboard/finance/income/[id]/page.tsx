'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Save,
  BadgeCent,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { DetailsPageSkeleton } from '@/components/ui/skeleton-loaders';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { incomeService } from '@/services';
import { IncomeRecord, IncomeCategory, IncomeFormData, IncomeStatus } from '@/lib/types';

export default function IncomeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(searchParams.get('edit') === 'true');
  const [incomeData, setIncomeData] = useState<IncomeRecord | null>(null);
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

  const loadData = async () => {
    try {
      setLoading(true);
      const recordId = String(params.id);
      const [record, catsRes] = await Promise.all([
        incomeService.getIncomeById(recordId),
        incomeService.getCategories(),
      ]);

      setIncomeData(record);
      setCategories(catsRes.data);

      setForm({
        description: record.description,
        categoryId: record.categoryId,
        source: record.source,
        amount: String(record.amount),
        currency: record.currency || 'GHS',
        paymentMethod: record.paymentMethod || 'Bank Transfer',
        date: new Date(record.date),
        status: record.status,
        reference: record.reference || '',
        notes: record.notes || '',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load income details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeData) return;

    if (!form.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Description is required.',
        variant: 'destructive',
      });
      return;
    }

    const amountNum = parseFloat(form.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid amount greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<IncomeFormData> = {
        description: form.description.trim(),
        amount: amountNum,
        currency: form.currency,
        categoryId: form.categoryId,
        source: form.source.trim(),
        paymentMethod: form.paymentMethod,
        date: form.date.toISOString().split('T')[0],
        status: form.status,
        reference: form.reference.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      const res = await incomeService.updateIncome(incomeData.id, payload);
      setIncomeData(res.data);
      setIsEditing(false);
      toast({
        title: 'Success',
        description: 'Income record updated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update income record.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!incomeData) return;
    try {
      await incomeService.deleteIncome(incomeData.id);
      toast({
        title: 'Success',
        description: 'Income record deleted successfully.',
      });
      router.push('/dashboard/finance/income');
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete income record.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number, curr = 'GHS') => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return <DetailsPageSkeleton />;
  }

  if (!incomeData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Income Record Not Found" />
        <Button asChild variant="outline">
          <Link href="/dashboard/finance/income">Return to Income Overview</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/finance/income" aria-label="Back to Income">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader
            title={isEditing ? 'Edit Income' : incomeData.description}
          />
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => deleteDialog.openDialog(incomeData)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {!isEditing ? (
        /* View Mode */
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Financial Summary</CardTitle>
                <StatusBadge status={incomeData.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border bg-muted/20">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold mt-1 text-foreground">
                    {formatCurrency(incomeData.amount, incomeData.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-semibold mt-1">
                    {incomeData.categoryName || 'General'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Source / Payer</p>
                  <p className="text-sm font-semibold mt-1">{incomeData.source}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-semibold mt-1">
                    {new Date(incomeData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium block">Payment Method</span>
                  <span className="text-foreground mt-1 block">{incomeData.paymentMethod || '—'}</span>
                </div>

                <div>
                  <span className="text-muted-foreground font-medium block">Reference / Invoice #</span>
                  <span className="text-foreground mt-1 block">{incomeData.reference || '—'}</span>
                </div>

                <div className="md:col-span-2">
                  <span className="text-muted-foreground font-medium block">Notes / Description</span>
                  <p className="text-foreground mt-1 whitespace-pre-wrap">
                    {incomeData.notes || 'No additional notes provided.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Edit Mode Form matching Giving layout design */
        <form onSubmit={handleUpdate} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">
                  Description / Purpose <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="source">
                  Source / Payer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="source"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  required
                />
              </div>

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
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="flex-1"
                    required
                  />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label>
                  Date <span className="text-destructive">*</span>
                </Label>
                <DatePicker
                  value={form.date}
                  onChange={(d) => d && setForm({ ...form, date: d })}
                />
              </div>

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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="reference">Reference / Invoice #</Label>
                <Input
                  id="reference"
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes / Purpose</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDelete}
        title="Delete Income Record"
        description="Are you sure you want to delete this income record? This action cannot be undone."
        itemName={incomeData.description}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
