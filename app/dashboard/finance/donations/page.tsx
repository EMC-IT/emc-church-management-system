'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { financeService } from '@/services';
import { Donation, DonationCategory, DonationMethod, DonationStatus, Currency } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Receipt,
  TrendingUp,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    category: '' as DonationCategory | '',
    method: '' as DonationMethod | '',
    status: '' as DonationStatus | '',
    branch: '',
    dateRange: { start: '', end: '' }
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [donationToDelete, setDonationToDelete] = useState<Donation | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Load donations
  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await financeService.getDonations({
        page: currentPage,
        limit: pageSize,
        search,
        category: filters.category || undefined,
        method: filters.method || undefined,
        status: filters.status || undefined,
        branch: filters.branch || undefined,
        dateRange: filters.dateRange.start && filters.dateRange.end ? filters.dateRange : undefined
      });
      setDonations(response.data);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load donations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [currentPage, pageSize, search, filters]);

  // Handle delete
  const handleDelete = async (donation: Donation) => {
    try {
      await financeService.deleteDonation(donation.id);
      toast({
        title: 'Success',
        description: 'Donation deleted successfully',
      });
      loadDonations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete donation',
        variant: 'destructive',
      });
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const result = await financeService.exportData({
        format: 'csv',
        dateRange: filters.dateRange.start && filters.dateRange.end ? {
          start: filters.dateRange.start,
          end: filters.dateRange.end
        } : undefined,
        groupBy: 'category'
      });
      
      if (result.success) {
        toast({
          title: 'Export Successful',
          description: 'Donations exported successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export donations',
        variant: 'destructive',
      });
    }
  };

  // Calculate summary stats
  const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const confirmedDonations = donations.filter(d => d.status === 'Confirmed').length;
  const pendingDonations = donations.filter(d => d.status === 'Pending').length;

  // Table columns
  const columns: ColumnDef<Donation>[] = [
    {
      accessorKey: 'donorName',
      header: 'Donor',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div>
            <div className="font-medium">{donation.donorName}</div>
            {donation.donorEmail && (
              <div className="text-sm text-muted-foreground">{donation.donorEmail}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <CurrencyDisplay 
            amount={donation.amount} 
            className="font-medium"
          />
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const donation = row.original;
        return <Badge variant="outline">{donation.category}</Badge>;
      },
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const donation = row.original;
        return <Badge variant="secondary">{donation.method}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const donation = row.original;
        const statusColors = {
          'Confirmed': 'bg-green-500',
          'Pending': 'bg-yellow-500',
          'Rejected': 'bg-red-500',
          'Refunded': 'bg-gray-500'
        };
        return (
          <Badge className={statusColors[donation.status]}>
            {donation.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div className="text-sm">
            {format(new Date(donation.date), 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => {
        const donation = row.original;
        return <div className="text-sm">{donation.branch}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const donation = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/finance/donations/${donation.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/finance/donations/${donation.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDonationToDelete(donation)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Donation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this donation? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (donationToDelete) {
                        handleDelete(donationToDelete);
                        setDonationToDelete(null);
                      }
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">Manage and track church donations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/finance/donations/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Donation
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={totalAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              {donations.length} donations this period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedDonations}</div>
            <p className="text-xs text-muted-foreground">
              {((confirmedDonations / donations.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDonations}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay 
                amount={donations.length > 0 ? totalAmount / donations.length : 0} 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Per donation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search donors, receipts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || 'none'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'none' ? '' : value as DonationCategory }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All categories</SelectItem>
                  <SelectItem value="General Offering">General Offering</SelectItem>
                  <SelectItem value="Building Fund">Building Fund</SelectItem>
                  <SelectItem value="Missions">Missions</SelectItem>
                  <SelectItem value="Children Ministry">Children Ministry</SelectItem>
                  <SelectItem value="Youth Ministry">Youth Ministry</SelectItem>
                  <SelectItem value="Music Ministry">Music Ministry</SelectItem>
                  <SelectItem value="Media Ministry">Media Ministry</SelectItem>
                  <SelectItem value="Welfare">Welfare</SelectItem>
                  <SelectItem value="Special Project">Special Project</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Method</label>
              <Select
                value={filters.method || 'none'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, method: value === 'none' ? '' : value as DonationMethod }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All methods</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Check">Check</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={filters.status || 'none'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'none' ? '' : value as DonationStatus }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All statuses</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donations</CardTitle>
          <CardDescription>
            A list of all donations with their details and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={donations}
            loading={loading}
            searchKey="donorName"
            showSearch={false}
            showFilters={false}
            pagination={{
              pageSize,
              pageSizeOptions: [10, 20, 50],
            }}
            className="bg-card"
          />
        </CardContent>
      </Card>
    </div>
  );
}