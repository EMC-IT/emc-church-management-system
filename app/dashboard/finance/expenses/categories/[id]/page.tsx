'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  Tag,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Calendar,
  Wallet,
  Receipt,
  MoreHorizontal,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Types
interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  color: string;
  expenseCount: number;
  totalAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: Date;
  vendor: string;
  paymentMethod: string;
  receiptNumber?: string;
  description?: string;
  createdAt: Date;
}

// Mock category data
const mockCategory: ExpenseCategory = {
  id: '5',
  name: 'Office Supplies',
  description: 'Paper, pens, printer supplies, and office equipment',
  color: '#6B7280',
  expenseCount: 8,
  totalAmount: 1250.00,
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-05'),
};

// Mock expenses data for this category
const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Printer Paper & Cartridges',
    amount: 245.50,
    date: new Date('2024-01-15'),
    vendor: 'Office Depot',
    paymentMethod: 'credit-card',
    receiptNumber: 'REC-2024-001',
    description: 'Monthly office supplies including paper and printer cartridges',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Stationery Supplies',
    amount: 89.99,
    date: new Date('2024-01-12'),
    vendor: 'Staples',
    paymentMethod: 'debit-card',
    receiptNumber: 'REC-2024-002',
    description: 'Pens, pencils, notebooks, and folders',
    createdAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    title: 'Desk Organizers',
    amount: 156.75,
    date: new Date('2024-01-10'),
    vendor: 'Amazon Business',
    paymentMethod: 'credit-card',
    receiptNumber: 'REC-2024-003',
    description: 'Desk organizers and filing cabinets for admin office',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    title: 'Whiteboard Markers',
    amount: 34.99,
    date: new Date('2024-01-08'),
    vendor: 'Office Max',
    paymentMethod: 'cash',
    description: 'Dry erase markers for meeting rooms',
    createdAt: new Date('2024-01-08'),
  },
  {
    id: '5',
    title: 'Copy Paper Bulk Order',
    amount: 189.00,
    date: new Date('2024-01-05'),
    vendor: 'Costco Business',
    paymentMethod: 'check',
    receiptNumber: 'REC-2024-004',
    description: 'Bulk order of copy paper for quarterly supply',
    createdAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    title: 'Binders & Folders',
    amount: 67.25,
    date: new Date('2024-01-03'),
    vendor: 'Office Depot',
    paymentMethod: 'credit-card',
    description: 'Three-ring binders and manila folders',
    createdAt: new Date('2024-01-03'),
  },
  {
    id: '7',
    title: 'Laminator & Supplies',
    amount: 298.50,
    date: new Date('2024-01-02'),
    vendor: 'Best Buy Business',
    paymentMethod: 'credit-card',
    receiptNumber: 'REC-2024-005',
    description: 'Laminator machine and laminating pouches',
    createdAt: new Date('2024-01-02'),
  },
  {
    id: '8',
    title: 'Desk Supplies Kit',
    amount: 168.02,
    date: new Date('2024-01-01'),
    vendor: 'Staples',
    paymentMethod: 'debit-card',
    description: 'Complete desk supplies kit for new staff member',
    createdAt: new Date('2024-01-01'),
  },
];

const paymentMethods = {
  'cash': 'Cash',
  'check': 'Check',
  'credit-card': 'Credit Card',
  'debit-card': 'Debit Card',
  'bank-transfer': 'Bank Transfer',
  'online-payment': 'Online Payment',
};

