'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears } from 'date-fns';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download, 
  Filter, 
  Calendar,
  Search,
  FileText,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line, Label } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

import { LazySection } from '@/components/ui/lazy-section';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface ExpenseReport {
  id: string;
  title: string;
  amount: number;
  category: string;
  categoryColor: string;
  date: Date;
  vendor: string;
  paymentMethod: string;
  receiptNumber?: string;
}

interface CategorySummary {
  category: string;
  color: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
}

// Mock data
const mockExpenses: ExpenseReport[] = [
  {
    id: '1',
    title: 'Staff Salaries - January',
    amount: 15000.00,
    category: 'Salaries & Benefits',
    categoryColor: '#2E8DB0',
    date: new Date('2024-01-31'),
    vendor: 'Payroll System',
    paymentMethod: 'bank-transfer',
    receiptNumber: 'PAY-2024-001',
  },
  {
    id: '2',
    title: 'Mission Trip Support',
    amount: 3500.00,
    category: 'Missions & Outreach',
    categoryColor: '#28ACD1',
    date: new Date('2024-01-28'),
    vendor: 'Global Missions',
    paymentMethod: 'check',
    receiptNumber: 'MIS-2024-001',
  },
  {
    id: '3',
    title: 'HVAC Maintenance',
    amount: 1250.00,
    category: 'Building Maintenance',
    categoryColor: '#C49831',
    date: new Date('2024-01-25'),
    vendor: 'ABC HVAC Services',
    paymentMethod: 'credit-card',
    receiptNumber: 'HVAC-2024-001',
  },
  {
    id: '4',
    title: 'Electric Bill - January',
    amount: 850.00,
    category: 'Utilities',
    categoryColor: '#A5CF5D',
    date: new Date('2024-01-20'),
    vendor: 'City Electric Company',
    paymentMethod: 'online-payment',
    receiptNumber: 'ELEC-2024-001',
  },
  {
    id: '5',
    title: 'Office Supplies',
    amount: 245.50,
    category: 'Office Supplies',
    categoryColor: '#6B7280',
    date: new Date('2024-01-15'),
    vendor: 'Office Depot',
    paymentMethod: 'credit-card',
    receiptNumber: 'OFF-2024-001',
  },
  {
    id: '6',
    title: 'Sound System Upgrade',
    amount: 2800.00,
    category: 'Technology & Equipment',
    categoryColor: '#8B5CF6',
    date: new Date('2024-01-12'),
    vendor: 'Audio Pro Solutions',
    paymentMethod: 'check',
    receiptNumber: 'TECH-2024-001',
  },
  {
    id: '7',
    title: 'Property Insurance',
    amount: 1200.00,
    category: 'Insurance',
    categoryColor: '#EF4444',
    date: new Date('2024-01-10'),
    vendor: 'Church Insurance Co',
    paymentMethod: 'bank-transfer',
    receiptNumber: 'INS-2024-001',
  },
  {
    id: '8',
    title: 'Van Fuel & Maintenance',
    amount: 380.00,
    category: 'Transportation',
    categoryColor: '#F59E0B',
    date: new Date('2024-01-08'),
    vendor: 'Local Gas Station',
    paymentMethod: 'credit-card',
    receiptNumber: 'FUEL-2024-001',
  },
  {
    id: '9',
    title: 'Youth Event Supplies',
    amount: 650.00,
    category: 'Events & Programs',
    categoryColor: '#EC4899',
    date: new Date('2024-01-05'),
    vendor: 'Party Supply Store',
    paymentMethod: 'debit-card',
    receiptNumber: 'EVENT-2024-001',
  },
  {
    id: '10',
    title: 'Website Hosting',
    amount: 150.00,
    category: 'Marketing & Communications',
    categoryColor: '#10B981',
    date: new Date('2024-01-03'),
    vendor: 'Web Hosting Co',
    paymentMethod: 'credit-card',
    receiptNumber: 'WEB-2024-001',
  },
];

const paymentMethods = {
  'cash': 'Cash',
  'check': 'Check',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  'bank-transfer': 'Bank Transfer',
  'online-payment': 'Online Payment',
};

