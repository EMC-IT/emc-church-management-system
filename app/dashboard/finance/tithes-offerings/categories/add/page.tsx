'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, PlusCircle, ArrowLeft, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LazySection } from '@/components/ui/lazy-section';
import { toast } from 'sonner';

// Category form validation schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().optional(),
  type: z.enum(['Tithe', 'Offering', 'First Fruits', 'Special Offering']),
  color: z.string().min(1, 'Color is required'),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Predefined colors for categories
const colorOptions = [
  { value: '#2E8DB0', name: 'Brand Primary', class: 'bg-brand-primary' },
  { value: '#28ACD1', name: 'Brand Secondary', class: 'bg-brand-secondary' },
  { value: '#C49831', name: 'Brand Accent', class: 'bg-brand-accent' },
  { value: '#A5CF5D', name: 'Brand Success', class: 'bg-brand-success' },
  { value: '#EF4444', name: 'Red', class: 'bg-red-500' },
  { value: '#F97316', name: 'Orange', class: 'bg-orange-500' },
  { value: '#EAB308', name: 'Yellow', class: 'bg-yellow-500' },
  { value: '#22C55E', name: 'Green', class: 'bg-green-500' },
  { value: '#06B6D4', name: 'Cyan', class: 'bg-cyan-500' },
  { value: '#3B82F6', name: 'Blue', class: 'bg-blue-500' },
  { value: '#6366F1', name: 'Indigo', class: 'bg-indigo-500' },
  { value: '#8B5CF6', name: 'Violet', class: 'bg-violet-500' },
  { value: '#EC4899', name: 'Pink', class: 'bg-pink-500' },
  { value: '#6B7280', name: 'Gray', class: 'bg-gray-500' },
];

export default function AddCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'Offering',
      color: '#2E8DB0',
      isActive: true,
    },
  });

  const selectedColor = form.watch('color');

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Category data:', data);
      
      toast.success('Category created successfully!');
      router.push('/dashboard/finance/tithes-offerings/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/tithes-offerings/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Add Giving Category</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a designated fund or offering category for tithes and contributions.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Category Details</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Specify category name, contribution type, color badges, and status</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Building Fund" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category type" />
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose of this designated fund..."
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
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Category Color Badge *</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                field.value === color.value 
                                  ? 'ring-2 ring-primary ring-offset-2 border-foreground' 
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => field.onChange(color.value)}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">
                          Active Status
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">Available for giving records</p>
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
              </div>
            </div>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/finance/tithes-offerings/categories')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
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