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
import { budgetService } from '@/services';
import { BudgetCategory, BudgetStatus } from '@/lib/types';

// Validation schema
const budgetFormSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Budget name must be less than 100 characters'),
  amount: z.string().min(1, 'Budget amount is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Amount must be a positive number'
  ),
  category: z.string().min(1, 'Category is required'),
  department: z.string().min(1, 'Department is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  owner: z.string().min(1, 'Budget owner is required').max(100, 'Owner name must be less than 100 characters'),
  status: z.enum(['Active', 'Watch', 'Near Limit', 'Over Budget', 'Completed', 'Draft', 'Archived']).default('Active'),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  description: z.string().optional(),
});

type BudgetFormData = z.infer<typeof budgetFormSchema>;

const departmentOptions = [
  'Worship Ministry',
  'Youth Ministry',
  'Children Ministry',
  'Missions Department',
  'Facilities Management',
  'Administration & Finance',
  'Media & Technology',
  'Women Ministry',
  'Men Ministry',
  'Outreach & Welfare',
];

const statusOptions = [
  'Active',
  'Watch',
  'Near Limit',
  'Over Budget',
  'Completed',
  'Draft',
  'Archived',
];

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BudgetFormData>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: '',
      amount: '',
      category: '',
      department: '',
      startDate: new Date(),
      endDate: new Date(),
      owner: '',
      status: 'Active',
      priority: 'Medium',
      description: '',
    },
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [catsRes, budget] = await Promise.all([
          budgetService.getCategories(),
          budgetService.getBudgetById(id),
        ]);

        setCategories(catsRes.data);

        form.reset({
          name: budget.name,
          amount: String(budget.amount),
          category: budget.categoryId || 'bcat_ministry',
          department: budget.department,
          startDate: new Date(budget.startDate),
          endDate: new Date(budget.endDate),
          owner: budget.owner,
          status: (budget.status as any) || 'Active',
          priority: (budget.priority as any) || 'Medium',
          description: budget.description || '',
        });
      } catch (error) {
        console.error('Error loading budget details:', error);
        toast.error('Failed to load budget details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, form]);

  const onSubmit = async (data: BudgetFormData) => {
    setIsSubmitting(true);
    try {
      const year = data.startDate.getFullYear();
      await budgetService.updateBudget(id, {
        name: data.name,
        amount: Number(data.amount),
        category: data.category,
        department: data.department,
        period: `Jan 1 – Dec 31, ${year}`,
        periodYear: year,
        startDate: data.startDate.toISOString().split('T')[0],
        endDate: data.endDate.toISOString().split('T')[0],
        owner: data.owner,
        status: data.status as BudgetStatus,
        priority: data.priority,
        description: data.description,
      });

      toast.success('Budget updated successfully!');
      router.push(`/dashboard/finance/budgets/${id}`);
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/finance/budgets/${id}`);
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
          <Link href={`/dashboard/finance/budgets/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Budget</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-foreground">Budget Details</h2>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Budget Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="2026 Missions & Outreach Budget" {...field} />
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
                      <FormLabel>Budget Amount *</FormLabel>
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
                  name="department"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Department *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departmentOptions.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
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
                  name="owner"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Budget Owner / Overseer *</FormLabel>
                      <FormControl>
                        <Input placeholder="David Wilson (Missions Coordinator)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select end date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
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
                      <FormLabel>Description / Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Strategic objectives, allocation notes, and spending guidelines for this budget..."
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
                'Update Budget'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}