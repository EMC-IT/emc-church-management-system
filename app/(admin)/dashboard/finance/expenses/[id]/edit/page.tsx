'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { toast } from 'sonner';
import { expenseService } from '@/services';
import { ExpenseRecord, ExpenseCategory, ExpenseStatus } from '@/lib/types';

// Expense form validation schema
const expenseFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  vendor: z.string().min(1, 'Vendor/Payee is required').max(100, 'Vendor name must be less than 100 characters'),
  status: z.enum(['paid', 'pending', 'approved', 'rejected', 'cancelled']),
  receiptNumber: z.string().optional(),
  approvedBy: z.string().optional(),
  description: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

const paymentMethods = [
  { id: 'Cash', name: 'Cash' },
  { id: 'Bank Transfer', name: 'Bank Transfer' },
  { id: 'Mobile Money', name: 'Mobile Money' },
  { id: 'Cheque', name: 'Cheque' },
  { id: 'Card', name: 'Card' },
  { id: 'Other', name: 'Other' },
];

const statusOptions = [
  { id: 'paid', name: 'Paid' },
  { id: 'pending', name: 'Pending' },
  { id: 'approved', name: 'Approved' },
  { id: 'rejected', name: 'Rejected' },
  { id: 'cancelled', name: 'Cancelled' },
];

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: '',
      paymentMethod: 'Bank Transfer',
      date: new Date(),
      vendor: '',
      status: 'paid',
      receiptNumber: '',
      approvedBy: '',
      description: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catsRes, expense] = await Promise.all([
          expenseService.getCategories(),
          expenseService.getExpenseById(id),
        ]);

        setCategories(catsRes.data);

        form.reset({
          title: expense.title,
          amount: String(expense.amount),
          category: expense.categoryId,
          paymentMethod: expense.paymentMethod,
          date: new Date(expense.date),
          vendor: expense.vendor,
          status: (expense.status?.toLowerCase() as any) || 'paid',
          receiptNumber: expense.receiptNumber || '',
          approvedBy: expense.approvedBy || '',
          description: expense.description || expense.notes || '',
        });
      } catch (error) {
        console.error('Error loading expense details:', error);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, form]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await expenseService.updateExpense(id, {
        title: data.title,
        amount: Number(data.amount),
        categoryId: data.category,
        paymentMethod: data.paymentMethod,
        date: data.date.toISOString().split('T')[0],
        vendor: data.vendor,
        status: data.status as ExpenseStatus,
        receiptNumber: data.receiptNumber,
        approvedBy: data.approvedBy,
        description: data.description,
      });

      toast.success('Expense updated successfully!');
      router.push(`/dashboard/finance/expenses/${id}`);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/finance/expenses/${id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <LazyLoader className="h-10 w-10 rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
          </LazyLoader>
          <div className="space-y-2">
            <LazyLoader className="h-6 w-48">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            </LazyLoader>
          </div>
        </div>
        <LazyLoader className="h-96 w-full rounded-xl">
          <div className="h-96 w-full rounded-xl bg-muted animate-pulse" />
        </LazyLoader>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/finance/expenses/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Expense</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Expense Details</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Expense Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Office supplies purchase / Sound equipment repair" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Amount *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">GH₵</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-12"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Payment Method *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Expense Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select expense date"
                          maxDate={new Date()}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Vendor / Payee *</FormLabel>
                      <FormControl>
                        <Input placeholder="ECG Electricity / Office Depot / Pastor John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((st) => (
                            <SelectItem key={st.id} value={st.id}>
                              {st.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Receipt / Invoice #</FormLabel>
                      <FormControl>
                        <Input placeholder="REC-2026-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedBy"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Approved By</FormLabel>
                      <FormControl>
                        <Input placeholder="Finance Board / Lead Pastor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description / Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional details or justification for this expenditure..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Expense'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}