'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Tag, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Eye,
  Wallet,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LazySection } from '@/components/ui/lazy-section';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { expenseService } from '@/services';
import { ExpenseCategory } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const deleteDialog = useDeleteDialog();

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const res = await expenseService.getCategories();
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading expense categories:', error);
      toast.error('Failed to load expense categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (category.group?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'active' && category.isActive) ||
        (filterStatus === 'inactive' && !category.isActive);

      return matchesSearch && matchesFilter;
    });
  }, [categories, searchTerm, filterStatus]);

  const handleDeleteCategory = async (category: ExpenseCategory) => {
    try {
      const result = await expenseService.deleteCategory(category.id);
      if (!result.success) {
        toast.warning(result.message || 'Category deactivated because historical records exist.');
      } else {
        toast.success('Category deleted successfully!');
      }
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleToggleStatus = async (category: ExpenseCategory) => {
    try {
      await expenseService.updateCategory(category.id, {
        isActive: !category.isActive,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? { ...c, isActive: !c.isActive } : c))
      );
      toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Summary statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => cat.isActive).length;
  const totalExpenses = categories.reduce((sum, cat) => sum + (cat.recordCount || 0), 0);
  const totalAmount = categories.reduce((sum, cat) => sum + (cat.totalExpenses || 0), 0);

  const columns: ColumnDef<ExpenseCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color || '#2E8DB0' }}
            />
            <div>
              <div className="font-medium text-foreground">{category.name}</div>
              {category.description && (
                <div className="text-xs text-muted-foreground truncate max-w-sm">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'group',
      header: 'Group',
      cell: ({ row }) => {
        const group = row.original.group || 'Operations';
        return <Badge variant="neutral">{group}</Badge>;
      },
    },
    {
      accessorKey: 'recordCount',
      header: 'Expenses',
      cell: ({ row }) => {
        const count = row.original.recordCount || 0;
        return (
          <div className="font-medium text-foreground">
            {count} {count === 1 ? 'expense' : 'expenses'}
          </div>
        );
      },
    },
    {
      accessorKey: 'totalExpenses',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = row.original.totalExpenses || 0;
        return (
          <div className="font-medium text-destructive">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const category = row.original;
        return <StatusBadge status={category.isActive ? 'active' : 'inactive'} />;
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/expenses/categories/${category.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/expenses/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {category.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(category)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expense Categories" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={6} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Expense Categories"
            actions={
              <Button asChild>
                <Link href="/dashboard/finance/expenses/categories/add">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Category
                </Link>
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary Statistics */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Total Categories"
          value={totalCategories}
          icon={Tag}
          accent="primary"
        />

        <StatCard
          title="Active Categories"
          value={activeCategories}
          icon={CheckCircle2}
          accent="success"
        />

        <StatCard
          title="Total Expenses Logged"
          value={totalExpenses}
          icon={Wallet}
          accent="secondary"
        />

        <StatCard
          title="Total Amount"
          value={formatCurrency(totalAmount)}
          icon={Wallet}
          accent="accent"
        />
      </LazySection>

      {/* Categories Table */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base font-semibold">Categories List</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredCategories}
              recordLabel="category"
              recordLabelPlural="categories"
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchKey="name"
              searchPlaceholder="Search categories by name, group, description..."
            />
          </CardContent>
        </Card>
      </LazySection>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteCategory(deleteDialog.itemToDelete)}
        title="Delete Expense Category"
        description="Are you sure you want to delete this category? If this category contains historical expense records, it will be safely deactivated instead of deleted to protect historical accounting data."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
