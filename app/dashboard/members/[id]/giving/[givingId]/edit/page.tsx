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
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, Member, PaymentMethod } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  Heart,
  Gift,
  Activity,
  Target,
  Star,
  Users,
  Building,
  Circle,
  Music,
  BookOpen,
  AlertCircle,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

// Mock member data for development
const mockMember: Member = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  phone: '+233 24 123 4567',
  address: '123 Main Street, Accra, Ghana',
  dateOfBirth: '1988-05-15',
  gender: 'Male',
  membershipStatus: 'Active',
  joinDate: '2023-01-15',
  avatar: null,
  familyId: 'fam1',
  emergencyContact: {
    name: 'Jane Smith',
    phone: '+233 24 123 4568',
    relationship: 'Spouse'
  },
  customFields: {},
  createdAt: '2023-01-15T00:00:00Z',
  updatedAt: '2023-01-15T00:00:00Z'
};

// Mock giving data for development
const mockGiving: Giving = {
  id: '1',
  memberId: '1',
  type: GivingType.TITHE,
  amount: 500.00,
  currency: 'GHS',
  category: GivingCategory.GENERAL,
  method: 'Cash',
  date: '2024-01-14',
  description: 'Weekly tithe',
  isAnonymous: false,
  receiptNumber: 'TITHE-2024-001',
  status: GivingStatus.COMPLETED,
  createdAt: '2024-01-14T09:00:00Z',
  updatedAt: '2024-01-14T09:00:00Z',
  metadata: {
    serviceDate: '2024-01-14',
    serviceType: 'Sunday Service'
  }
};

const givingTypes = [
  { value: GivingType.TITHE, label: 'Tithe', icon: Heart },
  { value: GivingType.OFFERING, label: 'Offering', icon: Gift },
  { value: GivingType.DONATION, label: 'Donation', icon: Heart },
  { value: GivingType.FUNDRAISING, label: 'Fundraising', icon: Activity },
  { value: GivingType.PLEDGE, label: 'Pledge', icon: Target },
  { value: GivingType.SPECIAL, label: 'Special', icon: Star },
  { value: GivingType.MISSIONARY, label: 'Missionary', icon: Users },
  { value: GivingType.BUILDING, label: 'Building', icon: Building },
];

const givingCategories = [
  { value: GivingCategory.GENERAL, label: 'General', icon: Circle },
  { value: GivingCategory.BUILDING_FUND, label: 'Building Fund', icon: Building },
  { value: GivingCategory.MISSIONARY, label: 'Missionary', icon: Users },
  { value: GivingCategory.YOUTH, label: 'Youth', icon: Users },
  { value: GivingCategory.CHILDREN, label: 'Children', icon: Users },
  { value: GivingCategory.MUSIC, label: 'Music', icon: Music },
  { value: GivingCategory.EDUCATION, label: 'Education', icon: BookOpen },
  { value: GivingCategory.OUTREACH, label: 'Outreach', icon: Users },
  { value: GivingCategory.CHARITY, label: 'Charity', icon: Heart },
  { value: GivingCategory.MEDICAL, label: 'Medical', icon: AlertCircle },
  { value: GivingCategory.DISASTER_RELIEF, label: 'Disaster Relief', icon: AlertCircle },
];

const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Card', label: 'Card' },
  { value: 'Transfer', label: 'Bank Transfer' },
  { value: 'Online', label: 'Online' },
  { value: 'Check', label: 'Check' },
];

const givingStatuses = [
  { value: GivingStatus.COMPLETED, label: 'Completed' },
  { value: GivingStatus.PENDING, label: 'Pending' },
  { value: GivingStatus.FAILED, label: 'Failed' },
  { value: GivingStatus.REFUNDED, label: 'Refunded' },
  { value: GivingStatus.CANCELLED, label: 'Cancelled' },
];

