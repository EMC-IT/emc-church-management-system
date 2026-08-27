'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Wallet,
  Users,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Target,
  DollarSign,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DataTable } from '@/components/ui/data-table';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { budgetService } from '@/services';
import { BudgetRecord, BudgetAllocation } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function AllocationsOverviewPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await budgetService.getBudgets({ limit: 50 });
        setBudgets(res.data);

        // Flatten allocations across budgets
        const allAllocations: any[] = [];
        res.data.forEach((b) => {
          (b.allocations || []).forEach((a) => {
            allAllocations.push({
              ...a,
              budgetId: b.id,
              budgetName: b.name,
              budgetTotal: b.amount,
              parentDepartment: b.department,
            });
          });
        });
        setAllocations(allAllocations);
      } catch (err) {
        console.error('Failed to load allocations', err);
        toast.error('Failed to load allocation data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 90) return 'text-amber-600 dark:text-amber-500';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-emerald-600 dark:text-emerald-500';
  };

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
  const totalSpent = allocations.reduce((sum, a) => sum + a.spentAmount, 0);
  const unallocatedReserve = Math.max(0, totalBudgeted - totalAllocated);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'department',
      header: 'Sub-Allocation / Ministry Area',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-medium text-foreground">{item.department}</div>
            <div className="text-xs text-muted-foreground">{item.budgetName}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'parentDepartment',
      header: 'Parent Department',
      cell: ({ row }) => <Badge variant="neutral">{row.original.parentDepartment}</Badge>,
    },
    {
      accessorKey: 'allocatedAmount',
      header: 'Allocated Funds',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{formatCurrency(row.original.allocatedAmount)}</div>
      ),
    },
    {
      accessorKey: 'spentAmount',
      header: 'Spent',
      cell: ({ row }) => (
        <div className="font-medium text-destructive">{formatCurrency(row.original.spentAmount)}</div>
      ),
    },
    {
      id: 'remaining',
      header: 'Balance',
      cell: ({ row }) => {
        const bal = Math.max(0, row.original.allocatedAmount - row.original.spentAmount);
        return <div className="font-medium text-emerald-600">{formatCurrency(bal)}</div>;
      },
    },
    {
      id: 'utilization',
      header: 'Utilization',
      cell: ({ row }) => {
        const item = row.original;
        const rate = item.allocatedAmount > 0 ? Math.round((item.spentAmount / item.allocatedAmount) * 100) : 0;
        return (
          <div className="w-24 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={`font-semibold ${getUtilizationColor(rate)}`}>{rate}%</span>
            </div>
            <Progress value={Math.min(rate, 100)} className="h-1.5" />
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/finance/budgets/${row.original.budgetId}`}>
            View Budget
          </Link>
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Budget Allocations" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={7} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/budgets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Budget Allocations"
            actions={
              <Button asChild>
                <Link href="/dashboard/finance/budgets/add">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Budget Allocation
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
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Total Approved Budget"
          value={formatCurrency(totalBudgeted)}
          icon={Target}
          accent="primary"
        />

        <StatCard
          title="Allocated to Ministries"
          value={formatCurrency(totalAllocated)}
          icon={Wallet}
          accent="accent"
        />

        <StatCard
          title="Unallocated Reserve"
          value={formatCurrency(unallocatedReserve)}
          icon={CheckCircle2}
          accent="success"
        />

        <StatCard
          title="Total Spending"
          value={formatCurrency(totalSpent)}
          icon={TrendingUp}
          accent="secondary"
        />
      </LazySection>

      {/* Allocations Table */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Departmental Fund Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={allocations}
              recordLabel="allocation"
              recordLabelPlural="allocations"
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchKey="department"
              searchPlaceholder="Search allocations by sub-area, department..."
            />
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}