'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  BadgeCent,
  FileText,
  Clock,
  RefreshCw,
  ArrowLeft,
  Users,
  Tag,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DataTable } from '@/components/ui/data-table';
import { LazySection } from '@/components/ui/lazy-section';
import { useToast } from '@/hooks/use-toast';
import { incomeService } from '@/services';
import { IncomeRecord, IncomeCategory, IncomeStatus } from '@/lib/types';

export default function IncomeReportsPage() {
  const [loading, setLoading] = useState(true);
  const [incomeData, setIncomeData] = useState<IncomeRecord[]>([]);
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [dateOpen, setDateOpen] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState<{
    category: string;
    status: string;
    method: string;
    search: string;
    dateRange: DateRange | undefined;
  }>({
    category: 'all',
    status: 'all',
    method: 'all',
    search: '',
    dateRange: undefined,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, catsRes] = await Promise.all([
        incomeService.getIncomeList({ limit: 100 }),
        incomeService.getCategories(),
      ]);
      setIncomeData(listRes.data);
      setCategories(catsRes.data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load report data.',
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

  // Filtered dataset
  const filteredData = useMemo(() => {
    return incomeData.filter((item) => {
      if (filters.category !== 'all' && item.categoryId !== filters.category) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.method !== 'all' && item.paymentMethod.toLowerCase() !== filters.method.toLowerCase()) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          item.description.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          (item.reference && item.reference.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filters.dateRange?.from) {
        const itemDate = new Date(item.date);
        if (itemDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
      }
      return true;
    });
  }, [incomeData, filters]);

  // Aggregate stats (strictly separated received vs pending)
  const receivedRecords = filteredData.filter((r) => r.status === 'received');
  const pendingRecords = filteredData.filter((r) => r.status === 'pending');

  const totalReceived = receivedRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalPending = pendingRecords.reduce((sum, r) => sum + r.amount, 0);
  const avgReceived = receivedRecords.length > 0 ? totalReceived / receivedRecords.length : 0;

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; amount: number; count: number }> = {};
    for (const r of receivedRecords) {
      const name = r.categoryName || 'Other';
      if (!map[name]) map[name] = { name, amount: 0, count: 0 };
      map[name].amount += r.amount;
      map[name].count += 1;
    }
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalReceived > 0 ? Math.round((item.amount / totalReceived) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [receivedRecords, totalReceived]);

  // Method breakdown calculation
  const methodBreakdown = useMemo(() => {
    const map: Record<string, { method: string; amount: number; count: number }> = {};
    for (const r of receivedRecords) {
      const m = r.paymentMethod || 'Other';
      if (!map[m]) map[m] = { method: m, amount: 0, count: 0 };
      map[m].amount += r.amount;
      map[m].count += 1;
    }
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalReceived > 0 ? Math.round((item.amount / totalReceived) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [receivedRecords, totalReceived]);

  // Source breakdown calculation
  const sourceBreakdown = useMemo(() => {
    const map: Record<string, { source: string; amount: number; count: number }> = {};
    for (const r of receivedRecords) {
      const s = r.source || 'General';
      if (!map[s]) map[s] = { source: s, amount: 0, count: 0 };
      map[s].amount += r.amount;
      map[s].count += 1;
    }
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: totalReceived > 0 ? Math.round((item.amount / totalReceived) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [receivedRecords, totalReceived]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const blob = await incomeService.exportIncome(
        {
          categoryId: filters.category !== 'all' ? filters.category : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          paymentMethod: filters.method !== 'all' ? filters.method : undefined,
          startDate: filters.dateRange?.from ? filters.dateRange.from.toISOString().split('T')[0] : undefined,
          endDate: filters.dateRange?.to ? filters.dateRange.to.toISOString().split('T')[0] : undefined,
          search: filters.search || undefined,
        },
        format
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export Complete',
        description: `Exported ${filteredData.length} records as ${format.toUpperCase()}.`,
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Failed to export income report.',
        variant: 'destructive',
      });
    }
  };

  const columns: ColumnDef<IncomeRecord>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          {row.original.reference && (
            <div className="text-xs text-muted-foreground">{row.original.reference}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => <Badge variant="neutral">{row.original.categoryName || 'General'}</Badge>,
    },
    {
      accessorKey: 'source',
      header: 'Source / Payer',
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.source}</span>,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const isReceived = row.original.status === 'received';
        return (
          <div className={`font-medium ${isReceived ? 'text-brand-success' : 'text-amber-600'}`}>
            {formatCurrency(row.original.amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) => <span className="text-sm">{row.original.paymentMethod || '—'}</span>,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span>{new Date(row.original.date).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/finance/income" aria-label="Back to Income">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title="Income Reports & Analytics" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Select onValueChange={(val) => handleExport(val as any)}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="pdf">PDF Report</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
            </SelectContent>
          </Select>
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
          title="Received Income"
          value={formatCurrency(totalReceived)}
          icon={BadgeCent}
          accent="primary"
        />

        <StatCard
          title="Pending Income"
          value={formatCurrency(totalPending)}
          icon={Clock}
          accent="accent"
        />

        <StatCard
          title="Average Received"
          value={formatCurrency(avgReceived)}
          icon={TrendingUp}
          accent="success"
        />

        <StatCard
          title="Total Transactions"
          value={String(filteredData.length)}
          icon={Users}
          accent="secondary"
        />
      </LazySection>

      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <Select
                value={filters.category}
                onValueChange={(val) => setFilters({ ...filters, category: val })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
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

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(val) => setFilters({ ...filters, status: val })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Method */}
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Method</Label>
              <Select
                value={filters.method}
                onValueChange={(val) => setFilters({ ...filters, method: val })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <Label className="text-xs">Date Range</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal w-full h-9 text-xs">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    {filters.dateRange?.from && filters.dateRange?.to
                      ? `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}`
                      : 'Select date range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={(range) => {
                      setFilters({ ...filters, dateRange: range });
                      if (range?.from && range?.to) setDateOpen(false);
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <Label className="text-xs">Search</Label>
              <Input
                placeholder="Search description, source..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {(filters.category !== 'all' ||
            filters.status !== 'all' ||
            filters.method !== 'all' ||
            filters.search ||
            filters.dateRange) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    category: 'all',
                    status: 'all',
                    method: 'all',
                    search: '',
                    dateRange: undefined,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="text-xs">Overview & Breakdown</TabsTrigger>
          <TabsTrigger value="source" className="text-xs">By Source / Payer</TabsTrigger>
          <TabsTrigger value="ledger" className="text-xs">Income Ledger</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Category Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Income by Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No received income in this period.</p>
                ) : (
                  categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{cat.name}</span>
                        <span>{formatCurrency(cat.amount)}</span>
                      </div>
                      <Progress value={cat.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{cat.count} entries</span>
                        <span>{cat.percentage}% of received</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Payment Method Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Income by Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {methodBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No received income in this period.</p>
                ) : (
                  methodBreakdown.map((m) => (
                    <div key={m.method} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{m.method}</span>
                        <span>{formatCurrency(m.amount)}</span>
                      </div>
                      <Progress value={m.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{m.count} entries</span>
                        <span>{m.percentage}% of received</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Source Tab */}
        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Income by Source / Payer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sourceBreakdown.length === 0 ? (
                <p className="text-xs text-muted-foreground">No received income in this period.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sourceBreakdown.map((s) => (
                    <div key={s.source} className="p-3.5 rounded-lg border bg-muted/20 space-y-1">
                      <p className="text-sm font-semibold truncate">{s.source}</p>
                      <p className="text-lg font-bold text-brand-success">{formatCurrency(s.amount)}</p>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>{s.count} transactions</span>
                        <span>{s.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Ledger Tab */}
        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Income Transaction Records</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {filteredData.length} records found
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredData}
                recordLabel="transaction"
                searchKey="description"
                searchPlaceholder="Filter records..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
