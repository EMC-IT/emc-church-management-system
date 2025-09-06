'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  ArrowLeft,
  Save,
  FileText,
  Tag,
  ToggleLeft,
  ToggleRight,
  AlertCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LazySection } from '@/components/ui/lazy-section';
import { toast } from 'sonner';

// Form validation schema
const categoryFormSchema = z.object({
  name: z.string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .refine(
      (name) => !/^\s*$/.test(name),
      'Category name cannot be only whitespace'
    ),
  description: z.string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  isActive: z.boolean().default(true),
  code: z.string()
    .optional()
    .refine(
      (code) => !code || /^[A-Z0-9_-]+$/.test(code),
      'Code must contain only uppercase letters, numbers, hyphens, and underscores'
    )
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Predefined category suggestions
const categorySuggestions = [
  {
    name: 'Hall Rental',
    description: 'Income from facility rentals for events and ceremonies',
    code: 'HALL_RENTAL'
  },
  {
    name: 'Book Sales',
    description: 'Revenue from religious books, materials, and publications',
    code: 'BOOK_SALES'
  },
  {
    name: 'Grants',
    description: 'Government and foundation grants for community programs',
    code: 'GRANTS'
  },
  {
    name: 'Fundraising Events',
    description: 'Income from organized fundraising activities and campaigns',
    code: 'FUNDRAISING'
  },
  {
    name: 'Parking Fees',
    description: 'Revenue from parking permits and daily parking fees',
    code: 'PARKING'
  },
  {
    name: 'Investment Returns',
    description: 'Returns from church investments and endowment funds',
    code: 'INVESTMENTS'
  },
  {
    name: 'Catering Services',
    description: 'Income from catering services for events and gatherings',
    code: 'CATERING'
  },
  {
    name: 'Educational Programs',
    description: 'Revenue from educational courses and training programs',
    code: 'EDUCATION'
  }
];

export default function AddIncomeCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      code: ''
    }
  });

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
  };

  const handleNameChange = (name: string) => {
    form.setValue('name', name);
    
    // Auto-generate code if it's empty
    const currentCode = form.getValues('code');
    if (!currentCode) {
      form.setValue('code', generateCode(name));
    }
  };

  const applySuggestion = (suggestion: typeof categorySuggestions[0], index: number) => {
    form.setValue('name', suggestion.name);
    form.setValue('description', suggestion.description);
    form.setValue('code', suggestion.code);
    setSelectedSuggestion(index);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Creating category:', data);
      
      toast.success('Income category created successfully!');
      router.push('/dashboard/finance/income/categories');
    } catch (error) {
      toast.error('Failed to create category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/finance/income/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Add Income Category</h1>
            <p className="text-muted-foreground">
              Create a new category to organize your income sources
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <LazySection
            strategy="immediate"
            showSkeleton
            skeletonVariant="form"
            skeletonCount={4}
            threshold={0.1}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tag className="mr-2 h-5 w-5" />
                  Category Information
                </CardTitle>
                <CardDescription>
                  Enter the details for the new income category
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
                          <FormLabel className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Category Name *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Hall Rental"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleNameChange(e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            A clear, descriptive name for this income category
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Category Code */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Code</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., HALL_RENTAL"
                              {...field}
                              className="font-mono"
                            />
                          </FormControl>
                          <FormDescription>
                            Optional unique identifier for reporting and integration
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
                          <FormLabel>Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe what types of income belong to this category..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Detailed description to help users understand this category
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
                            <FormLabel className="text-base flex items-center">
                              {field.value ? (
                                <ToggleRight className="mr-2 h-5 w-5 text-brand-success" />
                              ) : (
                                <ToggleLeft className="mr-2 h-5 w-5 text-muted-foreground" />
                              )}
                              Active Category
                            </FormLabel>
                            <FormDescription>
                              {field.value 
                                ? 'This category is active and can be used for new income records'
                                : 'This category is inactive and will not appear in income forms'
                              }
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

                    {/* Submit Button */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
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

        {/* Sidebar - Category Suggestions */}
        <div className="space-y-6">
          <LazySection
            strategy="immediate"
            showSkeleton
            skeletonVariant="card"
            skeletonCount={1}
            threshold={0.1}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
                <CardDescription>
                  Choose from common income categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {categorySuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedSuggestion === index 
                        ? 'border-brand-primary bg-brand-primary/5' 
                        : 'border-border'
                    }`}
                    onClick={() => applySuggestion(suggestion, index)}
                  >
                    <div className="font-medium text-sm">{suggestion.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {suggestion.description}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </LazySection>

          <LazySection
            strategy="immediate"
            showSkeleton
            skeletonVariant="card"
            skeletonCount={1}
            threshold={0.1}
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Tip:</strong> Choose descriptive names that clearly identify the income source. 
                You can always edit categories later if needed.
              </AlertDescription>
            </Alert>
          </LazySection>
        </div>
      </div>
    </div>
  );
}