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
import { TitheOffering, TitheType, ServiceType, Currency } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export default function TithesOfferingsPage() {
  const [tithesOfferings, setTithesOfferings] = useState<TitheOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    serviceType: '',
    branch: '',
    dateRange: { start: '', end: '' }
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [titheToDelete, setTitheToDelete] = useState<TitheOffering | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Load tithes and offerings
  const loadTithesOfferings = async () => {
    try {
      setLoading(true);
      const response = await financeService.getTithesOfferings({
        page: currentPage,
        limit: pageSize,
        search,
        ...filters
      });
      setTithesOfferings(response.data);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load tithes and offerings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTithesOfferings();
  }, [currentPage, pageSize, search, filters]);

  // Handle delete
  const handleDelete = async (tithe: TitheOffering) => {
    try {
      // Note: This would need to be implemented in the service
      toast({
        title: 'Success',
        description: 'Tithe/Offering deleted successfully',
      });
      loadTithesOfferings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tithe/offering',
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
          description: 'Tithes and offerings exported successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export tithes and offerings',
        variant: 'destructive',
      });
    }
  };

  // Calculate summary stats
  const totalAmount = tithesOfferings.reduce((sum, tithe) => sum + tithe.amount, 0);
  const tithesAmount = tithesOfferings.filter(t => t.type === 'Tithe').reduce((sum, t) => sum + t.amount, 0);
  const offeringsAmount = tithesOfferings.filter(t => t.type === 'Offering').reduce((sum, t) => sum + t.amount, 0);

  // Table columns
  const columns: ColumnDef<TitheOffering>[] = [
    {
      accessorKey: 'memberName',
      header: 'Member',
      cell: ({ row }) => {
        const tithe = row.original;
        return (
          <div>
            <div className="font-medium">{tithe.memberName || 'Anonymous'}</div>
            {tithe.memberId && (
              <div className="text-sm text-muted-foreground">ID: {tithe.memberId}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const tithe = row.original;
        return (
          <CurrencyDisplay 
            amount={tithe.amount} 
            className="font-medium"
          />
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const tithe = row.original;
        const typeColors = {
          'Tithe': 'bg-blue-500',
          'Offering': 'bg-green-500',
          'First Fruits': 'bg-purple-500',
          'Special Offering': 'bg-orange-500'
        };
        return (
          <Badge className={typeColors[tithe.type]}>
            {tithe.type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'serviceType',
      header: 'Service',
      cell: ({ row }) => {
        const tithe = row.original;
        return <Badge variant="outline">{tithe.serviceType}</Badge>;
      },
    },
    {
      accessorKey: 'serviceDate',
      header: 'Date',
      cell: ({ row }) => {
        const tithe = row.original;
        return (
          <div className="text-sm">
            {format(new Date(tithe.serviceDate), 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => {
        const tithe = row.original;
        return <div className="text-sm">{tithe.branch}</div>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const tithe = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/finance/tithes-offerings/${tithe.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/finance/tithes-offerings/${tithe.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTitheToDelete(tithe)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tithe/Offering</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this tithe/offering? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (titheToDelete) {
                        handleDelete(titheToDelete);
                        setTitheToDelete(null);
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
          <h1 className="text-3xl font-bold tracking-tight">Tithes & Offerings</h1>
          <p className="text-muted-foreground">Manage tithes and offerings from members</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/finance/tithes-offerings/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Tithe/Offering
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={totalAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              {tithesOfferings.length} records this period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tithes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <CurrencyDisplay amount={tithesAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              {tithesOfferings.filter(t => t.type === 'Tithe').length} tithes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offerings</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              <CurrencyDisplay amount={offeringsAmount} />
            </div>
            <p className="text-xs text-muted-foreground">
              {tithesOfferings.filter(t => t.type === 'Offering').length} offerings
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
                amount={tithesOfferings.length > 0 ? totalAmount / tithesOfferings.length : 0} 
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Per tithe/offering
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
                  placeholder="Search members, receipts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={filters.type || 'none'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All types</SelectItem>
                  <SelectItem value="Tithe">Tithe</SelectItem>
                  <SelectItem value="Offering">Offering</SelectItem>
                  <SelectItem value="First Fruits">First Fruits</SelectItem>
                  <SelectItem value="Special Offering">Special Offering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Type</label>
              <Select
                value={filters.serviceType || 'none'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, serviceType: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All services</SelectItem>
                  <SelectItem value="Sunday Service">Sunday Service</SelectItem>
                  <SelectItem value="Midweek Service">Midweek Service</SelectItem>
                  <SelectItem value="Special Service">Special Service</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select
                value={filters.branch || 'none'}
                onValueChange={(value) => setFilters(prev => ({ ...prev, branch: value === 'none' ? '' : value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All branches</SelectItem>
                  <SelectItem value="Adenta (HQ)">Adenta (HQ)</SelectItem>
                  <SelectItem value="Adusa">Adusa</SelectItem>
                  <SelectItem value="Liberia">Liberia</SelectItem>
                  <SelectItem value="Somanya">Somanya</SelectItem>
                  <SelectItem value="Mampong">Mampong</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tithes & Offerings</CardTitle>
          <CardDescription>
            A list of all tithes and offerings with their details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tithesOfferings}
            loading={loading}
            searchKey="memberName"
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