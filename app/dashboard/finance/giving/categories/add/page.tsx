'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
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
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, BadgeCent } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingCategory } from '@/lib/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form validation schema
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  category: z.nativeEnum(GivingCategory, {
    required_error: 'Please select a category type.',
  }),
  isActive: z.boolean().default(true),
  targetAmount: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Category options with descriptions
const categoryOptions = [
  {
    value: GivingCategory.GENERAL,
    label: 'General Fund',
    description: 'General church operations and ministry'
  },
  {
    value: GivingCategory.BUILDING_FUND,
    label: 'Building Fund',
    description: 'Church building construction and maintenance'
  },
  {
    value: GivingCategory.MISSIONARY,
    label: 'Missionary Support',
    description: 'Support for missionaries and evangelism'
  },
  {
    value: GivingCategory.YOUTH,
    label: 'Youth Ministry',
    description: 'Youth programs and activities'
  },
  {
    value: GivingCategory.CHILDREN,
    label: 'Children Ministry',
    description: 'Children programs and Sunday school'
  },
  {
    value: GivingCategory.MUSIC,
    label: 'Music Ministry',
    description: 'Instruments, sound equipment, and choir'
  },
  {
    value: GivingCategory.OUTREACH,
    label: 'Outreach Programs',
    description: 'Community outreach and evangelism'
  },
  {
    value: GivingCategory.CHARITY,
    label: 'Charity & Welfare',
    description: 'Charitable activities and welfare programs'
  },
  {
    value: GivingCategory.EDUCATION,
    label: 'Education',
    description: 'Educational programs and scholarships'
  },
  {
    value: GivingCategory.MEDICAL,
    label: 'Medical Support',
    description: 'Medical assistance and health programs'
  },
  {
    value: GivingCategory.DISASTER_RELIEF,
    label: 'Disaster Relief',
    description: 'Emergency and disaster relief efforts'
  },
  {
    value: GivingCategory.OTHER,
    label: 'Other',
    description: 'Other special purposes'
  }
];

export default function AddCategoryPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      notes: '',
    },
  });

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      
      // For now, simulate API call. Replace with actual API call:
      // await givingService.createCategory(data);
      
      console.log('Creating category:', data);
      
      toast({
        title: 'Success',
        description: 'Category created successfully',
      });
      
      router.push('/dashboard/finance/giving/categories');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create category',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/giving/categories" aria-label="Back to Giving Categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Add Giving Category</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Category Details</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Building Fund" {...field} />
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
                      <FormLabel>Category Classification *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Purpose, designated projects, and eligible use of this fund..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Target Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="pl-8"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6 flex items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">Active Category</FormLabel>
                        <p className="text-xs text-muted-foreground">Enable contributions to this fund</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Internal guidelines or restrictions for accounting..."
                          rows={2}
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/dashboard/finance/giving/categories">
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-1.5 h-4 w-4" />
              {loading ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}