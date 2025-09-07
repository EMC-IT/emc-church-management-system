'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  FolderPlus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

export default function AddCategoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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
      color: categoryColors[0].value,
      tags: [],
      customFields: []
    }
  });

  const onSubmit = async (data: CategoryFormValues) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Category data:', data);
      toast.success('Category created successfully!');
      router.push('/dashboard/assets/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
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

  const generateCode = (name: string) => {
    return name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/assets/categories')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <FolderPlus className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
            <p className="text-gray-600">
              Create a new asset category to organize your assets
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Creating...' : 'Create Category'}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Essential details about the category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter category name" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-generate code if not manually set
                            if (!form.formState.dirtyFields.code) {
                              form.setValue('code', generateCode(e.target.value));
                            }
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
                    <FormItem>
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
                      <FormDescription>
                        Short code for identification (2-10 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what assets belong to this category"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" variant="outline" onClick={handleAddTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {form.watch('tags') && form.watch('tags')!.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.watch('tags')!.map((tag) => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                            {tag}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance & Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Appearance & Settings</CardTitle>
                <CardDescription>
                  Visual appearance and category behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Color *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-5 gap-2">
                          {categoryColors.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`w-10 h-10 rounded-md border-2 ${color.class} ${
                                field.value === color.value ? 'border-foreground' : 'border-transparent'
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
                    <FormItem>
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
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Whether this category is available for use
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('isActive')}
                      onCheckedChange={(checked) => form.setValue('isActive', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Subcategories</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable creation of subcategories under this category
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('allowSubcategories')}
                      onCheckedChange={(checked) => form.setValue('allowSubcategories', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Requires Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Assets in this category require approval before activation
                      </p>
                    </div>
                    <Switch
                      checked={form.watch('requiresApproval')}
                      onCheckedChange={(checked) => form.setValue('requiresApproval', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Default Values */}
            <Card>
              <CardHeader>
                <CardTitle>Default Values</CardTitle>
                <CardDescription>
                  Default settings for assets in this category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="defaultDepreciationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Depreciation Rate (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="100"
                            className="pr-8"
                            placeholder="10"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">%</span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Annual depreciation rate for assets in this category
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultWarrantyPeriod"
                  render={({ field }) => (
                    <FormItem>
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
                      <FormDescription>
                        Default warranty period in months
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Custom Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
                <CardDescription>
                  Additional fields specific to this category
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Custom Field Form */}
                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-medium">Add Custom Field</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Field name"
                      value={newCustomField.name}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Select 
                      value={newCustomField.type} 
                      onValueChange={(value: any) => setNewCustomField(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="boolean">Yes/No</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {newCustomField.type === 'select' && (
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add option"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {newCustomField.options.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {newCustomField.options.map((option) => (
                            <Badge key={option} variant="outline" className="cursor-pointer" onClick={() => handleRemoveOption(option)}>
                              {option}
                              <X className="ml-1 h-3 w-3" />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fieldRequired"
                      checked={newCustomField.required}
                      onChange={(e) => setNewCustomField(prev => ({ ...prev, required: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="fieldRequired">Required field</Label>
                  </div>
                  
                  <Button type="button" variant="outline" onClick={handleAddCustomField}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                {/* Existing Custom Fields */}
                {form.watch('customFields') && form.watch('customFields')!.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Custom Fields</h4>
                    {form.watch('customFields')!.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <span className="font-medium">{field.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">({field.type})</span>
                          {field.required && <Badge variant="outline" className="ml-2 text-xs">Required</Badge>}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveCustomField(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How this category will appear in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: form.watch('color') }}
                >
                  <Package className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {form.watch('name') || 'Category Name'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('description') || 'Category description will appear here'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">{form.watch('code') || 'CODE'}</Badge>
                    {form.watch('isActive') ? (
                      <Badge className="bg-brand-success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}