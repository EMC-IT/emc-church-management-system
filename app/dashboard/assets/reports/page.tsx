'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  PieChart,
  TrendingDown,
  Package,
  FileText,
  Download,
  Calendar,
  Filter,
  Banknote,
  Activity,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Date picker functionality can be added later
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for asset reports
const assetStats = {
  totalAssets: 247,
  totalValue: 485000,
  averageAge: 3.2,
  depreciationRate: 12.5,
  maintenanceCosts: 28500,
  activeAssets: 231
};

const conditionData = [
  { condition: 'Excellent', count: 89, percentage: 36, color: '#A5CF5D' },
  { condition: 'Good', count: 102, percentage: 41, color: '#28ACD1' },
  { condition: 'Fair', count: 41, percentage: 17, color: '#C49831' },
  { condition: 'Poor', count: 12, percentage: 5, color: '#ef4444' },
  { condition: 'Damaged', count: 3, percentage: 1, color: '#991b1b' }
];

const categoryData = [
  { category: 'Audio/Visual Equipment', count: 45, value: 125000 },
  { category: 'Furniture', count: 78, value: 89000 },
  { category: 'Technology', count: 32, value: 156000 },
  { category: 'Musical Instruments', count: 28, value: 67000 },
  { category: 'Kitchen Appliances', count: 19, value: 23000 },
  { category: 'Office Supplies', count: 25, value: 12000 },
  { category: 'Vehicles', count: 4, value: 85000 },
  { category: 'Other', count: 16, value: 28000 }
];

const depreciationTrend = [
  { year: '2020', value: 520000, depreciation: 45000 },
  { year: '2021', value: 475000, depreciation: 52000 },
  { year: '2022', value: 423000, depreciation: 48000 },
  { year: '2023', value: 375000, depreciation: 55000 },
  { year: '2024', value: 485000, depreciation: 62000 }
];

export default function AssetReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const handleExport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting asset report as ${format}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/assets')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <BarChart3 className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Reports</h1>
            <p className="text-gray-600">
              Comprehensive analysis of asset value, depreciation, and condition
            </p>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryData.map((cat) => (
                <SelectItem key={cat.category} value={cat.category.toLowerCase()}>
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">
                {assetStats.activeAssets} active assets
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(assetStats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Current market value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Age</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.averageAge} years</div>
              <p className="text-xs text-muted-foreground">
                Across all assets
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Depreciation Rate</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.depreciationRate}%</div>
              <p className="text-xs text-muted-foreground">
                Annual average
              </p>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      {/* Reports Tabs */}
      <LazySection>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="condition">Condition Analysis</TabsTrigger>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
            <TabsTrigger value="depreciation">Depreciation Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Asset Condition Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {conditionData.map((item) => (
                      <div key={item.condition} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.condition}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.count}</span>
                          <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Maintenance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Maintenance Costs</span>
                      <span className="font-medium">{formatCurrency(assetStats.maintenanceCosts)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Assets Under Maintenance</span>
                      <span className="font-medium">16</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Scheduled Maintenance</span>
                      <span className="font-medium">23</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overdue Maintenance</span>
                      <Badge variant="destructive">5</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="condition" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Condition Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of asset conditions across all categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conditionData.map((item) => (
                    <div key={item.condition} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.condition}</span>
                        <span>{item.count} assets ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all" 
                          style={{ 
                            width: `${item.percentage}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Breakdown
                </CardTitle>
                <CardDescription>
                  Asset distribution and value by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((item) => (
                    <div key={item.category} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.category}</div>
                        <div className="text-sm text-muted-foreground">{item.count} assets</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.value)}</div>
                        <div className="text-sm text-muted-foreground">
                          {((item.value / assetStats.totalValue) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="depreciation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Depreciation Trends</CardTitle>
                <CardDescription>
                  Asset value and depreciation over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {depreciationTrend.map((item) => (
                    <div key={item.year} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="font-medium">{item.year}</div>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Asset Value</div>
                          <div className="font-medium">{formatCurrency(item.value)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Depreciation</div>
                          <div className="font-medium text-red-600">{formatCurrency(item.depreciation)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </LazySection>

      {/* Export Options */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Export Reports
            </CardTitle>
            <CardDescription>
              Download detailed asset reports in various formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                Export as PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Export as Excel
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                Export as CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}