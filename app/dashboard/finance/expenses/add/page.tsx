'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, PlusCircle, Receipt, Wallet, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
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

export default function AddExpensePage() {
  const router = useRouter();
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

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Expense data:', {
        ...data,
        amount: Number(data.amount),
      });
      
      toast.success('Expense recorded successfully!');
      router.push('/dashboard/finance/expenses');
    } catch (error) {
      console.error('Error recording expense:', error);
      toast.error('Failed to record expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Record New Expense</h1>
        </div>
      </div>

      {/* Expense Form */}
      <Card className="rounded-xl border border-border p-6">
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-foreground">Expense Details</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₵</span>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <Input placeholder="ECG Electricity / Office Depot / John Smith" {...field} />
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
                    <FormItem className="col-span-12 sm:col-span-3">
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

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/finance/expenses')}
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-1.5 h-4 w-4" />
                      <span>Record Expense</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}