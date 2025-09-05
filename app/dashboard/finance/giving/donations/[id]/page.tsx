'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LazySection } from '@/components/ui/lazy-section';
import { LazyLoader } from '@/components/ui/lazy-loader';
import { ProfileSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/skeleton-loaders';
import { 
  ArrowLeft, 
  Edit, 
  Save,
  X,
  BadgeCent,
  Receipt,
  User,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, PaymentMethod } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Extended donation interface
interface DonationData extends Giving {
  memberName?: string;
  memberEmail?: string;
  memberPhone?: string;
}

// Mock donation data
const mockDonation: DonationData = {
  id: '1',
  memberId: 'member1',
  memberName: 'John Doe',
  memberEmail: 'john@example.com',
  memberPhone: '+233 24 123 4567',
  type: GivingType.DONATION,
  amount: 5000.00,
  currency: 'GHS',
  category: GivingCategory.BUILDING_FUND,
  method: 'Transfer',
  date: '2024-01-20',
  description: 'Building fund donation for new sanctuary construction project',
  isAnonymous: false,
  receiptNumber: 'DON-001',
  status: GivingStatus.COMPLETED,
  createdAt: '2024-01-20T10:30:00Z',
  updatedAt: '2024-01-20T10:30:00Z'
};

export default function DonationDetailsPage() {
  const [donation, setDonation] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<DonationData>>({});
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const donationId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await givingService.getById(donationId);
        // setDonation(response);
        setDonation(mockDonation);
        setEditData(mockDonation);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load donation details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [donationId, toast]);

  const handleSave = async () => {
    try {
      // await givingService.update(donationId, editData);
      setDonation({ ...donation!, ...editData });
      setEditing(false);
      toast({
        title: 'Success',
        description: 'Donation updated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update donation',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditData(donation!);
    setEditing(false);
  };

  const handleStatusChange = async (newStatus: GivingStatus) => {
    try {
      // await givingService.updateStatus(donationId, newStatus);
      setDonation({ ...donation!, status: newStatus });
      toast({
        title: 'Success',
        description: 'Status updated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleSendReceipt = async () => {
    try {
      // await givingService.sendReceipt(donationId);
      toast({
        title: 'Success',
        description: 'Receipt sent successfully',
      });
      setReceiptDialogOpen(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to send receipt',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      // await givingService.downloadReceipt(donationId);
      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
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
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case GivingStatus.PENDING:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case GivingStatus.FAILED:
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: GivingCategory) => {
    const colors = {
      [GivingCategory.GENERAL]: 'bg-gray-100 text-gray-800',
      [GivingCategory.BUILDING_FUND]: 'bg-orange-100 text-orange-800',
      [GivingCategory.MISSIONARY]: 'bg-purple-100 text-purple-800',
      [GivingCategory.YOUTH]: 'bg-pink-100 text-pink-800',
      [GivingCategory.CHILDREN]: 'bg-blue-100 text-blue-800',
      [GivingCategory.MUSIC]: 'bg-green-100 text-green-800',
      [GivingCategory.OUTREACH]: 'bg-indigo-100 text-indigo-800',
      [GivingCategory.CHARITY]: 'bg-red-100 text-red-800',
      [GivingCategory.EDUCATION]: 'bg-yellow-100 text-yellow-800',
      [GivingCategory.MEDICAL]: 'bg-teal-100 text-teal-800',
      [GivingCategory.DISASTER_RELIEF]: 'bg-rose-100 text-rose-800',
      [GivingCategory.OTHER]: 'bg-slate-100 text-slate-800',
    };
    
    return (
      <Badge className={colors[category] || 'bg-gray-100 text-gray-800'}>
        {category.replace('_', ' ')}
      </Badge>
    );
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer':
        return <CreditCard className="h-4 w-4" />;
      case 'mobile_money':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <BadgeCent className="h-4 w-4" />;
      case 'check':
        return <Receipt className="h-4 w-4" />;
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <BadgeCent className="h-4 w-4" />;
    }
  };

  if (loading || !donation) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton 
          className="mb-6"
        />
        <CardSkeleton 
          count={3} 
          className="grid gap-4 md:grid-cols-3" 
        />
        <CardSkeleton 
          count={2} 
          className="grid gap-6 md:grid-cols-2" 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/finance/giving/donations">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Donations
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Donation {donation.receiptNumber}
            </h1>
            <p className="text-muted-foreground">
              {donation.isAnonymous ? 'Anonymous Donation' : donation.memberName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BadgeCent className="mr-2 h-4 w-4" />
                Receipt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Receipt Options</DialogTitle>
                <DialogDescription>
                  Download or send receipt for this donation
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center p-4 border rounded-lg">
                  <BadgeCent className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-semibold">Receipt #{donation.receiptNumber}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(donation.amount)} • {new Date(donation.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleDownloadReceipt} className="w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {!donation.isAnonymous && donation.memberEmail && (
                  <Button onClick={handleSendReceipt} className="w-full sm:w-auto">
                    <Mail className="mr-2 h-4 w-4" />
                    Send via Email
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
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
            <CardTitle className="text-sm font-medium">Amount</CardTitle>
            <BadgeCent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(donation.amount)}</div>
            <p className="text-xs text-muted-foreground">
              {donation.currency} • {getCategoryBadge(donation.category)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <div className="flex items-center space-x-1">
              {getMethodIcon(donation.method)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusBadge(donation.status)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              via {donation.method.replace('_', ' ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(donation.date).toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(donation.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </LazySection>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <LazyLoader threshold={0.2}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Donation Information */}
              <Card>
              <CardHeader>
                <CardTitle>Donation Information</CardTitle>
                <CardDescription>
                  {editing ? 'Edit donation details' : 'View donation information'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    {editing ? (
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={editData.amount || ''}
                        onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <div className="p-2 bg-muted rounded font-medium">{formatCurrency(donation.amount)}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    {editing ? (
                      <Select 
                        value={editData.category} 
                        onValueChange={(value) => setEditData({ ...editData, category: value as GivingCategory })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={GivingCategory.GENERAL}>General</SelectItem>
                          <SelectItem value={GivingCategory.BUILDING_FUND}>Building Fund</SelectItem>
                          <SelectItem value={GivingCategory.MISSIONARY}>Missionary</SelectItem>
                          <SelectItem value={GivingCategory.YOUTH}>Youth</SelectItem>
                          <SelectItem value={GivingCategory.CHILDREN}>Children</SelectItem>
                          <SelectItem value={GivingCategory.MUSIC}>Music</SelectItem>
                          <SelectItem value={GivingCategory.OUTREACH}>Outreach</SelectItem>
                          <SelectItem value={GivingCategory.CHARITY}>Charity</SelectItem>
                          <SelectItem value={GivingCategory.EDUCATION}>Education</SelectItem>
                          <SelectItem value={GivingCategory.MEDICAL}>Medical</SelectItem>
                          <SelectItem value={GivingCategory.DISASTER_RELIEF}>Disaster Relief</SelectItem>
                          <SelectItem value={GivingCategory.OTHER}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2">{getCategoryBadge(donation.category)}</div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    {editing ? (
                      <Select 
                        value={editData.method} 
                        onValueChange={(value) => setEditData({ ...editData, method: value as PaymentMethod })}
                      >
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
                    ) : (
                      <div className="p-2 bg-muted rounded capitalize">
                        {donation.method.replace('_', ' ')}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {editing ? (
                      <Select 
                        value={editData.status} 
                        onValueChange={(value) => setEditData({ ...editData, status: value as GivingStatus })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={GivingStatus.COMPLETED}>Completed</SelectItem>
                          <SelectItem value={GivingStatus.PENDING}>Pending</SelectItem>
                          <SelectItem value={GivingStatus.FAILED}>Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="p-2">{getStatusBadge(donation.status)}</div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  {editing ? (
                    <Textarea
                      id="description"
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  ) : (
                    <div className="p-2 bg-muted rounded min-h-[100px]">{donation.description}</div>
                  )}
                </div>
              </CardContent>
            </Card>

              {/* Donor Information */}
              <LazySection
                strategy="lazy"
                showSkeleton
                skeletonVariant="card"
                threshold={0.3}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Donor Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {donation.isAnonymous ? (
                      <div className="text-center py-8">
                        <User className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Anonymous Donation</h3>
                        <p className="mt-1 text-sm text-gray-500">Donor information is not available for anonymous donations.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="font-medium">{donation.memberName}</span>
                        </div>
                        
                        {donation.memberEmail && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Email:</span>
                            <span className="font-medium">{donation.memberEmail}</span>
                          </div>
                        )}
                        
                        {donation.memberPhone && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Phone:</span>
                            <span className="font-medium">{donation.memberPhone}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Member ID:</span>
                          <span className="font-medium">{donation.memberId}</span>
                        </div>
                      </div>
                    )}
                    
                    <hr />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Receipt #:</span>
                        <span className="font-medium">{donation.receiptNumber}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date:</span>
                        <span className="font-medium">{new Date(donation.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Created:</span>
                        <span className="font-medium">{new Date(donation.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                        <span className="font-medium">{new Date(donation.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LazySection>
            </div>
          </LazyLoader>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <LazyLoader threshold={0.4}>
            <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Track changes and activities for this donation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Donation Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donation.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {donation.status === GivingStatus.COMPLETED && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Status Updated to Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(donation.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          </LazyLoader>
        </TabsContent>
      </Tabs>
    </div>
  );
}