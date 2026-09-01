'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  BadgeCent,
  TrendingUp,
  Calendar,
  FileText,
  ArrowRight,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  PieChart,
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
import { incomeService } from '@/services';
import { IncomeRecord, IncomeAnalytics } from '@/lib/types';

export default function IncomeOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [incomeList, setIncomeList] = useState<IncomeRecord[]>([]);
  const [stats, setStats] = useState<IncomeAnalytics | null>(null);
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        incomeService.getIncomeList({ page: 1, limit: 10 }),
        incomeService.getIncomeStats(),
      ]);
      setIncomeList(listRes.data);
      setStats(statsRes);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load income data',
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

  const handleDeleteIncome = async (record: IncomeRecord) => {
    try {
      await incomeService.deleteIncome(record.id);
      setIncomeList((prev) => prev.filter((r) => r.id !== record.id));
      toast({
        title: 'Success',
        description: 'Income record deleted successfully',
      });
      // Refresh stats
      const updatedStats = await incomeService.getIncomeStats();
      setStats(updatedStats);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete income record',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' = 'csv') => {
    try {
      const blob = await incomeService.exportIncome({}, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-records-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Complete',
        description: `Income records downloaded as ${format.toUpperCase()}.`,
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Unable to export income records at this time.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<IncomeRecord>[] = [
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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const income = row.original;
        return (
          <div>
            <div className="font-medium">{income.description}</div>
            {income.reference && (
              <div className="text-xs text-muted-foreground">{income.reference}</div>
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
      accessorKey: 'source',
      header: 'Source / Payer',
      cell: ({ row }) => {
        return <span className="text-sm font-medium">{row.original.source || '—'}</span>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        const isReceived = row.original.status === 'received';
        return (
          <div className={`font-medium ${isReceived ? 'text-brand-success' : 'text-amber-600'}`}>
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
        return <div>{date.toLocaleDateString()}</div>;
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
        const income = row.original;
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
                <Link href={`/dashboard/finance/income/${income.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/income/${income.id}?edit=true`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(income)}
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
        <PageHeader title="Income Overview" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={7} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Overview"
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/income/categories">
                    <PieChart className="mr-2 h-4 w-4" />
                    Income Categories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/income/reports">
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
              <Link href="/dashboard/finance/income/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Record Income
              </Link>
            </Button>
          </div>
        }
      />

      {/* Financial Overview KPI Cards (No category count, includes Pending Income) */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Total Income"
          value={formatCurrency(stats?.totalReceived || 0)}
          icon={BadgeCent}
          accent="primary"
        />

        <StatCard
          title="This Month"
          value={formatCurrency(stats?.thisMonthReceived || 0)}
          icon={Calendar}
          accent="secondary"
          trend={{
            value: `+${stats?.growth || 12.5}% from last month`,
            direction: (stats?.growth || 12.5) > 0 ? 'up' : 'down',
          }}
        />

        <StatCard
          title="Average Income"
          value={formatCurrency(stats?.averageAmount || 0)}
          icon={TrendingUp}
          accent="success"
        />

        <StatCard
          title="Pending Income"
          value={formatCurrency(stats?.totalPending || 0)}
          icon={Clock}
          accent="accent"
        />
      </LazySection>

      {/* Recent Income Main Table */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Income</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/income/reports">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={incomeList}
              recordLabel="income entry"
              recordLabelPlural="income entries"
              searchKey="description"
              searchPlaceholder="Search income description, source, reference..."
            />
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteIncome(deleteDialog.itemToDelete)}
        title="Delete Income Record"
        description="Are you sure you want to delete this income record? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.description}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
