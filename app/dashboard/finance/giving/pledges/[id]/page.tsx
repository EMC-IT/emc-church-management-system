'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { CardSkeleton, ProfileSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { 
  ArrowLeft, 
  Edit, 
  BadgeCent,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Extended pledge interface
interface PledgeData extends Giving {
  memberName?: string;
  memberEmail?: string;
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

// Payment record interface
interface PaymentRecord {
  id: string;
  pledgeId: string;
  amount: number;
  date: string;
  method: string;
  receiptNumber: string;
  notes?: string;
  createdAt: string;
}

// Mock pledge data
const mockPledge: PledgeData = {
  id: '1',
  memberId: 'member1',
  memberName: 'John Doe',
  memberEmail: 'john@example.com',
  type: GivingType.PLEDGE,
  amount: 10000.00,
  currency: 'GHS',
  category: GivingCategory.BUILDING_FUND,
  method: 'Transfer',
  date: '2024-01-01',
  description: 'Annual building fund pledge for new sanctuary construction',
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
};

// Mock payment records
const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    pledgeId: '1',
    amount: 1000.00,
    date: '2024-01-01',
    method: 'Transfer',
    receiptNumber: 'PAY-001',
    notes: 'Initial payment',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    pledgeId: '1',
    amount: 1000.00,
    date: '2024-01-15',
    method: 'Transfer',
    receiptNumber: 'PAY-002',
    notes: 'Monthly installment',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    pledgeId: '1',
    amount: 1000.00,
    date: '2024-01-20',
    method: 'Online',
    receiptNumber: 'PAY-003',
    notes: 'Monthly installment via mobile money',
    createdAt: '2024-01-20T00:00:00Z'
  }
];

