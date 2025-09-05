'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { 
  Plus, 
  BadgeCent,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Gift,
  Heart,
  PieChart,
  FileText,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    description: 'Manage giving categories',
    icon: PieChart,
    href: '/dashboard/finance/giving/categories',
    color: 'bg-blue-500'
  },
  {
    title: 'Pledges',
    description: 'Track member pledges',
    icon: Target,
    href: '/dashboard/finance/giving/pledges',
    color: 'bg-green-500'
  },
  {
    title: 'Donations',
    description: 'Record donations',
    icon: Heart,
    href: '/dashboard/finance/giving/donations',
    color: 'bg-purple-500'
  },
  {
    title: 'Reports',
    description: 'View giving reports',
    icon: FileText,
    href: '/dashboard/finance/giving/reports',
    color: 'bg-orange-500'
  }
];

export default function GivingOverviewPage() {
  const [stats, setStats] = useState(mockGivingStats);
  const [recentGiving, setRecentGiving] = useState<Giving[]>(mockRecentGiving);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  const getTypeIcon = (type: GivingType) => {
    switch (type) {
      case GivingType.TITHE:
        return <BadgeCent className="h-4 w-4 text-blue-500" />;
      case GivingType.OFFERING:
        return <Gift className="h-4 w-4 text-green-500" />;
      case GivingType.DONATION:
        return <Heart className="h-4 w-4 text-red-500" />;
      case GivingType.PLEDGE:
        return <Target className="h-4 w-4 text-purple-500" />;
      default:
        return <BadgeCent className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: GivingStatus) => {
    switch (status) {
      case GivingStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case GivingStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case GivingStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<Giving>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const giving = row.original;
        return (
          <div className="flex items-center space-x-2">
            {getTypeIcon(giving.type)}
            <span className="font-medium capitalize">{giving.type.replace('_', ' ')}</span>
          </div>
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
          <Badge variant="outline" className="capitalize">
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Giving Overview</h1>
            <p className="text-muted-foreground">Track and manage church giving</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giving Overview</h1>
          <p className="text-muted-foreground">Track and manage church giving</p>
        </div>
        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Giving</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCount} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getGrowthIcon(stats.growth)}
              <span className="ml-1">+{stats.growth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Giving</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pledges</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(45000)} committed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push(action.href)}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  <CardDescription className="text-xs">{action.description}</CardDescription>
                </div>
                <div className={`p-2 rounded-md ${action.color}`}>
                  <IconComponent className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Manage</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Giving */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Giving</CardTitle>
              <CardDescription>Latest giving transactions</CardDescription>
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
            searchKey="description"
            searchPlaceholder="Search giving..."
          />
        </CardContent>
      </Card>
    </div>
  );
}