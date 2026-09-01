'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  MoreHorizontal,
  Eye,
  Download,
  ArrowLeft,
  Tag,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { toast } from 'sonner';
import { assetService } from '@/services';
import { AssetCategoryData } from '@/lib/types/assets';

interface CategoryWithStats extends AssetCategoryData {
  assetCount: number;
  totalValue: number;
  isActive: boolean;
}

const INITIAL_CATEGORY_STATS: CategoryWithStats[] = [
  {
    id: 'cat-av',
    name: 'Audio Visual Equipment',
    description: 'Sound systems, microphones, speakers, mixing consoles, and video equipment',
    color: '#2E8DB0',
    icon: 'Tv',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 15,
    assetCount: 3,
    totalValue: 48000,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-vehicles',
    name: 'Vehicles & Transport',
    description: 'Church vans, buses, and logistics vehicles',
    color: '#C49831',
    icon: 'Car',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 15,
    assetCount: 1,
    totalValue: 150000,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-instruments',
    name: 'Musical Instruments',
    description: 'Pianos, keyboards, drum kits, guitars, and orchestral gear',
    color: '#A5CF5D',
    icon: 'Music',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 10,
    assetCount: 1,
    totalValue: 88000,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-furniture',
    name: 'Furniture & Fixtures',
    description: 'Sanctuary seating, executive desks, communion tables, podiums, and chairs',
    color: '#8E44AD',
    icon: 'Armchair',
    requiresSerial: false,
    requiresWarranty: false,
    defaultDepreciationRate: 10,
    assetCount: 1,
    totalValue: 38000,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-equipment',
    name: 'Plant & Equipment',
    description: 'Generators, HVAC air conditioning, water treatment, and facility machines',
    color: '#E67E22',
    icon: 'Cpu',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 12,
    assetCount: 1,
    totalValue: 105000,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-tech',
    name: 'Technology & Computing',
    description: 'Computers, servers, network routers, tablets, and software appliances',
    color: '#3498DB',
    icon: 'Laptop',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 20,
    assetCount: 1,
    totalValue: 21500,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'cat-kitchen',
    name: 'Kitchen Appliances',
    description: 'Refrigerators, freezers, ovens, and fellowship catering equipment',
    color: '#E74C3C',
    icon: 'Coffee',
    requiresSerial: true,
    requiresWarranty: true,
    defaultDepreciationRate: 15,
    assetCount: 1,
    totalValue: 4500,
    isActive: true,
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

export default function CategoriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryWithStats[]>(INITIAL_CATEGORY_STATS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDeleteCategory = async () => {
    if (!deleteDialog.itemToDelete) return;
    try {
      setCategories((prev) => prev.filter((c) => c.id !== deleteDialog.itemToDelete?.id));
      toast.success('Category deleted successfully');
    } catch {
      toast.error('Failed to delete category');
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (filterStatus === 'active' && !c.isActive) return false;
      if (filterStatus === 'inactive' && c.isActive) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [categories, filterStatus, searchTerm]);

  const totalAssets = categories.reduce((sum, c) => sum + c.assetCount, 0);
  const totalValue = categories.reduce((sum, c) => sum + c.totalValue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Asset Categories" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={6} columns={6} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Asset Categories"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/dashboard/assets">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Assets
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/assets/categories/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Category
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Categories"
          value={categories.length}
          icon={Tag}
          accent="primary"
        />

        <StatCard
          title="Total Registered Assets"
          value={totalAssets}
          icon={Package}
          accent="accent"
        />

        <StatCard
          title="Total Category Valuation"
          value={formatCurrency(totalValue)}
          icon={Package}
          accent="success"
        />

        <StatCard
          title="Active Categories"
          value={categories.filter((c) => c.isActive).length}
          icon={Tag}
          accent="secondary"
        />
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">Categories</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9 w-60"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Status" />
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
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Assets</th>
                  <th className="py-3 px-4">Valuation</th>
                  <th className="py-3 px-4">Depreciation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color || '#2E8DB0' }} />
                        {cat.name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">
                      {cat.description}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="neutral">{cat.assetCount} assets</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                      {formatCurrency(cat.totalValue)}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {cat.defaultDepreciationRate || 10}% / yr
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/assets/categories/${cat.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/assets/categories/${cat.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteDialog.openDialog(cat)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? Assets under this category will need to be reassigned."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}