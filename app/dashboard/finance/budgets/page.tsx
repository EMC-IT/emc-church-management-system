'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Target,
  Plus,
  TrendingUp,
  ChevronDown,
  ArrowRight,
  Eye,
  Edit,
  Copy,
  Trash2,
  MoreHorizontal,
  Download,
  Calendar,
  Wallet,
  PieChart,
  FileText,
  Users,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { useToast } from '@/hooks/use-toast';
import { budgetService } from '@/services';
import { BudgetRecord, BudgetAnalytics } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

// Chart configurations
const budgetTrendsConfig = {
  budget: { label: 'Budget', color: 'hsl(var(--chart-1))' },
  spent: { label: 'Spent', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const departmentConfig = {
  budget: { label: 'Budget', color: 'hsl(var(--chart-1))' },
  spent: { label: 'Spent', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export default function BudgetsManagementPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2026, 2025, 2024]);
  const [budgetList, setBudgetList] = useState<BudgetRecord[]>([]);
  const [stats, setStats] = useState<BudgetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  const loadData = async (year: number) => {
    try {
      setLoading(true);
      const [listRes, statsRes, years] = await Promise.all([
        budgetService.getBudgets({ periodYear: year, limit: 10 }),
        budgetService.getBudgetStats(year),
        budgetService.getAvailableYears(),
      ]);
      setBudgetList(listRes.data);
      setStats(statsRes);
      if (years.length > 0) setAvailableYears(years);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load budget data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (yearStr: string) => {
    const year = Number(yearStr);
    setSelectedYear(year);
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

  const handleDeleteBudget = async (budget: BudgetRecord) => {
    try {
      await budgetService.deleteBudget(budget.id);
      setBudgetList((prev) => prev.filter((b) => b.id !== budget.id));
      toast({
        title: 'Success',
        description: 'Budget record deleted successfully',
      });
      const updatedStats = await budgetService.getBudgetStats(selectedYear);
      setStats(updatedStats);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete budget record',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateBudget = async (budget: BudgetRecord) => {
    try {
      const res = await budgetService.duplicateBudget(budget.id);
      setBudgetList((prev) => [res.data, ...prev]);
      toast({
        title: 'Budget Duplicated',
        description: `Created draft copy of "${budget.name}".`,
      });
      const updatedStats = await budgetService.getBudgetStats(selectedYear);
      setStats(updatedStats);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to duplicate budget',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv' = 'csv') => {
    try {
      const blob = await budgetService.exportBudgets({ periodYear: selectedYear }, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budgets-${selectedYear}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Complete',
        description: `Budgets dataset downloaded as ${format.toUpperCase()}.`,
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Unable to export budget records at this time.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<BudgetRecord>[] = [
    {
      accessorKey: 'name',
      header: 'Budget',
      cell: ({ row }) => {
        const budget = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-medium text-foreground">{budget.name}</div>
            <div className="text-xs text-muted-foreground">{budget.department}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => {
        const cat = row.original.categoryName || 'General';
        return <Badge variant="neutral" className="text-xs font-normal">{cat}</Badge>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Budgeted',
      cell: ({ row }) => {
        const amount = row.original.amount;
        return <div className="font-medium text-foreground whitespace-nowrap">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'spent',
      header: 'Spent',
      cell: ({ row }) => {
        const spent = row.original.spent;
        return <div className="font-medium text-destructive whitespace-nowrap">{formatCurrency(spent)}</div>;
      },
    },
    {
      id: 'remaining',
      header: 'Remaining',
      cell: ({ row }) => {
        const rem = Math.max(0, row.original.amount - row.original.spent);
        return <div className="font-medium text-muted-foreground whitespace-nowrap">{formatCurrency(rem)}</div>;
      },
    },
    {
      id: 'utilization',
      header: 'Utilization',
      cell: ({ row }) => {
        const budget = row.original;
        const rate = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
        return (
          <div className="w-16 sm:w-20 space-y-1">
            <span className={`text-xs font-semibold ${getUtilizationColor(rate)}`}>{rate}%</span>
            <Progress value={Math.min(rate, 100)} className={`h-1.5 ${getProgressColorClass(rate)}`} />
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <StatusBadge status={status} />;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const budget = row.original;
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
                <Link href={`/dashboard/finance/budgets/${budget.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/budgets/${budget.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Budget
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/finance/budgets/allocations">
                  <Users className="mr-2 h-4 w-4" />
                  Allocate Funds
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateBudget(budget)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(budget)}
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
        <PageHeader title="Budget Management" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <CardSkeleton count={2} />
        </div>
        <TableSkeleton rows={5} columns={9} showHeader className="mt-6" />
      </div>
    );
  }

  const utilizationRate = stats?.utilizationRate || 0;

  return (
    <div className="space-y-6">
      {/* Header matching Giving, Income, and Expenses standard */}
      <PageHeader
        title="Budget Management"
        actions={
          <>
            {/* More Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/budgets/categories">
                    <PieChart className="mr-2 h-4 w-4" />
                    Budget Categories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/budgets/allocations">
                    <Users className="mr-2 h-4 w-4" />
                    Allocate Funds
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/budgets/reports">
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

            {/* Primary Action */}
            <Button asChild>
              <Link href="/dashboard/finance/budgets/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Create Budget
              </Link>
            </Button>
          </>
        }
      />

      {/* Compact Fiscal Period Selector */}
      <div className="flex items-center">
        <Select value={String(selectedYear)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-36 h-9">
            <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue placeholder="Fiscal Period" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((yr) => (
              <SelectItem key={yr} value={String(yr)}>
                {yr} Fiscal Year
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4 Financial KPI Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0"
        threshold={0.1}
      >
        <StatCard
          title="Total Budget"
          value={formatCurrency(stats?.totalBudget || 0)}
          icon={Target}
          accent="primary"
        />

        <StatCard
          title="Total Spent"
          value={formatCurrency(stats?.totalSpent || 0)}
          icon={Wallet}
          accent="accent"
        />

        <StatCard
          title="Remaining"
          value={formatCurrency(stats?.remaining || 0)}
          icon={Calendar}
          accent="success"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(utilizationRate)}`}>
              {utilizationRate}%
            </div>
            <Progress
              value={Math.min(utilizationRate, 100)}
              className={`mt-2 h-2 ${getProgressColorClass(utilizationRate)}`}
            />
          </CardContent>
        </Card>
      </LazySection>

      {/* Analytical Charts: Budget vs Spending Trends & Department Budget Overview */}
      <LazySection className="grid gap-4 md:grid-cols-2 min-w-0">
        {/* Budget vs Spending Trends Line Chart */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Budget vs Spending Trends</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <ChartContainer config={budgetTrendsConfig} className="h-[280px] w-full">
              <LineChart data={stats?.trends || []} margin={{ left: 12, right: 12, top: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1.5">
                          <div className="font-semibold text-foreground">{data.month} {selectedYear}</div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-medium text-foreground">{formatCurrency(data.budget)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Spent:</span>
                            <span className="font-medium text-destructive">{formatCurrency(data.spent)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(data.remaining)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                />
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Department Budget Overview Bar Chart */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Department Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            <ChartContainer config={departmentConfig} className="h-[280px] w-full">
              <BarChart data={stats?.departmentSpending || []} margin={{ left: 12, right: 12, top: 10 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="department" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                <ChartTooltip
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1.5">
                          <div className="font-semibold text-foreground">{data.department}</div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Budget:</span>
                            <span className="font-medium text-foreground">{formatCurrency(data.budget)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Spent:</span>
                            <span className="font-medium text-destructive">{formatCurrency(data.spent)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-medium text-emerald-600">{formatCurrency(data.remaining)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 pt-1 border-t">
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className={`font-semibold ${getUtilizationColor(data.utilization)}`}>
                              {data.utilization}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="budget" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </LazySection>

      {/* Budgets Data Section */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Budgets</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/budgets/reports">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={budgetList}
              recordLabel="budget"
              recordLabelPlural="budgets"
              searchKey="name"
              searchPlaceholder="Search budgets by name, department, category..."
            />
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteBudget(deleteDialog.itemToDelete)}
        title="Delete Budget"
        description="Are you sure you want to delete this budget record? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
