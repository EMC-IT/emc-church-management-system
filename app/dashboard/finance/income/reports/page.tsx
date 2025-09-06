'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  BadgeCent,
  FileText,
  BarChart3,
  PieChart,
  Search,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { toast } from 'sonner';
import { addDays, format, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Types
interface IncomeData {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  source: string;
  date: string;
  status: 'received' | 'pending' | 'cancelled';
  reference?: string;
}

interface CategorySummary {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  recordCount: number;
  percentage: number;
  color: string;
}

interface MonthlyData {
  month: string;
  amount: number;
  recordCount: number;
}

// Mock data
const mockIncomeData: IncomeData[] = [
  {
    id: '1',
    description: 'Wedding Ceremony - Johnson Family',
    amount: 2500,
    categoryId: '1',
    categoryName: 'Hall Rental',
    source: 'Johnson Family',
    date: '2024-01-15',
    status: 'received',
    reference: 'INV-2024-001'
  },
  {
    id: '2',
    description: 'Religious Books Sale',
    amount: 450,
    categoryId: '2',
    categoryName: 'Book Sales',
    source: 'Church Bookstore',
    date: '2024-01-14',
    status: 'received',
    reference: 'INV-2024-002'
  },
  {
    id: '3',
    description: 'Community Grant - Phase 1',
    amount: 15000,
    categoryId: '3',
    categoryName: 'Grants',
    source: 'City Council',
    date: '2024-01-10',
    status: 'received',
    reference: 'GRANT-2024-001'
  },
  {
    id: '4',
    description: 'Charity Fundraiser Event',
    amount: 3200,
    categoryId: '4',
    categoryName: 'Fundraising',
    source: 'Community Donors',
    date: '2024-01-08',
    status: 'received',
    reference: 'FUND-2024-001'
  },
  {
    id: '5',
    description: 'Monthly Parking Fees',
    amount: 680,
    categoryId: '5',
    categoryName: 'Parking',
    source: 'Various',
    date: '2024-01-05',
    status: 'received',
    reference: 'PARK-2024-001'
  },
  {
    id: '6',
    description: 'Investment Dividend',
    amount: 1200,
    categoryId: '6',
    categoryName: 'Investments',
    source: 'Investment Fund',
    date: '2023-12-31',
    status: 'received',
    reference: 'DIV-2023-004'
  },
  {
    id: '7',
    description: 'Corporate Event - Tech Solutions',
    amount: 1800,
    categoryId: '1',
    categoryName: 'Hall Rental',
    source: 'Tech Solutions Ltd',
    date: '2023-12-28',
    status: 'received',
    reference: 'INV-2023-045'
  },
  {
    id: '8',
    description: 'Educational Materials Sale',
    amount: 320,
    categoryId: '2',
    categoryName: 'Book Sales',
    source: 'Church Bookstore',
    date: '2023-12-25',
    status: 'received',
    reference: 'INV-2023-046'
  }
];

const incomeCategories = [
  { id: '1', name: 'Hall Rental', color: '#2E8DB0' },
  { id: '2', name: 'Book Sales', color: '#28ACD1' },
  { id: '3', name: 'Grants', color: '#C49831' },
  { id: '4', name: 'Fundraising', color: '#A5CF5D' },
  { id: '5', name: 'Parking', color: '#8B5CF6' },
  { id: '6', name: 'Investments', color: '#F59E0B' }
];

export default function IncomeReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Filter data based on selected criteria
  const filteredData = useMemo(() => {
    return mockIncomeData.filter(item => {
      const itemDate = new Date(item.date);
      const matchesDateRange = !dateRange?.from || !dateRange?.to || 
        (itemDate >= dateRange.from && itemDate <= dateRange.to);
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      const matchesSearch = !searchTerm || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDateRange && matchesCategory && matchesStatus && matchesSearch;
    });
  }, [dateRange, selectedCategory, selectedStatus, searchTerm]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const receivedIncome = filteredData.filter(item => item.status === 'received');
    const pendingIncome = filteredData.filter(item => item.status === 'pending');
    
    const totalReceived = receivedIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalPending = pendingIncome.reduce((sum, item) => sum + item.amount, 0);
    const totalRecords = filteredData.length;
    const avgIncome = totalRecords > 0 ? totalReceived / receivedIncome.length : 0;

    return {
      totalReceived,
      totalPending,
      totalRecords,
      avgIncome,
      receivedCount: receivedIncome.length,
      pendingCount: pendingIncome.length
    };
  }, [filteredData]);

  // Calculate category breakdown
  const categoryBreakdown = useMemo(() => {
    const categoryTotals = new Map<string, { amount: number; count: number; name: string }>();
    
    filteredData
      .filter(item => item.status === 'received')
      .forEach(item => {
        const existing = categoryTotals.get(item.categoryId) || { amount: 0, count: 0, name: item.categoryName };
        categoryTotals.set(item.categoryId, {
          amount: existing.amount + item.amount,
          count: existing.count + 1,
          name: item.categoryName
        });
      });

    const totalAmount = Array.from(categoryTotals.values()).reduce((sum, cat) => sum + cat.amount, 0);
    
    return Array.from(categoryTotals.entries()).map(([categoryId, data]) => {
      const category = incomeCategories.find(cat => cat.id === categoryId);
      return {
        categoryId,
        categoryName: data.name,
        totalAmount: data.amount,
        recordCount: data.count,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        color: category?.color || '#6B7280'
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredData]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    const monthlyData = new Map<string, { amount: number; count: number }>();
    
    filteredData
      .filter(item => item.status === 'received')
      .forEach(item => {
        const month = format(new Date(item.date), 'MMM yyyy');
        const existing = monthlyData.get(month) || { amount: 0, count: 0 };
        monthlyData.set(month, {
          amount: existing.amount + item.amount,
          count: existing.count + 1
        });
      });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        recordCount: data.count
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [filteredData]);

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Report exported as ${format.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setDateRange({
      from: subMonths(new Date(), 6),
      to: new Date()
    });
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income Reports</h1>
          <p className="text-muted-foreground">
            Analyze income trends and generate detailed reports
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={1}
        threshold={0.1}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Customize your report by selecting date range, categories, and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                        ) : (
                          format(dateRange.from, 'MMM dd')
                        )
                      ) : (
                        'Select date range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange ? { from: dateRange.from, to: dateRange.to } : undefined}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setDateRange({ from: range.from, to: range.to });
                        } else {
                          setDateRange(undefined);
                        }
                      }}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search income..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Summary Statistics */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        threshold={0.1}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">
              {formatCurrency(summaryStats.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.receivedCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-accent">
              {formatCurrency(summaryStats.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.pendingCount} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Income entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Income</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryStats.avgIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </LazySection>

      {/* Charts and Analysis */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={2}
        threshold={0.1}
      >
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income Trends</CardTitle>
                <CardDescription>
                  Track income patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Income']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#2E8DB0" 
                        fill="#2E8DB0" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Income by Category</CardTitle>
                  <CardDescription>
                    Distribution of income across categories
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryBreakdown}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="totalAmount"
                          label={({ categoryName, percentage }) => 
                            `${categoryName}: ${percentage.toFixed(1)}%`
                          }
                        >
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>
                    Detailed breakdown by category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryBreakdown.map((category) => (
                      <div key={category.categoryId} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <div className="font-medium">{category.categoryName}</div>
                            <div className="text-sm text-muted-foreground">
                              {category.recordCount} records
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(category.totalAmount)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Income Analysis</CardTitle>
                <CardDescription>
                  Comprehensive breakdown of filtered income data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Export Options */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Options</h4>
                      <p className="text-sm text-muted-foreground">
                        Download detailed reports in various formats
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                      >
                        CSV
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                      >
                        Excel
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Summary Table */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-brand-success">
                        {summaryStats.receivedCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Received Transactions</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-brand-accent">
                        {summaryStats.pendingCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Pending Transactions</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">
                        {categoryBreakdown.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Active Categories</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LazySection>
    </div>
  );
}