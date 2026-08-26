'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Save,
  X,
  Package,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';



// Validation schema
const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code must be less than 10 characters'),
  color: z.string().min(1, 'Color is required'),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
  allowSubcategories: z.boolean().default(false),
  requiresApproval: z.boolean().default(false),
  defaultDepreciationRate: z.number().min(0).max(100).optional(),
  defaultWarrantyPeriod: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
    required: z.boolean(),
    options: z.array(z.string()).optional()
  })).optional()
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Predefined colors
const categoryColors = [
  { name: 'Blue', value: '#2E8DB0', class: 'bg-brand-primary' },
  { name: 'Light Blue', value: '#28ACD1', class: 'bg-brand-secondary' },
  { name: 'Gold', value: '#C49831', class: 'bg-brand-accent' },
  { name: 'Green', value: '#A5CF5D', class: 'bg-brand-success' },
  { name: 'Red', value: '#EF4444', class: 'bg-red-500' },
  { name: 'Purple', value: '#8B5CF6', class: 'bg-purple-500' },
  { name: 'Orange', value: '#F97316', class: 'bg-orange-500' },
  { name: 'Pink', value: '#EC4899', class: 'bg-pink-500' },
  { name: 'Teal', value: '#14B8A6', class: 'bg-teal-500' },
  { name: 'Gray', value: '#6B7280', class: 'bg-gray-500' }
];

// Predefined icons
const categoryIcons = [
  'package',
  'monitor',
  'music',
  'car',
  'home',
  'utensils',
  'printer',
  'shield',
  'book',
  'gamepad2',
  'camera',
  'headphones'
];

// Mock existing category data
const mockCategory = {
  id: '1',
  name: 'Audio Visual',
  description: 'Sound systems, microphones, speakers, mixing consoles, and video equipment',
  code: 'AUDIO',
  color: '#2E8DB0',
  icon: 'headphones',
  isActive: true,
  allowSubcategories: true,
  requiresApproval: false,
  defaultDepreciationRate: 15,
  defaultWarrantyPeriod: 24,
  tags: ['audio', 'video', 'electronics'],
  customFields: [
    {
      name: 'Brand',
      type: 'text' as const,
      required: true,
      options: []
    },
    {
      name: 'Power Rating',
      type: 'number' as const,
      required: false,
      options: []
    },
    {
      name: 'Connection Type',
      type: 'select' as const,
      required: true,
      options: ['XLR', 'USB', 'Bluetooth', 'Wireless']
    }
  ],
  assetCount: 15,
  createdAt: '2023-08-15T10:00:00Z',
  updatedAt: '2024-01-15T14:30:00Z'
};

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<any>(null);
  const [newTag, setNewTag] = useState('');
  const [newCustomField, setNewCustomField] = useState({
    name: '',
    type: 'text' as 'text' | 'number' | 'date' | 'boolean' | 'select',
    required: false,
    options: [] as string[]
  });
  const [newOption, setNewOption] = useState('');

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      isActive: true,
      allowSubcategories: false,
      requiresApproval: false,
      tags: [],
      customFields: []
    }
  });

  useEffect(() => {
    // Simulate API call to fetch category data
    const fetchCategory = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategory(mockCategory);

        // Populate form with existing data
        form.reset({
          name: mockCategory.name,
          description: mockCategory.description,
          code: mockCategory.code,
          color: mockCategory.color,
          icon: mockCategory.icon,
          isActive: mockCategory.isActive,
          allowSubcategories: mockCategory.allowSubcategories,
          requiresApproval: mockCategory.requiresApproval,
          defaultDepreciationRate: mockCategory.defaultDepreciationRate,
          defaultWarrantyPeriod: mockCategory.defaultWarrantyPeriod,
          tags: mockCategory.tags,
          customFields: mockCategory.customFields
        });
      } catch (error) {
        console.error('Error fetching category:', error);
        toast.error('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.id, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Updated category data:', data);
      toast.success('Category updated successfully!');
      router.push('/dashboard/assets/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !form.getValues('tags')?.includes(newTag.trim())) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleAddCustomField = () => {
    if (newCustomField.name.trim()) {
      const currentFields = form.getValues('customFields') || [];
      form.setValue('customFields', [...currentFields, {
        ...newCustomField,
        name: newCustomField.name.trim()
      }]);
      setNewCustomField({
        name: '',
        type: 'text',
        required: false,
        options: []
      });
    }
  };

  const handleRemoveCustomField = (index: number) => {
    const currentFields = form.getValues('customFields') || [];
    form.setValue('customFields', currentFields.filter((_, i) => i !== index));
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setNewCustomField(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (optionToRemove: string) => {
    setNewCustomField(prev => ({
      ...prev,
      options: prev.options.filter(option => option !== optionToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Category not found</h3>
          <p className="text-muted-foreground">The category you're trying to edit doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/assets/categories">Back to Categories</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/assets/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Asset Category</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update category classification, color badges, depreciation defaults, and custom fields.
          </p>
        </div>
      </div>

      {/* Warning for categories with assets */}
      {category.assetCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This category contains {category.assetCount} assets. Changes to custom fields or accounting defaults may affect existing inventory.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Basic Information</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Define name, classification code, and description</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-8">
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
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
                      <FormLabel>Category Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., AUDIO"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                          }}
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
                    <FormItem className="col-span-12">
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what assets belong to this category and their general purpose..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <div className="col-span-12 space-y-2">
                  <Label>Category Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      Add Tag
                    </Button>
                  </div>
                  {form.watch('tags') && form.watch('tags')!.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {form.watch('tags')!.map((tag) => (
                        <Badge key={tag} variant="neutral" className="cursor-pointer flex items-center gap-1" onClick={() => handleRemoveTag(tag)}>
                          {tag}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Appearance & Settings */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Appearance & Workflow Rules</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Color badges and categorization governance</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Category Color Badge *</FormLabel>
                      <FormControl>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {categoryColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-8 h-8 rounded-full border-2 transition-all ${color.class} ${
                                field.value === color.value ? 'ring-2 ring-primary ring-offset-2 border-foreground' : 'border-transparent'
                              }`}
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

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Category Icon</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryIcons.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              <span className="capitalize">{icon}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Active Status</Label>
                      <p className="text-xs text-muted-foreground">Available for new assets</p>
                    </div>
                    <Switch
                      checked={form.watch('isActive')}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Subcategories</Label>
                      <p className="text-xs text-muted-foreground">Allow nested subcategories</p>
                    </div>
                    <Switch
                      checked={form.watch('allowSubcategories')}
                      onCheckedChange={(checked) => form.setValue('allowSubcategories', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3.5">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium">Requires Approval</Label>
                      <p className="text-xs text-muted-foreground">Require admin verification</p>
                    </div>
                    <Switch
                      checked={form.watch('requiresApproval')}
                      onCheckedChange={(checked) => form.setValue('requiresApproval', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Default Values */}
          <Card className="rounded-xl border border-border p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-foreground">Default Accounting & Warranty Defaults</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Standard values auto-populated when creating assets under this category</p>
              </div>

              <div className="grid grid-cols-12 gap-5">
                <FormField
                  control={form.control}
                  name="defaultDepreciationRate"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Default Depreciation Rate (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            className="pr-8"
                            placeholder="10.0"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultWarrantyPeriod"
                  render={({ field }) => (
                    <FormItem className="col-span-12 sm:col-span-6">
                      <FormLabel>Default Warranty Period (months)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="12"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
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
          <div className="flex justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/assets/categories')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}