export default function PledgeDetailsPage() {
  const [pledge, setPledge] = useState<PledgeData | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    method: 'Cash',
    notes: ''
  });
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const pledgeId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [pledgeResponse, paymentsResponse] = await Promise.all([
        //   givingService.getById(pledgeId),
        //   givingService.getPledgePayments(pledgeId)
        // ]);
        // setPledge(pledgeResponse);
        // setPayments(paymentsResponse.data);
        setPledge(mockPledge);
        setPayments(mockPayments);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load pledge details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pledgeId, toast]);

  const handleRecordPayment = async () => {
    if (newPayment.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Payment amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (newPayment.amount > pledge!.pledgeDetails.remainingAmount) {
      toast({
        title: 'Validation Error',
        description: 'Payment amount cannot exceed remaining balance',
        variant: 'destructive',
      });
      return;
    }

    try {
      const paymentRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        pledgeId: pledgeId,
        amount: newPayment.amount,
        date: new Date().toISOString().split('T')[0],
        method: newPayment.method,
        receiptNumber: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
        notes: newPayment.notes,
        createdAt: new Date().toISOString()
      };

      // await givingService.recordPledgePayment(pledgeId, paymentRecord);
      
      // Update local state
      setPayments([...payments, paymentRecord]);
      
      const updatedPledge = {
        ...pledge!,
        pledgeDetails: {
          ...pledge!.pledgeDetails,
          paidAmount: pledge!.pledgeDetails.paidAmount + newPayment.amount,
          remainingAmount: pledge!.pledgeDetails.remainingAmount - newPayment.amount
        }
      };
      
      // Check if pledge is completed
      if (updatedPledge.pledgeDetails.remainingAmount <= 0) {
        updatedPledge.status = GivingStatus.COMPLETED;
        updatedPledge.pledgeDetails.nextDueDate = undefined;
      }
      
      setPledge(updatedPledge);
      
      setPaymentDialogOpen(false);
      setNewPayment({ amount: 0, method: 'cash', notes: '' });
      
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
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

  const getMethodBadge = (method: string) => {
    return (
      <Badge variant="outline" className="capitalize">
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  const columns: ColumnDef<PaymentRecord>[] = [
    {
      accessorKey: 'receiptNumber',
      header: 'Receipt #',
      cell: ({ row }) => {
        const receiptNumber = row.getValue('receiptNumber') as string;
        return <div className="font-medium">{receiptNumber}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('amount'));
        return <div className="font-medium">{formatCurrency(amount)}</div>;
      },
    },
    {
      accessorKey: 'method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('method') as string;
        return getMethodBadge(method);
      },
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => {
        const date = new Date(row.getValue('date'));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => {
        const notes = row.getValue('notes') as string;
        return <div className="max-w-[200px] truncate">{notes || '-'}</div>;
      },
    },
  ];

  if (loading || !pledge) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton 
          className="mb-6"
        />
        <CardSkeleton 
          count={4} 
          className="grid gap-4 md:grid-cols-4" 
        />
        <CardSkeleton 
          count={2} 
          className="grid gap-6 md:grid-cols-2" 
        />
        <TableSkeleton 
          rows={3} 
          columns={5} 
          showHeader 
          className="mt-6" 
        />
      </div>
    );
  }

  const progress = (pledge.pledgeDetails.paidAmount / pledge.pledgeDetails.totalAmount) * 100;
  const isOverdue = pledge.pledgeDetails.nextDueDate && new Date(pledge.pledgeDetails.nextDueDate) < new Date();
  const isCompleted = pledge.status === GivingStatus.COMPLETED;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/giving/pledges">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pledges
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pledge {pledge.receiptNumber}
            </h1>
            <p className="text-muted-foreground">
              {pledge.isAnonymous ? 'Anonymous Pledge' : pledge.memberName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isCompleted && (
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                  <DialogDescription>
                    Record a new payment for this pledge
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={pledge.pledgeDetails.remainingAmount}
                      value={newPayment.amount || ''}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">
                      Remaining balance: {formatCurrency(pledge.pledgeDetails.remainingAmount)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={newPayment.method} onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                      placeholder="Payment notes"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRecordPayment}>
                    Record Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/finance/giving/pledges/${pledge.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {isOverdue && !isCompleted && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Payment Overdue</p>
            <p className="text-sm text-red-600">
              Next payment was due on {new Date(pledge.pledgeDetails.nextDueDate!).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Pledge Completed</p>
            <p className="text-sm text-green-600">
              All payments have been received for this pledge
            </p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <LazySection
        strategy="immediate"
        showSkeleton
        skeletonVariant="card"
        skeletonCount={4}
        className="grid gap-4 md:grid-cols-4"
        threshold={0.1}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pledge.pledgeDetails.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {pledge.pledgeDetails.installments} installments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <BadgeCent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pledge.pledgeDetails.paidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {payments.length} payments made
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pledge.pledgeDetails.remainingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {isCompleted ? 'Completed' : `${pledge.pledgeDetails.installments - payments.length} payments left`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progress.toFixed(1)}%</div>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      </LazySection>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Pledge Details</TabsTrigger>
          <TabsTrigger value="payments">Payment History</TabsTrigger>
          <TabsTrigger value="schedule">Payment Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <LazyLoader threshold={0.2}>
            <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pledge Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member:</span>
                    <span className="font-medium">
                      {pledge.isAnonymous ? 'Anonymous' : pledge.memberName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge className="capitalize">
                      {pledge.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    {getStatusBadge(pledge.status)}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Receipt #:</span>
                    <span className="font-medium">{pledge.receiptNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(pledge.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {pledge.description && (
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <p className="text-sm bg-muted p-3 rounded">{pledge.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Frequency:</span>
                    <span className="font-medium capitalize">{pledge.pledgeDetails.frequency}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Installments:</span>
                    <span className="font-medium">{pledge.pledgeDetails.installments}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Per Payment:</span>
                    <span className="font-medium">
                      {formatCurrency(pledge.pledgeDetails.totalAmount / pledge.pledgeDetails.installments)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="font-medium">
                      {new Date(pledge.pledgeDetails.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {pledge.pledgeDetails.endDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="font-medium">
                        {new Date(pledge.pledgeDetails.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {pledge.pledgeDetails.nextDueDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Due:</span>
                      <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                        {new Date(pledge.pledgeDetails.nextDueDate).toLocaleDateString()}
                        {isOverdue && ' (Overdue)'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          </LazyLoader>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <LazyLoader threshold={0.3}>
            <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                All payments received for this pledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <DataTable
                  columns={columns}
                  data={payments}
                  searchKey="receiptNumber"
                  searchPlaceholder="Search payments..."
                />
              ) : (
                <div className="text-center py-8">
                  <BadgeCent className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No payments yet</h3>
                  <p className="mt-1 text-sm text-gray-500">No payments have been recorded for this pledge.</p>
                </div>
              )}
            </CardContent>
            </Card>
          </LazyLoader>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <LazyLoader threshold={0.4}>
            <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>
                Planned payment schedule for this pledge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would typically be generated based on the pledge schedule */}
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">Payment Schedule</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {pledge.pledgeDetails.frequency} payments of {formatCurrency(pledge.pledgeDetails.totalAmount / pledge.pledgeDetails.installments)}
                  </p>
                </div>
              </div>
            </CardContent>
            </Card>
          </LazyLoader>
        </TabsContent>
      </Tabs>
    </div>
  );
}