'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  Tag,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  Wallet,
  Receipt,
  MoreHorizontal,
  Plus,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import { expenseService } from '@/services';
import { ExpenseCategory, ExpenseRecord } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function ExpenseCategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'this-month' | 'last-month' | 'this-year'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const deleteDialog = useDeleteDialog();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catData, expRes] = await Promise.all([
        expenseService.getCategoryById(id),
        expenseService.getExpenses({ categoryId: id, limit: 100 }),
      ]);
      setCategory(catData);
      setExpenses(expRes.data);
    } catch (error) {
      console.error('Error loading category details:', error);
      toast.error('Failed to load category details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      let matchesDate = true;
      const now = new Date();
      const expenseDate = new Date(expense.date);

      if (dateFilter === 'this-month') {
        matchesDate =
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        matchesDate =
          expenseDate.getMonth() === lastMonth.getMonth() &&
          expenseDate.getFullYear() === lastMonth.getFullYear();
      } else if (dateFilter === 'this-year') {
        matchesDate = expenseDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesDate;
    });
  }, [expenses, searchTerm, dateFilter]);

  const handleDeleteCategory = async () => {
    if (!category) return;
    try {
      const result = await expenseService.deleteCategory(category.id);
      if (!result.success) {
        toast.warning(result.message || 'Category deactivated because historical records exist.');
        setCategory((prev) => (prev ? { ...prev, isActive: false } : null));
      } else {
        toast.success('Category deleted successfully!');
        router.push('/dashboard/finance/expenses/categories');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleExportExpenses = async () => {
    try {
      const blob = await expenseService.exportExpenses({ categoryId: id });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `category-${category?.code || id}-expenses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Expenses exported successfully!');
    } catch {
      toast.error('Failed to export expenses');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading || !category) {
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

  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgExpenseAmount = filteredExpenses.length > 0 ? filteredTotal / filteredExpenses.length : 0;

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: 'title',
      header: 'Expense',
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
      accessorKey: 'vendor',
      header: 'Vendor / Payee',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground">{row.original.vendor}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="font-medium text-destructive">
            {formatCurrency(expense.amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const expense = row.original;
        return <div className="text-sm">{format(new Date(expense.date), 'MMM dd, yyyy')}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
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
                  Edit Expense
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/expenses/categories">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title={category.name}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleExportExpenses}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/finance/expenses/categories/${category.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteDialog.openDialog(category)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* Category Information */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Domain Group
                </div>
                <div>
                  <Badge variant="neutral">{category.group || 'Operations'}</Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </div>
                <div>
                  <StatusBadge status={category.isActive ? 'active' : 'inactive'} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Color Identifier
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: category.color || '#2E8DB0' }}
                  />
                  <span className="text-sm font-medium">{category.color || '#2E8DB0'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Expense
                </div>
                <div className="text-sm font-medium">
                  {category.lastExpenseDate
                    ? format(new Date(category.lastExpenseDate), 'MMM dd, yyyy')
                    : 'None logged'}
                </div>
              </div>
            </div>

            {category.description && (
              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                {category.description}
              </div>
            )}
          </CardContent>
        </Card>
      </LazySection>

      {/* Statistics */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Expenses Logged"
            value={expenses.length}
            icon={Receipt}
            accent="primary"
          />

          <StatCard
            title="Total Amount"
            value={formatCurrency(filteredTotal)}
            icon={Wallet}
            accent="accent"
          />

          <StatCard
            title="Average Expense"
            value={formatCurrency(avgExpenseAmount)}
            icon={TrendingUp}
            accent="secondary"
          />
        </div>
      </LazySection>

      {/* Expenses List */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base font-semibold">Expenses in this Category</CardTitle>
              <Button asChild>
                <Link href="/dashboard/finance/expenses/add">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Record Expense
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DataTable
              columns={columns}
              data={filteredExpenses}
              recordLabel="expense"
              recordLabelPlural="expenses"
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchKey="title"
              searchPlaceholder="Search expenses in this category..."
            />
          </CardContent>
        </Card>
      </LazySection>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDeleteCategory}
        title="Delete Expense Category"
        description="Are you sure you want to delete this category? If historical expense records are attached, it will be deactivated to safeguard financial integrity."
        itemName={category.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
