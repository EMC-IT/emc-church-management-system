'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  ArrowLeft, 
  Save, 
  BadgeCent,
  Calendar as CalendarIcon,
  Target,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingType, GivingCategory, GivingFormData, Giving, GivingStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/finance/giving/pledges/${pledgeId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pledge
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Pledge</h1>
          <p className="text-muted-foreground">
            Update pledge details and payment schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BadgeCent className="h-5 w-5" />
                  <span>Pledge Information</span>
                </CardTitle>
                <CardDescription>
                  Update the basic pledge details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="member">Member</Label>
                    <Select 
                      value={formData.memberId} 
                      onValueChange={(value) => handleInputChange('memberId', value)}
                      disabled={formData.isAnonymous}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
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
                    <Label htmlFor="anonymous">Anonymous Pledge</Label>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Total Pledge Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount || ''}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="GHS">GHS (₵)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as GivingCategory)}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select value={formData.method} onValueChange={(value) => handleInputChange('method', value)}>
                      <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter pledge description or purpose"
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Payment Schedule</span>
                </CardTitle>
                <CardDescription>
                  Update the pledge payment schedule
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Payment Frequency</Label>
                    <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Installment Amount</Label>
                    <div className="p-2 bg-muted rounded text-sm font-medium">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 2,
                      }).format(installmentAmount || 0)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !formData.startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => {
                            if (date) {
                              handleInputChange('startDate', date);
                              setStartDateOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>End Date</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="autoEndDate"
                          checked={formData.autoCalculateEndDate}
                          onCheckedChange={(checked) => handleInputChange('autoCalculateEndDate', checked)}
                        />
                        <Label htmlFor="autoEndDate" className="text-xs">Auto</Label>
                      </div>
                    </div>
                    {formData.autoCalculateEndDate ? (
                      <div className="p-2 bg-muted rounded text-sm">
                        {formData.endDate ? format(formData.endDate, 'PPP') : 'Calculating...'}
                      </div>
                    ) : (
                      <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !formData.endDate && 'text-muted-foreground'
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.endDate ? format(formData.endDate, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => {
                              handleInputChange('endDate', date);
                              setEndDateOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Pledge Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 2,
                      }).format(formData.amount || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paid Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 2,
                      }).format(pledge.pledgeDetails.paidAmount || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Remaining:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 2,
                      }).format((formData.amount || 0) - (pledge.pledgeDetails.paidAmount || 0))}
                    </span>
                  </div>
                  
                  <hr className="my-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Installments:</span>
                    <span className="font-medium">{formData.installments}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Frequency:</span>
                    <span className="font-medium capitalize">{formData.frequency}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Per Payment:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-GH', {
                        style: 'currency',
                        currency: 'GHS',
                        minimumFractionDigits: 2,
                      }).format(installmentAmount || 0)}
                    </span>
                  </div>
                  
                  <hr className="my-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Date:</span>
                    <span className="font-medium text-sm">
                      {format(formData.startDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  {formData.endDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">End Date:</span>
                      <span className="font-medium text-sm">
                        {format(formData.endDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="font-medium text-sm capitalize">
                      {formData.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Pledge
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/finance/giving/pledges/${pledgeId}`}>
                  Cancel
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}