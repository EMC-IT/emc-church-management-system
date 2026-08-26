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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LazySection } from '@/components/ui/lazy-section';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FormSkeleton } from '@/components/ui/skeleton-loaders';
import { 
  ArrowLeft, 
  Save, 
  BadgeCent,
  Calendar as CalendarIcon,
  Receipt,
  User,
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
  { id: 'member5', name: 'David Brown', email: 'david@example.com' },
];

// Mock donation data for editing
const mockDonation: Giving = {
  id: '1',
  memberId: 'member1',
  type: GivingType.DONATION,
  amount: 500.00,
  currency: 'GHS',
  category: GivingCategory.GENERAL,
  method: 'Cash',
  date: '2024-01-15',
  description: 'Sunday service offering',
  isAnonymous: false,
  receiptNumber: 'DON-123456',
  status: GivingStatus.COMPLETED,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export default function EditDonationPage() {
  const [donation, setDonation] = useState<Giving | null>(null);
  const [formData, setFormData] = useState<GivingFormData>({
    type: GivingType.DONATION,
    amount: 0,
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: new Date().toISOString().split('T')[0],
    description: '',
    isAnonymous: false,
  });
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const donationId = params.id as string;

  useEffect(() => {
    const loadDonation = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const donationData = await givingService.getById(donationId);
        const donationData = mockDonation;
        setDonation(donationData);
        
        // Populate form with existing data
        setFormData({
          type: donationData.type,
          amount: donationData.amount,
          currency: donationData.currency,
          category: donationData.category,
          method: donationData.method,
          date: donationData.date,
          description: donationData.description || '',
          isAnonymous: donationData.isAnonymous,
        });
        
        setSelectedMemberId(donationData.memberId || '');
        setSelectedDate(new Date(donationData.date));
      } catch (err: any) {
        toast({
          title: 'Error',
          description: 'Failed to load donation details',
          variant: 'destructive',
        });
        router.push('/dashboard/finance/giving/donations');
      } finally {
        setLoading(false);
      }
    };

    if (donationId) {
      loadDonation();
    }
  }, [donationId, router, toast]);

  const handleInputChange = (field: keyof GivingFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, date: date.toISOString().split('T')[0] });
      setDateOpen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMemberId && !formData.isAnonymous) {
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
    
    if (!formData.description || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a description',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const updatedDonationData = {
        ...formData,
        id: donationId,
        memberId: formData.isAnonymous ? '' : selectedMemberId,
        receiptNumber: donation?.receiptNumber || '',
        status: donation?.status || 'completed'
      };
      
      // await givingService.update(donationId, updatedDonationData);
      
      toast({
        title: 'Success',
        description: 'Donation updated successfully',
      });
      
      router.push(`/dashboard/finance/giving/donations/${donationId}`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to update donation',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get member name for display
  const getMemberName = () => {
    if (formData.isAnonymous) return 'Anonymous';
    const member = mockMembers.find(m => m.id === selectedMemberId);
    return member?.name || 'Unknown Member';
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <FormSkeleton className="h-48" />
            <FormSkeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <FormSkeleton className="h-48" />
            <FormSkeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Donation Not Found</h2>
        <p className="text-muted-foreground mb-4">The donation you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/dashboard/finance/giving/donations">
            Back to Donations
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/finance/giving/donations/${donationId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Donation</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update donor attribution, donation amount, designation category, and payment channel.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Donor Attribution</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select a registered church member or record as anonymous</p>
            </div>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="member">Church Member</Label>
                <Select 
                  value={selectedMemberId} 
                  onValueChange={setSelectedMemberId}
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
                  <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">Anonymous Donor</Label>
                  <p className="text-xs text-muted-foreground">Keep donor identity private</p>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onCheckedChange={(checked) => {
                    handleInputChange('isAnonymous', checked);
                    if (checked) {
                      setSelectedMemberId('');
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Donation Details */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-foreground">Donation Details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Specify amount, currency, fund category, payment method, and date</p>
            </div>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="amount">Amount *</Label>
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
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label>Transaction Date</Label>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="receipt">Receipt Number</Label>
                <Input
                  id="receipt"
                  value={donation?.receiptNumber || 'Auto-generated'}
                  disabled
                  className="bg-muted/40"
                />
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description / Memo *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter donation description or designated purpose..."
                  rows={3}
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/finance/giving/donations/${donationId}`}>
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
                Update Donation
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}