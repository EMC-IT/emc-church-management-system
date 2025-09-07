'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, FolderOpen, Palette, FileText, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading category data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <FolderOpen className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Category</h1>
            <p className="text-muted-foreground">Update category information and settings</p>
          </div>
        </div>
      </div>

      {/* Category Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Category Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Ministry Operations" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
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
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of what this category covers"
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
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Category Color *
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <div className="grid grid-cols-6 md:grid-cols-12 gap-3">
                          {categoryColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                                selectedColor === color.value 
                                  ? 'border-gray-900 ring-2 ring-gray-300' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: color.value }}
                              onClick={() => handleColorSelect(color.value)}
                              title={color.name}
                            >
                              {selectedColor === color.value && (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {selectedColor && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div 
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: selectedColor }}
                            ></div>
                            <span>
                              Selected: {categoryColors.find(c => c.value === selectedColor)?.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Preview */}
              {(form.watch('name') || selectedColor) && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedColor || '#E5E7EB' }}
                      ></div>
                      <div>
                        <div className="font-medium">
                          {form.watch('name') || 'Category Name'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {form.watch('description') || 'Category description will appear here'}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Impact Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Update Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>
              <strong>Note:</strong> Changes to this category will affect all existing budgets that use this category.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Name changes will be reflected across all budget reports and displays</li>
              <li>Color changes will update the visual representation in charts and lists</li>
              <li>Setting status to "Inactive" will hide this category from new budget creation</li>
              <li>Description updates will help users better understand the category purpose</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}