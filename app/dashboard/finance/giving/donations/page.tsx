'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { 
  Plus, 
  BadgeCent,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  Users,
  Eye,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Mock donations data
const mockDonations: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    type: GivingType.DONATION,
    amount: 5000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Transfer',
    date: '2024-01-20',
    description: 'Building fund donation for new sanctuary',
    isAnonymous: false,
    receiptNumber: 'DON-001',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    memberId: 'member2',
    type: GivingType.DONATION,
    amount: 2000.00,
    currency: 'GHS',
    category: GivingCategory.MISSIONARY,
    method: 'Online',
    date: '2024-01-19',
    description: 'Missions support donation',
    isAnonymous: false,
    receiptNumber: 'DON-002',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    memberId: 'member3',
    type: GivingType.DONATION,
    amount: 1500.00,
    currency: 'GHS',
    category: GivingCategory.YOUTH,
    method: 'Cash',
    date: '2024-01-18',
    description: 'Youth ministry equipment donation',
    isAnonymous: true,
    receiptNumber: 'DON-003',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  },
  {
    id: '4',
    memberId: 'member4',
    type: GivingType.DONATION,
    amount: 3000.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Check',
    date: '2024-01-17',
    description: 'General fund donation',
    isAnonymous: false,
    receiptNumber: 'DON-004',
    status: GivingStatus.PENDING,
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-17T16:45:00Z'
  },
  {
    id: '5',
    memberId: 'member5',
    type: GivingType.DONATION,
    amount: 800.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Card',
    date: '2024-01-16',
    description: 'Online building fund donation',
    isAnonymous: false,
    receiptNumber: 'DON-005',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-16T11:30:00Z'
  }
];

export default function DonationsPage() {
  const [donations, setDonations] = useState<Giving[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Giving[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all',
    method: 'all',
    dateRange: undefined as DateRange | undefined,
    search: ''
  });
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadDonations = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await givingService.getAll({ type: GivingType.DONATION });
        // setDonations(response.data);
        setDonations(mockDonations);
        setFilteredDonations(mockDonations);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load donations',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, [toast]);

  useEffect(() => {
    let filtered = [...donations];

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(d => d.category === filters.category);
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    // Filter by method
    if (filters.method !== 'all') {
      filtered = filtered.filter(d => d.method === filters.method);
    }

    // Filter by date range
    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(d => {
        const donationDate = new Date(d.date);
        return donationDate >= filters.dateRange!.from! && donationDate <= filters.dateRange!.to!;
      });
    }

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(d => 
        (d.description && d.description.toLowerCase().includes(searchLower)) ||
        (d.receiptNumber && d.receiptNumber.toLowerCase().includes(searchLower))
      );
    }

    setFilteredDonations(filtered);
  }, [donations, filters]);

  const handleDeleteDonation = async (donation: Giving) => {
    try {
      // await givingService.delete(donation.id);
      setDonations(donations.filter(d => d.id !== donation.id));
      toast({
        title: 'Success',
        description: 'Donation deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete donation',
        variant: 'destructive',
      });
      throw err; // Re-throw to let DeleteDialog handle the error state
    }
  };

  const handleExport = async () => {
    try {
      // await givingService.exportDonations(filters);
      toast({
        title: 'Success',
        description: 'Donations exported successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to export donations',
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
      [GivingCategory.GENERAL]: 'bg-gray-100 text-gray-800',
      [GivingCategory.BUILDING_FUND]: 'bg-orange-100 text-orange-800',
      [GivingCategory.MISSIONARY]: 'bg-purple-100 text-purple-800',
      [GivingCategory.YOUTH]: 'bg-pink-100 text-pink-800',
      [GivingCategory.CHILDREN]: 'bg-blue-100 text-blue-800',
      [GivingCategory.MUSIC]: 'bg-green-100 text-green-800',
      [GivingCategory.OUTREACH]: 'bg-indigo-100 text-indigo-800',
      [GivingCategory.CHARITY]: 'bg-red-100 text-red-800',
      [GivingCategory.EDUCATION]: 'bg-yellow-100 text-yellow-800',
      [GivingCategory.MEDICAL]: 'bg-teal-100 text-teal-800',
      [GivingCategory.DISASTER_RELIEF]: 'bg-rose-100 text-rose-800',
      [GivingCategory.OTHER]: 'bg-slate-100 text-slate-800',
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

  const getMethodBadge = (method: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {method.replace('_', ' ')}
      </Badge>
    );
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
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        const donation = row.original;
        return (
          <div>
            <div className="max-w-[200px] truncate font-medium">{description}</div>
            <div className="text-xs text-muted-foreground">
              {donation.isAnonymous ? 'Anonymous' : 'Member donation'}
            </div>
          </div>
        );
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
        return getMethodBadge(method);
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
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const donation = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/giving/donations/${donation.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/giving/donations/${donation.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => deleteDialog.openDialog(donation)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Calculate statistics
  const totalDonations = filteredDonations.length;
  const totalAmount = filteredDonations.reduce((sum, donation) => sum + donation.amount, 0);
  const averageAmount = totalDonations > 0 ? totalAmount / totalDonations : 0;
  const completedDonations = filteredDonations.filter(d => d.status === GivingStatus.COMPLETED).length;
  const pendingDonations = filteredDonations.filter(d => d.status === GivingStatus.PENDING).length;
  const thisMonthDonations = filteredDonations.filter(d => {
    const donationDate = new Date(d.date);
    const now = new Date();
    return donationDate.getMonth() === now.getMonth() && donationDate.getFullYear() === now.getFullYear();
  });
  const thisMonthAmount = thisMonthDonations.reduce((sum, donation) => sum + donation.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all giving donations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/finance/giving/donations/add">
              <Plus className="mr-2 h-4 w-4" />
              Record Donation
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonations}</div>
            <p className="text-xs text-muted-foreground">
              {completedDonations} completed, {pendingDonations} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All donations combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Per donation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {thisMonthDonations.length} donations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter donations by category, status, method, and date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search donations..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
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
            
            <div className="space-y-2">
              <Label>Method</Label>
              <Select value={filters.method} onValueChange={(value) => setFilters({ ...filters, method: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
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
                      } else {
                        setFilters({ ...filters, dateRange: undefined });
                      }
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {(filters.category !== 'all' || filters.status !== 'all' || filters.method !== 'all' || filters.dateRange || filters.search) && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ category: 'all', status: 'all', method: 'all', dateRange: undefined, search: '' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Donations</CardTitle>
          <CardDescription>
            {filteredDonations.length} of {donations.length} donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredDonations}
              searchKey="description"
              searchPlaceholder="Search donations..."
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteDonation(deleteDialog.itemToDelete)}
        title="Delete Donation"
        description={`Are you sure you want to delete this donation? This action cannot be undone and will permanently remove the donation record.`}
        itemName={deleteDialog.itemToDelete?.description || deleteDialog.itemToDelete?.receiptNumber}
        loading={deleteDialog.loading}
      />
    </div>
  );
}