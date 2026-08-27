'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Download,
  TrendingUp,
  Target,
  Wallet,
  Calendar,
  CheckCircle2,
  PieChart,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
} from '@/components/ui/chart';
import { LazySection } from '@/components/ui/lazy-section';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { toast } from 'sonner';
import { budgetService } from '@/services';
import { BudgetRecord, BudgetAnalytics } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

const budgetTrendsConfig = {
  budget: { label: 'Budget', color: 'hsl(var(--chart-1))' },
  spent: { label: 'Spent', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const departmentConfig = {
  budget: { label: 'Budget', color: 'hsl(var(--chart-1))' },
  spent: { label: 'Spent', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export default function BudgetReportsPage() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
  const [stats, setStats] = useState<BudgetAnalytics | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [listRes, statsRes] = await Promise.all([
          budgetService.getBudgets({ periodYear: selectedYear, limit: 100 }),
          budgetService.getBudgetStats(selectedYear),
        ]);
        setBudgets(listRes.data);
        setStats(statsRes);
      } catch (err) {
        console.error('Failed to load budget report data', err);
        toast.error('Failed to load budget report data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedYear]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.categoryName && b.categoryName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDept = departmentFilter === 'all' || b.department.toLowerCase() === departmentFilter.toLowerCase();
      const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [budgets, searchTerm, departmentFilter, statusFilter]);

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

  const handleExport = async (formatType: 'pdf' | 'excel' | 'csv' = 'csv') => {
    try {
      const blob = await budgetService.exportBudgets(
        {
          periodYear: selectedYear,
          department: departmentFilter !== 'all' ? departmentFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined,
        },
        formatType
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-report-${selectedYear}-${new Date().toISOString().split('T')[0]}.${formatType === 'excel' ? 'xlsx' : formatType}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Budget report downloaded as ${formatType.toUpperCase()}`);
    } catch {
      toast.error('Failed to export report');
    }
  };

  const columns: ColumnDef<BudgetRecord>[] = [
    {
      accessorKey: 'name',
      header: 'Budget',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">{row.original.period}</div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <Badge variant="neutral">{row.original.department}</Badge>,
    },
    {
      accessorKey: 'amount',
      header: 'Budget Amount',
      cell: ({ row }) => (
        <div className="font-medium text-foreground">{formatCurrency(row.original.amount)}</div>
      ),
    },
    {
      accessorKey: 'spent',
      header: 'Actual Spent',
      cell: ({ row }) => (
        <div className="font-medium text-destructive">{formatCurrency(row.original.spent)}</div>
      ),
    },
    {
      id: 'remaining',
      header: 'Variance / Balance',
      cell: ({ row }) => {
        const bal = row.original.amount - row.original.spent;
        return (
          <div className={`font-medium ${bal >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
            {formatCurrency(bal)}
          </div>
        );
      },
    },
    {
      id: 'utilization',
      header: 'Utilization',
      cell: ({ row }) => {
        const rate = row.original.amount > 0 ? Math.round((row.original.spent / row.original.amount) * 100) : 0;
        return (
          <div className="w-24 space-y-1">
            <span className={`text-xs font-semibold ${getUtilizationColor(rate)}`}>{rate}%</span>
            <Progress value={Math.min(rate, 100)} className="h-1.5" />
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Budget Reports" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={7} showHeader className="mt-6" />
      </div>
    );
  }

  const utilizationRate = stats?.utilizationRate || 0;

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
            title="Budget Reports"
            actions={
              <div className="flex items-center gap-2">
                <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Department
                </label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Worship Ministry">Worship Ministry</SelectItem>
                    <SelectItem value="Youth Ministry">Youth Ministry</SelectItem>
                    <SelectItem value="Children Ministry">Children Ministry</SelectItem>
                    <SelectItem value="Missions Department">Missions Department</SelectItem>
                    <SelectItem value="Facilities Management">Facilities Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Budget Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="watch">Watch (75–89%)</SelectItem>
                    <SelectItem value="near limit">Near Limit (90–99%)</SelectItem>
                    <SelectItem value="over budget">Over Budget (≥100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Year
                </label>
                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026 Fiscal Year</SelectItem>
                    <SelectItem value="2025">2025 Fiscal Year</SelectItem>
                    <SelectItem value="2024">2024 Fiscal Year</SelectItem>
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
          title="Approved Budget"
          value={formatCurrency(stats?.totalBudget || 0)}
          icon={Target}
          accent="primary"
        />

        <StatCard
          title="Actual Spending"
          value={formatCurrency(stats?.totalSpent || 0)}
          icon={Wallet}
          accent="accent"
        />

        <StatCard
          title="Remaining Balance"
          value={formatCurrency(stats?.remaining || 0)}
          icon={Calendar}
          accent="success"
        />

        <StatCard
          title="Overall Utilization"
          value={`${utilizationRate}%`}
          icon={TrendingUp}
          accent="secondary"
        />
      </LazySection>

      {/* Analytics Tabs */}
      <LazySection>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visual Analytics</TabsTrigger>
            <TabsTrigger value="departments">Department Breakdown</TabsTrigger>
            <TabsTrigger value="records">Budget Records Table</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Trends */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Budget vs Spending Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={budgetTrendsConfig} className="h-80 w-full">
                    <LineChart data={stats?.trends || []} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <ChartTooltip
                        cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                        content={<ChartTooltipContent indicator="line" />}
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

              {/* Department Overview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Department Budget Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={departmentConfig} className="h-80 w-full">
                    <BarChart data={stats?.departmentSpending || []} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="department" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <ChartTooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="budget" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="spent" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Department Performance & Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.departmentSpending.map((dept, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-foreground">{dept.department}</div>
                        <div className={`font-bold ${getUtilizationColor(dept.utilization)}`}>
                          {dept.utilization}% Utilization
                        </div>
                      </div>
                      <div className="grid grid-cols-3 text-sm text-muted-foreground gap-4">
                        <div>
                          <span>Budget: </span>
                          <span className="font-medium text-foreground">{formatCurrency(dept.budget)}</span>
                        </div>
                        <div>
                          <span>Spent: </span>
                          <span className="font-medium text-destructive">{formatCurrency(dept.spent)}</span>
                        </div>
                        <div>
                          <span>Remaining: </span>
                          <span className="font-medium text-emerald-600">{formatCurrency(dept.remaining)}</span>
                        </div>
                      </div>
                      <Progress value={Math.min(dept.utilization, 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Detailed Budget Records</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredBudgets}
                  recordLabel="budget"
                  recordLabelPlural="budgets"
                  searchValue={searchTerm}
                  onSearchChange={setSearchTerm}
                  searchKey="name"
                  searchPlaceholder="Search budget records..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LazySection>
    </div>
  );
}