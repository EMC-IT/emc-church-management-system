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
  ArrowLeft,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LazySection } from '@/components/ui/lazy-section';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { toast } from 'sonner';
import { assetService } from '@/services';
import { AssetAnalytics } from '@/lib/types/assets';

export default function AssetReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AssetAnalytics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2026');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        setLoading(true);
        const data = await assetService.getAssetStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load asset reports', err);
        toast.error('Failed to load asset report data');
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = async () => {
    try {
      const blob = await assetService.exportAssets({}, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asset-valuation-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Asset valuation report downloaded');
    } catch {
      toast.error('Failed to export asset report');
    }
  };

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Asset Reports" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <div className="grid gap-4 md:grid-cols-2 mt-6">
          <CardSkeleton count={2} />
        </div>
      </div>
    );
  }

  const conditionList = [
    { condition: 'Excellent', count: 3, percentage: 33 },
    { condition: 'Good', count: 4, percentage: 44 },
    { condition: 'Fair', count: 0, percentage: 0 },
    { condition: 'Poor', count: 1, percentage: 11 },
    { condition: 'Needs Repair', count: 1, percentage: 12 },
  ];

  const categoryBreakdown = [
    { category: 'Audio Visual Equipment', count: 3, value: 48000 },
    { category: 'Vehicles & Transport', count: 1, value: 150000 },
    { category: 'Plant & Equipment', count: 1, value: 105000 },
    { category: 'Musical Instruments', count: 1, value: 88000 },
    { category: 'Furniture & Fixtures', count: 1, value: 38000 },
    { category: 'Technology & Computing', count: 1, value: 21500 },
    { category: 'Kitchen Appliances', count: 1, value: 4500 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Asset Reports"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/assets">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Assets
              </Link>
            </Button>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026 Fiscal Year</SelectItem>
                <SelectItem value="2025">2025 Fiscal Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport}>
              <Download className="mr-1.5 h-4 w-4" />
              Export Report
            </Button>
          </>
        }
      />

      {/* 4 KPI StatCards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0"
        threshold={0.1}
      >
        <StatCard
          title="Total Assets"
          value={stats?.totalAssets || 0}
          icon={Package}
          accent="primary"
        />

        <StatCard
          title="Total Valuation"
          value={formatCurrency(stats?.totalValue || 0)}
          icon={Banknote}
          accent="accent"
        />

        <StatCard
          title="Active in Service"
          value={stats?.activeAssets || 0}
          icon={Activity}
          accent="success"
        />

        <StatCard
          title="Needs Maintenance"
          value={stats?.maintenanceNeeded || 0}
          icon={TrendingDown}
          accent="secondary"
        />
      </LazySection>

      {/* Detailed Analysis Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Valuation Breakdown */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Valuation by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((cat, idx) => {
              const totalVal = stats?.totalValue || 1;
              const pct = Math.round((cat.value / totalVal) * 100);
              return (
                <div key={idx} className="space-y-1.5 p-2.5 border rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-foreground">{cat.category}</div>
                    <div className="font-semibold text-foreground">
                      {formatCurrency(cat.value)} <span className="text-xs text-muted-foreground">({pct}%)</span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Condition Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Asset Physical Condition Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conditionList.map((cond, idx) => (
              <div key={idx} className="space-y-1.5 p-2.5 border rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="font-medium text-foreground">{cond.condition}</div>
                  <div className="font-semibold text-foreground">
                    {cond.count} assets <span className="text-xs text-muted-foreground">({cond.percentage}%)</span>
                  </div>
                </div>
                <Progress
                  value={cond.percentage}
                  className={`h-1.5 ${
                    cond.condition === 'Needs Repair' || cond.condition === 'Poor'
                      ? '[&>div]:bg-destructive'
                      : cond.condition === 'Excellent'
                      ? '[&>div]:bg-emerald-500'
                      : ''
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}