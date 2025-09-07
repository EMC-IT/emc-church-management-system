'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Save, ArrowLeft, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="space-y-6">
      {/* Page Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-12 w-12"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Edit className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Giving Record</h1>
            <p className="text-muted-foreground">Update tithe or offering information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Update Record
            </CardTitle>
            <CardDescription>
              Modify the details below to update this giving record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="memberName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Member Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Smith" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the name of the person giving
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₵</span>
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type *</FormLabel>
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
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
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
                        <FormDescription>
                          Categories change based on the selected type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
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
                      <FormItem className="flex flex-col">
                        <FormLabel>Date *</FormLabel>
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
                        <FormDescription>
                          When was this tithe/offering given
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="receiptNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., TO-2024-001" {...field} />
                        </FormControl>
                        <FormDescription>
                          Optional receipt reference number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Additional notes or comments..."
                            className="resize-none"
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
                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update Record
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