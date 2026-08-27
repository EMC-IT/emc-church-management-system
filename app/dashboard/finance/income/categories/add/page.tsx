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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/income/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Add Income Category</h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Quick Suggestions */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Quick Templates</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categorySuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applySuggestion(suggestion, index)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      selectedSuggestion === index 
                        ? 'border-primary bg-primary/5 text-foreground' 
                        : 'border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className="font-medium text-xs text-foreground truncate">{suggestion.name}</div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{suggestion.code}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Category Details */}
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
                          placeholder="Hall Rental"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleNameChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4">
                      <FormLabel>Category Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="HALL_RENTAL"
                          {...field}
                          className="font-mono uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Income types and transactions belonging to this category..."
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
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5 self-start">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium cursor-pointer">
                          Active Status
                        </FormLabel>
                        <p className="text-xs text-muted-foreground">Available for income records</p>
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

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/finance/income/categories')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="mr-1.5 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
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