'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  BadgeCent,
  TrendingUp,
  Users,
  PieChart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingCategory } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Extended category interface for management
interface CategoryData {
  id: string;
  name: string;
  description: string;
  category: GivingCategory;
  totalAmount: number;
  transactionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock data for development
const mockCategories: CategoryData[] = [
  {
    id: '1',
    name: 'General Fund',
    description: 'General church operations and ministry',
    category: GivingCategory.GENERAL,
    totalAmount: 85000.00,
    transactionCount: 320,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Building Fund',
    description: 'Church building construction and maintenance',
    category: GivingCategory.BUILDING_FUND,
    totalAmount: 45000.00,
    transactionCount: 150,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-19T14:20:00Z'
  },
  {
    id: '3',
    name: 'Missionary Support',
    description: 'Support for missionaries and evangelism',
    category: GivingCategory.MISSIONARY,
    totalAmount: 25000.00,
    transactionCount: 85,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  },
  {
    id: '4',
    name: 'Youth Ministry',
    description: 'Youth programs and activities',
    category: GivingCategory.YOUTH,
    totalAmount: 15000.00,
    transactionCount: 65,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-17T16:45:00Z'
  },
  {
    id: '5',
    name: 'Children Ministry',
    description: 'Children programs and Sunday school',
    category: GivingCategory.CHILDREN,
    totalAmount: 8000.00,
    transactionCount: 45,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-16T11:30:00Z'
  },
  {
    id: '6',
    name: 'Music Ministry',
    description: 'Instruments, sound equipment, and choir',
    category: GivingCategory.MUSIC,
    totalAmount: 12000.00,
    transactionCount: 35,
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T13:20:00Z'
  },
  {
    id: '7',
    name: 'Outreach Programs',
    description: 'Community outreach and evangelism',
    category: GivingCategory.OUTREACH,
    totalAmount: 6000.00,
    transactionCount: 25,
    isActive: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-14T08:10:00Z'
  }
];

export default function GivingCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>(mockCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const response = await givingService.getGivingCategories();
        // setCategories(response);
        setCategories(mockCategories);
      } catch (err: any) {
        setError(err.message || 'Failed to load categories');
        toast({
          title: 'Error',
          description: 'Failed to load giving categories',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [toast]);

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // await givingService.deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete category',
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

  const getCategoryIcon = (category: GivingCategory) => {
    switch (category) {
      case GivingCategory.GENERAL:
        return <BadgeCent className="h-4 w-4 text-blue-500" />;
      case GivingCategory.BUILDING_FUND:
        return <PieChart className="h-4 w-4 text-green-500" />;
      case GivingCategory.MISSIONARY:
        return <Users className="h-4 w-4 text-purple-500" />;
      case GivingCategory.YOUTH:
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <BadgeCent className="h-4 w-4 text-gray-500" />;
    }
  };

  const columns: ColumnDef<CategoryData>[] = [
    {
      accessorKey: 'name',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center space-x-3">
            {getCategoryIcon(category.category)}
            <div>
              <div className="font-medium">{category.name}</div>
              <div className="text-sm text-muted-foreground">{category.description}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'transactionCount',
      header: 'Transactions',
      cell: ({ row }) => {
        const count = row.getValue('transactionCount') as number;
        return <div className="text-center">{count}</div>;
      },
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
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => {
        const date = new Date(row.getValue('updatedAt'));
        return <div className="text-sm">{date.toLocaleDateString()}</div>;
      },
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/finance/giving/categories/${category.id}`)}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/finance/giving/categories/${category.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
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
                      and remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteCategory(category.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
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

  // Calculate summary statistics
  const totalAmount = categories.reduce((sum, cat) => sum + cat.totalAmount, 0);
  const totalTransactions = categories.reduce((sum, cat) => sum + cat.transactionCount, 0);
  const activeCategories = categories.filter(cat => cat.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giving Categories</h1>
          <p className="text-muted-foreground">Manage and organize giving categories</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/giving/categories/add">
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
        skeletonCount={3}
        className="grid gap-4 md:grid-cols-3"
        threshold={0.1}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeCategories} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </LazySection>

      {/* Categories Table */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              Manage giving categories and view their performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton 
                rows={7} 
                columns={6} 
                showHeader 
                showPagination 
              />
            ) : (
              <DataTable
                columns={columns}
                data={categories}
                searchKey="name"
                searchPlaceholder="Search categories..."
              />
            )}
          </CardContent>
        </Card>
      </LazyLoader>
    </div>
  );
}