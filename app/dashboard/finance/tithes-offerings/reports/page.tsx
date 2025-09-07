'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  PieChart,
  FileText,
  Filter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { LazySection } from '@/components/ui/lazy-section';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { addDays, format, subDays, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

// Mock data for reports
const mockReportData = {
  summary: {
    totalAmount: 125000,
    totalRecords: 186,
    averageAmount: 672.04,
    growth: 12.5
  },
  monthlyTrends: [
    { month: 'Jan', tithes: 15000, offerings: 8500, total: 23500 },
    { month: 'Feb', tithes: 16200, offerings: 9200, total: 25400 },
    { month: 'Mar', tithes: 14800, offerings: 8800, total: 23600 },
    { month: 'Apr', tithes: 17500, offerings: 10200, total: 27700 },
    { month: 'May', tithes: 16800, offerings: 9800, total: 26600 },
    { month: 'Jun', tithes: 18200, offerings: 11000, total: 29200 }
  ],
  categoryBreakdown: [
    { name: 'Regular Tithe', amount: 45000, percentage: 36, color: '#2E8DB0' },
    { name: 'Sunday Offering', amount: 25000, percentage: 20, color: '#28ACD1' },
    { name: 'Building Fund', amount: 20000, percentage: 16, color: '#C49831' },
    { name: 'First Fruits', amount: 15000, percentage: 12, color: '#A5CF5D' },
    { name: 'Missions', amount: 12000, percentage: 10, color: '#6366F1' },
    { name: 'Youth Ministry', amount: 8000, percentage: 6, color: '#EC4899' }
  ],
  topGivers: [
    { name: 'John Smith', amount: 5200, records: 12 },
    { name: 'Mary Johnson', amount: 4800, records: 10 },
    { name: 'David Wilson', amount: 4200, records: 8 },
    { name: 'Sarah Brown', amount: 3800, records: 9 },
    { name: 'Michael Davis', amount: 3500, records: 7 }
  ]
};

export default function TitheOfferingReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 6),
    to: new Date()
  });
  const [reportType, setReportType] = useState('summary');
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Report exported as ${exportFormat.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth > 0 ? (
      <TrendingUp className="h-4 w-4 text-brand-success" />
    ) : (
      <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Back Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="h-12 w-12"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Giving Reports</h1>
            <p className="text-muted-foreground">Analytics and insights for tithes and offerings</p>
          </div>
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
              Customize your report parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  placeholder="Select date range"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary Report</SelectItem>
                    <SelectItem value="detailed">Detailed Analysis</SelectItem>
                    <SelectItem value="trends">Trend Analysis</SelectItem>
                    <SelectItem value="categories">Category Breakdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Export Format</label>
                <div className="flex gap-2">
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Summary Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">
              {formatCurrency(mockReportData.summary.totalAmount)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(mockReportData.summary.growth)}
              <span className="ml-1">{mockReportData.summary.growth}% from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReportData.summary.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Giving transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockReportData.summary.averageAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brand-success">
              +{mockReportData.summary.growth}%
            </div>
            <p className="text-xs text-muted-foreground">
              Compared to last period
            </p>
          </CardContent>
        </Card>
      </LazySection>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Trends */}
        <LazySection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Trends
              </CardTitle>
              <CardDescription>
                Giving trends over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReportData.monthlyTrends.map((month, index) => (
                  <div key={month.month} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{month.month} 2024</span>
                      <span className="text-sm font-bold">{formatCurrency(month.total)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tithes:</span>
                        <span>{formatCurrency(month.tithes)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Offerings:</span>
                        <span>{formatCurrency(month.offerings)}</span>
                      </div>
                    </div>
                    {index < mockReportData.monthlyTrends.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LazySection>

        {/* Category Breakdown */}
        <LazySection>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Distribution by giving categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReportData.categoryBreakdown.map((category, index) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{formatCurrency(category.amount)}</div>
                        <div className="text-xs text-muted-foreground">{category.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${category.percentage}%`,
                          backgroundColor: category.color 
                        }}
                      />
                    </div>
                    {index < mockReportData.categoryBreakdown.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </LazySection>
      </div>

      {/* Top Givers */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Contributors
            </CardTitle>
            <CardDescription>
              Members with highest giving amounts in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReportData.topGivers.map((giver, index) => (
                <div key={giver.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-brand-primary">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{giver.name}</div>
                      <div className="text-sm text-muted-foreground">{giver.records} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-brand-success">{formatCurrency(giver.amount)}</div>
                    <Badge variant="outline" className="text-xs">
                      Rank #{index + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}