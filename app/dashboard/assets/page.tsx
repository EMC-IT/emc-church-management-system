'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Package,
  TrendingUp,
  Calendar,
  PieChart,
  FileText,
  ArrowRight,
  Wrench,
  Tag,
  BarChart3,
  Users,
  AlertTriangle,
  Clock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnDef } from '@tanstack/react-table';
import { Asset, AssetStatus, AssetCondition, AssetCategory } from '@/lib/types/assets';

// Mock data for assets overview
const assetStats = {
  totalAssets: 156,
  totalValue: 485000,
  activeAssets: 142,
  maintenanceNeeded: 8,
  averageValue: 3109.62,
  categoriesCount: 12,
  warrantyExpiring: 5
};

const quickActions = [
  {
    title: 'Add Asset',
    description: 'Register new asset',
    href: '/dashboard/assets/add',
    icon: Plus,
    color: 'bg-brand-primary'
  },
  {
    title: 'Categories',
    description: 'Manage asset categories',
    href: '/dashboard/assets/categories',
    icon: Tag,
    color: 'bg-brand-secondary'
  },
  {
    title: 'Maintenance',
    description: 'Schedule maintenance',
    href: '/dashboard/assets/maintenance',
    icon: Wrench,
    color: 'bg-brand-accent'
  },
  {
    title: 'Reports',
    description: 'View asset reports',
    href: '/dashboard/assets/reports',
    icon: BarChart3,
    color: 'bg-brand-success'
  }
];

const recentAssets: Asset[] = [
  {
    id: '1',
    name: 'Sound Mixing Console',
    description: 'Digital mixing console for main sanctuary',
    category: AssetCategory.AUDIO_VISUAL,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.EXCELLENT,
    priority: 'high' as any,
    purchasePrice: 25000,
    currentValue: 22000,
    currency: 'GHS',
    location: 'Main Sanctuary',
    assignedDepartment: 'Media Ministry',
    purchaseDate: '2023-08-15',
    warrantyExpiry: '2025-08-15',
    manufacturer: 'Yamaha',
    model: 'CL5',
    serialNumber: 'YM2023CL5001',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-08-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Church Van',
    description: '15-seater van for transportation',
    category: AssetCategory.VEHICLES,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.GOOD,
    priority: 'high' as any,
    purchasePrice: 180000,
    currentValue: 150000,
    currency: 'GHS',
    location: 'Church Parking',
    assignedDepartment: 'Transportation',
    purchaseDate: '2022-03-10',
    warrantyExpiry: '2025-03-10',
    manufacturer: 'Toyota',
    model: 'Hiace',
    serialNumber: 'TH2022HC001',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2022-03-10T09:00:00Z',
    updatedAt: '2024-01-10T11:20:00Z'
  },
  {
    id: '3',
    name: 'Projector - Main Hall',
    description: 'High-definition projector for presentations',
    category: AssetCategory.AUDIO_VISUAL,
    status: AssetStatus.MAINTENANCE,
    condition: AssetCondition.FAIR,
    priority: 'medium' as any,
    purchasePrice: 8500,
    currentValue: 6000,
    currency: 'GHS',
    location: 'Main Hall',
    assignedDepartment: 'Media Ministry',
    purchaseDate: '2021-11-20',
    warrantyExpiry: '2023-11-20',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-02-05',
    manufacturer: 'Epson',
    model: 'EB-2250U',
    serialNumber: 'EP2021EB001',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2021-11-20T15:00:00Z',
    updatedAt: '2024-01-05T16:45:00Z'
  },
  {
    id: '4',
    name: 'Office Chairs Set',
    description: 'Ergonomic office chairs for admin office',
    category: AssetCategory.FURNITURE,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.GOOD,
    priority: 'low' as any,
    purchasePrice: 3200,
    currentValue: 2400,
    currency: 'GHS',
    location: 'Administrative Office',
    assignedDepartment: 'Administration',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2025-01-15',
    manufacturer: 'Herman Miller',
    model: 'Aeron',
    serialNumber: 'HM2023AR001',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-12-20T10:15:00Z'
  },
  {
    id: '5',
    name: 'Piano - Sanctuary',
    description: 'Grand piano for worship services',
    category: AssetCategory.MUSICAL_INSTRUMENTS,
    status: AssetStatus.ACTIVE,
    condition: AssetCondition.EXCELLENT,
    priority: 'critical' as any,
    purchasePrice: 95000,
    currentValue: 88000,
    currency: 'GHS',
    location: 'Main Sanctuary',
    assignedDepartment: 'Music Ministry',
    purchaseDate: '2020-06-01',
    warrantyExpiry: '2025-06-01',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-06-15',
    manufacturer: 'Steinway & Sons',
    model: 'Model M',
    serialNumber: 'SS2020MM001',
    createdBy: 'admin',
    updatedBy: 'admin',
    createdAt: '2020-06-01T14:00:00Z',
    updatedAt: '2023-12-15T13:30:00Z'
  }
];

