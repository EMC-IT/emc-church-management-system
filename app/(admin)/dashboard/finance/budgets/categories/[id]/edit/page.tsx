'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, FolderOpen, Palette, FileText, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { FormPageSkeleton } from '@/components/ui/skeleton-loaders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

// Validation schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required'),
  color: z.string().min(1, 'Color is required'),
  status: z.string().min(1, 'Status is required'),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

// Predefined colors for categories
const categoryColors = [
  { value: '#2E8DB0', label: 'Blue', name: 'Primary Blue' },
  { value: '#28ACD1', label: 'Light Blue', name: 'Secondary Blue' },
  { value: '#C49831', label: 'Gold', name: 'Accent Gold' },
  { value: '#A5CF5D', label: 'Green', name: 'Success Green' },
  { value: '#080A09', label: 'Dark', name: 'Dark Gray' },
  { value: '#EF4444', label: 'Red', name: 'Red' },
  { value: '#8B5CF6', label: 'Purple', name: 'Purple' },
  { value: '#F59E0B', label: 'Orange', name: 'Orange' },
  { value: '#10B981', label: 'Emerald', name: 'Emerald' },
  { value: '#6B7280', label: 'Gray', name: 'Gray' },
  { value: '#EC4899', label: 'Pink', name: 'Pink' },
  { value: '#14B8A6', label: 'Teal', name: 'Teal' },
];

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// Mock existing category data
const mockCategoryData = {
  id: '1',
  name: 'Ministry Operations',
  description: 'Day-to-day ministry operations and activities including worship services, pastoral care, and regular ministry functions.',
  color: '#2E8DB0',
  status: 'active',
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '',
      status: 'active',
    },
  });

  useEffect(() => {
    // Simulate loading existing category data
    const loadCategoryData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Pre-fill form with existing data
        form.reset({
          name: mockCategoryData.name,
          description: mockCategoryData.description,
          color: mockCategoryData.color,
          status: mockCategoryData.status,
        });
        setSelectedColor(mockCategoryData.color);
      } catch (error) {
        toast.error('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    loadCategoryData();
  }, [params.id, form]);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Updated category data:', data);
      toast.success('Category updated successfully!');
      router.push(`/dashboard/finance/budgets/categories/${params.id}`);
    } catch (error) {
      toast.error('Failed to update category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    form.setValue('color', color);
  };

  if (loading) {
    return <FormPageSkeleton cardCount={2} fieldsPerCard={3} />;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/budgets/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Budget Category</h1>
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
                        <Input placeholder="Ministry Operations" {...field} />
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
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
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
                          placeholder="What this category covers..."
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
                            {categoryColors.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                className={cn(
                                  'w-8 h-8 rounded-full border-2 transition-all',
                                  selectedColor === color.value 
                                    ? 'ring-2 ring-primary ring-offset-2 border-foreground' 
                                    : 'border-transparent hover:scale-105'
                                )}
                                style={{ backgroundColor: color.value }}
                                onClick={() => handleColorSelect(color.value)}
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
              onClick={() => router.push('/dashboard/finance/budgets/categories')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-1.5" />
              {isSubmitting ? 'Updating...' : 'Update Category'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}