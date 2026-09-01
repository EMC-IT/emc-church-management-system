'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GivingCategoryBadge, PaymentMethodBadge } from '@/components/ui/finance-badges';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { ChartHeader } from '@/components/ui/chart-header';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import {
  Plus,
  BadgeCent,
  TrendingUp,
  Calendar as CalendarIcon,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowLeft,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, GivingSource } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Mock giving data — source field required by updated domain model.
// Records with parentGivingId are excluded from all aggregate totals (anti-double-counting).
const mockGiving: Giving[] = [
  {
    id: '1',
    memberId: 'member1',
    memberName: 'Kofi Mensah',
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
    description: 'Sunday morning offering',
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
  {
    id: '4',
    memberId: 'member4',
    memberName: 'Abena Owusu',
    source: GivingSource.INDIVIDUAL,
    type: GivingType.FIRST_FRUITS,
    amount: 3000.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Transfer',
    date: '2024-01-17',
    description: 'First fruits offering',
    isAnonymous: false,
    receiptNumber: 'GIV-004',
    status: GivingStatus.PENDING,
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-17T16:45:00Z',
  },
  {
    id: '5',
    source: GivingSource.CONGREGATIONAL,
    serviceEvent: 'Midweek Bible Study',
    type: GivingType.OFFERING,
    amount: 450.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '2024-01-16',
    description: 'Midweek service offering',
    isAnonymous: false,
    receiptNumber: 'GIV-005',
    status: GivingStatus.COMPLETED,
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
  },
];

const GIVING_TYPE_LABELS: Record<string, string> = {
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

export default function AllGivingPage() {
  const [giving, setGiving] = useState<Giving[]>([]);
  const [filteredGiving, setFilteredGiving] = useState<Giving[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    source: 'all',
    type: 'all',
    category: 'all',
    status: 'all',
    method: 'all',
    dateRange: undefined as DateRange | undefined,
    search: '',
  });
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadGiving = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        // Only top-level records (no parentGivingId) count toward totals.
        const topLevelOnly = mockGiving.filter(g => !g.parentGivingId);
        setGiving(topLevelOnly);
        setFilteredGiving(topLevelOnly);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load giving records',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadGiving();
  }, [toast]);

  useEffect(() => {
    let filtered = [...giving];

    if (filters.source !== 'all') {
      filtered = filtered.filter(g => g.source === filters.source);
    }
    if (filters.type !== 'all') {
      filtered = filtered.filter(g => g.type === filters.type);
    }
    if (filters.category !== 'all') {
      filtered = filtered.filter(g => g.category === filters.category);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(g => g.status === filters.status);
    }
    if (filters.method !== 'all') {
      filtered = filtered.filter(g => g.method === filters.method);
    }
    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(g => {
        const d = new Date(g.date);
        return d >= filters.dateRange!.from! && d <= filters.dateRange!.to!;
      });
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(g =>
        g.description?.toLowerCase().includes(s) ||
        g.receiptNumber?.toLowerCase().includes(s) ||
        g.memberName?.toLowerCase().includes(s) ||
        g.serviceEvent?.toLowerCase().includes(s)
      );
    }

    setFilteredGiving(filtered);
  }, [giving, filters]);

  const handleDelete = async (record: Giving) => {
    try {
      setGiving(giving.filter(g => g.id !== record.id));
      toast({ title: 'Success', description: 'Giving record deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to delete record', variant: 'destructive' });
      throw err;
    }
  };

  const handleExport = async () => {
    toast({ title: 'Success', description: 'Giving records exported successfully' });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(amount);

  const columns: ColumnDef<Giving>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
      cell: ({ row }) => (
        <span className="font-medium">{GIVING_TYPE_LABELS[row.original.type] ?? row.original.type}</span>
      ),
    },
    {
      id: 'contributor',
      header: 'Contributor',
      cell: ({ row }) => {
        const g = row.original;
        if (g.source === GivingSource.CONGREGATIONAL) {
          return <span className="text-muted-foreground text-sm">{g.serviceEvent ?? 'Congregational'}</span>;
        }
        if (g.isAnonymous) {
          return <span className="text-muted-foreground text-sm italic">Anonymous</span>;
        }
        return <span className="text-sm">{g.memberName ?? g.memberId ?? '—'}</span>;
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
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <GivingCategoryBadge category={row.getValue('category') as GivingCategory} />,
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(parseFloat(row.getValue('amount')))}</span>
      ),
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => <PaymentMethodBadge method={row.getValue('method') as string} />,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => <span>{new Date(row.getValue('date')).toLocaleDateString()}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status') as GivingStatus} />,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const record = row.original;
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
                <Link href={`/dashboard/finance/giving/donations/${record.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/giving/donations/${record.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(record)}
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

  // Aggregate stats — only top-level records (parentGivingId excluded in load)
  const totalAmount = filteredGiving.reduce((sum, g) => sum + g.amount, 0);
  const totalCount = filteredGiving.length;
  const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
  const thisMonthAmount = filteredGiving
    .filter(g => {
      const d = new Date(g.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, g) => sum + g.amount, 0);

  const hasActiveFilters =
    filters.source !== 'all' ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.method !== 'all' ||
    !!filters.dateRange ||
    !!filters.search;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/giving" aria-label="Back to Giving">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="All Giving"
            actions={
              <>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard title="Total Records" value={String(totalCount)} icon={BadgeCent} accent="primary" />
        <StatCard title="Total Amount" value={formatCurrency(totalAmount)} icon={TrendingUp} accent="success" />
        <StatCard title="Average Amount" value={formatCurrency(avgAmount)} icon={Users} accent="secondary" />
        <StatCard title="This Month" value={formatCurrency(thisMonthAmount)} icon={CalendarIcon} accent="accent" />
      </LazySection>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={filters.source} onValueChange={(v) => setFilters({ ...filters, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value={GivingSource.INDIVIDUAL}>Individual</SelectItem>
                  <SelectItem value={GivingSource.CONGREGATIONAL}>Congregational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(GIVING_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={GivingStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={GivingStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={GivingStatus.FAILED}>Failed</SelectItem>
                  <SelectItem value={GivingStatus.REFUNDED}>Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={GivingCategory.GENERAL}>General</SelectItem>
                  <SelectItem value={GivingCategory.BUILDING_FUND}>Building Fund</SelectItem>
                  <SelectItem value={GivingCategory.MISSIONARY}>Missionary</SelectItem>
                  <SelectItem value={GivingCategory.YOUTH}>Youth</SelectItem>
                  <SelectItem value={GivingCategory.CHILDREN}>Children</SelectItem>
                  <SelectItem value={GivingCategory.MUSIC}>Music</SelectItem>
                  <SelectItem value={GivingCategory.OUTREACH}>Outreach</SelectItem>
                  <SelectItem value={GivingCategory.WELFARE}>Welfare</SelectItem>
                  <SelectItem value={GivingCategory.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal w-full">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from && filters.dateRange?.to
                      ? `${format(filters.dateRange.from, 'MMM dd')} – ${format(filters.dateRange.to, 'MMM dd')}`
                      : 'Select range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange ? { from: filters.dateRange.from, to: filters.dateRange.to } : undefined}
                    onSelect={(range) => {
                      setFilters({
                        ...filters,
                        dateRange: range?.from && range?.to ? { from: range.from, to: range.to } : undefined,
                      });
                    }}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ source: 'all', type: 'all', category: 'all', status: 'all', method: 'all', dateRange: undefined, search: '' })}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <ChartHeader
              title="Giving Records"
              badge={`${filteredGiving.length} of ${giving.length}`}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={9} showHeader showPagination />
            ) : (
              <DataTable
                columns={columns}
                data={filteredGiving}
                recordLabel="giving record"
                searchValue={filters.search}
                onSearchChange={(v) => setFilters({ ...filters, search: v })}
                searchKey="description"
                searchPlaceholder="Search giving..."
              />
            )}
          </CardContent>
        </Card>
      </LazyLoader>

      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDelete(deleteDialog.itemToDelete)}
        title="Delete Giving Record"
        description="Are you sure you want to delete this giving record? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.description || deleteDialog.itemToDelete?.receiptNumber}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
