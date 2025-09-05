'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { 
  Download, 
  BadgeCent,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Users,
  Target,
  PieChart,
  BarChart3,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Report interfaces
interface GivingReport {
  id: string;
  period: string;
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
  categories: CategoryReport[];
  methods: MethodReport[];
  trends: TrendData[];
}

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

interface TrendData {
  date: string;
  amount: number;
  count: number;
}

// Mock report data
const mockReport: GivingReport = {
  id: '1',
  period: 'January 2024',
  totalAmount: 125000.00,
  totalCount: 450,
  averageAmount: 277.78,
  categories: [
    {
      category: GivingCategory.GENERAL,
      amount: 45000.00,
      count: 180,
      percentage: 36
    },
    {
      category: GivingCategory.GENERAL,
      amount: 35000.00,
      count: 120,
      percentage: 28
    },
    {
      category: GivingCategory.BUILDING_FUND,
      amount: 25000.00,
      count: 80,
      percentage: 20
    },
    {
      category: GivingCategory.MISSIONARY,
      amount: 15000.00,
      count: 50,
      percentage: 12
    },
    {
      category: GivingCategory.YOUTH,
      amount: 5000.00,
      count: 20,
      percentage: 4
    }
  ],
  methods: [
    {
      method: 'Transfer',
      amount: 50000.00,
      count: 150,
      percentage: 40
    },
    {
      method: 'Cash',
      amount: 35000.00,
      count: 180,
      percentage: 28
    },
    {
      method: 'Online',
      amount: 25000.00,
      count: 80,
      percentage: 20
    },
    {
      method: 'Card',
      amount: 10000.00,
      count: 30,
      percentage: 8
    },
    {
      method: 'Check',
      amount: 5000.00,
      count: 10,
      percentage: 4
    }
  ],
  trends: [
    { date: '2024-01-01', amount: 8500.00, count: 32 },
    { date: '2024-01-08', amount: 9200.00, count: 35 },
    { date: '2024-01-15', amount: 7800.00, count: 28 },
    { date: '2024-01-22', amount: 10500.00, count: 42 },
    { date: '2024-01-29', amount: 9000.00, count: 38 }
  ]
};

// Mock detailed giving data
const mockGivingData: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    type: GivingType.TITHE,
    amount: 2000.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Transfer',
    date: '2024-01-20',
    description: 'Monthly tithe',
    isAnonymous: false,
    receiptNumber: 'TIT-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    memberId: 'member2',
    type: GivingType.OFFERING,
    amount: 500.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-19',
    description: 'Sunday offering',
    isAnonymous: false,
    receiptNumber: 'OFF-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    memberId: 'member3',
    type: GivingType.DONATION,
    amount: 5000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Online',
    date: '2024-01-18',
    description: 'Building fund donation',
    isAnonymous: true,
    receiptNumber: 'DON-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  }
];

