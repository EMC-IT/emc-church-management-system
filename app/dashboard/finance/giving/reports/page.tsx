'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { GivingCategoryBadge } from '@/components/ui/finance-badges';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { 
  BadgeCent,
  TrendingUp,
  Calendar as CalendarIcon,
  Users,
  Target,
  HandCoins,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, GivingSource, Pledge, PledgeStatus, FundraisingCampaign, CampaignStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface CategoryReport {
  category: GivingCategory;
  amount: number;
  count: number;
  percentage: number;
}

interface MethodReport {
  method: string;
  amount: number;
  count: number;
  percentage: number;
}

// Mock actual giving records
const mockGivingRecords: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    memberName: 'John Mensah',
    source: GivingSource.INDIVIDUAL,
    type: GivingType.TITHE,
    amount: 5000.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Transfer',
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
    amount: 12500.00,
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
    memberId: 'member2',
    memberName: 'Abena Owusu',
    source: GivingSource.INDIVIDUAL,
    type: GivingType.FIRST_FRUITS,
    amount: 8000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Online',
    date: '2024-01-18',
    description: 'First fruits commitment',
    isAnonymous: false,
    receiptNumber: 'GIV-003',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
];

// Mock pledge report summary
const mockPledgeSummary = {
  totalPledged: 450000.00,
  totalReceived: 180000.00,
  totalOutstanding: 270000.00,
  activePledgesCount: 38,
  fulfillmentRate: 40.0,
};

