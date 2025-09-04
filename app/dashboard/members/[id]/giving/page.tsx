'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Receipt,
  Download,
  Share2,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  PieChart,
  Target,
  Gift,
  Heart,
  Building,
  Users,
  Music,
  BookOpen,
  Activity,
  Star,
  Circle
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

// Mock giving data for development
const mockGiving: Giving[] = [
  {
    id: '1',
    memberId: '1',
    type: GivingType.TITHE,
    amount: 500.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-14',
    description: 'Weekly tithe',
    isAnonymous: false,
    receiptNumber: 'TITHE-2024-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    metadata: {
      serviceDate: '2024-01-14',
      serviceType: 'Sunday Service'
    }
  },
  {
    id: '2',
    memberId: '1',
    type: GivingType.OFFERING,
    amount: 100.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-14',
    description: 'Sunday offering',
    isAnonymous: false,
    receiptNumber: 'OFFER-2024-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    metadata: {
      serviceDate: '2024-01-14',
      serviceType: 'Sunday Service'
    }
  },
  {
    id: '3',
    memberId: '1',
    type: GivingType.DONATION,
    amount: 1000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    campaign: 'New Church Building',
    method: 'Transfer',
    date: '2024-01-10',
    description: 'Building fund donation',
    isAnonymous: false,
    receiptNumber: 'DON-2024-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
    metadata: {
      campaignId: 'building-2024',
      campaignName: 'New Church Building'
    }
  },
  {
    id: '4',
    memberId: '1',
    type: GivingType.FUNDRAISING,
    amount: 250.00,
    currency: 'GHS',
    category: GivingCategory.MISSIONARY,
    campaign: 'Mission Trip 2024',
    method: 'Card',
    date: '2024-01-08',
    description: 'Mission trip support',
    isAnonymous: false,
    receiptNumber: 'FUND-2024-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-08T16:45:00Z',
    metadata: {
      campaignId: 'mission-2024',
      campaignName: 'Mission Trip 2024'
    }
  },
  {
    id: '5',
    memberId: '1',
    type: GivingType.SPECIAL,
    amount: 300.00,
    currency: 'GHS',
    category: GivingCategory.YOUTH,
    method: 'Cash',
    date: '2024-01-05',
    description: 'Youth ministry support',
    isAnonymous: false,
    receiptNumber: 'SPEC-2024-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-05T11:20:00Z',
    metadata: {
      ministry: 'Youth Ministry',
      event: 'Youth Conference'
    }
  },
  {
    id: '6',
    memberId: '1',
    type: GivingType.PLEDGE,
    amount: 5000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    campaign: 'New Church Building',
    method: 'Transfer',
    date: '2024-01-01',
    description: 'Building fund pledge',
    isAnonymous: false,
    receiptNumber: 'PLEDGE-2024-001',
    status: GivingStatus.PENDING,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    metadata: {
      pledgeDate: '2024-01-01',
      dueDate: '2024-12-31',
      campaignId: 'building-2024'
    }
  }
];

// Mock member data for development
const mockMember: Member = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phone: '+233 24 123 4567',
  address: '123 Main Street, Accra, Ghana',
  dateOfBirth: '1988-05-15',
  gender: 'Male',
  membershipStatus: 'Active',
  joinDate: '2023-01-15',
  avatar: null,
  familyId: 'fam1',
  emergencyContact: {
    name: 'Jane Smith',
    phone: '+233 24 123 4568',
    relationship: 'Spouse'
  },
  customFields: {},
  createdAt: '2023-01-15T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z'
};

