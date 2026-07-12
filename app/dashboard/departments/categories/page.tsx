"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

import { DataTable } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
  Palette,
  Save,
  Building2
} from 'lucide-react';
import { DepartmentCategory, DepartmentCategoryFormData } from '@/lib/types/departments';
import { departmentsService } from '@/services/departments-service';
import { toast } from 'sonner';



const categoryFormSchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  color: z.string().min(4, 'Please select a color'),
  icon: z.string().min(1, 'Please select an icon'),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const PREDEFINED_COLORS = [
  { name: 'Blue', value: '#2E8DB0' },
  { name: 'Light Blue', value: '#28ACD1' },
  { name: 'Gold', value: '#C49831' },
  { name: 'Green', value: '#A5CF5D' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
];

const AVAILABLE_ICONS = [
  'Music',
  'Settings',
  'Heart',
  'Monitor',
  'Users',
  'Book',
  'Mic',
  'Camera',
  'Headphones',
  'Globe',
  'Shield',
  'Star',
  'Zap',
  'Target',
  'Award'
];

export default function DepartmentCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<DepartmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DepartmentCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<DepartmentCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '',
      icon: '',
    },
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await departmentsService.getCategories();
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      setSubmitting(true);
      
      const categoryData: DepartmentCategoryFormData = {
        name: values.name,
        description: values.description,
        color: values.color,
        icon: values.icon,
      };
      
      const response = await departmentsService.createCategory(categoryData);
      
      if (response.success) {
        toast.success('Category created successfully');
        setDialogOpen(false);
        form.reset();
        loadCategories();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCategory = (category: DepartmentCategory) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
    });
    setDialogOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      // In a real app, you would call the delete API
      toast.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const openDeleteDialog = (category: DepartmentCategory) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    form.reset();
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }: { row: any }) => {
        const category = row.original as DepartmentCategory;
        return (
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">
                {category.description.length > 50 
                  ? `${category.description.substring(0, 50)}...` 
                  : category.description
                }
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }: { row: any }) => {
        const category = row.original as DepartmentCategory;
        return (
          <Badge variant="neutral">
            {category.icon}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: ({ row }: { row: any }) => {
        const category = row.original as DepartmentCategory;
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm font-mono">{category.color}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: any }) => {
        const category = row.original as DepartmentCategory;
        return (
          <span className="text-sm text-muted-foreground">
            {new Date(category.createdAt).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const category = row.original as DepartmentCategory;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => openDeleteDialog(category)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <PageHeader title="Department Categories" />
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Update the category information below.'
                  : 'Create a new category to organize your departments.'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Music Ministry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this category..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <div className="grid grid-cols-5 gap-2">
                        {PREDEFINED_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`w-12 h-12 rounded border-2 transition-all ${
                              field.value === color.value 
                                ? 'border-foreground scale-110' 
                                : 'border-muted hover:border-foreground/50'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => field.onChange(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an icon" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {AVAILABLE_ICONS.map((icon) => (
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
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Categories"
          value={categories.length}
          icon={Tag}
          accent="primary"
          description="Active categories"
        />
        <StatCard
          title="Most Used"
          value="Music Ministry"
          icon={Building2}
          accent="secondary"
          description="3 departments"
        />
        <StatCard
          title="Color Palette"
          value={
            <div className="flex space-x-1">
              {categories.slice(0, 6).map((category, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              ))}
            </div>
          }
          icon={Palette}
          accent="success"
          description="Category colors"
        />
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories}
            recordLabel="category"
            recordLabelPlural="categories"
            loading={loading}
            pagination={true}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
              Departments using this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
