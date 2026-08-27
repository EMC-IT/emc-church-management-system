'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Wallet, 
  Receipt, 
  Clock, 
  ArrowLeft,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { LazySection } from '@/components/ui/lazy-section';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { expenseService } from '@/services';
import { ExpenseRecord, ExpenseCategory } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

export default function ExpenseReportsPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [reportPeriod, setReportPeriod] = useState<'this-month' | 'last-month' | 'this-year' | 'last-year' | 'all'>('this-year');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [expRes, catRes] = await Promise.all([
        expenseService.getExpenses({ limit: 1000 }),
        expenseService.getCategories(),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Failed to load expense report data', err);
      toast.error('Failed to load expense report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePeriodChange = (period: string) => {
    setReportPeriod(period as any);
    const now = new Date();

    switch (period) {
      case 'this-month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'last-month':
        const lastMonth = subMonths(now, 1);
        setDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
        break;
      case 'this-year':
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
      case 'last-year':
        const lastYear = subYears(now, 1);
        setDateRange({ from: startOfYear(lastYear), to: endOfYear(lastYear) });
        break;
      case 'all':
        setDateRange({});
        break;
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || expense.categoryId === categoryFilter;
      const matchesStatus = statusFilter === 'all' || expense.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesPayment =
        paymentMethodFilter === 'all' ||
        expense.paymentMethod.toLowerCase() === paymentMethodFilter.toLowerCase();

      const expenseDate = new Date(expense.date);
      const matchesDate =
        (!dateRange.from || expenseDate >= dateRange.from) &&
        (!dateRange.to || expenseDate <= dateRange.to);

      return matchesSearch && matchesCategory && matchesStatus && matchesPayment && matchesDate;
    });
  }, [expenses, searchTerm, categoryFilter, statusFilter, paymentMethodFilter, dateRange]);

  // Status segregation for accurate accounting
  const paidExpenses = useMemo(() => filteredExpenses.filter((e) => e.status.toLowerCase() === 'paid'), [filteredExpenses]);
  const pendingExpenses = useMemo(() => filteredExpenses.filter((e) => e.status.toLowerCase() === 'pending'), [filteredExpenses]);

  const totalPaidAmount = useMemo(() => paidExpenses.reduce((sum, e) => sum + e.amount, 0), [paidExpenses]);
  const totalPendingAmount = useMemo(() => pendingExpenses.reduce((sum, e) => sum + e.amount, 0), [pendingExpenses]);
  const averagePaidAmount = paidExpenses.length > 0 ? totalPaidAmount / paidExpenses.length : 0;

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { amount: number; count: number; color: string }>();

    paidExpenses.forEach((expense) => {
      const catName = expense.categoryName || 'General';
      const color = expense.categoryColor || '#2E8DB0';
      const existing = map.get(catName) || { amount: 0, count: 0, color };
      map.set(catName, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
        color: existing.color || color,
      });
    });

    return Array.from(map.entries())
      .map(([category, data]) => ({
        category,
        color: data.color,
        amount: data.amount,
        count: data.count,
        percentage: totalPaidAmount > 0 ? (data.amount / totalPaidAmount) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [paidExpenses, totalPaidAmount]);

  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, { amount: number; count: number }>();

    paidExpenses.forEach((expense) => {
      const monthKey = format(new Date(expense.date), 'MMM yyyy');
      const existing = monthMap.get(monthKey) || { amount: 0, count: 0 };
      monthMap.set(monthKey, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [paidExpenses]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = async (formatType: 'pdf' | 'excel' | 'csv' = 'csv') => {
    try {
      const blob = await expenseService.exportExpenses(
        {
          categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
          startDate: dateRange.from?.toISOString().split('T')[0],
          endDate: dateRange.to?.toISOString().split('T')[0],
          search: searchTerm || undefined,
        },
        formatType
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-report-${new Date().toISOString().split('T')[0]}.${formatType === 'excel' ? 'xlsx' : formatType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Expense report exported as ${formatType.toUpperCase()}`);
    } catch {
      toast.error('Failed to export expense report');
    }
  };

  const expenseChartConfig = {
    amount: { label: 'Amount', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const monthlyChartConfig = {
    amount: { label: 'Amount', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const columns: ColumnDef<ExpenseRecord>[] = [
    {
      accessorKey: 'title',
      header: 'Expense',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div>
            <div className="font-medium text-foreground">{expense.title}</div>
            <div className="text-xs text-muted-foreground">{expense.vendor}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => {
        const expense = row.original;
        return (
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: expense.categoryColor || '#2E8DB0' }}
            />
            <span className="text-sm font-medium">{expense.categoryName || 'General'}</span>
          </div>
        );
      },
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
      accessorKey: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => (
        <Badge variant="neutral">{row.original.paymentMethod}</Badge>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Expense Reports" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={6} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/finance/expenses">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Expense Reports"
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="mr-1.5 h-4 w-4" />
                  CSV
                </Button>
                <Button onClick={() => handleExport('excel')}>
                  <Download className="mr-1.5 h-4 w-4" />
                  Export Excel
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* Filter Controls */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Period
                </label>
                <Select value={reportPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="paid">Paid Only</SelectItem>
                    <SelectItem value="pending">Pending Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment Method
                </label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>

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
          title="Total Paid Expenses"
          value={formatCurrency(totalPaidAmount)}
          icon={Wallet}
          accent="primary"
        />
        <StatCard
          title="Pending Expenses"
          value={formatCurrency(totalPendingAmount)}
          icon={Clock}
          accent="accent"
        />
        <StatCard
          title="Average Paid Expense"
          value={formatCurrency(averagePaidAmount)}
          icon={Receipt}
          accent="secondary"
        />
        <StatCard
          title="Active Categories"
          value={categoryBreakdown.length}
          icon={PieChart}
          accent="success"
        />
      </LazySection>

      {/* Analysis Tabs */}
      <LazySection>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="details">Detailed Records</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <PieChart className="h-4 w-4" />
                    Paid Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryBreakdown.length > 0 ? (
                    <ChartContainer config={expenseChartConfig} className="h-80 w-full">
                      <RechartsPieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          dataKey="amount"
                          strokeWidth={2}
                          label={({ category, percentage }: any) =>
                            `${category}: ${percentage.toFixed(1)}%`
                          }
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              stroke="hsl(var(--background))"
                            />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
                      No paid expenses recorded for this period
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Trends Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <LineChart className="h-4 w-4" />
                    Monthly Expense Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {monthlyTrends.length > 0 ? (
                    <ChartContainer config={monthlyChartConfig} className="h-80 w-full">
                      <RechartsLineChart data={monthlyTrends} margin={{ left: 12, right: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                        <ChartTooltip
                          cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                          content={<ChartTooltipContent indicator="line" />}
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--chart-2))' }}
                        />
                      </RechartsLineChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">
                      No trend data available for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryBreakdown.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div>
                          <div className="font-medium text-foreground">{cat.category}</div>
                          <div className="text-xs text-muted-foreground">
                            {cat.count} {cat.count === 1 ? 'expense' : 'expenses'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-destructive">
                          {formatCurrency(cat.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {cat.percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Expense Inflow / Outflow Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={expenseChartConfig} className="h-96 w-full">
                  <BarChart data={monthlyTrends} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Expense Details List</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredExpenses}
                  recordLabel="expense"
                  recordLabelPlural="expenses"
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchKey="title"
                  searchPlaceholder="Search expense records..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LazySection>
    </div>
  );
}