// Mock analytics data
const mockAnalytics = {
  totalAmount: 7150.00,
  totalCount: 6,
  averageAmount: 1191.67,
  byType: {
    [GivingType.TITHE]: { amount: 500.00, count: 1 },
    [GivingType.OFFERING]: { amount: 100.00, count: 1 },
    [GivingType.DONATION]: { amount: 1000.00, count: 1 },
    [GivingType.FUNDRAISING]: { amount: 250.00, count: 1 },
    [GivingType.SPECIAL]: { amount: 300.00, count: 1 },
    [GivingType.PLEDGE]: { amount: 5000.00, count: 1 },
    [GivingType.MISSIONARY]: { amount: 0, count: 0 },
    [GivingType.BUILDING]: { amount: 0, count: 0 },
    [GivingType.OTHER]: { amount: 0, count: 0 },
  },
  byCategory: {
    [GivingCategory.GENERAL]: { amount: 600.00, count: 2 },
    [GivingCategory.BUILDING_FUND]: { amount: 6000.00, count: 2 },
    [GivingCategory.MISSIONARY]: { amount: 250.00, count: 1 },
    [GivingCategory.YOUTH]: { amount: 300.00, count: 1 },
    [GivingCategory.CHILDREN]: { amount: 0, count: 0 },
    [GivingCategory.MUSIC]: { amount: 0, count: 0 },
    [GivingCategory.OUTREACH]: { amount: 0, count: 0 },
    [GivingCategory.CHARITY]: { amount: 0, count: 0 },
    [GivingCategory.EDUCATION]: { amount: 0, count: 0 },
    [GivingCategory.MEDICAL]: { amount: 0, count: 0 },
    [GivingCategory.DISASTER_RELIEF]: { amount: 0, count: 0 },
    [GivingCategory.OTHER]: { amount: 0, count: 0 },
  },
  byMonth: [
    { month: 'Jan 2024', amount: 7150.00, count: 6 }
  ],
  byYear: [
    { year: '2024', amount: 7150.00, count: 6 }
  ],
  recentGiving: mockGiving.slice(0, 3),
  topCategories: [
    { category: GivingCategory.BUILDING_FUND, amount: 6000.00, percentage: 83.9 },
    { category: GivingCategory.GENERAL, amount: 600.00, percentage: 8.4 },
    { category: GivingCategory.YOUTH, amount: 300.00, percentage: 4.2 },
    { category: GivingCategory.MISSIONARY, amount: 250.00, percentage: 3.5 }
  ],
  givingTrend: [
    { period: 'This Month', amount: 7150.00, change: 15.2 },
    { period: 'Last Month', amount: 6200.00, change: 8.5 },
    { period: 'This Year', amount: 7150.00, change: 12.3 }
  ]
};

