'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  User,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  Download,
  Share2,
  Upload,
  DollarSign,
  Plus
} from 'lucide-react';
import Link from 'next/link';

// Mock data for departments, groups, and members (should match the form)
const MOCK_DEPARTMENTS = [
  { id: 'd1', name: 'Media' },
  { id: 'd2', name: 'Music' },
  { id: 'd3', name: 'Protocol' },
  { id: 'd4', name: 'Children’s Ministry' },
  { id: 'd5', name: 'Finance' },
];
const MOCK_GROUPS = [
  { id: 'g1', name: 'Ushering' },
  { id: 'g2', name: 'Choir' },
  { id: 'g3', name: 'Prayer Warriors' },
  { id: 'g4', name: 'Technical' },
  { id: 'g5', name: 'Evangelism' },
];
const MOCK_MEMBERS = [
  { id: 'm1', name: 'John Doe' },
  { id: 'm2', name: 'Jane Smith' },
  { id: 'm3', name: 'Kwame Boateng' },
  { id: 'm4', name: 'Abena Mensah' },
  { id: 'm5', name: 'Kojo Appiah' },
];

// Mock family members data
const mockFamilyMembers = [
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@email.com',
    phone: '+233 24 123 4568',
    address: '123 Main Street, Accra, Ghana',
    dateOfBirth: '1990-08-22',
    gender: 'Female',
    membershipStatus: 'Active',
    joinDate: '2023-02-10',
    avatar: null,
    familyId: 'fam1',
    emergencyContact: {
      name: 'John Smith',
      phone: '+233 24 123 4567',
      relationship: 'Spouse'
    },
    customFields: {},
    createdAt: '2023-02-10T00:00:00Z',
    updatedAt: '2023-02-10T00:00:00Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Smith',
    email: 'michael.smith@email.com',
    phone: '+233 24 123 4569',
    address: '123 Main Street, Accra, Ghana',
    dateOfBirth: '2015-03-15',
    gender: 'Male',
    membershipStatus: 'Active',
    joinDate: '2023-03-15',
    avatar: null,
    familyId: 'fam1',
    emergencyContact: {
      name: 'John Smith',
      phone: '+233 24 123 4567',
      relationship: 'Father'
    },
    customFields: {},
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Smith',
    email: 'sarah.smith@email.com',
    phone: '+233 24 123 4570',
    address: '123 Main Street, Accra, Ghana',
    dateOfBirth: '2018-11-08',
    gender: 'Female',
    membershipStatus: 'Active',
    joinDate: '2023-03-15',
    avatar: null,
    familyId: 'fam1',
    emergencyContact: {
      name: 'John Smith',
      phone: '+233 24 123 4567',
      relationship: 'Father'
    },
    customFields: {},
    createdAt: '2023-03-15T00:00:00Z',
    updatedAt: '2023-03-15T00:00:00Z'
  },
];

// Mock activity data
const mockActivities = [
  {
    id: '1',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Attended Sunday service',
    date: '2024-01-14',
    time: '09:00',
    status: 'present',
    location: 'Main Sanctuary'
  },
  {
    id: '2',
    type: 'attendance',
    title: 'Bible Study',
    description: 'Attended Wednesday Bible study',
    date: '2024-01-10',
    time: '19:00',
    status: 'present',
    location: 'Fellowship Hall'
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Ushering',
    description: 'Served as usher during service',
    date: '2024-01-07',
    time: '08:30',
    status: 'completed',
    location: 'Main Sanctuary'
  },
  {
    id: '4',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Attended Sunday service',
    date: '2024-01-07',
    time: '09:00',
    status: 'present',
    location: 'Main Sanctuary'
  },
  {
    id: '5',
    type: 'event',
    title: 'Christmas Celebration',
    description: 'Participated in Christmas celebration',
    date: '2023-12-25',
    time: '18:00',
    status: 'completed',
    location: 'Church Grounds'
  },
  {
    id: '6',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Attended Sunday service',
    date: '2023-12-24',
    time: '09:00',
    status: 'present',
    location: 'Main Sanctuary'
  }
];

// Mock attendance statistics
const mockAttendanceStats = {
  totalServices: 156,
  attendedServices: 142,
  attendanceRate: 91.0,
  currentStreak: 8,
  longestStreak: 24,
  volunteerHours: 45,
  eventsParticipated: 12
};

// Mock member data for development (new schema)
const mockMember = {
  id: '1',
  title: 'Rev.',
  fullName: 'Kwame Mensah Boateng',
  branch: 'Somanya',
  serviceType: 'Jesus Generation',
  status: 'Special Guest',
  contact1: '+233 20 555 1234',
  contact2: '+233 24 888 5678',
  email: 'kwame.mensah@church.com',
  gender: 'Male',
  dateOfBirth: '1992-03-10',
  ageGroup: 'Youth',
  lifeDevelopment: 'Ministry',
  departments: ['d2', 'd4', 'd5'],
  groups: ['g2', 'g3', 'g5'],
  waterBaptism: 'Yes',
  holyGhostBaptism: 'Yes',
  leadershipRole: 'Youth President',
  specialGuestInvitedBy: 'custom',
  specialGuestInvitedByCustom: 'Prophet Samuel Owusu',
  avatar: '',
  location: 'Accra',
};

