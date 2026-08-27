'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { GivingCategoryBadge } from '@/components/ui/finance-badges';
import { DataTable } from '@/components/ui/data-table';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { TableSkeleton } from '@/components/ui/skeleton-loaders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Target,
  TrendingUp,
  HandCoins,
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { FundraisingCampaign, CampaignStatus, GivingCategory } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock campaigns data
const mockCampaigns: FundraisingCampaign[] = [
  {
    id: 'c1',
    name: 'New Sanctuary Building',
    description: 'Capital campaign for the main church auditorium expansion',
    targetAmount: 500000.00,
    pledgedAmount: 320000.00,
    receivedAmount: 180000.00,
    outstandingAmount: 140000.00,
    currency: 'GHS',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: CampaignStatus.ACTIVE,
    fund: GivingCategory.BUILDING_FUND,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Missions Outreach 2024',
    description: 'Annual rural evangelism and welfare mission fund',
    targetAmount: 80000.00,
    pledgedAmount: 65000.00,
    receivedAmount: 45000.00,
    outstandingAmount: 20000.00,
    currency: 'GHS',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    status: CampaignStatus.ACTIVE,
    fund: GivingCategory.MISSIONARY,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: 'c3',
    name: 'Youth Center Equipment',
    description: 'Musical instruments and sound gear for youth hall',
    targetAmount: 30000.00,
    pledgedAmount: 30000.00,
    receivedAmount: 30000.00,
    outstandingAmount: 0.00,
    currency: 'GHS',
    startDate: '2023-09-01',
    endDate: '2023-12-31',
    status: CampaignStatus.COMPLETED,
    fund: GivingCategory.YOUTH,
    createdAt: '2023-09-01T00:00:00Z',
    updatedAt: '2023-12-31T00:00:00Z',
  },
];

export default function FundraisingCampaignsPage() {
  const [campaigns, setCampaigns] = useState<FundraisingCampaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<FundraisingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCampaigns(mockCampaigns);
        setFilteredCampaigns(mockCampaigns);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load campaigns',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, [toast]);

  useEffect(() => {
    let filtered = [...campaigns];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(term) ||
        (c.description && c.description.toLowerCase().includes(term)) ||
        c.fund.toLowerCase().includes(term)
      );
    }

    setFilteredCampaigns(filtered);
  }, [campaigns, statusFilter, searchTerm]);

  const handleDeleteCampaign = async (campaign: FundraisingCampaign) => {
    try {
      setCampaigns(campaigns.filter(c => c.id !== campaign.id));
      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnDef<FundraisingCampaign>[] = [
    {
      accessorKey: 'name',
      header: 'Campaign',
      cell: ({ row }) => {
        const campaign = row.original;
        return (
          <div>
            <div className="font-medium">{campaign.name}</div>
            {campaign.description && (
              <div className="text-xs text-muted-foreground truncate max-w-[220px]">
                {campaign.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'fund',
      header: 'Fund',
      cell: ({ row }) => <GivingCategoryBadge category={row.getValue('fund') as GivingCategory} />,
    },
    {
      accessorKey: 'targetAmount',
      header: 'Target',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('targetAmount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'pledgedAmount',
      header: 'Pledged',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('pledgedAmount'));
        return <div className="text-sm font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'receivedAmount',
      header: 'Received',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('receivedAmount'));
        return <div className="text-sm font-medium text-brand-success">{formatCurrency(amount)}</div>;
      },
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const campaign = row.original;
        const percent = campaign.targetAmount > 0
          ? Math.min(100, Math.round((campaign.receivedAmount / campaign.targetAmount) * 100))
          : 0;
        return (
          <div className="w-[120px] space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{percent}%</span>
            </div>
            <Progress value={percent} className="h-2" />
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.getValue('status')} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const campaign = row.original;
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
                <Link href={`/dashboard/finance/giving/fundraising/${campaign.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/giving/fundraising/${campaign.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => deleteDialog.openDialog(campaign)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Distinct KPI calculations
  const totalTarget = filteredCampaigns.reduce((sum, c) => sum + c.targetAmount, 0);
  const totalReceived = filteredCampaigns.reduce((sum, c) => sum + c.receivedAmount, 0);
  const totalPledged = filteredCampaigns.reduce((sum, c) => sum + c.pledgedAmount, 0);
  const activeCount = filteredCampaigns.filter(c => c.status === CampaignStatus.ACTIVE).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/giving" aria-label="Back to Giving">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <PageHeader
            title="Fundraising Campaigns"
            actions={
              <Button asChild>
                <Link href="/dashboard/finance/giving/fundraising/add">
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Link>
              </Button>
            }
          />
        </div>
      </div>

      {/* Statistics Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        threshold={0.1}
      >
        <StatCard
          title="Active Campaigns"
          value={String(activeCount)}
          icon={HandCoins}
          accent="primary"
        />

        <StatCard
          title="Total Target"
          value={formatCurrency(totalTarget)}
          icon={Target}
          accent="secondary"
        />

        <StatCard
          title="Total Received"
          value={formatCurrency(totalReceived)}
          icon={TrendingUp}
          accent="success"
        />

        <StatCard
          title="Total Pledged"
          value={formatCurrency(totalPledged)}
          icon={FolderOpen}
          accent="accent"
        />
      </LazySection>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value={CampaignStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={CampaignStatus.DRAFT}>Draft</SelectItem>
                  <SelectItem value={CampaignStatus.COMPLETED}>Completed</SelectItem>
                  <SelectItem value={CampaignStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search campaign name, fund, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {(statusFilter !== 'all' || searchTerm) && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">All Campaigns</CardTitle>
              <span className="text-xs text-muted-foreground">
                {filteredCampaigns.length} of {campaigns.length} campaigns
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton 
                rows={4} 
                columns={8} 
                showHeader 
                showPagination 
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredCampaigns}
                recordLabel="campaign"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchKey="name"
                searchPlaceholder="Search campaigns..."
              />
            )}
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeleteCampaign(deleteDialog.itemToDelete)}
        title="Delete Campaign"
        description="Are you sure you want to delete this fundraising campaign? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.name || 'Campaign'}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
