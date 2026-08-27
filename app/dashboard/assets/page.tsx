'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Package,
  TrendingUp,
  Wrench,
  Tag,
  BarChart3,
  Users,
  AlertTriangle,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText,
  MoreHorizontal,
  ArrowRight,
  Filter,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { LazySection } from '@/components/ui/lazy-section';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { assetService } from '@/services';
import { Asset, AssetStatus, AssetCondition, AssetCategory, AssetAnalytics } from '@/lib/types/assets';

export default function AssetsOverviewPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [needsAttentionOnly, setNeedsAttentionOnly] = useState<boolean>(false);

  const deleteDialog = useDeleteDialog();

  const loadData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        assetService.getAssets({ limit: 100 }),
        assetService.getAssetStats(),
      ]);
      setAssets(listRes.assets);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load assets', err);
      toast.error('Failed to load asset records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExport = async (formatType: string = 'csv') => {
    try {
      const blob = await assetService.exportAssets(
        {
          search: searchTerm || undefined,
          category: selectedCategory !== 'all' ? (selectedCategory as any) : undefined,
          status: selectedStatus !== 'all' ? (selectedStatus as any) : undefined,
          condition: selectedCondition !== 'all' ? (selectedCondition as any) : undefined,
        },
        formatType
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assets-register-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Asset register exported successfully');
    } catch {
      toast.error('Failed to export asset records');
    }
  };

  const handleDeleteAsset = async () => {
    if (!deleteDialog.itemToDelete) return;
    try {
      await assetService.deleteAsset(deleteDialog.itemToDelete.id);
      toast.success('Asset deleted successfully');
      loadData();
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Needs attention quick filter
      if (needsAttentionOnly) {
        const isAttention =
          asset.condition === AssetCondition.NEEDS_REPAIR ||
          asset.condition === AssetCondition.POOR ||
          asset.condition === AssetCondition.DAMAGED ||
          asset.status === AssetStatus.MAINTENANCE;
        if (!isAttention) return false;
      }

      if (selectedCategory !== 'all' && asset.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'all' && asset.status !== selectedStatus) {
        return false;
      }
      if (selectedCondition !== 'all' && asset.condition !== selectedCondition) {
        return false;
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchName = asset.name.toLowerCase().includes(q);
        const matchSerial = asset.serialNumber && asset.serialNumber.toLowerCase().includes(q);
        const matchLocation = asset.location.toLowerCase().includes(q);
        const matchDept = asset.assignedDepartment && asset.assignedDepartment.toLowerCase().includes(q);
        if (!matchName && !matchSerial && !matchLocation && !matchDept) return false;
      }

      return true;
    });
  }, [assets, needsAttentionOnly, selectedCategory, selectedStatus, selectedCondition, searchTerm]);

  const columns: ColumnDef<Asset>[] = [
    {
      accessorKey: 'name',
      header: 'Asset',
      cell: ({ row }) => {
        const asset = row.original;
        return (
          <div className="space-y-0.5 min-w-[180px]">
            <div className="font-medium text-foreground">{asset.name}</div>
            <div className="text-xs text-muted-foreground">
              {asset.serialNumber ? `ID: ${asset.serialNumber}` : `Asset ID: ${asset.id}`}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as string;
        const formatted = category.replace(/_/g, ' ');
        return <Badge variant="neutral" className="capitalize text-xs font-normal">{formatted}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <StatusBadge status={status} />;
      },
    },
    {
      accessorKey: 'condition',
      header: 'Condition',
      cell: ({ row }) => {
        const condition = row.getValue('condition') as string;
        return <StatusBadge status={condition} />;
      },
    },
    {
      accessorKey: 'currentValue',
      header: 'Current Value',
      cell: ({ row }) => {
        const value = row.getValue('currentValue') as number;
        return (
          <div className="font-medium text-foreground whitespace-nowrap">
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
        return <div className="text-xs text-muted-foreground">{location}</div>;
      },
    },
    {
      accessorKey: 'assignedDepartment',
      header: 'Department',
      cell: ({ row }) => {
        const department = row.getValue('assignedDepartment') as string;
        return department ? (
          <Badge variant="neutral" className="text-xs">{department}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">General</span>
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/assets/${asset.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Asset
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/assets/${asset.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Asset
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/assets/${asset.id}/maintenance`}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Record Maintenance
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(asset)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Assets" />
        <CardSkeleton count={4} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" />
        <TableSkeleton rows={5} columns={8} showHeader className="mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Assets"
        actions={
          <>
            {/* More Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  More
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/assets/categories">
                    <Tag className="mr-2 h-4 w-4" />
                    Categories
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/assets/reports">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Reports
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Primary Action */}
            <Button asChild>
              <Link href="/dashboard/assets/add">
                <Plus className="mr-1.5 h-4 w-4" />
                Add Asset
              </Link>
            </Button>
          </>
        }
      />

      {/* 4 KPI StatCards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-w-0"
        threshold={0.1}
      >
        <StatCard
          title="Total Assets"
          value={stats?.totalAssets || 0}
          icon={Package}
          accent="primary"
        />

        <StatCard
          title="Total Value"
          value={formatCurrency(stats?.totalValue || 0)}
          icon={TrendingUp}
          accent="accent"
        />

        <StatCard
          title="Active Assets"
          value={stats?.activeAssets || 0}
          icon={Users}
          accent="success"
        />

        <div
          onClick={() => setNeedsAttentionOnly(!needsAttentionOnly)}
          className="cursor-pointer transition-transform active:scale-[0.98]"
          title="Click to filter assets requiring maintenance/repair"
        >
          <StatCard
            title="Needs Attention"
            value={stats?.maintenanceNeeded || 0}
            icon={AlertTriangle}
            accent={needsAttentionOnly ? 'primary' : 'secondary'}
            description={
              needsAttentionOnly ? (
                <span className="text-primary font-medium">Filtering attention items (Click to clear)</span>
              ) : (
                <span className="text-muted-foreground">Click to filter table</span>
              )
            }
          />
        </div>
      </LazySection>

      {/* Main Asset Register Section */}
      <LazySection>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-semibold">Assets</CardTitle>
                {needsAttentionOnly && (
                  <Badge variant="warning" className="text-xs">
                    Needs Attention Filter Active
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/assets/reports">
                  <FileText className="mr-1.5 h-4 w-4" />
                  View Reports
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filter controls row */}
            <div className="grid gap-3 sm:grid-cols-3 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={AssetCategory.AUDIO_VISUAL}>Audio Visual</SelectItem>
                  <SelectItem value={AssetCategory.VEHICLES}>Vehicles</SelectItem>
                  <SelectItem value={AssetCategory.MUSICAL_INSTRUMENTS}>Musical Instruments</SelectItem>
                  <SelectItem value={AssetCategory.FURNITURE}>Furniture</SelectItem>
                  <SelectItem value={AssetCategory.EQUIPMENT}>Plant & Equipment</SelectItem>
                  <SelectItem value={AssetCategory.TECHNOLOGY}>Technology</SelectItem>
                  <SelectItem value={AssetCategory.KITCHEN_APPLIANCES}>Kitchen Appliances</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value={AssetStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={AssetStatus.MAINTENANCE}>Maintenance</SelectItem>
                  <SelectItem value={AssetStatus.RETIRED}>Retired</SelectItem>
                  <SelectItem value={AssetStatus.DISPOSED}>Disposed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value={AssetCondition.EXCELLENT}>Excellent</SelectItem>
                  <SelectItem value={AssetCondition.GOOD}>Good</SelectItem>
                  <SelectItem value={AssetCondition.FAIR}>Fair</SelectItem>
                  <SelectItem value={AssetCondition.POOR}>Poor</SelectItem>
                  <SelectItem value={AssetCondition.NEEDS_REPAIR}>Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DataTable
              columns={columns}
              data={filteredAssets}
              recordLabel="asset"
              recordLabelPlural="assets"
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchKey="name"
              searchPlaceholder="Search assets by name, serial, location, department..."
            />
          </CardContent>
        </Card>
      </LazySection>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={handleDeleteAsset}
        title="Delete Asset"
        description="Are you sure you want to delete this asset from the registry? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