// Mock campaign summaries
const mockCampaignReports: FundraisingCampaign[] = [
  {
    id: 'c1',
    name: 'New Sanctuary Building',
    targetAmount: 500000.00,
    pledgedAmount: 320000.00,
    receivedAmount: 180000.00,
    outstandingAmount: 140000.00,
    currency: 'GHS',
    startDate: '2024-01-01',
    status: CampaignStatus.ACTIVE,
    fund: GivingCategory.BUILDING_FUND,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Missions Outreach 2024',
    targetAmount: 80000.00,
    pledgedAmount: 65000.00,
    receivedAmount: 45000.00,
    outstandingAmount: 20000.00,
    currency: 'GHS',
    startDate: '2024-01-15',
    status: CampaignStatus.ACTIVE,
    fund: GivingCategory.MISSIONARY,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
];

export default function GivingReportsPage() {
  const [loading, setLoading] = useState(false);
  const [givingData, setGivingData] = useState<Giving[]>(mockGivingRecords);
  const [dateOpen, setDateOpen] = useState(false);
  const [filters, setFilters] = useState({
    source: 'all',
    category: 'all',
    type: 'all',
    method: 'all',
    status: 'all',
    dateRange: undefined as DateRange | undefined,
  });

  const { toast } = useToast();

  const loadReportData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setGivingData(mockGivingRecords);
      toast({
        title: 'Report Updated',
        description: 'Giving statistics and reports refreshed.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    toast({
      title: 'Export Generated',
      description: `Report exported as ${format.toUpperCase()}.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Top-level actual giving (never sums pledges or breakdown items)
  const actualGivingTotal = 125000.00;
  const actualGivingCount = 450;
  const avgGiving = actualGivingCount > 0 ? actualGivingTotal / actualGivingCount : 0;

  const categories: CategoryReport[] = [
    { category: GivingCategory.GENERAL, amount: 65000.00, count: 250, percentage: 52 },
    { category: GivingCategory.BUILDING_FUND, amount: 35000.00, count: 110, percentage: 28 },
    { category: GivingCategory.MISSIONARY, amount: 15000.00, count: 50, percentage: 12 },
    { category: GivingCategory.YOUTH, amount: 10000.00, count: 40, percentage: 8 },
  ];

  const methods: MethodReport[] = [
    { method: 'Transfer / Bank', amount: 55000.00, count: 160, percentage: 44 },
    { method: 'Cash', amount: 40000.00, count: 190, percentage: 32 },
    { method: 'Online / MoMo', amount: 20000.00, count: 70, percentage: 16 },
    { method: 'Card / Cheque', amount: 10000.00, count: 30, percentage: 8 },
  ];

  const columns: ColumnDef<Giving>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'Receipt #',
      cell: ({ row }) => <span className="font-medium">{row.getValue('receiptNumber') || '—'}</span>,
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <span className="capitalize">{row.original.type.replace('_', ' ')}</span>,
    },
    {
      id: 'contributor',
      header: 'Contributor / Service',
      cell: ({ row }) => {
        const g = row.original;
        if (g.source === GivingSource.CONGREGATIONAL) {
          return <span className="text-sm text-muted-foreground">{g.serviceEvent || 'Congregational'}</span>;
        }
        if (g.isAnonymous) {
          return <span className="text-sm text-muted-foreground italic">Anonymous</span>;
        }
        return <span className="text-sm">{g.memberName || g.memberId || '—'}</span>;
      },
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) => (
        <Badge variant="neutral" className="capitalize">
          {row.original.source}
        </Badge>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Fund',
      cell: ({ row }) => <GivingCategoryBadge category={row.getValue('category') as GivingCategory} />,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium text-brand-success">{formatCurrency(parseFloat(row.getValue('amount')))}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span>{new Date(row.getValue('date')).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="h-9 w-9" asChild>
            <Link href="/dashboard/finance/giving" aria-label="Back to Giving">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <PageHeader title="Giving Reports & Analytics" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadReportData}>
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
        threshold={0.1}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Actual Giving Received"
            value={formatCurrency(actualGivingTotal)}
            icon={BadgeCent}
            accent="primary"
          />
          <StatCard
            title="Total Transactions"
            value={String(actualGivingCount)}
            icon={Users}
            accent="secondary"
          />
          <StatCard
            title="Average Giving"
            value={formatCurrency(avgGiving)}
            icon={TrendingUp}
            accent="success"
          />
          <StatCard
            title="Total Pledged (Commitments)"
            value={formatCurrency(mockPledgeSummary.totalPledged)}
            icon={Target}
            accent="accent"
          />
        </div>
      </LazySection>

      <Tabs defaultValue="giving" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="giving" className="text-xs">Actual Giving</TabsTrigger>
          <TabsTrigger value="pledges" className="text-xs">Pledges & Fulfillment</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs">Campaigns</TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">Transactions</TabsTrigger>
        </TabsList>

        {/* Tab 1: Actual Giving Breakdown */}
        <TabsContent value="giving" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Giving by Fund / Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.map((c) => (
                  <div key={c.category} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{c.category.replace('_', ' ')}</span>
                      <span className="font-medium">{formatCurrency(c.amount)}</span>
                    </div>
                    <Progress value={c.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{c.count} transactions</span>
                      <span>{c.percentage}% of total</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Giving by Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {methods.map((m) => (
                  <div key={m.method} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span>{m.method}</span>
                      <span className="font-medium">{formatCurrency(m.amount)}</span>
                    </div>
                    <Progress value={m.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{m.count} transactions</span>
                      <span>{m.percentage}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Pledges & Fulfillment */}
        <TabsContent value="pledges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Pledged</p>
              <p className="text-xl font-bold mt-1">{formatCurrency(mockPledgeSummary.totalPledged)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Committed amount across all pledges</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Fulfilled</p>
              <p className="text-xl font-bold mt-1 text-brand-success">{formatCurrency(mockPledgeSummary.totalReceived)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Actual money received against pledges</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Outstanding Pledges</p>
              <p className="text-xl font-bold mt-1 text-amber-600">{formatCurrency(mockPledgeSummary.totalOutstanding)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Remaining unfulfilled commitment</p>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Overall Pledge Fulfillment Rate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Fulfillment</span>
                <span className="font-medium">{mockPledgeSummary.fulfillmentRate}%</span>
              </div>
              <Progress value={mockPledgeSummary.fulfillmentRate} className="h-3" />
              <p className="text-xs text-muted-foreground pt-1">
                {mockPledgeSummary.activePledgesCount} active/unfulfilled pledge commitments currently tracked.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Campaigns */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {mockCampaignReports.map((camp) => {
              const progress = Math.min(100, Math.round((camp.receivedAmount / camp.targetAmount) * 100));
              return (
                <Card key={camp.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{camp.name}</CardTitle>
                      <StatusBadge status={camp.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">Target</span>
                        <span className="font-medium">{formatCurrency(camp.targetAmount)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Pledged</span>
                        <span className="font-medium">{formatCurrency(camp.pledgedAmount)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Received</span>
                        <span className="font-medium text-brand-success">{formatCurrency(camp.receivedAmount)}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Funded Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 4: Detailed Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Giving Ledger Records</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={givingData}
                recordLabel="transaction"
                searchKey="receiptNumber"
                searchPlaceholder="Search transactions..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
