'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BadgeCent,
  TrendingUp,
  Calendar,
  FileText
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
  ColumnFiltersState,
  VisibilityState
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { toast } from 'sonner';

// Types
interface IncomeCategory {
  id: string;
  name: string;
  description: string;
  totalIncome: number;
  recordCount: number;
  lastIncomeDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockCategories: IncomeCategory[] = [
  {
    id: '1',
    name: 'Hall Rental',
    description: 'Income from facility rentals for events and ceremonies',
    totalIncome: 45000,
    recordCount: 18,
    lastIncomeDate: '2024-01-15',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Book Sales',
    description: 'Revenue from religious books, materials, and publications',
    totalIncome: 12500,
    recordCount: 45,
    lastIncomeDate: '2024-01-12',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-12T14:20:00Z'
  },
  {
    id: '3',
    name: 'Grants',
    description: 'Government and foundation grants for community programs',
    totalIncome: 75000,
    recordCount: 5,
    lastIncomeDate: '2023-12-20',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-20T09:15:00Z'
  },
  {
    id: '4',
    name: 'Fundraising Events',
    description: 'Income from organized fundraising activities and campaigns',
    totalIncome: 28750,
    recordCount: 12,
    lastIncomeDate: '2024-01-08',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-08T16:45:00Z'
  },
  {
    id: '5',
    name: 'Parking Fees',
    description: 'Revenue from parking permits and daily parking fees',
    totalIncome: 8200,
    recordCount: 156,
    lastIncomeDate: '2024-01-14',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-14T18:30:00Z'
  },
  {
    id: '6',
    name: 'Investment Returns',
    description: 'Returns from church investments and endowment funds',
    totalIncome: 15600,
    recordCount: 4,
    lastIncomeDate: '2023-12-31',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-12-31T23:59:00Z'
  },
  {
    id: '7',
    name: 'Catering Services',
    description: 'Income from catering services for events (Inactive)',
    totalIncome: 5400,
    recordCount: 8,
    lastIncomeDate: '2023-08-15',
    isActive: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-08-15T12:00:00Z'
  }
];

export default function IncomeCategoriesPage() {
  const [categories, setCategories] = useState<IncomeCategory[]>(mockCategories);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const handleDelete = async (categoryId: string) => {
    setDeletingId(categoryId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleStatus = async (categoryId: string) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isActive: !cat.isActive, updatedAt: new Date().toISOString() }
          : cat
      ));
      
      const category = categories.find(cat => cat.id === categoryId);
      toast.success(`Category ${category?.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      toast.error('Failed to update category status.');
    }
  };

  // Table columns
  const columns: ColumnDef<IncomeCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category Name',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${
                category.isActive ? 'bg-brand-success' : 'bg-gray-400'
              }`} />
            </div>
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                {category.description}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'totalIncome',
      header: 'Total Income',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('totalIncome'))}
        </div>
      )
    },
    {
      accessorKey: 'recordCount',
      header: 'Records',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="outline">
            {row.getValue('recordCount')} records
          </Badge>
        </div>
      )
    },
    {
      accessorKey: 'lastIncomeDate',
      header: 'Last Income',
      cell: ({ row }) => {
        const date = row.getValue('lastIncomeDate') as string | null;
        return (
          <div className="text-sm">
            {date ? new Date(date).toLocaleDateString() : 'No income yet'}
          </div>
        );
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('isActive') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const category = row.original;
        
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
                <Link href={`/dashboard/finance/income/categories/${category.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/income/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toggleStatus(category.id)}>
                {category.isActive ? 'Deactivate' : 'Activate'}
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
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ];

  const table = useReactTable({
    data: categories,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter
    }
  });

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const activeCategories = categories.filter(cat => cat.isActive);
    const totalIncome = categories.reduce((sum, cat) => sum + cat.totalIncome, 0);
    const totalRecords = categories.reduce((sum, cat) => sum + cat.recordCount, 0);
    const avgIncomePerCategory = activeCategories.length > 0 
      ? totalIncome / activeCategories.length 
      : 0;

    return {
      totalCategories: categories.length,
      activeCategories: activeCategories.length,
      totalIncome,
      totalRecords,
      avgIncomePerCategory
    };
  }, [categories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income Categories</h1>
          <p className="text-muted-foreground">
            Manage income categories and track revenue sources
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/income/categories/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
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
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.activeCategories} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryStats.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Total income entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Category</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summaryStats.avgIncomePerCategory)}
            </div>
            <p className="text-xs text-muted-foreground">
              Active categories only
            </p>
          </CardContent>
        </Card>
      </LazySection>

      {/* Categories Table */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="table"
        skeletonCount={5}
        threshold={0.1}
      >
        <Card>
          <CardHeader>
            <CardTitle>Categories List</CardTitle>
            <CardDescription>
              Manage your income categories and track their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search categories..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
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
                        No categories found.
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
                {categories.length} categories
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