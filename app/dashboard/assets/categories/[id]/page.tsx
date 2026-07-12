'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Package,
  Banknote,
  Calendar,
  MapPin,
  User,
  ArrowLeft,
  MoreHorizontal,
  Eye
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { LazySection } from '@/components/ui/lazy-section';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';

// Asset data interface
interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  condition: string;
  status: string;
  location: string;
  assignedTo: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  lastMaintenance: string;
}

// Mock category data
const categoryData = {
  id: '1',
  name: 'Audio/Visual Equipment',
  description: 'Sound systems, projectors, cameras, and related audio-visual equipment for church services and events',
  color: '#2E8DB0',
  assetCount: 45,
  totalValue: 125000,
  averageAge: 2.8,
  activeAssets: 42,
  maintenanceAssets: 2,
  retiredAssets: 1,
  createdAt: '2023-01-15',
  updatedAt: '2024-01-10'
};

// Mock assets in this category
const categoryAssets: Asset[] = [
  {
    id: '1',
    name: 'Main Sanctuary Sound System',
    serialNumber: 'SND-2023-001',
    condition: 'Excellent',
    status: 'Active',
    location: 'Main Sanctuary',
    assignedTo: 'Media Team',
    purchasePrice: 25000,
    currentValue: 22000,
    purchaseDate: '2023-03-15',
    lastMaintenance: '2024-01-05'
  },
  {
    id: '2',
    name: 'Wireless Microphone Set (6 units)',
    serialNumber: 'MIC-2023-002',
    condition: 'Good',
    status: 'Active',
    location: 'Main Sanctuary',
    assignedTo: 'Worship Team',
    purchasePrice: 3500,
    currentValue: 2800,
    purchaseDate: '2023-04-20',
    lastMaintenance: '2023-12-15'
  },
  {
    id: '3',
    name: 'LED Projector - Main Screen',
    serialNumber: 'PRJ-2023-003',
    condition: 'Good',
    status: 'Active',
    location: 'Main Sanctuary',
    assignedTo: 'Media Team',
    purchasePrice: 8500,
    currentValue: 6800,
    purchaseDate: '2023-02-10',
    lastMaintenance: '2024-01-08'
  },
  {
    id: '4',
    name: 'Camera System (3 cameras)',
    serialNumber: 'CAM-2023-004',
    condition: 'Excellent',
    status: 'Active',
    location: 'Main Sanctuary',
    assignedTo: 'Media Team',
    purchasePrice: 12000,
    currentValue: 10500,
    purchaseDate: '2023-05-12',
    lastMaintenance: '2023-11-20'
  },
  {
    id: '5',
    name: 'Portable PA System',
    serialNumber: 'PA-2023-005',
    condition: 'Fair',
    status: 'Maintenance',
    location: 'Storage Room',
    assignedTo: 'Youth Ministry',
    purchasePrice: 2200,
    currentValue: 1500,
    purchaseDate: '2023-06-08',
    lastMaintenance: '2024-01-12'
  }
];

export default function CategoryDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(categoryData);
  const [assets, setAssets] = useState(categoryAssets);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
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
      case 'Active':
        return <Badge variant="default" className="bg-brand-success">Active</Badge>;
      case 'Maintenance':
        return <Badge variant="secondary">Maintenance</Badge>;
      case 'Retired':
        return <Badge variant="outline">Retired</Badge>;
      case 'Disposed':
        return <Badge variant="destructive">Disposed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'Excellent':
        return <Badge variant="default" className="bg-brand-success">Excellent</Badge>;
      case 'Good':
        return <Badge variant="default" className="bg-brand-secondary">Good</Badge>;
      case 'Fair':
        return <Badge variant="secondary">Fair</Badge>;
      case 'Poor':
        return <Badge variant="destructive">Poor</Badge>;
      case 'Damaged':
        return <Badge variant="destructive">Damaged</Badge>;
      default:
        return <Badge variant="outline">{condition}</Badge>;
    }
  };

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'name',
      header: 'Asset Name',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div>
            <div className="font-medium">{asset.name}</div>
            <div className="text-sm text-muted-foreground">{asset.serialNumber}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => {
        const condition = row.getValue('condition') as string;
        return getConditionBadge(condition);
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return getStatusBadge(status);
      },
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const location = row.getValue('location') as string;
        return (
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{location}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => {
        const assignedTo = row.getValue('assignedTo') as string;
        return (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{assignedTo}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'currentValue',
      header: 'Current Value',
      cell: ({ row }) => {
        const value = row.getValue('currentValue') as number;
        return (
          <div className="font-medium">{formatCurrency(value)}</div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/assets/${asset.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/assets/${asset.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/assets/categories')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Button>
          <PageHeader title={category.name} description={category.description} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => router.push('/dashboard/assets/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/assets/categories/${category.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Category
          </Button>
        </div>
      </div>

      {/* Category Overview */}
      <LazySection>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Assets"
            value={category.assetCount}
            icon={Package}
            accent="primary"
            description={`${category.activeAssets} active`}
          />

          <StatCard
            title="Total Value"
            value={formatCurrency(category.totalValue)}
            icon={Banknote}
            accent="secondary"
            description="Current market value"
          />

          <StatCard
            title="Average Age"
            value={`${category.averageAge} years`}
            icon={Calendar}
            accent="success"
            description="Across all assets"
          />

          <StatCard
            title="Maintenance"
            value={category.maintenanceAssets}
            icon={Package}
            accent="accent"
            description="Assets under maintenance"
          />
        </div>
      </LazySection>

      {/* Category Details */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-sm font-medium">Category Name</div>
                <div className="text-sm text-muted-foreground">{category.name}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <div className="text-sm text-muted-foreground">{category.description}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Created Date</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(category.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </LazySection>

      {/* Assets in Category */}
      <LazySection>
        <Card>
          <CardHeader>
            <CardTitle>Assets in {category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={assets}
              recordLabel="asset"
              searchKey="name"
              searchPlaceholder="Search assets..."
            />
          </CardContent>
        </Card>
      </LazySection>
    </div>
  );
}
