'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { DataTable } from '@/components/ui/data-table';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Plus,
  BadgeCent,
  TrendingUp,
  Target,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  CreditCard,
  MoreHorizontal,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Pledge, PledgeStatus, PaymentMethod } from '@/lib/types';
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

// Mock pledges using proper Pledge domain model
const mockPledges: Pledge[] = [
  {
    id: '1',
    memberId: 'member1',
    memberName: 'John Doe',
    campaignId: 'c1',
    campaignName: 'New Sanctuary Building',
    pledgedAmount: 10000.00,
    paidAmount: 3000.00,
    outstandingAmount: 7000.00,
    currency: 'GHS',
    pledgeDate: '2024-01-01',
    completionDate: '2024-12-31',
    status: PledgeStatus.PARTIALLY_PAID,
    notes: 'Annual building fund pledge',
    payments: [
      {
        id: 'pay-1',
        pledgeId: '1',
        amount: 3000.00,
        currency: 'GHS',
        date: '2024-01-15',
        method: 'Transfer',
        notes: 'Initial installment',
        createdAt: '2024-01-15T10:00:00Z',
      },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    memberId: 'member2',
    memberName: 'Jane Smith',
    campaignId: 'c2',
    campaignName: 'Missions Outreach 2024',
    pledgedAmount: 5000.00,
    paidAmount: 5000.00,
    outstandingAmount: 0.00,
    currency: 'GHS',
    pledgeDate: '2024-01-15',
    completionDate: '2024-06-30',
    status: PledgeStatus.FULFILLED,
    notes: 'Missions support pledge',
    payments: [
      {
        id: 'pay-2',
        pledgeId: '2',
        amount: 5000.00,
        currency: 'GHS',
        date: '2024-01-20',
        method: 'Online',
        notes: 'Paid in full',
        createdAt: '2024-01-20T09:00:00Z',
      },
    ],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
  },
  {
    id: '3',
    memberId: 'member3',
    memberName: 'Michael Johnson',
    campaignId: 'c1',
    campaignName: 'New Sanctuary Building',
    pledgedAmount: 15000.00,
    paidAmount: 0.00,
    outstandingAmount: 15000.00,
    currency: 'GHS',
    pledgeDate: '2024-01-10',
    completionDate: '2024-12-31',
    status: PledgeStatus.ACTIVE,
    notes: 'Sanctuary seating pledge',
    payments: [],
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '4',
    memberId: 'member4',
    memberName: 'Sarah Wilson',
    pledgedAmount: 2500.00,
    paidAmount: 1000.00,
    outstandingAmount: 1500.00,
    currency: 'GHS',
    pledgeDate: '2024-01-05',
    completionDate: '2024-04-30',
    status: PledgeStatus.PARTIALLY_PAID,
    notes: 'General fund commitment',
    payments: [
      {
        id: 'pay-3',
        pledgeId: '4',
        amount: 1000.00,
        currency: 'GHS',
        date: '2024-01-18',
        method: 'Cash',
        notes: 'First payment',
        createdAt: '2024-01-18T14:00:00Z',
      },
    ],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-18T14:00:00Z',
  },
];

export default function PledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [filteredPledges, setFilteredPledges] = useState<Pledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Payment Dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<Pledge | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const { toast } = useToast();
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    const loadPledges = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setPledges(mockPledges);
        setFilteredPledges(mockPledges);
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

  useEffect(() => {
    let filtered = [...pledges];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.memberName && p.memberName.toLowerCase().includes(term)) ||
        (p.campaignName && p.campaignName.toLowerCase().includes(term)) ||
        (p.notes && p.notes.toLowerCase().includes(term))
      );
    }

    setFilteredPledges(filtered);
  }, [pledges, statusFilter, searchTerm]);

  const handleDeletePledge = async (pledge: Pledge) => {
    try {
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
      throw err;
    }
  };

  const handleOpenPaymentDialog = (pledge: Pledge) => {
    setSelectedPledge(pledge);
    setPaymentAmount(pledge.outstandingAmount > 0 ? String(pledge.outstandingAmount) : '');
    setPaymentMethod('Cash');
    setPaymentDate(new Date());
    setPaymentNotes('');
    setPaymentDialogOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPledge) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid payment amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (amountNum > selectedPledge.outstandingAmount) {
      toast({
        title: 'Validation Error',
        description: `Payment amount cannot exceed outstanding amount (${formatCurrency(selectedPledge.outstandingAmount)})`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsRecordingPayment(true);
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPaid = selectedPledge.paidAmount + amountNum;
      const newOutstanding = selectedPledge.pledgedAmount - newPaid;
      const newStatus = newOutstanding <= 0 ? PledgeStatus.FULFILLED : PledgeStatus.PARTIALLY_PAID;

      const updatedPledge: Pledge = {
        ...selectedPledge,
        paidAmount: newPaid,
        outstandingAmount: newOutstanding,
        status: newStatus,
        payments: [
          ...selectedPledge.payments,
          {
            id: `pay-${Date.now()}`,
            pledgeId: selectedPledge.id,
            amount: amountNum,
            currency: selectedPledge.currency,
            date: paymentDate.toISOString().split('T')[0],
            method: paymentMethod,
            notes: paymentNotes || undefined,
            createdAt: new Date().toISOString(),
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      setPledges(pledges.map(p => p.id === selectedPledge.id ? updatedPledge : p));

      toast({
        title: 'Payment Recorded',
        description: `Recorded payment of ${formatCurrency(amountNum)}. New Giving record created.`,
      });

      setPaymentDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const columns: ColumnDef<Pledge>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'memberName',
      header: 'Member',
      cell: ({ row }) => {
        const pledge = row.original;
        return (
          <div>
            <div className="font-medium">{pledge.memberName || pledge.memberId}</div>
            {pledge.notes && (
              <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                {pledge.notes}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'campaignName',
      header: 'Campaign',
      cell: ({ row }) => {
        const campaign = row.original.campaignName;
        return campaign ? (
          <span className="text-sm">{campaign}</span>
        ) : (
          <span className="text-sm text-muted-foreground italic">General</span>
        );
      },
    },
    {
      accessorKey: 'pledgedAmount',
      header: 'Pledged',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('pledgedAmount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'paidAmount',
      header: 'Paid',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('paidAmount'));
        return <div className="font-medium text-brand-success">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'outstandingAmount',
      header: 'Outstanding',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('outstandingAmount'));
        return (
          <div className={`font-medium ${amount > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}>
            {formatCurrency(amount)}
          </div>
        );
      },
    },
    {
      accessorKey: 'pledgeDate',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('pledgeDate'));
        return <div>{date.toLocaleDateString()}</div>;
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
              {pledge.status !== PledgeStatus.FULFILLED && (
                <DropdownMenuItem onClick={() => handleOpenPaymentDialog(pledge)}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Record Payment
                </DropdownMenuItem>
              )}
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
                className="text-destructive focus:text-destructive"
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

  // Distinct calculations for commitments vs actual money
  const totalPledged = filteredPledges.reduce((sum, p) => sum + p.pledgedAmount, 0);
  const totalPaid = filteredPledges.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalOutstanding = filteredPledges.reduce((sum, p) => sum + p.outstandingAmount, 0);
  const activeCount = filteredPledges.filter(
    p => p.status === PledgeStatus.ACTIVE || p.status === PledgeStatus.PARTIALLY_PAID
  ).length;

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
            title="Pledges"
            actions={
              <Button asChild>
                <Link href="/dashboard/finance/giving/pledges/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Pledge
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
          title="Total Pledged"
          value={formatCurrency(totalPledged)}
          icon={Target}
          accent="primary"
        />

        <StatCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          icon={TrendingUp}
          accent="success"
        />

        <StatCard
          title="Total Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={DollarSign}
          accent="accent"
        />

        <StatCard
          title="Active Pledges"
          value={String(activeCount)}
          icon={BadgeCent}
          accent="secondary"
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
                  <SelectItem value={PledgeStatus.ACTIVE}>Active</SelectItem>
                  <SelectItem value={PledgeStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                  <SelectItem value={PledgeStatus.FULFILLED}>Fulfilled</SelectItem>
                  <SelectItem value={PledgeStatus.CANCELLED}>Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search member, campaign, notes..."
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

      {/* Pledges Table */}
      <LazyLoader threshold={0.3}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">All Pledges</CardTitle>
              <span className="text-xs text-muted-foreground">
                {filteredPledges.length} of {pledges.length} pledges
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton 
                rows={5} 
                columns={8} 
                showHeader 
                showPagination 
              />
            ) : (
              <DataTable
                columns={columns}
                data={filteredPledges}
                recordLabel="pledge"
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                searchKey="memberName"
                searchPlaceholder="Search pledges..."
              />
            )}
          </CardContent>
        </Card>
      </LazyLoader>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Pledge Payment</DialogTitle>
          </DialogHeader>
          {selectedPledge && (
            <form onSubmit={handleRecordPayment} className="space-y-4 pt-2">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member:</span>
                  <span className="font-medium">{selectedPledge.memberName || selectedPledge.memberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pledged:</span>
                  <span className="font-medium">{formatCurrency(selectedPledge.pledgedAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding:</span>
                  <span className="font-medium text-amber-600">{formatCurrency(selectedPledge.outstandingAmount)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payAmount">Payment Amount <span className="text-destructive">*</span></Label>
                <Input
                  id="payAmount"
                  type="number"
                  min="0.01"
                  max={selectedPledge.outstandingAmount}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                  <SelectTrigger id="payMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Online">Online / Mobile Money</SelectItem>
                    <SelectItem value="Check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Date</Label>
                <DatePicker
                  value={paymentDate}
                  onChange={(d) => d && setPaymentDate(d)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payNotes">Notes</Label>
                <Input
                  id="payNotes"
                  placeholder="Optional reference or receipt info"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isRecordingPayment}>
                  {isRecordingPayment ? 'Recording...' : 'Save Payment'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => handleDeletePledge(deleteDialog.itemToDelete)}
        title="Delete Pledge"
        description="Are you sure you want to delete this pledge? This action cannot be undone."
        itemName={deleteDialog.itemToDelete?.memberName || 'Pledge'}
        loading={deleteDialog.loading}
      />
    </div>
  );
}
