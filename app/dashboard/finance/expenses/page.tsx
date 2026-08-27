'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Wallet,
  Calendar,
  Receipt,
  Clock,
  Download,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ArrowRight,
  PieChart,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
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
import { ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/use-toast';
import { expenseService } from '@/services';
import { ExpenseRecord, ExpenseAnalytics } from '@/lib/types';

export default function ExpensesOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expenseList, setExpenseList] = useState<ExpenseRecord[]>([]);
  const [stats, setStats] = useState<ExpenseAnalytics | null>(null);
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        expenseService.getExpenses({ page: 1, limit: 10 }),
        expenseService.getExpenseStats(),
      ]);
      setExpenseList(listRes.data);
      setStats(statsRes);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load expense records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDeleteExpense = async (record: ExpenseRecord) => {
    try {
      await expenseService.deleteExpense(record.id);
      setExpenseList((prev) => prev.filter((r) => r.id !== record.id));
      toast({
        title: 'Success',
        description: 'Expense record deleted successfully',
      });
      const updatedStats = await expenseService.getExpenseStats();
      setStats(updatedStats);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete expense record',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateExpense = async (record: ExpenseRecord) => {
    try {
      const res = await expenseService.duplicateExpense(record.id);
      setExpenseList((prev) => [res.data, ...prev]);
      toast({
        title: 'Expense Duplicated',
        description: `Created copy of "${record.title}". Status is set to Pending.`,
      });
      const updatedStats = await expenseService.getExpenseStats();
      setStats(updatedStats);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to duplicate expense',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' = 'csv') => {
    try {
      const blob = await expenseService.exportExpenses({}, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenses-records-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Complete',
        description: `Expense records downloaded as ${format.toUpperCase()}.`,
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Unable to export expense records at this time.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Description',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <div className="font-medium text-foreground">{expense.title}</div>
            {expense.receiptNumber && (
              <div className="text-xs text-muted-foreground">{expense.receiptNumber}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original.categoryName || 'General';
        return <Badge variant="neutral">{category}</Badge>;
      },
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor / Payee',
      cell: ({ row }) => {
        return <span className="text-sm font-medium text-foreground">{row.original.vendor || '—'}</span>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(String(row.getValue('amount')));
        return (
          <div className="font-medium text-destructive">
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const expense = row.original;
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
                <Link href={`/dashboard/finance/expenses/${expense.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/expenses/${expense.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateExpense(expense)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(expense)}
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

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expenses Overview" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={7} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses Overview"
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/expenses/categories">
                    <PieChart className="mr-2 h-4 w-4" />
                    Expense Categories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/expenses/reports">
                    <FileText className="mr-2 h-4 w-4" />
                    Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button asChild>
              <Link href="/dashboard/finance/expenses/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Record Expense
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards: Total Expenses, This Month, Average Expense, Pending Expenses */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats?.totalPaid || 0)}
          icon={Wallet}
          accent="primary"
        />

        <StatCard
          title="This Month"
          value={formatCurrency(stats?.thisMonthPaid || 0)}
          icon={Calendar}
          accent="accent"
          trend={{
            value: `${Math.abs(stats?.growth ?? 8.2)}% from last month`,
            direction: (stats?.growth ?? -8.2) >= 0 ? 'up' : 'down',
          }}
        />

        <StatCard
          title="Average Expense"
          value={formatCurrency(stats?.averageAmount || 0)}
          icon={Receipt}
          accent="secondary"
        />

        <StatCard
          title="Pending Expenses"
          value={formatCurrency(stats?.totalPending || 0)}
          icon={Clock}
          accent="accent"
        />
      </LazySection>

      {/* Recent Expenses Section */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Expenses</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/expenses/reports">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={expenseList}
              recordLabel="expense"
              recordLabelPlural="expenses"
              searchKey="title"
              searchPlaceholder="Search expenses..."
            />
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteExpense(deleteDialog.itemToDelete)}
        title="Delete Expense Record"
        description="Are you sure you want to delete this expense record? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.title}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
