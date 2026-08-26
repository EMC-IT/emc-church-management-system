'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Edit, Receipt, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  description: z.string().optional(),
  receiptNumber: z.string().optional(),
  approvedBy: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseFormSchema>;

// Mock expense categories
const expenseCategories = [
  { id: '1', name: 'Salaries & Benefits' },
  { id: '2', name: 'Missions & Outreach' },
  { id: '3', name: 'Building Maintenance' },
  { id: '4', name: 'Utilities' },
  { id: '5', name: 'Office Supplies' },
  { id: '6', name: 'Technology & Equipment' },
  { id: '7', name: 'Insurance' },
  { id: '8', name: 'Transportation' },
  { id: '9', name: 'Events & Programs' },
  { id: '10', name: 'Marketing & Communications' },
  { id: '11', name: 'Professional Services' },
  { id: '12', name: 'Miscellaneous' },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'check', name: 'Check' },
  { id: 'credit-card', name: 'Credit Card' },
  { id: 'debit-card', name: 'Debit Card' },
  { id: 'bank-transfer', name: 'Bank Transfer' },
  { id: 'online-payment', name: 'Online Payment' },
];

// Mock expense data
const mockExpense = {
  id: '1',
  title: 'Office Supplies Purchase',
  amount: 245.50,
  category: '5',
  paymentMethod: 'credit-card',
  date: new Date('2024-01-15'),
  vendor: 'Office Depot',
  description: 'Monthly office supplies including paper, pens, and printer cartridges for administrative office.',
  receiptNumber: 'REC-2024-001',
  approvedBy: 'Finance Committee',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const [expense, setExpense] = useState(mockExpense);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: '',
      paymentMethod: '',
      date: new Date(),
      vendor: '',
      description: '',
      receiptNumber: '',
      approvedBy: '',
    },
  });

  useEffect(() => {
    // Simulate loading expense data
    const loadExpense = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        // In real app, fetch expense by params.id
        setExpense(mockExpense);

        // Reset form with loaded data
        form.reset({
          title: mockExpense.title,
          amount: mockExpense.amount.toString(),
          category: mockExpense.category,
          paymentMethod: mockExpense.paymentMethod,
          date: mockExpense.date,
          vendor: mockExpense.vendor,
          description: mockExpense.description || '',
          receiptNumber: mockExpense.receiptNumber || '',
          approvedBy: mockExpense.approvedBy || '',
        });
      } catch (error) {
        console.error('Error loading expense:', error);
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpense();
  }, [params.id, form]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Updated expense data:', {
        ...data,
        amount: Number(data.amount),
        id: params.id,
      });

      toast.success('Expense updated successfully!');
      router.push(`/dashboard/finance/expenses/${params.id}`);
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/finance/expenses/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <LazyLoader className="h-12 w-12 rounded-lg">
            <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse" />
          </LazyLoader>
          <div className="space-y-2">
            <LazyLoader className="h-8 w-64">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            </LazyLoader>
            <LazyLoader className="h-4 w-48">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </LazyLoader>
          </div>
        </div>
        <LazyLoader className="h-96 w-full rounded-lg">
          <div className="h-96 w-full rounded-lg bg-gray-200 animate-pulse" />
        </LazyLoader>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Expense</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update disbursement record, vendor/payee, expense category, and payment channel.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Expense Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Payee information, amount, budget categorization, and date</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Expense Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Office supplies purchase" {...field} />
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-8"
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
                            <SelectValue placeholder="Select expense category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {expenseCategories.map((category) => (
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
                            <SelectValue placeholder="Select payment method" />
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
                    <FormItem className="col-span-12 sm:col-span-4 flex flex-col">
                      <FormLabel className="mb-2">Expense Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                        <Input placeholder="e.g., Office Depot, John Smith" {...field} />
                      </FormControl>
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
                        <Input placeholder="e.g., REC-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="approvedBy"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-3">
                      <FormLabel>Approved By</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Finance Committee" {...field} />
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
                      <FormLabel>Description / Itemized Breakdown</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide additional details or itemized list about this expense..."
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