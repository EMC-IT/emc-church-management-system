'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AddDonationPage() {
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
    return `DON-${timestamp}`;
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
        description: 'Donation recorded successfully',
      });
      
      router.push('/dashboard/finance/giving/donations');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to record donation',
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
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/finance/giving/donations">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Donations
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Record New Donation</h1>
          <p className="text-muted-foreground">
            Create a new donation record
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Donor Information */}
            <LazySection
              strategy="immediate"
              showSkeleton
              skeletonVariant="form"
              threshold={0.1}
            >
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Donor Information</span>
                </CardTitle>
                <CardDescription>
                  Select the donor or mark as anonymous
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="member">Member</Label>
                    <Select 
                      value={selectedMemberId} 
                      onValueChange={setSelectedMemberId}
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
                          setSelectedMemberId('');
                        }
                      }}
                    />
                    <Label htmlFor="anonymous">Anonymous Donation</Label>
                  </div>
                </div>
              </CardContent>
              </Card>
            </LazySection>

            {/* Donation Details */}
            <LazySection
              strategy="lazy"
              showSkeleton
              skeletonVariant="form"
              threshold={0.2}
            >
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BadgeCent className="h-5 w-5" />
                  <span>Donation Details</span>
                </CardTitle>
                <CardDescription>
                  Enter the donation amount and details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
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
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter donation description or purpose"
                    className="min-h-[100px]"
                    required
                  />
                </div>
              </CardContent>
              </Card>
            </LazySection>
          </div>

          {/* Summary Sidebar */}
          <LazySection
            strategy="lazy"
            showSkeleton
            skeletonVariant="card"
            skeletonCount={3}
            threshold={0.3}
          >
            <div className="space-y-6">
              <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BadgeCent className="h-5 w-5" />
                  <span>Donation Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Donor:</span>
                    <span className="font-medium text-sm">
                      {formData.isAnonymous 
                        ? 'Anonymous' 
                        : selectedMemberId 
                          ? mockMembers.find(m => m.id === selectedMemberId)?.name || 'Unknown'
                          : 'Not selected'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(formData.amount || 0)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="font-medium text-sm capitalize">
                      {formData.category.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Method:</span>
                    <span className="font-medium text-sm capitalize">
                      {formData.method.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="font-medium text-sm">
                      {format(selectedDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  
                  <hr className="my-2" />
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Receipt #:</span>
                    <span className="font-medium text-sm">
                      {generateReceiptNumber()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Categories</CardTitle>
                <CardDescription>
                  Common donation categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleInputChange('category', GivingCategory.GENERAL);
                    handleInputChange('description', 'General offering');
                  }}
                >
                  <BadgeCent className="mr-2 h-4 w-4" />
                  Quick: General
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    handleInputChange('category', GivingCategory.BUILDING_FUND);
                    handleInputChange('description', 'Building fund donation');
                  }}
                >
                  <BadgeCent className="mr-2 h-4 w-4" />
                  Quick: Building Fund
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleInputChange('category', GivingCategory.MISSIONARY);
                    handleInputChange('description', 'Missionary support');
                  }}
                >
                  <BadgeCent className="mr-2 h-4 w-4" />
                  Quick: Missionary
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => {
                    handleInputChange('category', GivingCategory.OUTREACH);
                    handleInputChange('description', 'Outreach support');
                  }}
                >
                  <BadgeCent className="mr-2 h-4 w-4" />
                  Quick: Outreach
                </Button>
              </CardContent>
            </Card>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {loading ? 'Recording...' : 'Record Donation'}
                </Button>
                <Button type="button" variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/finance/giving/donations">
                    Cancel
                  </Link>
                </Button>
              </div>
            </div>
          </LazySection>
        </div>
      </form>
    </div>
  );
}