export default function AssetsOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.ACTIVE:
        return <Badge variant="default" className="bg-brand-success">Active</Badge>;
      case AssetStatus.MAINTENANCE:
        return <Badge variant="secondary" className="bg-brand-accent">Maintenance</Badge>;
      case AssetStatus.RETIRED:
        return <Badge variant="outline">Retired</Badge>;
      case AssetStatus.DAMAGED:
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: AssetCondition) => {
    switch (condition) {
      case AssetCondition.EXCELLENT:
        return <Badge variant="default" className="bg-brand-success">Excellent</Badge>;
      case AssetCondition.GOOD:
        return <Badge variant="default" className="bg-brand-secondary">Good</Badge>;
      case AssetCondition.FAIR:
        return <Badge variant="secondary">Fair</Badge>;
      case AssetCondition.POOR:
        return <Badge variant="destructive">Poor</Badge>;
      case AssetCondition.DAMAGED:
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case AssetCategory.AUDIO_VISUAL:
        return <Package className="h-4 w-4" />;
      case AssetCategory.VEHICLES:
        return <Package className="h-4 w-4" />;
      case AssetCategory.FURNITURE:
        return <Package className="h-4 w-4" />;
      case AssetCategory.MUSICAL_INSTRUMENTS:
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'name',
      header: 'Asset',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getCategoryIcon(asset.category)}
            </div>
            <div>
              <div className="font-medium">{asset.name}</div>
              <div className="text-sm text-muted-foreground">{asset.serialNumber}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as AssetCategory;
        return <Badge variant="outline">{category.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as AssetStatus;
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => {
        const condition = row.getValue('condition') as AssetCondition;
        return getConditionBadge(condition);
      },
    },
    {
      accessorKey: 'currentValue',
      header: 'Current Value',
      cell: ({ row }) => {
        const value = row.getValue('currentValue') as number;
        return (
          <div className="font-medium">
            {formatCurrency(value)}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return <div className="text-sm">{location}</div>;
      },
    },
    {
      accessorKey: 'assignedDepartment',
      header: 'Department',
      cell: ({ row }) => {
        const department = row.getValue('assignedDepartment') as string;
        return department ? (
          <Badge variant="outline">{department}</Badge>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
            >
              View
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/assets/${asset.id}/edit`)}
            >
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground">
            Manage church assets, equipment, and inventory
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/assets/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.totalAssets}</div>
              <p className="text-xs text-muted-foreground">
                {assetStats.categoriesCount} categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(assetStats.totalValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(assetStats.averageValue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assetStats.activeAssets}</div>
              <p className="text-xs text-muted-foreground">
                {((assetStats.activeAssets / assetStats.totalAssets) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {assetStats.maintenanceNeeded + assetStats.warrantyExpiring}
              </div>
              <p className="text-xs text-muted-foreground">
                {assetStats.maintenanceNeeded} maintenance, {assetStats.warrantyExpiring} warranty
              </p>
            </CardContent>
          </Card>
        </div>
      </LazySection>

      {/* Quick Actions */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common asset management tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`rounded-md p-2 ${action.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-brand-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Recent Assets Table */}
      <LazySection>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Assets</CardTitle>
                <CardDescription>
                  Latest registered assets and their status
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/assets/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentAssets}
              searchKey="name"
              searchPlaceholder="Search assets..."
            />
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}