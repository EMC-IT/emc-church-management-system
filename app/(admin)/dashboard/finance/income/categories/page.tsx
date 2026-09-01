'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  BadgeCent,
  TrendingUp,
  Tag,
  CheckCircle,
  MoreHorizontal,
  FolderOpen,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { incomeService } from '@/services';
import { IncomeCategory } from '@/lib/types';

export default function IncomeCategoriesPage() {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await incomeService.getCategories();
      setCategories(res.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load income categories.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDeleteCategory = async (category: IncomeCategory) => {
    try {
      await incomeService.deleteCategory(category.id);
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast({
        title: 'Success',
        description: 'Category deleted successfully.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete category.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<IncomeCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div>
            <div className="font-medium">{cat.name}</div>
            {cat.description && (
              <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                {cat.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => {
        const code = row.getValue('code') as string;
        return code ? <Badge variant="neutral">{code}</Badge> : <span className="text-muted-foreground text-xs">—</span>;
      },
    },
    {
      accessorKey: 'totalIncome',
      header: 'Total Income',
      cell: ({ row }) => {
        const total = row.original.totalIncome || 0;
        return <div className="font-medium text-brand-success">{formatCurrency(total)}</div>;
      },
    },
    {
      accessorKey: 'recordCount',
      header: 'Entries',
      cell: ({ row }) => {
        const count = row.original.recordCount || 0;
        return <span className="text-sm">{count}</span>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.original.isActive;
        return <StatusBadge status={active ? 'active' : 'inactive'} />;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const cat = row.original;
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
                <Link href={`/dashboard/finance/income/categories/${cat.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/income/categories/${cat.id}?edit=true`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(cat)}
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

  const totalIncomeGenerated = categories.reduce((sum, c) => sum + (c.totalIncome || 0), 0);
  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/income" aria-label="Back to Income">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Income Categories"
            actions={
              <Button asChild>
                <Link href="/dashboard/finance/income/categories/add">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Category
                </Link>
              </Button>
            }
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={3}
        className="grid gap-4 md:grid-cols-3"
        threshold={0.1}
      >
        <StatCard
          title="Active Categories"
          value={String(activeCount)}
          icon={Tag}
          accent="primary"
        />

        <StatCard
          title="Total Categories"
          value={String(categories.length)}
          icon={FolderOpen}
          accent="secondary"
        />

        <StatCard
          title="Total Revenue Generated"
          value={formatCurrency(totalIncomeGenerated)}
          icon={TrendingUp}
          accent="success"
        />
      </LazySection>

      {/* Table */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Configured Categories</CardTitle>
              <span className="text-xs text-muted-foreground">
                {categories.length} categories configured
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={categories}
              recordLabel="category"
              recordLabelPlural="categories"
              searchKey="name"
              searchPlaceholder="Search categories..."
            />
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteCategory(deleteDialog.itemToDelete)}
        title="Delete Income Category"
        description="Are you sure you want to delete this category? Historical income records will remain intact."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
