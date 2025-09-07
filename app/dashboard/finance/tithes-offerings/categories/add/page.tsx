'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, PlusCircle, ArrowLeft, Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
            <Tag className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Category</h1>
            <p className="text-muted-foreground">Create a new tithe or offering category</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Category Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to create a new category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Building Fund" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter a descriptive name for this category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
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
                        <FormDescription>
                          Choose the type of giving this category represents
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the purpose of this category..."
                          className="resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional description to help identify the category's purpose
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Color Selection */}
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color *</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-gray-200" 
                              style={{ backgroundColor: selectedColor }}
                            />
                            <span className="text-sm text-muted-foreground">
                              Selected: {colorOptions.find(c => c.value === selectedColor)?.name}
                            </span>
                          </div>
                          <div className="grid grid-cols-7 gap-2">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                className={`w-8 h-8 rounded-full border-2 transition-all ${
                                  field.value === color.value 
                                    ? 'border-gray-900 scale-110' 
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                                style={{ backgroundColor: color.value }}
                                onClick={() => field.onChange(color.value)}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose a color to help identify this category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Category
                        </FormLabel>
                        <FormDescription>
                          Enable this category for use in new records
                        </FormDescription>
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Category
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