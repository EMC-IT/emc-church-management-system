'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Save, ArrowLeft, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LazySection } from '@/components/ui/lazy-section';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Tithe/Offering form validation schema
const titheOfferingFormSchema = z.object({
  memberName: z.string().min(1, 'Member name is required').max(100, 'Name must be less than 100 characters'),
  amount: z.string().min(1, 'Amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  type: z.enum(['Tithe', 'Offering', 'First Fruits', 'Special Offering']),
  category: z.string().min(1, 'Category is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  date: z.date({
    required_error: 'Date is required',
  }),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

type TitheOfferingFormData = z.infer<typeof titheOfferingFormSchema>;

// Mock categories based on type
const categoriesByType = {
  'Tithe': [
    { id: '1', name: 'Regular Tithe' },
    { id: '2', name: 'Catch-up Tithe' },
  ],
  'Offering': [
    { id: '3', name: 'Sunday Offering' },
    { id: '4', name: 'Thanksgiving Offering' },
    { id: '5', name: 'Special Collection' },
  ],
  'First Fruits': [
    { id: '6', name: 'First Fruits' },
  ],
  'Special Offering': [
    { id: '7', name: 'Building Fund' },
    { id: '8', name: 'Missions' },
    { id: '9', name: 'Youth Ministry' },
    { id: '10', name: 'Children Ministry' },
    { id: '11', name: 'Music Ministry' },
    { id: '12', name: 'Welfare Fund' },
  ],
};

const paymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'mobile-money', name: 'Mobile Money' },
  { id: 'bank-transfer', name: 'Bank Transfer' },
  { id: 'card', name: 'Card Payment' },
  { id: 'check', name: 'Check' },
];

// Mock existing record data
const mockRecord = {
  id: '1',
  memberName: 'John Smith',
  amount: '500',
  type: 'Tithe' as const,
  category: 'Regular Tithe',
  paymentMethod: 'Mobile Money',
  date: new Date('2024-01-15'),
  receiptNumber: 'TO-2024-001',
  notes: 'Monthly tithe payment'
};

export default function EditTitheOfferingPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const form = useForm<TitheOfferingFormData>({
    resolver: zodResolver(titheOfferingFormSchema),
    defaultValues: {
      memberName: '',
      amount: '',
      type: 'Tithe',
      category: '',
      paymentMethod: '',
      date: new Date(),
      receiptNumber: '',
      notes: '',
    },
  });

  const selectedType = form.watch('type');
  const availableCategories = categoriesByType[selectedType] || [];

  // Load existing record data
  useEffect(() => {
    const loadRecord = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set form values with existing data
        form.reset(mockRecord);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load record');
        router.push('/dashboard/finance/tithes-offerings');
      }
    };

    loadRecord();
  }, [params.id, form, router]);

  // Reset category when type changes
  React.useEffect(() => {
    if (!loading) {
      const currentCategory = form.getValues('category');
      const isValidCategory = availableCategories.some(cat => cat.name === currentCategory);
      if (!isValidCategory) {
        form.setValue('category', '');
      }
    }
  }, [selectedType, form, availableCategories, loading]);

  const onSubmit = async (data: TitheOfferingFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Updated tithe/offering data:', {
        ...data,
        amount: Number(data.amount),
        id: params.id,
      });
      
      toast.success('Record updated successfully!');
      router.push(`/dashboard/finance/tithes-offerings/${params.id}`);
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gray-200 rounded-md animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/tithes-offerings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Giving Record</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update contributor, offering designation, payment method, and receipt reference.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Giving Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Contributor information, transaction amount, and fund categorization</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="memberName"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Contributor Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Smith" {...field} />
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
                  name="type"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Giving Type *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select giving type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tithe">Tithe</SelectItem>
                          <SelectItem value="Offering">Offering</SelectItem>
                          <SelectItem value="First Fruits">First Fruits</SelectItem>
                          <SelectItem value="Special Offering">Special Offering</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Fund Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCategories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
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
                            <SelectItem key={method.id} value={method.name}>
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
                      <FormLabel className="mb-2">Transaction Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
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
                              date > new Date() || date < new Date('1900-01-01')
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
                  name="receiptNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Receipt / Transaction Ref</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., TO-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional notes or comments regarding this contribution..."
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

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/finance/tithes-offerings')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Update Record
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}