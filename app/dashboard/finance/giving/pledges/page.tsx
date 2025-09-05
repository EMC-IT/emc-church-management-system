'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { 
  Plus, 
  BadgeCent,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// Extended pledge interface
interface PledgeData extends Giving {
  pledgeDetails: {
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    installments: number;
    frequency: string;
    startDate: string;
    endDate?: string;
    nextDueDate?: string;
  };
}

// Mock pledges data
const mockPledges: PledgeData[] = [
  {
    id: '1',
    memberId: 'member1',
    type: GivingType.PLEDGE,
    amount: 10000.00,
    currency: 'GHS',
    category: GivingCategory.BUILDING_FUND,
    method: 'Transfer',
    date: '2024-01-01',
    description: 'Annual building fund pledge',
    isAnonymous: false,
    receiptNumber: 'PLG-001',
    status: GivingStatus.PENDING,
    pledgeDetails: {
      totalAmount: 10000.00,
      paidAmount: 3000.00,
      remainingAmount: 7000.00,
      installments: 12,
      frequency: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      nextDueDate: '2024-02-01'
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    memberId: 'member2',
    type: GivingType.PLEDGE,
    amount: 5000.00,
    currency: 'GHS',
    category: GivingCategory.MISSIONARY,
    method: 'Online',
    date: '2024-01-15',
    description: 'Missions support pledge',
    isAnonymous: false,
    receiptNumber: 'PLG-002',
    status: GivingStatus.COMPLETED,
    pledgeDetails: {
      totalAmount: 5000.00,
      paidAmount: 5000.00,
      remainingAmount: 0.00,
      installments: 5,
      frequency: 'monthly',
      startDate: '2024-01-15',
      endDate: '2024-05-15',
      nextDueDate: undefined
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '3',
    memberId: 'member3',
    type: GivingType.PLEDGE,
    amount: 2400.00,
    currency: 'GHS',
    category: GivingCategory.YOUTH,
    method: 'Cash',
    date: '2024-01-10',
    description: 'Youth ministry equipment pledge',
    isAnonymous: false,
    receiptNumber: 'PLG-003',
    status: GivingStatus.PENDING,
    pledgeDetails: {
      totalAmount: 2400.00,
      paidAmount: 800.00,
      remainingAmount: 1600.00,
      installments: 6,
      frequency: 'bi-weekly',
      startDate: '2024-01-10',
      endDate: '2024-04-10',
      nextDueDate: '2024-01-24'
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '4',
    memberId: 'member4',
    type: GivingType.PLEDGE,
    amount: 15000.00,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Transfer',
    date: '2023-12-01',
    description: 'General fund annual pledge',
    isAnonymous: false,
    receiptNumber: 'PLG-004',
    status: GivingStatus.PENDING,
    pledgeDetails: {
      totalAmount: 15000.00,
      paidAmount: 12500.00,
      remainingAmount: 2500.00,
      installments: 12,
      frequency: 'monthly',
      startDate: '2023-12-01',
      endDate: '2024-11-30',
      nextDueDate: '2024-02-01'
    },
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  }
];

export default function PledgesPage() {
  const [pledges, setPledges] = useState<PledgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadPledges = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await givingService.getAll({ type: GivingType.PLEDGE });
        // setPledges(response.data);
        setPledges(mockPledges);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load pledges',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadPledges();
  }, [toast]);

  const handleDeletePledge = async (pledge: PledgeData) => {
    try {
      // await givingService.delete(pledge.id);
      setPledges(pledges.filter(p => p.id !== pledge.id));
      toast({
        title: 'Success',
        description: 'Pledge deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to delete pledge',
        variant: 'destructive',
      });
      throw err; // Re-throw to let the dialog handle the error state
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryBadge = (category: GivingCategory) => {
    const colors = {
      [GivingCategory.GENERAL]: 'bg-blue-100 text-blue-800',
      [GivingCategory.MISSIONARY]: 'bg-green-100 text-green-800',
      [GivingCategory.BUILDING_FUND]: 'bg-orange-100 text-orange-800',
      [GivingCategory.YOUTH]: 'bg-purple-100 text-purple-800',
      [GivingCategory.CHILDREN]: 'bg-pink-100 text-pink-800',
      [GivingCategory.MUSIC]: 'bg-indigo-100 text-indigo-800',
      [GivingCategory.OUTREACH]: 'bg-yellow-100 text-yellow-800',
      [GivingCategory.CHARITY]: 'bg-red-100 text-red-800',
      [GivingCategory.EDUCATION]: 'bg-cyan-100 text-cyan-800',
      [GivingCategory.MEDICAL]: 'bg-emerald-100 text-emerald-800',
      [GivingCategory.DISASTER_RELIEF]: 'bg-rose-100 text-rose-800',
      [GivingCategory.OTHER]: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status: GivingStatus) => {
    switch (status) {
      case GivingStatus.COMPLETED:
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case GivingStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case GivingStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProgressPercentage = (pledge: PledgeData) => {
    if (!pledge.pledgeDetails) return 0;
    return (pledge.pledgeDetails.paidAmount / pledge.pledgeDetails.totalAmount) * 100;
  };

  const columns: ColumnDef<PledgeData>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'Receipt #',
      cell: ({ row }) => {
        const receiptNumber = row.getValue('receiptNumber') as string;
        return <div className="font-medium">{receiptNumber}</div>;
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const description = row.getValue('description') as string;
        return <div className="max-w-[200px] truncate">{description}</div>;
      },
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => {
        const category = row.getValue('category') as GivingCategory;
        return getCategoryBadge(category);
      },
    },
    {
      accessorKey: 'amount',
      header: 'Total Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const pledge = row.original;
        const percentage = getProgressPercentage(pledge);
        const paidAmount = pledge.pledgeDetails?.paidAmount || 0;
        const totalAmount = pledge.amount;
        
        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{formatCurrency(paidAmount)}</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'date',
      header: 'Start Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: 'nextDue',
      header: 'Next Due',
      cell: ({ row }) => {
        const pledge = row.original;
        const nextDue = pledge.pledgeDetails?.nextDueDate;
        
        if (!nextDue) {
          return <span className="text-muted-foreground">Completed</span>;
        }
        
        const dueDate = new Date(nextDue);
        const today = new Date();
        const isOverdue = dueDate < today;
        
        return (
          <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
            {dueDate.toLocaleDateString()}
            {isOverdue && <div className="text-xs text-red-500">Overdue</div>}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as GivingStatus;
        return getStatusBadge(status);
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const pledge = row.original;
        
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
                <Link href={`/dashboard/finance/giving/pledges/${pledge.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/finance/giving/pledges/${pledge.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => deleteDialog.openDialog(pledge)}
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

  // Calculate statistics
  const totalPledges = pledges.length;
  const totalAmount = pledges.reduce((sum, pledge) => sum + pledge.amount, 0);
  const totalPaid = pledges.reduce((sum, pledge) => sum + (pledge.pledgeDetails?.paidAmount || 0), 0);
  const totalRemaining = pledges.reduce((sum, pledge) => sum + (pledge.pledgeDetails?.remainingAmount || 0), 0);
  const activePledges = pledges.filter(p => p.status === GivingStatus.PENDING).length;
  const completedPledges = pledges.filter(p => p.status === GivingStatus.COMPLETED).length;
  const overduePledges = pledges.filter(p => {
    if (!p.pledgeDetails?.nextDueDate) return false;
    return new Date(p.pledgeDetails.nextDueDate) < new Date();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pledges</h1>
          <p className="text-muted-foreground">
            Manage and track all giving pledges
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/finance/giving/pledges/add">
            <Plus className="mr-2 h-4 w-4" />
            Record Pledge
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pledges</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPledges}</div>
            <p className="text-xs text-muted-foreground">
              {activePledges} active, {completedPledges} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              All pledges combined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">
              {totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(1) : 0}% of total pledged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground">
              {overduePledges > 0 && (
                <span className="text-red-600">{overduePledges} overdue</span>
              )}
              {overduePledges === 0 && 'All on track'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pledges Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pledges</CardTitle>
          <CardDescription>
            View and manage all giving pledges with payment tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={pledges}
              searchKey="description"
              searchPlaceholder="Search pledges..."
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(handleDeletePledge)}
        title="Delete Pledge"
        description="Are you sure you want to delete this pledge? This action cannot be undone and will permanently remove the pledge and all associated payment records."
        itemName={deleteDialog.itemToDelete?.description || `Pledge ${deleteDialog.itemToDelete?.receiptNumber}`}
        loading={deleteDialog.loading}
        confirmText="Delete Pledge"
        cancelText="Cancel"
      />
    </div>
  );
}