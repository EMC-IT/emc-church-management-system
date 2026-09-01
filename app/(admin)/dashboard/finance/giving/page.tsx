'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { PageHeader } from '@/components/ui/page-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Plus,
  BadgeCent,
  Calendar,
  Target,
  FileText,
  ArrowRight,
  ChevronDown,
  User,
  Users,
  HandCoins,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, GivingSource } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';

// Mock data — source field required by updated domain model.
// totalAmount = actual giving received only; activePledgesCount = count, never summed amount.
const mockGivingStats = {
  totalAmount: 125000.00,
  totalCount: 450,
  averageAmount: 277.78,
  thisMonth: 15000.00,
  lastMonth: 12500.00,
  growth: 20.0,
  activePledgesCount: 25,
};

const mockRecentGiving: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    memberName: 'John Mensah',
    source: GivingSource.INDIVIDUAL,
    type: GivingType.TITHE,
    amount: 500.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-20',
    description: 'Monthly tithe',
    isAnonymous: false,
    receiptNumber: 'GIV-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    source: GivingSource.CONGREGATIONAL,
    serviceEvent: 'Sunday Morning Service',
    type: GivingType.OFFERING,
    amount: 1200.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-21',
    description: 'Sunday offering',
    isAnonymous: false,
    receiptNumber: 'GIV-002',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-21T11:00:00Z',
    updatedAt: '2024-01-21T11:00:00Z',
  },
  {
    id: '3',
    source: GivingSource.INDIVIDUAL,
    type: GivingType.DONATION,
    amount: 1000.00,
    currency: 'GHS',
    category: GivingCategory.MISSIONARY,
    method: 'Transfer',
    date: '2024-01-18',
    description: 'Missionary support',
    isAnonymous: true,
    receiptNumber: 'GIV-003',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
];

const GIVING_TYPE_LABELS: Record<GivingType, string> = {
  [GivingType.TITHE]: 'Tithe',
  [GivingType.OFFERING]: 'Offering',
  [GivingType.DONATION]: 'Donation',
  [GivingType.FIRST_FRUITS]: 'First Fruits',
  [GivingType.SPECIAL_SEED]: 'Special Seed',
  [GivingType.THANKSGIVING]: 'Thanksgiving',
  [GivingType.FUNDRAISING]: 'Fundraising',
  [GivingType.PLEDGE]: 'Pledge',
  [GivingType.SPECIAL]: 'Special',
  [GivingType.MISSIONARY]: 'Missionary',
  [GivingType.BUILDING]: 'Building',
  [GivingType.WELFARE]: 'Welfare',
  [GivingType.OTHER]: 'Other',
};

export default function GivingOverviewPage() {
  const [stats, setStats] = useState(mockGivingStats);
  const [recentGiving, setRecentGiving] = useState<Giving[]>(mockRecentGiving);
  const [loading, setLoading] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats(mockGivingStats);
        setRecentGiving(mockRecentGiving);
      } catch (err: any) {
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);

  const columns: ColumnDef<Giving>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="font-medium">
          {GIVING_TYPE_LABELS[row.original.type as GivingType] ?? row.original.type}
        </span>
      ),
    },
    {
      id: 'contributor',
      header: 'Contributor',
      cell: ({ row }) => {
        const giving = row.original;
        if (giving.source === GivingSource.CONGREGATIONAL) {
          return (
            <span className="text-muted-foreground text-sm">
              {giving.serviceEvent ?? 'Congregational'}
            </span>
          );
        }
        if (giving.isAnonymous) {
          return <span className="text-muted-foreground text-sm italic">Anonymous</span>;
        }
        return <span className="text-sm">{giving.memberName ?? giving.memberId ?? '—'}</span>;
      },
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <Badge variant="neutral">
          {row.original.source === GivingSource.CONGREGATIONAL ? 'Congregational' : 'Individual'}
        </Badge>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-brand-success">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span>{new Date(row.getValue('date')).toLocaleDateString()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Giving Overview" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={3} columns={6} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Giving Overview"
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/giving/reports">
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/giving/pledges">
                    <Target className="mr-2 h-4 w-4" />
                    Pledges
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/giving/fundraising">
                    <HandCoins className="mr-2 h-4 w-4" />
                    Fundraising
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/finance/giving/categories">
                    Giving Categories
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button onClick={() => setRecordDialogOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Record Giving
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
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
          value={String(stats.activePledgesCount)}
          icon={Target}
          accent="accent"
        />
      </LazySection>

      {/* Recent Giving */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Recent Giving</CardTitle>
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
              recordLabel="giving record"
              searchKey="type"
              searchPlaceholder="Search giving..."
            />
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Record Giving — choice dialog */}
      <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Giving</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            <button
              className="w-full flex items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setRecordDialogOpen(false);
                router.push('/dashboard/finance/giving/donations/add');
              }}
            >
              <User className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
              <div>
                <p className="font-medium leading-snug">Individual Giving</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For giving attributed to a specific member or anonymous giver.
                </p>
              </div>
            </button>

            <button
              className="w-full flex items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setRecordDialogOpen(false);
                router.push('/dashboard/finance/giving/new/congregational');
              }}
            >
              <Users className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
              <div>
                <p className="font-medium leading-snug">Congregational Giving</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For a combined amount collected from a service or event.
                </p>
              </div>
            </button>

            <button
              className="w-full flex items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => {
                setRecordDialogOpen(false);
                router.push('/dashboard/finance/giving/pledges/add');
              }}
            >
              <Target className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
              <div>
                <p className="font-medium leading-snug">Pledge</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For recording a member's commitment to give.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
