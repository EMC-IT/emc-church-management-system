'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Tag, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Filter,
  Eye,
  Wallet
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
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

// Mock expense categories data
const mockCategories: ExpenseCategory[] = [
  {
    id: '1',
    name: 'Salaries & Benefits',
    description: 'Staff salaries, benefits, and payroll expenses',
    color: '#2E8DB0',
    expenseCount: 24,
    totalAmount: 45250.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Missions & Outreach',
    description: 'Missionary support, outreach programs, and evangelism',
    color: '#28ACD1',
    expenseCount: 18,
    totalAmount: 12800.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Building Maintenance',
    description: 'Facility repairs, maintenance, and improvements',
    color: '#C49831',
    expenseCount: 15,
    totalAmount: 8950.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '4',
    name: 'Utilities',
    description: 'Electric, water, gas, internet, and phone bills',
    color: '#A5CF5D',
    expenseCount: 12,
    totalAmount: 3450.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-08'),
  },
  {
    id: '5',
    name: 'Office Supplies',
    description: 'Paper, pens, printer supplies, and office equipment',
    color: '#6B7280',
    expenseCount: 8,
    totalAmount: 1250.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    name: 'Technology & Equipment',
    description: 'Computers, software, AV equipment, and tech services',
    color: '#8B5CF6',
    expenseCount: 6,
    totalAmount: 5600.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '7',
    name: 'Insurance',
    description: 'Property, liability, and other insurance premiums',
    color: '#EF4444',
    expenseCount: 4,
    totalAmount: 2800.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '8',
    name: 'Transportation',
    description: 'Vehicle expenses, fuel, and travel costs',
    color: '#F59E0B',
    expenseCount: 10,
    totalAmount: 1850.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-11'),
  },
  {
    id: '9',
    name: 'Events & Programs',
    description: 'Special events, programs, and ministry activities',
    color: '#EC4899',
    expenseCount: 14,
    totalAmount: 4200.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-13'),
  },
  {
    id: '10',
    name: 'Marketing & Communications',
    description: 'Website, printing, advertising, and communication tools',
    color: '#10B981',
    expenseCount: 7,
    totalAmount: 950.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-09'),
  },
  {
    id: '11',
    name: 'Professional Services',
    description: 'Legal, accounting, consulting, and professional fees',
    color: '#6366F1',
    expenseCount: 5,
    totalAmount: 3200.00,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-07'),
  },
  {
    id: '12',
    name: 'Miscellaneous',
    description: 'Other expenses that don\'t fit specific categories',
    color: '#64748B',
    expenseCount: 3,
    totalAmount: 450.00,
    isActive: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  },
];

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Filter and search categories
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesFilter = filterStatus === 'all' || 
                           (filterStatus === 'active' && category.isActive) ||
                           (filterStatus === 'inactive' && !category.isActive);
      
      return matchesSearch && matchesFilter;
    });
  }, [categories, searchTerm, filterStatus]);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      toast.success('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      ));
      toast.success('Category status updated successfully!');
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary statistics
  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalExpenses = categories.reduce((sum, cat) => sum + cat.expenseCount, 0);
  const totalAmount = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);

  const columns = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }: { row: any }) => {
        const category = row.original as ExpenseCategory;
        return (
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-500 truncate max-w-xs">
                  {category.description}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'expenseCount',
      header: 'Expenses',
      cell: ({ row }: { row: any }) => {
        const category = row.original as ExpenseCategory;
        return (
          <div className="text-center">
            <div className="font-medium">{category.expenseCount}</div>
            <div className="text-xs text-gray-500">records</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }: { row: any }) => {
        const category = row.original as ExpenseCategory;
        return (
          <div className="text-right">
            <div className="font-medium text-brand-primary">
              ₵{category.totalAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }: { row: any }) => {
        const category = row.original as ExpenseCategory;
        return (
          <Badge 
            variant={category.isActive ? 'default' : 'secondary'}
            className={category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: any }) => {
        const category = row.original as ExpenseCategory;
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
                <Link href={`/dashboard/finance/expenses/categories/${category.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/expenses/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleToggleStatus(category.id)}
                disabled={isLoading}
              >
                <Tag className="mr-2 h-4 w-4" />
                {category.isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Category
                  </DropdownMenuItem>
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
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Category
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <Tag className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Categories</h1>
            <p className="text-gray-600">Manage and organize expense categories</p>
          </div>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/finance/expenses/categories/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Summary Statistics */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Tag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-bold">{totalCategories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Tag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Categories</p>
                  <p className="text-2xl font-bold">{activeCategories}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold">{totalExpenses}</p>
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
                    ₵{totalAmount.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      {/* Categories Table */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle>Categories List</CardTitle>
            <CardDescription>
              Manage your expense categories and track spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={filteredCategories}
              searchKey="name"
              searchPlaceholder="Search categories..."
            />
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}