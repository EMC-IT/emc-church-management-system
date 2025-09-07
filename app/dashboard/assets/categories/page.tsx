'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  MoreHorizontal,
  Eye,
  Download,
  Upload,
  ArrowLeft,
  Folder
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { AssetCategory } from '@/lib/types/assets';

interface CategoryData {
  id: string;
  name: string;
  description: string;
  assetCount: number;
  totalValue: number;
  averageCondition: string;
  lastUpdated: string;
  isActive: boolean;
}

// Mock categories data
const mockCategories: CategoryData[] = [
  {
    id: '1',
    name: 'Audio Visual',
    description: 'Sound systems, microphones, speakers, mixing consoles, and video equipment',
    assetCount: 15,
    totalValue: 125000,
    averageCondition: 'Excellent',
    lastUpdated: '2024-01-15',
    isActive: true
  },
  {
    id: '2',
    name: 'Furniture',
    description: 'Chairs, tables, podiums, and other furniture items',
    assetCount: 45,
    totalValue: 85000,
    averageCondition: 'Good',
    lastUpdated: '2024-01-10',
    isActive: true
  },
  {
    id: '3',
    name: 'Technology',
    description: 'Computers, tablets, projectors, and other electronic devices',
    assetCount: 28,
    totalValue: 95000,
    averageCondition: 'Good',
    lastUpdated: '2024-01-12',
    isActive: true
  },
  {
    id: '4',
    name: 'Vehicles',
    description: 'Church buses, vans, and other transportation vehicles',
    assetCount: 3,
    totalValue: 180000,
    averageCondition: 'Fair',
    lastUpdated: '2024-01-08',
    isActive: true
  },
  {
    id: '5',
    name: 'Musical Instruments',
    description: 'Pianos, guitars, drums, and other musical instruments',
    assetCount: 22,
    totalValue: 65000,
    averageCondition: 'Excellent',
    lastUpdated: '2024-01-14',
    isActive: true
  },
  {
    id: '6',
    name: 'Kitchen Appliances',
    description: 'Refrigerators, ovens, coffee makers, and kitchen equipment',
    assetCount: 12,
    totalValue: 35000,
    averageCondition: 'Good',
    lastUpdated: '2024-01-09',
    isActive: true
  },
  {
    id: '7',
    name: 'Office Supplies',
    description: 'Printers, scanners, office furniture, and supplies',
    assetCount: 18,
    totalValue: 25000,
    averageCondition: 'Good',
    lastUpdated: '2024-01-11',
    isActive: true
  },
  {
    id: '8',
    name: 'Safety & Security',
    description: 'Fire extinguishers, security cameras, alarm systems',
    assetCount: 8,
    totalValue: 15000,
    averageCondition: 'Excellent',
    lastUpdated: '2024-01-13',
    isActive: true
  }
];

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');

  useEffect(() => {
    // Simulate API call to fetch categories
    const fetchCategories = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCategories(mockCategories);
        setFilteredCategories(mockCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Filter and sort categories
    let filtered = categories;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(category => {
        if (filterBy === 'active') return category.isActive;
        if (filterBy === 'inactive') return !category.isActive;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'assetCount':
          return b.assetCount - a.assetCount;
        case 'totalValue':
          return b.totalValue - a.totalValue;
        case 'lastUpdated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchTerm, sortBy, filterBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getConditionBadge = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'excellent':
        return <Badge className="bg-brand-success">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-brand-secondary">Good</Badge>;
      case 'fair':
        return <Badge variant="secondary">Fair</Badge>;
      case 'poor':
        return <Badge variant="destructive">Poor</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        toast.success('Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
      ));
      toast.success('Category status updated successfully!');
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Failed to update category status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const totalCategories = categories.length;
  const activeCategories = categories.filter(cat => cat.isActive).length;
  const totalAssets = categories.reduce((sum, cat) => sum + cat.assetCount, 0);
  const totalValue = categories.reduce((sum, cat) => sum + cat.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/dashboard/assets')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-primary/10">
            <Folder className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asset Categories</h1>
            <p className="text-gray-600">
              Manage and organize your asset categories
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/dashboard/assets/categories/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              {activeCategories} active categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Combined asset value
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Category</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCategories > 0 ? Math.round(totalAssets / totalCategories) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Assets per category
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage your asset categories and their properties
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="assetCount">Sort by Asset Count</SelectItem>
                  <SelectItem value="totalValue">Sort by Value</SelectItem>
                  <SelectItem value="lastUpdated">Sort by Updated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={category.isActive ? 'default' : 'secondary'}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {getConditionBadge(category.averageCondition)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/assets?category=${category.name}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/assets/categories/${category.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleStatus(category.id)}>
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Assets:</span>
                    <p className="font-semibold">{category.assetCount}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Total Value:</span>
                    <p className="font-semibold">{formatCurrency(category.totalValue)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Avg. Condition:</span>
                    <p className="font-semibold">{category.averageCondition}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Last Updated:</span>
                    <p className="font-semibold">{formatDate(category.lastUpdated)}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No categories found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterBy !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create your first asset category to get started'}
                </p>
                {(!searchTerm && filterBy === 'all') && (
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/assets/categories/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}