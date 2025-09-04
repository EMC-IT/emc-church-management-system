'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { givingService } from '@/services';
import { Giving, GivingType, GivingCategory, GivingStatus, Member } from '@/lib/types';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Download,
  Share2,
  Calendar,
  Receipt,
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
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

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
  description: 'Weekly tithe contribution for Sunday service. This was given during the morning service and is part of the regular weekly giving.',
  isAnonymous: false,
  receiptNumber: 'TITHE-2024-001',
  status: GivingStatus.COMPLETED,
  createdAt: '2024-01-14T09:00:00Z',
  updatedAt: '2024-01-14T09:00:00Z',
  metadata: {
    serviceDate: '2024-01-14',
    serviceType: 'Sunday Service',
    serviceTime: '10:00 AM',
    location: 'Main Sanctuary'
  }
};

export default function GivingDetailPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [giving, setGiving] = useState<Giving | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;
  const givingId = params.givingId as string;

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

  const handleGenerateReceipt = async () => {
    try {
      // For now, simulate API call. Replace with actual API call:
      // const receipt = await givingService.generateReceipt(givingId);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Receipt generated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate receipt',
        variant: 'destructive',
      });
    }
  };

  const getTypeIcon = (type: GivingType) => {
    switch (type) {
      case GivingType.TITHE:
        return <Heart className="h-4 w-4" />;
      case GivingType.OFFERING:
        return <Gift className="h-4 w-4" />;
      case GivingType.DONATION:
        return <Heart className="h-4 w-4" />;
      case GivingType.FUNDRAISING:
        return <Activity className="h-4 w-4" />;
      case GivingType.PLEDGE:
        return <Target className="h-4 w-4" />;
      case GivingType.SPECIAL:
        return <Star className="h-4 w-4" />;
      case GivingType.MISSIONARY:
        return <Users className="h-4 w-4" />;
      case GivingType.BUILDING:
        return <Building className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: GivingCategory) => {
    switch (category) {
      case GivingCategory.GENERAL:
        return <Circle className="h-4 w-4" />;
      case GivingCategory.BUILDING_FUND:
        return <Building className="h-4 w-4" />;
      case GivingCategory.MISSIONARY:
        return <Users className="h-4 w-4" />;
      case GivingCategory.YOUTH:
        return <Users className="h-4 w-4" />;
      case GivingCategory.CHILDREN:
        return <Users className="h-4 w-4" />;
      case GivingCategory.MUSIC:
        return <Music className="h-4 w-4" />;
      case GivingCategory.EDUCATION:
        return <BookOpen className="h-4 w-4" />;
      case GivingCategory.OUTREACH:
        return <Users className="h-4 w-4" />;
      case GivingCategory.CHARITY:
        return <Heart className="h-4 w-4" />;
      case GivingCategory.MEDICAL:
        return <AlertCircle className="h-4 w-4" />;
      case GivingCategory.DISASTER_RELIEF:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: GivingType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getCategoryLabel = (category: GivingCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const getStatusBadge = (status: GivingStatus) => {
    switch (status) {
      case GivingStatus.COMPLETED:
        return <Badge variant="default">Completed</Badge>;
      case GivingStatus.PENDING:
        return <Badge variant="secondary">Pending</Badge>;
      case GivingStatus.FAILED:
        return <Badge variant="destructive">Failed</Badge>;
      case GivingStatus.REFUNDED:
        return <Badge variant="outline">Refunded</Badge>;
      case GivingStatus.CANCELLED:
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <h1 className="text-3xl font-bold tracking-tight">Giving Record Details</h1>
            <p className="text-muted-foreground">
              View details for {member.firstName} {member.lastName}'s giving record
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleGenerateReceipt}>
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          <Button variant="outline">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button asChild>
            <Link href={`/dashboard/members/${memberId}/giving/${givingId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getTypeIcon(giving.type)}
                <span>{getTypeLabel(giving.type)}</span>
              </CardTitle>
              <CardDescription>
                Giving record for {member.firstName} {member.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Amount</Label>
                  <p className="text-2xl font-bold text-green-600">
                    <CurrencyDisplay amount={giving.amount} />
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(giving.status)}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Category</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getCategoryIcon(giving.category)}
                    <span className="font-medium">{getCategoryLabel(giving.category)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize mt-1">{giving.method}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(giving.date)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Anonymous</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {giving.isAnonymous ? (
                      <>
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Yes</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">No</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {giving.campaign && (
                <div>
                  <Label className="text-sm text-muted-foreground">Campaign</Label>
                  <p className="font-medium mt-1">{giving.campaign}</p>
                </div>
              )}

              {giving.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{giving.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {giving.metadata && Object.keys(giving.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Additional details about this giving record
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(giving.metadata).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-sm text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="font-medium mt-1">{value as string}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Receipt Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <span>Receipt</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Receipt Number</Label>
                <p className="font-medium">{giving.receiptNumber}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Created</Label>
                <p className="font-medium">{formatDate(giving.createdAt)}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Last Updated</Label>
                <p className="font-medium">{formatDate(giving.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Member Information */}
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Name</Label>
                <p className="font-medium">{member.firstName} {member.lastName}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{member.email}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Phone</Label>
                <p className="font-medium">{member.phone}</p>
              </div>
              <Button variant="outline" asChild className="w-full">
                <Link href={`/dashboard/members/${member.id}`}>
                  View Member Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" onClick={handleGenerateReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/members/${memberId}/giving/${givingId}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Record
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Record
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 