export default function ExpenseReportsPage() {
  const router = useRouter();
  const [expenses] = useState<ExpenseReport[]>(mockExpenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [reportPeriod, setReportPeriod] = useState<'custom' | 'this-month' | 'last-month' | 'this-year' | 'last-year'>('this-month');

  // Handle period selection
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
    }
  };

  // Filter expenses based on criteria
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      const matchesPayment = paymentMethodFilter === 'all' || expense.paymentMethod === paymentMethodFilter;
      
      const expenseDate = expense.date;
      const matchesDate = expenseDate >= dateRange.from && expenseDate <= dateRange.to;
      
      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });
  }, [expenses, searchTerm, categoryFilter, paymentMethodFilter, dateRange]);

  // Calculate summary statistics
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalCount = filteredExpenses.length;
  const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryMap = new Map<string, { amount: number; count: number; color: string }>();
    
    filteredExpenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0, color: expense.categoryColor };
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
        color: expense.categoryColor,
      });
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      color: data.color,
      amount: data.amount,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, totalAmount]);

  // Monthly trends (for chart)
  const monthlyTrends = useMemo(() => {
    const monthMap = new Map<string, { amount: number; count: number }>();
    
    filteredExpenses.forEach(expense => {
      const monthKey = format(expense.date, 'MMM yyyy');
      const existing = monthMap.get(monthKey) || { amount: 0, count: 0 };
      monthMap.set(monthKey, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
      });
    });
    
    return Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      amount: data.amount,
      count: data.count,
    })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredExpenses]);

  // Get unique categories and payment methods for filters
  const uniqueCategories = Array.from(new Set(expenses.map(e => e.category)));
  const uniquePaymentMethods = Array.from(new Set(expenses.map(e => e.paymentMethod)));

  // Chart configurations
  const expenseChartConfig = {
    amount: { label: 'Amount', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const monthlyChartConfig = {
    amount: { label: 'Amount', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    // Simulate export functionality
    toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
  };

  const columns = [
    {
      accessorKey: 'title',
      header: 'Expense',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as ExpenseReport;
        return (
          <div>
            <div className="font-medium">{expense.title}</div>
            <div className="text-sm text-gray-500">{expense.vendor}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as ExpenseReport;
        return (
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: expense.categoryColor }}
            />
            <span className="text-sm">{expense.category}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as ExpenseReport;
        return (
          <div className="text-right font-medium text-brand-primary">
            ₵{expense.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as ExpenseReport;
        return (
          <div className="text-sm">
            {format(expense.date, 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as ExpenseReport;
        return (
          <Badge variant="outline">
            {paymentMethods[expense.paymentMethod as keyof typeof paymentMethods] || expense.paymentMethod}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">


      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/finance/expenses')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <BarChart3 className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Reports</h1>
            <p className="text-gray-600">Analyze spending patterns and generate reports</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button onClick={() => handleExport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Customize your expense report by applying filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Period Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Period</label>
                <Select value={reportPeriod} onValueChange={handlePeriodChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this-month">This Month</SelectItem>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="this-year">This Year</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {uniquePaymentMethods.map(method => (
                      <SelectItem key={method} value={method}>
                        {paymentMethods[method as keyof typeof paymentMethods] || method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Custom Date Range */}
            {reportPeriod === 'custom' && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">Custom Date Range</label>
                <p className="text-sm text-gray-500">Custom date range picker will be implemented</p>
              </div>
            )}
          </CardContent>
        </Card>
      </LazySection>

      {/* Summary Statistics */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
                  <Wallet className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-brand-primary">
                    ₵{totalAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Amount</p>
                  <p className="text-2xl font-bold">
                    ₵{averageAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Tag className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold">{categoryBreakdown.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      {/* Charts and Analysis */}
      <LazySection>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Category Breakdown Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Expenses by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={expenseChartConfig} className="h-80 w-full">
                    <RechartsPieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="amount"
                        strokeWidth={2}
                        label={({ category, percentage }: any) => `${category}: ${percentage.toFixed(1)}%`}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                        ))}
                      </Pie>
                    </RechartsPieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Monthly Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={monthlyChartConfig} className="h-80 w-full">
                    <RechartsLineChart data={monthlyTrends} margin={{ left: 12, right: 12 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                      <ChartTooltip cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }} content={<ChartTooltipContent indicator="line" />} />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-2))' }}
                      />
                    </RechartsLineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Detailed analysis of expenses by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdown.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-gray-500">{category.count} expenses</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-brand-primary">
                          ₵{category.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {category.percentage.toFixed(1)}%
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Expense Trends
                </CardTitle>
                <CardDescription>
                  Monthly expense patterns and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={expenseChartConfig} className="h-96 w-full">
                  <BarChart data={monthlyTrends} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <ChartTooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Expense Details</CardTitle>
                <CardDescription>
                  Complete list of filtered expenses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={filteredExpenses}
                  searchKey="title"
                  searchPlaceholder="Search expenses..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LazySection>
    </div>
  );
}