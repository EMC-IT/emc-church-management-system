'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  Calendar,
  BadgeCent,
  FileText,
  Building,
  User,
  Tag
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { LazySection } from '@/components/ui/lazy-section';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';

// Form validation schema
const incomeFormSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255, 'Description too long'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  categoryId: z.string().min(1, 'Category is required'),
  source: z.string().min(1, 'Source is required').max(100, 'Source name too long'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
  reference: z.string().optional(),
  status: z.enum(['received', 'pending', 'cancelled']).default('received')
});

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

// Mock income categories
const incomeCategories = [
  { id: '1', name: 'Hall Rental', description: 'Facility rental income' },
  { id: '2', name: 'Book Sales', description: 'Religious books and materials' },
  { id: '3', name: 'Grants', description: 'Government and foundation grants' },
  { id: '4', name: 'Fundraising', description: 'Fundraising events and campaigns' },
  { id: '5', name: 'Parking', description: 'Parking fees and permits' },
  { id: '6', name: 'Donations', description: 'General donations and offerings' },
  { id: '7', name: 'Investment', description: 'Investment returns and dividends' },
  { id: '8', name: 'Other', description: 'Other miscellaneous income' }
];

export default function AddIncomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      description: '',
      amount: '',
      categoryId: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      reference: '',
      status: 'received'
    }
  });

  useEffect(() => {
    // Simulate loading categories
    const timer = setTimeout(() => {
      setCategoriesLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const onSubmit = async (data: IncomeFormValues) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Income data:', {
        ...data,
        amount: parseFloat(data.amount)
      });
      
      toast.success('Income recorded successfully!');
      router.push('/dashboard/finance/income');
    } catch (error) {
      toast.error('Failed to record income. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string) => {
    if (!amount) return '';
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(num);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/income">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Record Income</h1>
        </div>
      </div>

      {/* Form */}
      <Card className="rounded-xl border border-border p-6">
        <div className="space-y-5">
          <h2 className="text-base font-semibold text-foreground">Income Details</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-12 gap-5">
                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Hall Rental - Wedding Event / Bookshop Sales"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Amount */}
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
                            min="0"
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

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
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
                          {incomeCategories.map((category) => (
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

                {/* Source */}
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Source / Payer *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Johnson Family / Ministry Partners"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={(_, dateStr) => field.onChange(dateStr)}
                          placeholder="Select transaction date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Reference */}
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Reference / Invoice #</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="INV-2026-001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes or comments regarding this transaction..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/finance/income')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>Recording...</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-1.5 h-4 w-4" />
                      <span>Record Income</span>
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