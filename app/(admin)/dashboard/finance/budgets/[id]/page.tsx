'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Target,
  Edit,
  Trash2,
  Calendar,
  Wallet,
  Tag,
  Users,
  Copy,
  ArrowLeft,
  PieChart,
  Receipt,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { Separator } from '@/components/ui/separator';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import { budgetService } from '@/services';
import { BudgetRecord } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function BudgetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [budget, setBudget] = useState<BudgetRecord | null>(null);
  const [spendingRecords, setSpendingRecords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [bData, spending] = await Promise.all([
          budgetService.getBudgetById(id),
          budgetService.getSpendingAgainstBudget(id),
        ]);
        setBudget(bData);
        setSpendingRecords(spending);
      } catch (error) {
        console.error('Error loading budget details:', error);
        toast.error('Failed to load budget details');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      await budgetService.deleteBudget(id);
      toast.success('Budget deleted successfully!');
      router.push('/dashboard/finance/budgets');
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget. Please try again.');
    }
  };

  const handleDuplicate = async () => {
    if (!budget) return;
    try {
      const res = await budgetService.duplicateBudget(budget.id);
      toast.success('Budget duplicated as draft');
      router.push(`/dashboard/finance/budgets/${res.data.id}/edit`);
    } catch {
      toast.error('Failed to duplicate budget');
    }
  };

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

  const getProgressColorClass = (percentage: number) => {
    if (percentage >= 100) return '[&>div]:bg-destructive';
    if (percentage >= 90) return '[&>div]:bg-amber-500';
    if (percentage >= 75) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-emerald-500';
  };

  if (isLoading || !budget) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center gap-4">
          <LazyLoader className="h-10 w-10 rounded-lg">
            <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
          </LazyLoader>
          <div className="space-y-2">
            <LazyLoader className="h-6 w-48">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            </LazyLoader>
          </div>
        </div>
        <LazyLoader className="h-96 w-full rounded-xl">
          <div className="h-96 w-full rounded-xl bg-muted animate-pulse" />
        </LazyLoader>
      </div>
    );
  }

  const remaining = Math.max(0, budget.amount - budget.spent);
  const utilization = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;

  const spendingColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'description',
      header: 'Expense / Activity',
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div>
            <div className="font-medium text-foreground">{item.description}</div>
            {item.receiptNumber && (
              <div className="text-xs text-muted-foreground">{item.receiptNumber}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor / Payee',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.vendor}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount Charged',
      cell: ({ row }) => (
        <div className="font-medium text-destructive">{formatCurrency(row.original.amount)}</div>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-sm">{format(new Date(row.original.date), 'MMM dd, yyyy')}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

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
            title={budget.name}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleDuplicate}>
                  <Copy className="mr-1.5 h-4 w-4" />
                  Duplicate
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/finance/budgets/${budget.id}/edit`}>
                    <Edit className="mr-1.5 h-4 w-4" />
                    Edit Budget
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteDialog.openDialog(budget)}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  Delete
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* 3 Financial KPIs */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={3}
        className="grid gap-4 md:grid-cols-3"
      >
        <StatCard
          title="Approved Budget"
          value={formatCurrency(budget.amount)}
          icon={Target}
          accent="primary"
        />

        <StatCard
          title="Actual Spent"
          value={formatCurrency(budget.spent)}
          icon={Wallet}
          accent="accent"
        />

        <StatCard
          title="Remaining Balance"
          value={formatCurrency(remaining)}
          icon={Calendar}
          accent="success"
        />
      </LazySection>

      {/* Utilization & Metadata Card */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Budget Details & Utilization</CardTitle>
              <StatusBadge status={budget.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Utilization Bar */}
            <div className="space-y-2 bg-muted/40 p-4 rounded-lg border">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">Overall Utilization</span>
                <span className={`font-bold ${getUtilizationColor(utilization)}`}>
                  {utilization}%
                </span>
              </div>
              <Progress
                value={Math.min(utilization, 100)}
                className={`h-2.5 ${getProgressColorClass(utilization)}`}
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </div>
                <div>
                  <Badge variant="neutral">{budget.categoryName || 'General'}</Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Department
                </div>
                <div className="text-sm font-medium text-foreground">{budget.department}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget Period
                </div>
                <div className="text-sm font-medium text-foreground">{budget.period}</div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget Owner / Overseer
                </div>
                <div className="text-sm font-medium text-foreground">{budget.owner}</div>
              </div>
            </div>

            {budget.description && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description & Objectives
                  </div>
                  <div className="text-sm text-foreground leading-relaxed">{budget.description}</div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </LazySection>

      {/* Spending Against This Budget */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Spending Against This Budget</CardTitle>
              </div>
              <Button size="sm" asChild>
                <Link href="/dashboard/finance/expenses/add">
                  <Receipt className="mr-1.5 h-4 w-4" />
                  Record Expense
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={spendingColumns}
              data={spendingRecords}
              recordLabel="transaction"
              recordLabelPlural="transactions"
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchKey="description"
              searchPlaceholder="Search spending records..."
            />
          </CardContent>
        </Card>
      </LazySection>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDelete}
        title="Delete Budget"
        description="Are you sure you want to delete this budget record? This action cannot be undone."
        itemName={budget.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}