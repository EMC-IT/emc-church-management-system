'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Tag,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowRight,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

// Category interface
interface TitheOfferingCategory {
  id: string;
  name: string;
  description?: string;
  type: 'Tithe' | 'Offering' | 'First Fruits' | 'Special Offering';
  color: string;
  recordCount: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: string;
}

// Mock categories data
const mockCategories: TitheOfferingCategory[] = [
  {
    id: '1',
    name: 'Regular Tithe',
    description: 'Monthly tithe payments from members',
    type: 'Tithe',
    color: '#2E8DB0',
    recordCount: 45,
    totalAmount: 22500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Sunday Offering',
    description: 'Regular Sunday service offerings',
    type: 'Offering',
    color: '#28ACD1',
    recordCount: 32,
    totalAmount: 8500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Building Fund',
    description: 'Special offerings for church building projects',
    type: 'Special Offering',
    color: '#C49831',
    recordCount: 18,
    totalAmount: 15000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'First Fruits',
    description: 'First fruits offerings at the beginning of the year',
    type: 'First Fruits',
    color: '#A5CF5D',
    recordCount: 12,
    totalAmount: 12000,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Missions',
    description: 'Special offerings for missionary work',
    type: 'Special Offering',
    color: '#6366F1',
    recordCount: 8,
    totalAmount: 4500,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Youth Ministry',
    description: 'Special offerings for youth programs',
    type: 'Special Offering',
    color: '#EC4899',
    recordCount: 6,
    totalAmount: 2800,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export default function TitheOfferingCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<TitheOfferingCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, openDialog, closeDialog, itemToDelete } = useDeleteDialog();

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Tithe':
        return <Badge variant="default" className="bg-brand-primary">Tithe</Badge>;
      case 'Offering':
        return <Badge variant="default" className="bg-brand-secondary">Offering</Badge>;
      case 'First Fruits':
        return <Badge variant="default" className="bg-brand-accent">First Fruits</Badge>;
      case 'Special Offering':
        return <Badge variant="default" className="bg-brand-success">Special</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleDelete = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCategories(prev => prev.filter(cat => cat.id !== itemToDelete?.id));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Calculate summary stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalRecords = categories.reduce((sum, cat) => sum + cat.recordCount, 0);
  const totalAmount = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);

  const columns: ColumnDef<TitheOfferingCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-muted-foreground">{category.description}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as string;
        return getTypeBadge(type);
      },
    },
    {
      accessorKey: 'recordCount',
      header: 'Records',
      cell: ({ row }) => {
        const count = row.getValue('recordCount') as number;
        return <span className="font-medium">{count}</span>;
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.getValue('totalAmount') as number;
        return <div className="font-medium text-brand-success">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/tithes-offerings/categories/${category.id}`}>
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/tithes-offerings/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => openDialog(category)}
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
            <FolderOpen className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Giving Categories</h1>
            <p className="text-muted-foreground">Manage tithe and offering categories</p>
          </div>
        </div>

        <div className="ml-auto">
          <Button asChild>
            <Link href="/dashboard/finance/tithes-offerings/categories/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {activeCategories} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <Tag className="h-6 w-6 text-brand-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All categories combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Category</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount / totalCategories || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Average amount
            </p>
          </CardContent>
        </Card>
      </LazySection>

      {/* Categories Table */}
      <LazySection>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Manage your tithe and offering categories</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/tithes-offerings/categories/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={categories}
              searchKey="name"
              searchPlaceholder="Search categories..."
              loading={loading}
            />
          </CardContent>
        </Card>
      </LazySection>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isOpen}
        onOpenChange={closeDialog}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone and will affect all associated records."
        itemName={itemToDelete?.name}
      />
    </div>
  );
}