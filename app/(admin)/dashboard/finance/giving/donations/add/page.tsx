'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  User
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { GivingType, GivingCategory, GivingFormData } from '@/lib/types';
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

export default function RecordGivingPage() {
  const [formData, setFormData] = useState<GivingFormData>({
    type: GivingType.TITHE,
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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

  const generateReceiptNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `GIV-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMemberId && !formData.isAnonymous) {
      toast({
        title: 'Validation Error',
        description: 'Select a member or mark as anonymous',
        variant: 'destructive',
      });
      return;
    }
    
    if (formData.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Enter an amount greater than 0',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.description || !formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Enter a description',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      
      const donationData = {
        ...formData,
        memberId: formData.isAnonymous ? '' : selectedMemberId,
        receiptNumber: generateReceiptNumber(),
        status: 'completed' // Default status for new donations
      };
      
      // await givingService.create(donationData);
      
      toast({
        title: 'Success',
        description: 'Giving recorded successfully',
      });
      
      router.push('/dashboard/finance/giving');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to record giving',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-9 w-9" asChild>
          <Link href="/dashboard/finance/giving" aria-label="Back to Giving">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Record New Giving</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donor Information */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Donor Information</h2>

            <div className="grid grid-cols-12 gap-5 items-end">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="member">Member</Label>
                <Select 
                  value={selectedMemberId} 
                  onValueChange={setSelectedMemberId}
                  disabled={formData.isAnonymous}
                >
                  <SelectTrigger id="member">
                    <SelectValue placeholder={formData.isAnonymous ? "Anonymous donor" : "Select member"} />
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
                  <Label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">Anonymous Giving</Label>
                  <p className="text-xs text-muted-foreground">Keep the giver's identity private</p>
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

        {/* Giving Details */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Giving Details</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="type">Giving Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value as GivingType)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GivingType.TITHE}>Tithe</SelectItem>
                    <SelectItem value={GivingType.OFFERING}>Offering</SelectItem>
                    <SelectItem value={GivingType.DONATION}>Donation</SelectItem>
                    <SelectItem value={GivingType.FIRST_FRUITS}>First Fruits</SelectItem>
                    <SelectItem value={GivingType.SPECIAL_SEED}>Special Seed</SelectItem>
                    <SelectItem value={GivingType.THANKSGIVING}>Thanksgiving</SelectItem>
                    <SelectItem value={GivingType.FUNDRAISING}>Fundraising</SelectItem>
                    <SelectItem value={GivingType.PLEDGE}>Pledge</SelectItem>
                    <SelectItem value={GivingType.SPECIAL}>Special</SelectItem>
                    <SelectItem value={GivingType.MISSIONARY}>Missionary</SelectItem>
                    <SelectItem value={GivingType.BUILDING}>Building</SelectItem>
                    <SelectItem value={GivingType.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₵</span>
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

              <div className="col-span-12 sm:col-span-2 space-y-2">
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
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={formData.method} onValueChange={(value) => handleInputChange('method', value)}>
                  <SelectTrigger id="method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-12 sm:col-span-4 space-y-2">
                <Label>Date *</Label>
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
                <Label htmlFor="description">Description / Purpose *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Sunday first service offering / special seed donation"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <Link href="/dashboard/finance/giving">
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                <span>Recording...</span>
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                <span>Record Giving</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}