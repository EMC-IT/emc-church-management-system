'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  BadgeCent,
  TrendingUp,
  Calendar,
  FileText,
  MoreHorizontal,
  Eye,
  Filter,
  Download
} from 'lucide-react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { toast } from 'sonner';

// Types
interface IncomeCategory {
  id: string;
  name: string;
  description: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IncomeRecord {
  id: string;
  description: string;
  amount: number;
  source: string;
  date: string;
  status: 'received' | 'pending' | 'cancelled';
  reference?: string;
  notes?: string;
  createdAt: string;
}

// Mock data
const mockCategory: IncomeCategory = {
  id: '1',
  name: 'Hall Rental',
  description: 'Income from facility rentals for events and ceremonies',
  code: 'HALL_RENTAL',
  isActive: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

const mockIncomeRecords: IncomeRecord[] = [
  {
    id: '1',
    description: 'Wedding Ceremony - Johnson Family',
    amount: 2500,
    source: 'Johnson Family',
    date: '2024-01-15',
    status: 'received',
    reference: 'INV-2024-001',
    notes: 'Full day rental including sound system',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    description: 'Corporate Event - Tech Solutions Ltd',
    amount: 1800,
    source: 'Tech Solutions Ltd',
    date: '2024-01-12',
    status: 'received',
    reference: 'INV-2024-002',
    createdAt: '2024-01-12T14:20:00Z'
  },
  {
    id: '3',
    description: 'Birthday Party - Smith Family',
    amount: 800,
    source: 'Smith Family',
    date: '2024-01-10',
    status: 'received',
    reference: 'INV-2024-003',
    createdAt: '2024-01-10T09:15:00Z'
  },
  {
    id: '4',
    description: 'Community Meeting - Local Council',
    amount: 500,
    source: 'Local Council',
    date: '2024-01-08',
    status: 'pending',
    reference: 'INV-2024-004',
    createdAt: '2024-01-08T16:45:00Z'
  },
  {
    id: '5',
    description: 'Graduation Ceremony - ABC School',
    amount: 1200,
    source: 'ABC School',
    date: '2024-01-05',
    status: 'received',
    reference: 'INV-2024-005',
    createdAt: '2024-01-05T11:30:00Z'
  }
];

export default function IncomeCategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [category, setCategory] = useState<IncomeCategory>(mockCategory);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(mockIncomeRecords);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setCategory(mockCategory);
      setIncomeRecords(mockIncomeRecords);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [params.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="default" className="bg-brand-success">Received</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Category deleted successfully!');
      router.push('/dashboard/finance/income/categories');
    } catch (error) {
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Table columns
  const columns: ColumnDef<IncomeRecord>[] = [
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const record = row.original;
        return (
          <div>
            <div className="font-medium">{record.description}</div>
            <div className="text-sm text-muted-foreground">
              {record.source}
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('amount'))}
        </div>
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.getValue('date')).toLocaleDateString()}
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.getValue('status'))
    },
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) => {
        const reference = row.getValue('reference') as string;
        return reference ? (
          <span className="font-mono text-sm">{reference}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const record = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/income/${record.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/income/${record.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Record
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: incomeRecords,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      globalFilter
    }
  });

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalIncome = incomeRecords.reduce((sum, record) =>
      record.status === 'received' ? sum + record.amount : sum, 0
    );
    const pendingIncome = incomeRecords.reduce((sum, record) =>
      record.status === 'pending' ? sum + record.amount : sum, 0
    );
    const recordCount = incomeRecords.length;
    const avgIncome = recordCount > 0 ? totalIncome / recordCount : 0;
    const lastIncomeDate = incomeRecords
      .filter(record => record.status === 'received')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;

    return {
      totalIncome,
      pendingIncome,
      recordCount,
      avgIncome,
      lastIncomeDate
    };
  }, [incomeRecords]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/finance/income/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
            <div>
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
            </div>
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-6">
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/finance/income/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">
              Category details and income records
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/finance/income/categories/${category.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Export Records
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="text-red-600"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the category
                    "{category.name}" and all associated income records.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category Information */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={1}
        threshold={0.1}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Category Information
              </span>
              <Badge variant={category.isActive ? 'default' : 'secondary'}>
                {category.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </CardTitle>
            <CardDescription>
              Details about this income category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{category.description}</p>
              </div>

              {category.code && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category Code</label>
                  <p className="text-sm font-mono">{category.code}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm">{new Date(category.createdAt).toLocaleDateString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{new Date(category.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Statistics Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        threshold={0.1}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Received income only
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(statistics.pendingIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting receipt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.recordCount}</div>
            <p className="text-xs text-muted-foreground">
              Total entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Income</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.lastIncomeDate
                ? new Date(statistics.lastIncomeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'None'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent
            </p>
          </CardContent>
        </Card>
      </LazySection>

      {/* Income Records Table */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="table"
        skeletonCount={5}
        threshold={0.1}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Income Records</CardTitle>
                <CardDescription>
                  All income records for this category
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/finance/income/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Income
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <Input
                  placeholder="Search income records..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            {/* Data Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No income records found for this category.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {table.getFilteredRowModel().rows.length} of{' '}
                {incomeRecords.length} records
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}