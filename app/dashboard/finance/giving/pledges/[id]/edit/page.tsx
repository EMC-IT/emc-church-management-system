'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  ArrowLeft, 
  Save, 
  BadgeCent,
  Target,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingType, GivingCategory, GivingFormData, Giving, GivingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/date-utils';

// Mock members data for selection
const mockMembers = [
  { id: 'member1', name: 'John Doe', email: 'john@example.com' },
  { id: 'member2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'member3', name: 'Michael Johnson', email: 'michael@example.com' },
  { id: 'member4', name: 'Sarah Wilson', email: 'sarah@example.com' },
];

interface PledgeFormData extends GivingFormData {
  memberId: string;
  installments: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
  startDate: Date;
  endDate?: Date;
  autoCalculateEndDate: boolean;
}

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

// Mock pledge data for editing
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

export default function EditPledgePage() {
  const [pledge, setPledge] = useState<PledgeData | null>(null);
  const [formData, setFormData] = useState<PledgeFormData>({
    memberId: '',
    type: GivingType.PLEDGE,
    amount: 0,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isAnonymous: false,
    installments: 12,
    frequency: 'monthly',
    startDate: new Date(),
    autoCalculateEndDate: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const pledgeId = params.id as string;

  useEffect(() => {
    const loadPledge = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const pledgeData = await givingService.getById(pledgeId);
        const pledgeData = mockPledge;
        setPledge(pledgeData);
        
        // Populate form with existing data
        setFormData({
          memberId: pledgeData.memberId || '',
          type: pledgeData.type,
          amount: pledgeData.amount,
          currency: pledgeData.currency,
          category: pledgeData.category,
          method: pledgeData.method,
          date: pledgeData.date,
          description: pledgeData.description || '',
          isAnonymous: pledgeData.isAnonymous,
          installments: pledgeData.pledgeDetails.installments,
          frequency: pledgeData.pledgeDetails.frequency as any,
          startDate: new Date(pledgeData.pledgeDetails.startDate),
          endDate: pledgeData.pledgeDetails.endDate ? new Date(pledgeData.pledgeDetails.endDate) : undefined,
          autoCalculateEndDate: !pledgeData.pledgeDetails.endDate,
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load pledge details',
          variant: 'destructive',
        });
        router.push('/dashboard/finance/giving/pledges');
      } finally {
        setLoading(false);
      }
    };

    if (pledgeId) {
      loadPledge();
    }
  }, [pledgeId, router, toast]);

  const calculateEndDate = (startDate: Date, installments: number, frequency: string): Date => {
    const endDate = new Date(startDate);
    
    switch (frequency) {
      case 'weekly':
        endDate.setDate(endDate.getDate() + (installments * 7));
        break;
      case 'bi-weekly':
        endDate.setDate(endDate.getDate() + (installments * 14));
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + installments);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + (installments * 3));
        break;
      case 'annually':
        endDate.setFullYear(endDate.getFullYear() + installments);
        break;
    }
    
    return endDate;
  };

  const handleInputChange = (field: keyof PledgeFormData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-calculate end date if enabled
    if ((field === 'startDate' || field === 'installments' || field === 'frequency') && updatedData.autoCalculateEndDate) {
      updatedData.endDate = calculateEndDate(updatedData.startDate, updatedData.installments, updatedData.frequency);
    }
    
    setFormData(updatedData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.memberId && !formData.isAnonymous) {
      toast({
        title: 'Validation Error',
        description: 'Please select a member or mark as anonymous',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.installments <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Number of installments must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const updatedPledgeData = {
        ...formData,
        id: pledgeId,
        date: formData.startDate.toISOString().split('T')[0],
        pledgeDetails: {
          totalAmount: formData.amount,
          paidAmount: pledge?.pledgeDetails.paidAmount || 0,
          remainingAmount: formData.amount - (pledge?.pledgeDetails.paidAmount || 0),
          installments: formData.installments,
          frequency: formData.frequency,
          startDate: formData.startDate.toISOString().split('T')[0],
          endDate: formData.endDate?.toISOString().split('T')[0],
          nextDueDate: pledge?.pledgeDetails.nextDueDate
        }
      };
      
      // await givingService.update(pledgeId, updatedPledgeData);
      
      toast({
        title: 'Success',
        description: 'Pledge updated successfully',
      });
      
      router.push(`/dashboard/finance/giving/pledges/${pledgeId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update pledge',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const installmentAmount = formData.amount / formData.installments;



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading pledge details...</span>
        </div>
      </div>
    );
  }

  if (!pledge) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Pledge Not Found</h2>
        <p className="text-muted-foreground mb-4">The pledge you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/dashboard/finance/giving/pledges">
            Back to Pledges
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href={`/dashboard/finance/giving/pledges/${pledgeId}`} aria-label="Back to Pledge Details">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Pledge</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Pledge Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="member">Church Member</Label>
                <Select 
                  value={formData.memberId} 
                  onValueChange={(value) => handleInputChange('memberId', value)}
                  disabled={formData.isAnonymous}
                >
                  <SelectTrigger id="member">
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 flex items-center justify-between rounded-lg border border-border p-3.5">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">Anonymous Pledge</Label>
                  <p className="text-xs text-muted-foreground">Keep donor identity private</p>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => {
                    handleInputChange('isAnonymous', checked);
                    if (checked) {
                      handleInputChange('memberId', '');
                    }
                  }}
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="amount">Total Pledge Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₵</span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="pl-8"
                    required
                  />
                </div>
              </div>

              <div className="col-span-12 sm:col-span-2 space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GHS">GHS (₵)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as GivingCategory)}>
                  <SelectTrigger id="category">
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
              </div>

              <div className="col-span-12 sm:col-span-3 space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select value={formData.method} onValueChange={(value) => handleInputChange('method', value)}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Transfer">Transfer</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description / Purpose</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Pledge description or campaign purpose..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Schedule */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Payment Schedule & Installments</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="installments">Number of Installments</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  value={formData.installments}
                  onChange={(e) => handleInputChange('installments', parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="frequency">Payment Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label>Installment Amount</Label>
                <div className="h-10 px-3 flex items-center bg-muted/40 border border-border rounded-md text-sm font-semibold text-foreground">
                  {new Intl.NumberFormat('en-GH', {
                    style: 'currency',
                    currency: 'GHS',
                    minimumFractionDigits: 2,
                  }).format(installmentAmount || 0)}
                  <span className="text-xs font-normal text-muted-foreground ml-1.5">/ {formData.frequency}</span>
                </div>
              </div>

              <div className="col-span-12 sm:col-span-6 space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <DatePicker
                  id="startDate"
                  value={formData.startDate}
                  onChange={(date) => {
                    if (date) handleInputChange('startDate', date);
                  }}
                  placeholder="Pick start date"
                />
              </div>

              <div className="col-span-12 sm:col-span-6 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="endDate">End Date</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoEndDate"
                      checked={formData.autoCalculateEndDate}
                      onCheckedChange={(checked) => handleInputChange('autoCalculateEndDate', checked)}
                    />
                    <Label htmlFor="autoEndDate" className="text-xs text-muted-foreground cursor-pointer">Auto Calculate</Label>
                  </div>
                </div>
                {formData.autoCalculateEndDate ? (
                  <div className="h-10 px-3 flex items-center bg-muted/40 border border-border rounded-md text-sm text-foreground">
                    {formData.endDate ? formatDate(formData.endDate) : 'Calculating...'}
                  </div>
                ) : (
                  <DatePicker
                    id="endDate"
                    value={formData.endDate}
                    onChange={(date) => {
                      if (date) handleInputChange('endDate', date);
                    }}
                    placeholder="Pick end date"
                  />
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/finance/giving/pledges/${pledgeId}`}>
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Update Pledge
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}