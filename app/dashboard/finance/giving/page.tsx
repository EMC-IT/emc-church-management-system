'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import {
  Plus,
  BadgeCent,
  Users,
  Calendar,
  Target,
  Gift,
  Heart,
  PieChart,
  FileText,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

// Mock data for development
const mockGivingStats = {
  totalAmount: 125000.00,
  totalCount: 450,
  averageAmount: 277.78,
  thisMonth: 15000.00,
  lastMonth: 12500.00,
  growth: 20.0,
  byType: {
    [GivingType.TITHE]: { amount: 75000.00, count: 200 },
    [GivingType.OFFERING]: { amount: 25000.00, count: 150 },
    [GivingType.DONATION]: { amount: 15000.00, count: 50 },
    [GivingType.PLEDGE]: { amount: 10000.00, count: 50 },
  },
  byCategory: {
    [GivingCategory.GENERAL]: { amount: 80000.00, count: 250 },
    [GivingCategory.BUILDING_FUND]: { amount: 30000.00, count: 100 },
    [GivingCategory.MISSIONARY]: { amount: 10000.00, count: 60 },
    [GivingCategory.YOUTH]: { amount: 5000.00, count: 40 },
  }
};

const mockRecentGiving: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    type: GivingType.TITHE,
    amount: 500.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-20',
    description: 'Monthly tithe',
    isAnonymous: false,
    receiptNumber: 'RCP-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    memberId: 'member2',
    type: GivingType.OFFERING,
    amount: 200.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Online',
    date: '2024-01-19',
    description: 'Building fund offering',
    isAnonymous: false,
    receiptNumber: 'RCP-002',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    memberId: 'member3',
    type: GivingType.DONATION,
    amount: 1000.00,
    currency: 'GHS',
    category: GivingCategory.MISSIONARY,
    method: 'Transfer',
    date: '2024-01-18',
    description: 'Missionary support',
    isAnonymous: true,
    receiptNumber: 'RCP-003',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  }
];

const quickActions = [
  {
    title: 'Categories',
    icon: PieChart,
    href: '/dashboard/finance/giving/categories'
  },
  {
    title: 'Pledges',
    icon: Target,
    href: '/dashboard/finance/giving/pledges'
  },
  {
    title: 'Donations',
    icon: Heart,
    href: '/dashboard/finance/giving/donations'
  },
  {
    title: 'Reports',
    icon: FileText,
    href: '/dashboard/finance/giving/reports'
  }
];

export default function GivingOverviewPage() {
  const [stats, setStats] = useState(mockGivingStats);
  const [recentGiving, setRecentGiving] = useState<Giving[]>(mockRecentGiving);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [statsResponse, recentResponse] = await Promise.all([
        //   givingService.getGivingStats(),
        //   givingService.searchGiving({ limit: 5, sortBy: 'date', sortOrder: 'desc' })
        // ]);
        // setStats(statsResponse);
        // setRecentGiving(recentResponse.data);
        setStats(mockGivingStats);
        setRecentGiving(mockRecentGiving);
      } catch (err: any) {
        setError(err.message || 'Failed to load giving data');
        toast({
          title: 'Error',
          description: 'Failed to load giving information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTypeIcon = (type: GivingType) => {
    switch (type) {
      case GivingType.TITHE:
        return <BadgeCent className="h-4 w-4 text-brand-primary" />;
      case GivingType.OFFERING:
        return <Gift className="h-4 w-4 text-brand-success" />;
      case GivingType.DONATION:
        return <Heart className="h-4 w-4 text-brand-gold" />;
      case GivingType.PLEDGE:
        return <Target className="h-4 w-4 text-brand-secondary" />;
      default:
        return <BadgeCent className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: GivingStatus) => <StatusBadge status={status} />;

  const columns: ColumnDef<Giving>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const giving = row.original;
        return (
          <span className="font-medium capitalize">{giving.type.replace('_', ' ')}</span>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as GivingCategory;
        return (
          <Badge variant="neutral" className="capitalize">
            {category.replace('_', ' ')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as GivingStatus;
        return getStatusBadge(status);
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Giving Overview" />
        <CardSkeleton
          count={4} 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" 
        />
        <CardSkeleton 
          count={4} 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" 
        />
        <TableSkeleton 
          rows={3} 
          columns={5} 
          showHeader 
          className="mt-6" 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giving Overview"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/finance/giving/reports">
                <FileText className="mr-2 h-4 w-4" />
                View Reports
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/finance/giving/donations/add">
                <Plus className="mr-2 h-4 w-4" />
                Record Giving
              </Link>
            </Button>
          </>
        }
      />

      {/* Statistics Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Total Giving"
          value={formatCurrency(stats.totalAmount)}
          icon={BadgeCent}
          accent="primary"
        />

        <StatCard
          title="This Month"
          value={formatCurrency(stats.thisMonth)}
          icon={Calendar}
          accent="secondary"
          trend={{ value: `+${stats.growth}% from last month`, direction: stats.growth >= 0 ? 'up' : 'down' }}
        />

        <StatCard
          title="Average Giving"
          value={formatCurrency(stats.averageAmount)}
          icon={Users}
          accent="success"
        />

        <StatCard
          title="Active Pledges"
          value="25"
          icon={Target}
          accent="accent"
        />
      </LazySection>

      {/* Quick Actions */}
      <LazySection
        strategy="lazy"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.2}
      >
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-4 rounded-lg border bg-background px-4 py-3 transition-colors hover:border-foreground/30 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:bg-muted"
            >
              <IconComponent className="h-5 w-5 text-foreground" />
              <span className="flex-1 font-semibold">{action.title}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          );
        })}
      </LazySection>

      {/* Recent Giving */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Giving</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/finance/giving/donations">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentGiving}
              recordLabel="giving transaction"
              searchKey="description"
              searchPlaceholder="Search giving..."
            />
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}