export default function ExpenseCategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [category, setCategory] = useState<ExpenseCategory | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'this-month' | 'last-month' | 'this-year'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Simulate loading category and expenses data
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategory(mockCategory);
        setExpenses(mockExpenses);
      } catch (error) {
        console.error('Error loading category data:', error);
        toast.error('Failed to load category details');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  // Filter expenses based on search and date
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      let matchesDate = true;
      const now = new Date();
      const expenseDate = expense.date;

      if (dateFilter === 'this-month') {
        matchesDate = expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear();
      } else if (dateFilter === 'last-month') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        matchesDate = expenseDate.getMonth() === lastMonth.getMonth() &&
          expenseDate.getFullYear() === lastMonth.getFullYear();
      } else if (dateFilter === 'this-year') {
        matchesDate = expenseDate.getFullYear() === now.getFullYear();
      }

      return matchesSearch && matchesDate;
    });
  }, [expenses, searchTerm, dateFilter]);

  const handleDeleteCategory = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success('Category deleted successfully!');
      router.push('/dashboard/finance/expenses/categories');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExpenses = () => {
    // Simulate export functionality
    toast.success('Expenses exported successfully!');
  };

  if (isLoading || !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <LazyLoader className="h-12 w-12 rounded-lg">
            <div className="h-12 w-12 rounded-lg bg-gray-200 animate-pulse" />
          </LazyLoader>
          <div className="space-y-2">
            <LazyLoader className="h-8 w-64">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
            </LazyLoader>
            <LazyLoader className="h-4 w-48">
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            </LazyLoader>
          </div>
        </div>
        <LazyLoader className="h-96 w-full rounded-lg">
          <div className="h-96 w-full rounded-lg bg-gray-200 animate-pulse" />
        </LazyLoader>
      </div>
    );
  }

  // Calculate statistics
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const avgExpenseAmount = filteredExpenses.length > 0 ? filteredTotal / filteredExpenses.length : 0;
  const thisMonthExpenses = expenses.filter(expense => {
    const now = new Date();
    return expense.date.getMonth() === now.getMonth() &&
      expense.date.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const columns = [
    {
      accessorKey: 'title',
      header: 'Expense',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as Expense;
        return (
          <div>
            <div className="font-medium">{expense.title}</div>
            <div className="text-sm text-gray-500">{expense.vendor}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as Expense;
        return (
          <div className="text-right font-medium text-brand-primary">
            ₵{expense.amount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as Expense;
        return (
          <div className="text-sm">
            {format(expense.date, 'MMM dd, yyyy')}
          </div>
        );
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Payment',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as Expense;
        return (
          <Badge variant="outline">
            {paymentMethods[expense.paymentMethod as keyof typeof paymentMethods] || expense.paymentMethod}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const expense = row.original as Expense;
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
                <Link href={`/dashboard/finance/expenses/${expense.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/expenses/${expense.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Expense
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/finance/expenses/categories')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
            <Tag className="h-6 w-6" style={{ color: category.color }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-600">{category.description || 'Category details and expenses'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExpenses}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/finance/expenses/categories/${category.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{category.name}"? This action cannot be undone and will affect {category.expenseCount} expense records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCategory}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Category'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Category Information */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  Color
                </div>
                <div className="font-medium">{category.color}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-500">Status</div>
                <Badge
                  variant={category.isActive ? 'default' : 'secondary'}
                  className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-500">Created</div>
                <div className="font-medium">{format(category.createdAt, 'MMM dd, yyyy')}</div>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="font-medium">{format(category.updatedAt, 'MMM dd, yyyy')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Statistics */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold">{category.expenseCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
                  <Wallet className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-brand-primary">
                    ₵{category.totalAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Amount</p>
                  <p className="text-2xl font-bold">
                    ₵{avgExpenseAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">
                    ₵{thisMonthTotal.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      {/* Expenses List */}
      <LazySection>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Category Expenses</CardTitle>
                <CardDescription>
                  All expenses recorded under this category
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/dashboard/finance/expenses/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Summary */}
            {(searchTerm || dateFilter !== 'all') && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Showing {filteredExpenses.length} of {expenses.length} expenses
                  </span>
                  <span className="font-medium">
                    Total: ₵{filteredTotal.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={filteredExpenses}
              searchKey="title"
              searchPlaceholder="Search expenses..."
            />
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}