export default function EditGivingPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [giving, setGiving] = useState<Giving | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;
  const givingId = params.givingId as string;

  // Form state
  const [formData, setFormData] = useState({
    type: GivingType.TITHE,
    amount: '',
    currency: 'GHS',
    category: GivingCategory.GENERAL,
    method: 'Cash',
    date: '',
    description: '',
    isAnonymous: false,
    campaign: '',
    status: GivingStatus.COMPLETED,
    metadata: {} as Record<string, any>,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [memberResponse, givingResponse] = await Promise.all([
        //   membersService.getMember(memberId),
        //   givingService.getGiving(givingId)
        // ]);
        // setMember(memberResponse);
        // setGiving(givingResponse);
        
        setMember(mockMember);
        setGiving(mockGiving);
        
        // Populate form with existing data
        setFormData({
          type: mockGiving.type,
          amount: mockGiving.amount.toString(),
          currency: mockGiving.currency,
          category: mockGiving.category,
          method: mockGiving.method,
          date: mockGiving.date,
          description: mockGiving.description ?? '',
          isAnonymous: mockGiving.isAnonymous,
          campaign: mockGiving.campaign ?? '',
          status: mockGiving.status,
          metadata: mockGiving.metadata ?? {},
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        toast({
          title: 'Error',
          description: 'Failed to load giving information',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId && givingId) {
      loadData();
    }
  }, [memberId, givingId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      
      const givingData: Partial<Giving> = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        category: formData.category,
        method: (["Cash", "Card", "Transfer", "Online", "Check"].includes(formData.method) ? formData.method : undefined) as PaymentMethod,
        date: formData.date,
        description: formData.description,
        isAnonymous: formData.isAnonymous,
        campaign: formData.campaign || undefined,
        status: formData.status,
        metadata: formData.metadata,
      };

      // For now, simulate API call. Replace with actual API call:
      // await givingService.updateGiving(givingId, givingData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Giving record updated successfully',
      });
      
      router.push(`/dashboard/members/${memberId}/giving`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update giving record',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this giving record? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      
      // For now, simulate API call. Replace with actual API call:
      // await givingService.deleteGiving(givingId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Giving record deleted successfully',
      });
      
      router.push(`/dashboard/members/${memberId}/giving`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete giving record',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTypeIcon = (type: GivingType) => {
    const typeConfig = givingTypes.find(t => t.value === type);
    const Icon = typeConfig?.icon || Circle;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryIcon = (category: GivingCategory) => {
    const categoryConfig = givingCategories.find(c => c.value === category);
    const Icon = categoryConfig?.icon || Circle;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member || !giving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">
          {error || 'Giving record not found'}
        </div>
        <Button asChild>
          <Link href={`/dashboard/members/${memberId}/giving`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Giving History
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/members/${member.id}/giving`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Giving History
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Giving Record</h1>
            <p className="text-muted-foreground">
              Update giving record for {member.firstName} {member.lastName}
            </p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleting ? 'Deleting...' : 'Delete Record'}
        </Button>
      </div>

      {/* Receipt Info */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Information</CardTitle>
          <CardDescription>
            Receipt details for this giving record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm text-muted-foreground">Receipt Number</Label>
              <p className="font-medium">{giving.receiptNumber}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Created</Label>
              <p className="font-medium">{new Date(giving.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Giving Details</CardTitle>
          <CardDescription>
            Update the details of the giving contribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Type of Giving</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {givingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type.value)}
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className="pl-8"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    <CurrencyDisplay amount={0} showSymbol={true} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {givingCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.value)}
                          <span>{category.label}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {givingStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign">Campaign (Optional)</Label>
              <Input
                id="campaign"
                value={formData.campaign}
                onChange={(e) => handleInputChange('campaign', e.target.value)}
                placeholder="e.g., Building Fund, Mission Trip"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about this giving..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="anonymous"
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => handleInputChange('isAnonymous', checked)}
              />
              <Label htmlFor="anonymous">Anonymous Giving</Label>
            </div>

            {/* Summary */}
            {formData.amount && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">
                        <CurrencyDisplay amount={parseFloat(formData.amount) || 0} />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">
                        {givingTypes.find(t => t.value === formData.type)?.label}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/members/${memberId}/giving`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Update Giving Record'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 