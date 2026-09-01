'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Tag, Plus, CheckCircle2, Wallet, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { LazySection } from '@/components/ui/lazy-section';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { budgetService } from '@/services';
import { BudgetCategory } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function BudgetCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const res = await budgetService.getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories', err);
        toast.error('Failed to load budget categories');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === 'Active').length;
  const totalBudgetAcrossCategories = categories.reduce((sum, c) => sum + (c.totalBudget || 0), 0);

  const columns: ColumnDef<BudgetCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: cat.color || '#2E8DB0' }}
            />
            <div>
              <div className="font-medium text-foreground">{cat.name}</div>
              {cat.description && (
                <div className="text-xs text-muted-foreground truncate max-w-sm">
                  {cat.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'budgetCount',
      header: 'Budgets',
      cell: ({ row }) => {
        const count = row.original.budgetCount || 0;
        return <div className="font-medium text-foreground">{count} {count === 1 ? 'budget' : 'budgets'}</div>;
      },
    },
    {
      accessorKey: 'totalBudget',
      header: 'Total Budgeted',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">
          {formatCurrency(row.original.totalBudget || 0)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Budget Categories" />
        <CardSkeleton count={3} className="grid gap-4 md:grid-cols-3" />
        <TableSkeleton rows={5} columns={5} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/budgets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Budget Categories"
            actions={
              <Button asChild>
                <Link href="/dashboard/finance/budgets/add">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Create Budget
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
        skeletonCount={3}
        className="grid gap-4 md:grid-cols-3"
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
          title="Total Budget Allocated"
          value={formatCurrency(totalBudgetAcrossCategories)}
          icon={Wallet}
          accent="accent"
        />
      </LazySection>

      {/* Categories Table */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Categories Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={categories}
              recordLabel="category"
              recordLabelPlural="categories"
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchKey="name"
              searchPlaceholder="Search categories by name, description..."
            />
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}