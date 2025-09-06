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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LazySection } from '@/components/ui/lazy-section';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/finance/income">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Income
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Record Income</h1>
            <p className="text-muted-foreground">Add a new income transaction</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="form"
        skeletonCount={6}
        threshold={0.1}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BadgeCent className="mr-2 h-5 w-5" />
              Income Details
            </CardTitle>
            <CardDescription>
              Enter the details of the income transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Description
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Hall Rental - Wedding Event"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Brief description of the income source
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Amount */}
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <BadgeCent className="mr-2 h-4 w-4" />
                          Amount
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value && formatCurrency(field.value)}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Tag className="mr-2 h-4 w-4" />
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {incomeCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                <div>
                                  <div className="font-medium">{category.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {category.description}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the income category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Source */}
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Source
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Johnson Family"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Who or what provided this income
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date */}
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Date
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          When was this income received
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
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
                        <FormDescription>
                          Current status of this income
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Reference */}
                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., INV-2024-001"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional reference or invoice number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes or comments..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional additional information
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Record Income
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}