export default function GivingReportsPage() {
  const [report, setReport] = useState<GivingReport | null>(null);
  const [givingData, setGivingData] = useState<Giving[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date()
    } as DateRange,
    category: 'all',
    type: 'all',
    method: 'all',
    status: 'all'
  });
  const [dateOpen, setDateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with actual API calls:
      // const [reportResponse, givingResponse] = await Promise.all([
      //   givingService.getReport(filters),
      //   givingService.getAll(filters)
      // ]);
      // setReport(reportResponse);
      // setGivingData(givingResponse.data);
      setReport(mockReport);
      setGivingData(mockGivingData);
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

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      // await givingService.exportReport(filters, format);
      toast({
        title: 'Success',
        description: `Report exported as ${format.toUpperCase()} successfully`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryBadge = (category: GivingCategory) => {
    const colors = {
      [GivingCategory.GENERAL]: 'bg-blue-100 text-blue-800',
      [GivingCategory.MISSIONARY]: 'bg-green-100 text-green-800',
      [GivingCategory.BUILDING_FUND]: 'bg-orange-100 text-orange-800',
      [GivingCategory.YOUTH]: 'bg-purple-100 text-purple-800',
      [GivingCategory.CHILDREN]: 'bg-pink-100 text-pink-800',
      [GivingCategory.MUSIC]: 'bg-indigo-100 text-indigo-800',
      [GivingCategory.OUTREACH]: 'bg-yellow-100 text-yellow-800',
      [GivingCategory.CHARITY]: 'bg-red-100 text-red-800',
      [GivingCategory.EDUCATION]: 'bg-cyan-100 text-cyan-800',
      [GivingCategory.MEDICAL]: 'bg-emerald-100 text-emerald-800',
      [GivingCategory.DISASTER_RELIEF]: 'bg-rose-100 text-rose-800',
      [GivingCategory.OTHER]: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category.replace('_', ' ')}
      </Badge>
    );
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
      accessorKey: 'receiptNumber',
      header: 'Receipt #',
      cell: ({ row }) => {
        const receiptNumber = row.getValue('receiptNumber') as string;
        return <div className="font-medium">{receiptNumber}</div>;
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.getValue('type') as GivingType;
        return <Badge variant="outline" className="capitalize">{type}</Badge>;
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as GivingCategory;
        return getCategoryBadge(category);
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
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('method') as string;
        return (
          <Badge variant="outline" className="capitalize">
            {method.replace('_', ' ')}
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

  if (loading || !report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex space-x-2">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <CardSkeleton count={1} className="h-32" />
        <CardSkeleton count={4} />
        <div className="space-y-4">
          <ChartSkeleton height="h-96" />
          <TableSkeleton rows={5} columns={7} showFilters showPagination />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giving Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive giving analytics and insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadReportData()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Select onValueChange={(value) => handleExport(value as 'pdf' | 'excel' | 'csv')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </SelectItem>
              <SelectItem value="excel">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </SelectItem>
              <SelectItem value="csv">
                <Download className="mr-2 h-4 w-4" />
                CSV
              </SelectItem>
            </SelectContent>
          </Select>
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
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Report Filters</span>
            </CardTitle>
            <CardDescription>
              Filter the report data by date range, category, type, and method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal w-full">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange?.from && filters.dateRange?.to ? (
                        `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}`
                      ) : (
                        'Select date range'
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={filters.dateRange ? { from: filters.dateRange.from, to: filters.dateRange.to } : undefined}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setFilters({ ...filters, dateRange: { from: range.from, to: range.to } });
                        }
                        setDateOpen(false);
                      }}
                      numberOfMonths={2}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value={GivingCategory.GENERAL}>General</SelectItem>
                    <SelectItem value={GivingCategory.BUILDING_FUND}>Building Fund</SelectItem>
                    <SelectItem value={GivingCategory.MISSIONARY}>Missionary</SelectItem>
                    <SelectItem value={GivingCategory.YOUTH}>Youth</SelectItem>
                    <SelectItem value={GivingCategory.CHILDREN}>Children</SelectItem>
                    <SelectItem value={GivingCategory.MUSIC}>Music</SelectItem>
                    <SelectItem value={GivingCategory.OUTREACH}>Outreach</SelectItem>
                    <SelectItem value={GivingCategory.CHARITY}>Charity</SelectItem>
                    <SelectItem value={GivingCategory.EDUCATION}>Education</SelectItem>
                    <SelectItem value={GivingCategory.MEDICAL}>Medical</SelectItem>
                    <SelectItem value={GivingCategory.DISASTER_RELIEF}>Disaster Relief</SelectItem>
                    <SelectItem value={GivingCategory.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value={GivingType.TITHE}>Tithe</SelectItem>
                    <SelectItem value={GivingType.OFFERING}>Offering</SelectItem>
                    <SelectItem value={GivingType.DONATION}>Donation</SelectItem>
                    <SelectItem value={GivingType.PLEDGE}>Pledge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Method</Label>
                <Select value={filters.method} onValueChange={(value) => setFilters({ ...filters, method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={GivingStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={GivingStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={GivingStatus.FAILED}>Failed</SelectItem>
                  </SelectContent>
                </Select>
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
       >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <BadgeCent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(report.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {report.period}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Count</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.totalCount}</div>
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
              <div className="text-2xl font-bold">{formatCurrency(report.averageAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                vs previous period
              </p>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="methods">By Method</TabsTrigger>
          <TabsTrigger value="details">Detailed Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <LazyLoader threshold={0.2}>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>Category Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.categories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{category.category.replace('_', ' ')}</span>
                        <span className="font-medium">{formatCurrency(category.amount)}</span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{category.count} transactions</span>
                        <span>{category.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Payment Methods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.methods.map((method) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize">{method.method.replace('_', ' ')}</span>
                        <span className="font-medium">{formatCurrency(method.amount)}</span>
                      </div>
                      <Progress value={method.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{method.count} transactions</span>
                        <span>{method.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </LazyLoader>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <LazyLoader threshold={0.3}>
            <Card>
              <CardHeader>
                <CardTitle>Giving by Category</CardTitle>
                <CardDescription>
                  Detailed breakdown of giving by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.categories.map((category) => (
                    <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getCategoryBadge(category.category)}
                        <div>
                          <p className="font-medium capitalize">{category.category.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{category.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(category.amount)}</p>
                        <p className="text-sm text-muted-foreground">{category.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LazyLoader>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <LazyLoader threshold={0.3} fadeIn>
            <Card>
              <CardHeader>
                <CardTitle>Giving by Payment Method</CardTitle>
                <CardDescription>
                  Analysis of preferred payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.methods.map((method) => (
                    <div key={method.method} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="capitalize">
                          {method.method.replace('_', ' ')}
                        </Badge>
                        <div>
                          <p className="font-medium capitalize">{method.method.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(method.amount)}</p>
                        <p className="text-sm text-muted-foreground">{method.percentage}% of total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </LazyLoader>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <LazyLoader threshold={0.4}>
            <Card>
              <CardHeader>
                <CardTitle>Detailed Giving Data</CardTitle>
                <CardDescription>
                  Complete list of giving transactions for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={givingData}
                  searchKey="description"
                  searchPlaceholder="Search transactions..."
                />
              </CardContent>
            </Card>
          </LazyLoader>
        </TabsContent>
      </Tabs>
    </div>
  );
}