export default function GivingPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [giving, setGiving] = useState<Giving[]>([]);
  const [analytics, setAnalytics] = useState(mockAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGiving, setSelectedGiving] = useState<string[]>([]);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [memberResponse, givingResponse, analyticsResponse] = await Promise.all([
        //   membersService.getMember(memberId),
        //   givingService.getMemberGiving(memberId),
        //   givingService.getMemberGivingAnalytics(memberId)
        // ]);
        // setMember(memberResponse);
        // setGiving(givingResponse.data);
        // setAnalytics(analyticsResponse);
        setMember(mockMember);
        setGiving(mockGiving);
        setAnalytics(mockAnalytics);
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

    if (memberId) {
      loadData();
    }
  }, [memberId, toast]);

  const handleDeleteGiving = async (givingId: string) => {
    try {
      await givingService.deleteGiving(givingId);
      setGiving(giving.filter(g => g.id !== givingId));
      toast({
        title: 'Success',
        description: 'Giving record deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete giving record',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGiving.length === 0) return;
    
    try {
      await givingService.bulkDeleteGiving(selectedGiving);
      setGiving(giving.filter(g => !selectedGiving.includes(g.id)));
      setSelectedGiving([]);
      toast({
        title: 'Success',
        description: `${selectedGiving.length} giving record(s) deleted successfully`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete giving records',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateReceipt = async (giving: Giving) => {
    try {
      const receipt = await givingService.generateReceipt(giving.id);
      
      // Download receipt
      const response = await fetch(receipt.receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `receipt-${receipt.receiptNumber}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate receipt',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GHS') => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGivingTypeIcon = (type: GivingType) => {
    switch (type) {
      case GivingType.TITHE:
        return <Heart className="h-4 w-4" />;
      case GivingType.OFFERING:
        return <Gift className="h-4 w-4" />;
      case GivingType.DONATION:
        return <Heart className="h-4 w-4" />;
      case GivingType.FUNDRAISING:
        return <Activity className="h-4 w-4" />;
      case GivingType.PLEDGE:
        return <Target className="h-4 w-4" />;
      case GivingType.SPECIAL:
        return <Star className="h-4 w-4" />;
      case GivingType.MISSIONARY:
        return <Users className="h-4 w-4" />;
      case GivingType.BUILDING:
        return <Building className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getGivingTypeLabel = (type: GivingType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getCategoryIcon = (category: GivingCategory) => {
    switch (category) {
      case GivingCategory.GENERAL:
        return <Circle className="h-4 w-4" />;
      case GivingCategory.BUILDING_FUND:
        return <Building className="h-4 w-4" />;
      case GivingCategory.MISSIONARY:
        return <Users className="h-4 w-4" />;
      case GivingCategory.YOUTH:
        return <Users className="h-4 w-4" />;
      case GivingCategory.CHILDREN:
        return <Users className="h-4 w-4" />;
      case GivingCategory.MUSIC:
        return <Music className="h-4 w-4" />;
      case GivingCategory.EDUCATION:
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: GivingCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getStatusBadge = (status: GivingStatus) => {
    switch (status) {
      case GivingStatus.COMPLETED:
        return <Badge variant="default">Completed</Badge>;
      case GivingStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case GivingStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      case GivingStatus.REFUNDED:
        return <Badge variant="outline">Refunded</Badge>;
      case GivingStatus.CANCELLED:
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Table columns definition
  const columns: ColumnDef<Giving>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const giving = row.original;
        return (
          <div className="flex items-center space-x-2">
            {getGivingTypeIcon(giving.type)}
            <span className="font-medium">{getGivingTypeLabel(giving.type)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number;
        const currency = row.original.currency;
        return (
          <span className="font-medium text-green-600">
            {formatCurrency(amount, currency)}
          </span>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as GivingCategory;
        return (
          <div className="flex items-center space-x-2">
            {getCategoryIcon(category)}
            <span className="text-sm">{getCategoryLabel(category)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('method') as string;
        return <span className="text-sm capitalize">{method}</span>;
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = row.getValue('date') as string;
        return (
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
            {formatDate(date)}
          </div>
        );
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const giving = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGenerateReceipt(giving)}
            >
              <Receipt className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/members/${memberId}/giving/${giving.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteGiving(giving.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">
          {error || 'Member not found'}
        </div>
        <Button asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/members/${member.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Giving History</h1>
            <p className="text-muted-foreground">
              Track giving and donations for {member.firstName} {member.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBulkDelete} disabled={selectedGiving.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({selectedGiving.length})
          </Button>
          <Button asChild>
            <Link href={`/dashboard/members/${member.id}/giving/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Giving Record
            </Link>
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Given</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalCount} giving records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.averageAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Per giving record
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.givingTrend[0]?.amount || 0)}</div>
            <p className="text-xs text-muted-foreground">
              +{analytics.givingTrend[0]?.change || 0}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.topCategories[0]?.category ? getCategoryLabel(analytics.topCategories[0].category) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.topCategories[0]?.percentage || 0}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Giving Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Giving Records</CardTitle>
          <CardDescription>
            View and manage all giving records for {member.firstName} {member.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {giving.length > 0 ? (
            <DataTable
              columns={columns}
              data={giving}
              loading={loading}
              error={error || undefined}
              searchKey="type"
              showSearch={true}
              showFilters={true}
              pagination={{
                pageSize: 10,
                pageSizeOptions: [10, 20, 50],
              }}
              onRowClick={(giving) => router.push(`/dashboard/members/${memberId}/giving/${giving.id}`)}
              className="bg-card"
            />
          ) : (
            <div className="text-center py-8">
              <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No giving records found</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding giving records for this member
              </p>
              <Button asChild>
                <Link href={`/dashboard/members/${member.id}/giving/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Giving Record
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 