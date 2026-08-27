'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusCircle, Tag, Loader2, Palette, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LazySection } from '@/components/ui/lazy-section';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

// Category form validation schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required').regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Predefined color options
const colorOptions = [
  { name: 'Blue', value: '#2E8DB0' },
  { name: 'Light Blue', value: '#28ACD1' },
  { name: 'Gold', value: '#C49831' },
  { name: 'Green', value: '#A5CF5D' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Emerald', value: '#10B981' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Slate', value: '#64748B' },
];

export default function AddExpenseCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#2E8DB0');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#2E8DB0',
      isActive: true,
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Category data:', data);
      
      toast.success('Category created successfully!');
      router.push('/dashboard/finance/expenses/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    form.setValue('color', color);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/expenses/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Add Expense Category</h1>
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
                        <Input 
                          placeholder="Office Supplies / Utilities / Missions" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">
                          Active Status
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">Available for expense logging</p>
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Expense types and disbursements belonging to this category..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Color Selection */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Category Color Badge *</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2 pt-1">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => handleColorSelect(color.value)}
                                className={cn(
                                  'w-8 h-8 rounded-full border-2 transition-all',
                                  selectedColor === color.value
                                    ? 'ring-2 ring-primary ring-offset-2 border-foreground'
                                    : 'border-transparent hover:scale-105'
                                )}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
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
              onClick={() => router.push('/dashboard/finance/expenses/categories')}
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
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}