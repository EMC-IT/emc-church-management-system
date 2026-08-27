'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Wallet,
  Receipt,
  Heart,
  Target,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { financeService } from '@/services';
import {
  ConsolidatedFinancialReport,
  FinancialAuditRecord,
} from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

// Chart configurations
const monthlyInflowOutflowConfig = {
  totalInflows: {
    label: 'Total Inflows (Giving + Income)',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Operating Expenses',
    color: 'hsl(var(--chart-2))',
  },
  netSurplus: {
    label: 'Net Operating Surplus',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const budgetVarianceConfig = {
  budget: {
    label: 'Approved Budget',
    color: 'hsl(var(--chart-1))',
  },
  spent: {
    label: 'Actual Spent',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function FinancialReportsPage() {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeTab, setActiveTab] = useState('statement');
  const [report, setReport] = useState<ConsolidatedFinancialReport | null>(null);
  const [auditRecords, setAuditRecords] = useState<FinancialAuditRecord[]>([]);
  const [auditDomain, setAuditDomain] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const [rep, audit] = await Promise.all([
          financeService.getConsolidatedFinancialReport(selectedYear),
          financeService.getFinancialAuditRecords(),
        ]);
        setReport(rep);
        setAuditRecords(audit);
      } catch (err) {
        console.error('Failed to load financial reports', err);
        toast.error('Failed to load financial reports data');
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, [selectedYear]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf' = 'csv') => {
    try {
      const blob = await financeService.exportConsolidatedReport(selectedYear, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-statement-${selectedYear}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Financial report downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export report');
    }
  };

  const filteredAuditRecords = useMemo(() => {
    return auditRecords.filter((r) => {
      const matchDomain = auditDomain === 'all' || r.domain.toLowerCase() === auditDomain.toLowerCase();
      const matchSearch =
        !auditSearch ||
        r.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(auditSearch.toLowerCase()) ||
        r.payeeOrDonor.toLowerCase().includes(auditSearch.toLowerCase()) ||
        (r.reference && r.reference.toLowerCase().includes(auditSearch.toLowerCase()));
      return matchDomain && matchSearch;
    });
  }, [auditRecords, auditDomain, auditSearch]);

  const auditColumns: ColumnDef<FinancialAuditRecord>[] = [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span className="text-xs text-muted-foreground whitespace-nowrap">{row.original.date}</span>,
    },
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }) => {
        const d = row.original.domain;
        const variant = d === 'Giving' ? 'primary' : d === 'Income' ? 'success' : 'warning';
        return <Badge variant={variant}>{d}</Badge>;
      },
    },
    {
      accessorKey: 'category',
      header: 'Category / Account',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground">{row.original.category}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description & Reference',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground text-sm">{row.original.description}</div>
          {row.original.reference && (
            <div className="text-xs text-muted-foreground">{row.original.reference}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'payeeOrDonor',
      header: 'Payee / Contributor',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.payeeOrDonor}</span>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.paymentMethod}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const item = row.original;
        const isInflow = item.flow === 'inflow';
        return (
          <div className={`font-semibold whitespace-nowrap ${isInflow ? 'text-emerald-600' : 'text-destructive'}`}>
            {isInflow ? '+' : '-'}{formatCurrency(item.amount)}
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

  if (loading && !report) {
    return (
      <div className="space-y-6">
        <PageHeader title="Financial Reports" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <CardSkeleton count={2} />
        </div>
        <TableSkeleton rows={6} columns={7} showHeader className="mt-6" />
      </div>
    );
  }

  const netSurplusPositive = (report?.netSurplus || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Financial Reports"
        actions={
          <>
            <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger className="w-36">
                <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Fiscal Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026 Fiscal Year</SelectItem>
                <SelectItem value="2025">2025 Fiscal Year</SelectItem>
                <SelectItem value="2024">2024 Fiscal Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => handleExport('excel')}>
              <Download className="mr-1.5 h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />

      {/* 4 Executive Financial KPI Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0"
        threshold={0.1}
      >
        <StatCard
          title="Total Voluntary Giving"
          value={formatCurrency(report?.totalGiving || 0)}
          icon={Heart}
          accent="primary"
        />

        <StatCard
          title="Non-Giving Revenue"
          value={formatCurrency(report?.totalIncome || 0)}
          icon={TrendingUp}
          accent="accent"
        />

        <StatCard
          title="Operating Expenses"
          value={formatCurrency(report?.totalExpenses || 0)}
          icon={Receipt}
          accent="secondary"
        />

        <StatCard
          title="Net Financial Surplus"
          value={formatCurrency(report?.netSurplus || 0)}
          icon={netSurplusPositive ? TrendingUp : TrendingDown}
          accent={netSurplusPositive ? 'success' : 'secondary'}
        />
      </LazySection>

      {/* Tabbed Progressive Disclosure */}
      <LazySection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="statement">Statement of Activities</TabsTrigger>
            <TabsTrigger value="variance">Budget vs Actual</TabsTrigger>
            <TabsTrigger value="revenue">Inflows Breakdown</TabsTrigger>
            <TabsTrigger value="expenses">Outflows Breakdown</TabsTrigger>
            <TabsTrigger value="audit">Transaction Audit Log</TabsTrigger>
          </TabsList>

          {/* TAB 1: Statement of Activities (Income Statement) */}
          <TabsContent value="statement" className="space-y-6">
            {/* Monthly Trend Chart */}
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Monthly Financial Inflows vs Operating Outflows ({selectedYear})
                </CardTitle>
              </CardHeader>
              <CardContent className="min-w-0">
                <ChartContainer config={monthlyInflowOutflowConfig} className="h-80 w-full">
                  <LineChart data={report?.monthlyTrends || []} margin={{ left: 12, right: 12, top: 10 }}>
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
                      dataKey="totalInflows"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="netSurplus"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-3))' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Statement of Financial Activities Table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Statement of Financial Activities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 1. REVENUES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="font-semibold text-sm tracking-wide text-foreground uppercase">
                      Revenues & Inflows
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Share %</span>
                  </div>
                  <div className="space-y-2">
                    {report?.statementRevenues.map((rev, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium text-foreground">{rev.category}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-medium text-foreground">{formatCurrency(rev.amount)}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{rev.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t font-semibold text-sm bg-muted/30 px-3 py-2 rounded">
                    <span>Total Revenues & Inflows</span>
                    <span>{formatCurrency(report?.totalRevenue || 0)}</span>
                  </div>
                </div>

                {/* 2. OPERATING EXPENDITURES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <span className="font-semibold text-sm tracking-wide text-foreground uppercase">
                      Operating Expenditures
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase">Share %</span>
                  </div>
                  <div className="space-y-2">
                    {report?.statementExpenses.map((exp, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm py-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span className="font-medium text-foreground">{exp.category}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-medium text-destructive">{formatCurrency(exp.amount)}</span>
                          <span className="text-xs text-muted-foreground w-12 text-right">{exp.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t font-semibold text-sm bg-muted/30 px-3 py-2 rounded">
                    <span>Total Operating Expenditures</span>
                    <span className="text-destructive">{formatCurrency(report?.totalExpenses || 0)}</span>
                  </div>
                </div>

                {/* 3. NET OPERATING SURPLUS */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-xs">
                  <div>
                    <div className="font-bold text-base text-foreground">
                      Net Financial Operating Position
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gross Revenues minus Operating Expenditures
                    </div>
                  </div>
                  <div className={`text-xl font-bold ${netSurplusPositive ? 'text-emerald-600' : 'text-destructive'}`}>
                    {netSurplusPositive ? '+' : ''}{formatCurrency(report?.netSurplus || 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Budget vs Actual Variance Analysis */}
          <TabsContent value="variance" className="space-y-6">
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Department Budget vs Spending Overview</CardTitle>
              </CardHeader>
              <CardContent className="min-w-0">
                <ChartContainer config={budgetVarianceConfig} className="h-80 w-full">
                  <BarChart data={report?.departmentVariances || []} margin={{ left: 12, right: 12, top: 10 }}>
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Departmental Variance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report?.departmentVariances.map((dv, idx) => {
                    const badgeVariant =
                      dv.status === 'Over Budget'
                        ? 'danger'
                        : dv.status === 'Near Limit' || dv.status === 'Watch'
                        ? 'warning'
                        : 'success';
                    return (
                      <div key={idx} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-foreground">{dv.department}</div>
                          <Badge variant={badgeVariant}>{dv.status}</Badge>
                        </div>
                        <div className="grid grid-cols-3 text-sm text-muted-foreground gap-4">
                          <div>
                            <span>Approved Budget: </span>
                            <span className="font-medium text-foreground">{formatCurrency(dv.budget)}</span>
                          </div>
                          <div>
                            <span>Actual Spent: </span>
                            <span className="font-medium text-destructive">{formatCurrency(dv.spent)}</span>
                          </div>
                          <div>
                            <span>Remaining Variance: </span>
                            <span className="font-medium text-emerald-600">{formatCurrency(dv.variance)}</span>
                          </div>
                        </div>
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Utilization</span>
                            <span className="font-bold text-foreground">{dv.utilization}%</span>
                          </div>
                          <Progress value={Math.min(dv.utilization, 100)} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Inflows Breakdown */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Giving Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Voluntary Giving Composition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report?.givingCategoryDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.category}</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(item.amount)} ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Income Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Non-Giving Revenue Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report?.incomeCategoryDistribution.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.category}</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(item.amount)} ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Payment Channels */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Collection Channels & Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {report?.paymentMethodDistribution.map((pm, idx) => (
                    <div key={idx} className="p-4 border rounded-lg space-y-2 bg-card">
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {pm.method}
                      </div>
                      <div className="text-lg font-bold text-foreground">{formatCurrency(pm.amount)}</div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Share of Collections</span>
                        <span className="font-semibold">{pm.percentage}%</span>
                      </div>
                      <Progress value={pm.percentage} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Outflows Breakdown */}
          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Operating Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report?.expenseCategoryDistribution.map((item, idx) => (
                  <div key={idx} className="space-y-1.5 p-3 border rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.category}</span>
                      <span className="font-bold text-destructive">
                        {formatCurrency(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="h-2 [&>div]:bg-destructive" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: Transaction Audit Log */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold">Consolidated Financial Audit Log</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={auditDomain} onValueChange={setAuditDomain}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="All Domains" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Domains</SelectItem>
                        <SelectItem value="giving">Giving Only</SelectItem>
                        <SelectItem value="income">Income Only</SelectItem>
                        <SelectItem value="expense">Expenses Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={auditColumns}
                  data={filteredAuditRecords}
                  recordLabel="transaction"
                  recordLabelPlural="transactions"
                  searchValue={auditSearch}
                  onSearchChange={setAuditSearch}
                  searchKey="description"
                  searchPlaceholder="Search audit log by description, payee, category..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LazySection>
    </div>
  );
}