export default function MemberProfilePage() {
  const [member, setMember] = useState<any>(null);
  const [activities, setActivities] = useState(mockActivities);
  const [attendanceStats, setAttendanceStats] = useState(mockAttendanceStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [memberResponse, activitiesResponse, statsResponse] = await Promise.all([
        //   membersService.getMember(memberId),
        //   membersService.getMemberActivities(memberId),
        //   membersService.getMemberAttendanceStats(memberId)
        // ]);
        // setMember(memberResponse.data);
        // setActivities(activitiesResponse.data);
        // setAttendanceStats(statsResponse.data);
        setMember(mockMember);
      } catch (err: any) {
        setError(err.message || 'Failed to load member history');
        toast({
          title: 'Error',
          description: 'Failed to load member history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadData();
    }
  }, [memberId, toast]);

  const handleDeleteMember = async () => {
    if (!member) return;
    
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
      try {
        await membersService.deleteMember(member.id);
        toast({
          title: 'Success',
          description: 'Member deleted successfully',
        });
        router.push('/dashboard/members');
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'Failed to delete member',
          variant: 'destructive',
        });
      }
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 
      : age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="h-4 w-4" />;
      case 'volunteer':
        return <Users className="h-4 w-4" />;
      case 'event':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
      case 'completed':
        return <Badge variant="default">Present</Badge>;
      case 'absent':
        return <Badge variant="secondary">Absent</Badge>;
      case 'late':
        return <Badge variant="outline">Late</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">
          {error || 'Member not found'}
        </div>
        <Button asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
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
            <Link href="/dashboard/members">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Members
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member Profile</h1>
            <p className="text-muted-foreground">View and manage member information</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button asChild>
            <Link href={`/dashboard/members/${member.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Member
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDeleteMember}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Member Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={member.avatar || ''} />
                <AvatarFallback className="text-lg">
                  {member.fullName ? member.fullName.split(' ').map((n: string) => n[0]).join('') : ''}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">{member.title} {member.fullName}</CardTitle>
            <CardDescription>{member.email}</CardDescription>
            <Badge variant={member.status === 'Member' ? 'default' : 'secondary'}>
              {member.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                {member.email}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                {member.contact1}
              </div>
              {member.contact2 && (
                <div className="flex items-center text-sm">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  {member.contact2}
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {member.dateOfBirth ? `${calculateAge(member.dateOfBirth)} years old` : 'N/A'}
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                {member.gender}
              </div>
              <div className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                {member.branch}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{member.location}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Member Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
            <CardDescription>Detailed member information and history</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="family">Family</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="giving">Giving</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span>{member.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Full Name:</span>
                        <span>{member.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gender:</span>
                        <span>{member.gender}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date of Birth:</span>
                        <span>{formatDate(member.dateOfBirth)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Age Group:</span>
                        <span>{member.ageGroup}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Contact 1:</span>
                        <span>{member.contact1}</span>
                      </div>
                      {member.contact2 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contact 2:</span>
                          <span>{member.contact2}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Church Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Branch:</span>
                        <span>{member.branch}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service Type:</span>
                        <span>{member.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{member.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Departments:</span>
                        <span>{(member.departments || []).map((id: string) => MOCK_DEPARTMENTS.find(d => d.id === id)?.name || id).join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Groups:</span>
                        <span>{(member.groups || []).map((id: string) => MOCK_GROUPS.find(g => g.id === id)?.name || id).join(', ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Life Development:</span>
                        <span>{member.lifeDevelopment}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Water Baptism:</span>
                        <span>{member.waterBaptism}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Holy Ghost Baptism:</span>
                        <span>{member.holyGhostBaptism}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold mt-4">Leadership & Invitation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leadership Role:</span>
                        <span>{member.leadershipRole || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Invited By:</span>
                        <span>{member.specialGuestInvitedBy === 'custom'
                          ? member.specialGuestInvitedByCustom
                          : (MOCK_MEMBERS.find(m => m.id === member.specialGuestInvitedBy)?.name || member.specialGuestInvitedBy)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="family" className="space-y-4">
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Family Members</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage family relationships
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/members/${member.id}/family`}>
                      Manage Family
                    </Link>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="text-center py-8">
                  <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Activity History</h3>
                  <p className="text-muted-foreground mb-4">
                    View member's activity and attendance history
                  </p>
                  <Button asChild>
                    <Link href={`/dashboard/members/${member.id}/history`}>
                      View History
                    </Link>
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Documents</h3>
                  <p className="text-muted-foreground mb-4">
                    View and manage member documents
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button asChild>
                      <Link href={`/dashboard/members/${member.id}/documents`}>
                        View Documents
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/members/${member.id}/documents/upload`}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Documents
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="giving" className="space-y-4">
                <div className="text-center py-8">
                  <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Giving History</h3>
                  <p className="text-muted-foreground mb-4">
                    Track tithes, offerings, donations, and fundraising
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <Button asChild>
                      <Link href={`/dashboard/members/${member.id}/giving`}>
                        View Giving History
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/dashboard/members/${member.id}/giving/add`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Giving Record
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 