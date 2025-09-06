'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { PlusCircle, Tag, Loader2, Palette, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { LazySection } from '@/components/ui/lazy-section';
import { toast } from 'sonner';
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
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/dashboard/finance/expenses/categories')}
          className="h-12 w-12"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
          <PlusCircle className="h-6 w-6 text-brand-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Expense Category</h1>
          <p className="text-gray-600">Create a new category to organize expenses</p>
        </div>
      </div>

      {/* Category Form */}
      <LazySection>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Category Details
                </CardTitle>
                <CardDescription>
                  Fill in the details below to create a new expense category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Category Name */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Office Supplies, Utilities, Missions" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Choose a clear, descriptive name for this expense category
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what types of expenses belong in this category..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Optional description to help users understand when to use this category
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
                            <div className="space-y-4">
                              {/* Color Picker Grid */}
                              <div className="grid grid-cols-6 gap-3">
                                {colorOptions.map((color) => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    onClick={() => handleColorSelect(color.value)}
                                    className={cn(
                                      'w-10 h-10 rounded-lg border-2 transition-all hover:scale-110',
                                      selectedColor === color.value
                                        ? 'border-gray-900 ring-2 ring-gray-300'
                                        : 'border-gray-200 hover:border-gray-300'
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                              
                              {/* Custom Color Input */}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Palette className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">Custom:</span>
                                </div>
                                <Input
                                  type="color"
                                  value={selectedColor}
                                  onChange={(e) => handleColorSelect(e.target.value)}
                                  className="w-16 h-10 p-1 border rounded"
                                />
                                <Input
                                  type="text"
                                  value={selectedColor}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                                      setSelectedColor(value);
                                      if (value.length === 7) {
                                        form.setValue('color', value);
                                      }
                                    }
                                  }}
                                  placeholder="#000000"
                                  className="w-24 font-mono text-sm"
                                />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Choose a color to help visually identify this category in reports and charts
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Active Status */}
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
                              Active categories can be used when recording new expenses
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

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Category...
                          </>
                        ) : (
                          <>
                            <Tag className="mr-2 h-4 w-4" />
                            Create Category
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
                <CardDescription>
                  See how your category will appear
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category Preview */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <div className="font-medium">
                      {form.watch('name') || 'Category Name'}
                    </div>
                  </div>
                  {form.watch('description') && (
                    <p className="text-sm text-gray-600 mb-3">
                      {form.watch('description')}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Status:</span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      form.watch('isActive') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    )}>
                      {form.watch('isActive') ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Color Info */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Color Information</div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-sm font-mono">{selectedColor}</span>
                  </div>
                </div>

                {/* Usage Guidelines */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Usage Guidelines</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Use clear, specific names</li>
                    <li>• Choose distinct colors</li>
                    <li>• Add helpful descriptions</li>
                    <li>• Keep categories organized</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </LazySection>
    </div>
  );
}