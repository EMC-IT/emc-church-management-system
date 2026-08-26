'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Smartphone,
  Mail, 
  MapPin, 
  Calendar,
  User,
  Download,
  Share2,
  Upload,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react';

// Mock data for departments, groups, and members
const MOCK_DEPARTMENTS = [
  { id: 'd1', name: 'Media' },
  { id: 'd2', name: 'Music' },
  { id: 'd3', name: 'Protocol' },
  { id: 'd4', name: "Children's Ministry" },
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

// Mock family members
const mockFamilyMembers = [
  {
    id: 'fam-1',
    fullName: 'Jane Mensah Boateng',
    relationship: 'Spouse',
    gender: 'Female',
    dateOfBirth: '1990-08-22',
    phone: '+233 24 123 4568',
    email: 'jane.boateng@church.com',
    status: 'active',
  },
  {
    id: 'fam-2',
    fullName: 'Michael Mensah Boateng',
    relationship: 'Child (Son)',
    gender: 'Male',
    dateOfBirth: '2015-03-15',
    phone: '+233 24 123 4569',
    email: 'michael.boateng@church.com',
    status: 'active',
  },
  {
    id: 'fam-3',
    fullName: 'Sarah Mensah Boateng',
    relationship: 'Child (Daughter)',
    gender: 'Female',
    dateOfBirth: '2018-11-08',
    phone: '+233 24 123 4570',
    email: 'sarah.boateng@church.com',
    status: 'active',
  },
];

// Mock activity data
const mockActivities = [
  {
    id: '1',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Empowerment Service',
    date: '2024-01-14',
    time: '09:00 AM',
    status: 'present',
    location: 'Main Sanctuary',
  },
  {
    id: '2',
    type: 'attendance',
    title: 'Wednesday Bible Study',
    description: 'Midweek Expository Teaching',
    date: '2024-01-10',
    time: '07:00 PM',
    status: 'present',
    location: 'Fellowship Hall',
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Youth Leadership Meeting',
    description: 'Youth Department Planning Session',
    date: '2024-01-07',
    time: '04:00 PM',
    status: 'completed',
    location: 'Conference Room B',
  },
  {
    id: '4',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'New Year Thanksgiving Service',
    date: '2024-01-07',
    time: '09:00 AM',
    status: 'present',
    location: 'Main Sanctuary',
  },
  {
    id: '5',
    type: 'event',
    title: 'Christmas Carol & Dinner',
    description: 'Annual Christmas Celebration',
    date: '2023-12-25',
    time: '06:00 PM',
    status: 'completed',
    location: 'Church Auditorium',
  }
];

// Mock attendance statistics
const mockAttendanceStats = {
  totalServices: 156,
  attendedServices: 142,
  attendanceRate: 91.0,
  currentStreak: 8,
};

// Mock documents
const mockDocuments = [
  {
    id: 'doc-1',
    title: 'National Identification Card (Ghana Card)',
    category: 'Identification',
    fileName: 'ghana_card_kmb.pdf',
    fileSize: '2.4 MB',
    fileType: 'PDF',
    uploadedAt: '2024-01-15',
    uploadedBy: 'Admin',
    status: 'verified',
  },
  {
    id: 'doc-2',
    title: 'Water Baptism Certificate',
    category: 'Sacrament',
    fileName: 'baptism_certificate_kmb.pdf',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    uploadedAt: '2024-01-10',
    uploadedBy: 'Church Office',
    status: 'verified',
  },
  {
    id: 'doc-3',
    title: 'Ministerial / Ordination License',
    category: 'Ministry',
    fileName: 'ordination_certificate.pdf',
    fileSize: '3.8 MB',
    fileType: 'PDF',
    uploadedAt: '2024-01-05',
    uploadedBy: 'HQ Secretariat',
    status: 'verified',
  },
  {
    id: 'doc-4',
    title: 'Marriage Certificate',
    category: 'Legal',
    fileName: 'marriage_cert_boateng.pdf',
    fileSize: '1.8 MB',
    fileType: 'PDF',
    uploadedAt: '2023-12-20',
    uploadedBy: 'Admin',
    status: 'verified',
  },
  {
    id: 'doc-5',
    title: 'Medical Clearance Form',
    category: 'Medical',
    fileName: 'medical_report_2023.pdf',
    fileSize: '4.1 MB',
    fileType: 'PDF',
    uploadedAt: '2023-11-15',
    uploadedBy: 'Member',
    status: 'verified',
  }
];

// Mock giving records
const mockGiving = [
  {
    id: 'giv-1',
    type: 'Tithe',
    amount: '500.00',
    currency: 'GHS',
    category: 'Weekly Tithe',
    method: 'Mobile Money',
    date: '2024-01-14',
    receiptNumber: 'TITHE-2024-001',
    status: 'completed'
  },
  {
    id: 'giv-2',
    type: 'Offering',
    amount: '100.00',
    currency: 'GHS',
    category: 'Sunday General Offering',
    method: 'Cash',
    date: '2024-01-14',
    receiptNumber: 'OFFER-2024-001',
    status: 'completed'
  },
  {
    id: 'giv-3',
    type: 'Donation',
    amount: '1,000.00',
    currency: 'GHS',
    category: 'Sanctuary Building Project',
    method: 'Bank Transfer',
    date: '2024-01-10',
    receiptNumber: 'DON-2024-001',
    status: 'completed'
  },
  {
    id: 'giv-4',
    type: 'Fundraising',
    amount: '250.00',
    currency: 'GHS',
    category: 'Youth Missions Trip 2024',
    method: 'Card',
    date: '2024-01-08',
    receiptNumber: 'FUND-2024-001',
    status: 'completed'
  },
  {
    id: 'giv-5',
    type: 'Special',
    amount: '300.00',
    currency: 'GHS',
    category: 'Prophetic Seed Offering',
    method: 'Mobile Money',
    date: '2024-01-05',
    receiptNumber: 'SPEC-2024-001',
    status: 'completed'
  }
];

// Mock member profile data
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
        // Using mock data for local display
        setMember(mockMember);
      } catch (err: any) {
        setError(err.message || 'Failed to load member profile');
        toast({
          title: 'Error',
          description: 'Failed to load member profile',
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
    if (!dateOfBirth) return '—';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return isNaN(age) ? '—' : `${age} years old`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return 'M';
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'M';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return parts.map(p => p[0]).join('').toUpperCase().slice(0, 3);
  };

  const formatDepartments = (deptIds?: string[]) => {
    if (!deptIds || !deptIds.length) return 'None';
    return deptIds
      .map(id => MOCK_DEPARTMENTS.find(d => d.id === id)?.name || id)
      .join(', ');
  };

  const formatGroups = (groupIds?: string[]) => {
    if (!groupIds || !groupIds.length) return 'None';
    return groupIds
      .map(id => MOCK_GROUPS.find(g => g.id === id)?.name || id)
      .join(', ');
  };

  const formatInvitedBy = (mem: any) => {
    if (mem.specialGuestInvitedBy === 'custom') {
      return mem.specialGuestInvitedByCustom || '—';
    }
    if (mem.specialGuestInvitedBy) {
      const found = MOCK_MEMBERS.find(m => m.id === mem.specialGuestInvitedBy);
      return found ? found.name : mem.specialGuestInvitedBy;
    }
    return mem.specialGuestInvitedByCustom || '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-sm font-medium">
          {error || 'Member not found'}
        </div>
        <Button asChild variant="outline" size="sm">
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
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/members">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Member Profile</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast({
                title: "Export Member",
                description: "Exporting member profile data...",
              });
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined') {
                navigator.clipboard?.writeText(window.location.href);
                toast({
                  title: "Link Copied",
                  description: "Profile URL copied to clipboard",
                });
              }
            }}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          <Button asChild size="sm">
            <Link href={`/dashboard/members/${member.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Member
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteMember}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Member Overview & Contact Card */}
        <div className="lg:col-span-4 xl:col-span-4">
          <Card className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-3 flex items-center justify-center">
                {member.avatar ? (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={member.avatar} alt={member.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                      {getInitials(member.fullName)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-semibold text-xl tracking-wide">
                    {getInitials(member.fullName)}
                  </div>
                )}
              </div>

              <div className="mb-2">
                <Badge variant="primary" size="sm">
                  {member.status || 'Member'}
                </Badge>
              </div>

              <h2 className="font-heading text-lg font-bold">
                {member.title ? `${member.title} ` : ''}{member.fullName}
              </h2>
            </div>

            <div className="mt-6 mb-3 pt-6 border-t border-border">
              <h3 className="font-heading text-sm font-semibold text-foreground">
                Contact Information
              </h3>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              {member.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate text-foreground">{member.email}</span>
                </div>
              )}

              {member.contact1 && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">{member.contact1}</span>
                </div>
              )}

              {member.contact2 && (
                <div className="flex items-center gap-3">
                  <Smartphone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground">{member.contact2}</span>
                </div>
              )}

              <div className="pt-2 space-y-3 border-t border-border/50">
                {member.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span>{calculateAge(member.dateOfBirth)}</span>
                  </div>
                )}

                {member.gender && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <span>{member.gender}</span>
                  </div>
                )}

                {member.branch && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{member.branch}</span>
                  </div>
                )}

                {member.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{member.location}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Member Information with Underline Tabs */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold">
              Member Information
            </h2>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            {/* Underline Tabs Navigation */}
            <div className="border-b border-border">
              <TabsList className="h-auto bg-transparent p-0 gap-6 justify-start rounded-none">
                <TabsTrigger
                  value="overview"
                  className="rounded-none border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="family"
                  className="rounded-none border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Family
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  History
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-none border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="giving"
                  className="rounded-none border-b-2 border-transparent px-1 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Giving
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ========================================================================= */}
            {/* TAB 1: OVERVIEW */}
            {/* ========================================================================= */}
            <TabsContent value="overview" className="mt-4 space-y-4 focus-visible:outline-none">
              {/* Section 1: Personal Information */}
              <Card className="p-5">
                <h3 className="font-heading text-base font-semibold mb-4">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="space-y-2.5">
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Title:</span>
                      <span className="font-medium text-foreground">{member.title || '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Full Name:</span>
                      <span className="font-medium text-foreground">{member.fullName || '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Gender:</span>
                      <span className="font-medium text-foreground">{member.gender || '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Date of Birth:</span>
                      <span className="font-medium text-foreground">{member.dateOfBirth ? formatDate(member.dateOfBirth) : '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Age Group:</span>
                      <span className="font-medium text-foreground">{member.ageGroup || '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex">
                      <span className="w-24 text-muted-foreground shrink-0">Contact 1:</span>
                      <span className="font-medium text-foreground">{member.contact1 || '—'}</span>
                    </div>
                    {member.contact2 && (
                      <div className="flex">
                        <span className="w-24 text-muted-foreground shrink-0">Contact 2:</span>
                        <span className="font-medium text-foreground">{member.contact2}</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="w-24 text-muted-foreground shrink-0">Email:</span>
                      <span className="font-medium text-foreground">{member.email || '—'}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section 2: Church Information */}
              <Card className="p-5">
                <h3 className="font-heading text-base font-semibold mb-4">
                  Church Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <div className="space-y-2.5">
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Branch:</span>
                      <span className="font-medium text-foreground">{member.branch || '—'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-28 text-muted-foreground shrink-0">Service Type:</span>
                      <span className="font-medium text-foreground">{member.serviceType || '—'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 text-muted-foreground shrink-0">Status:</span>
                      <Badge variant="success" size="sm">
                        {member.status || '—'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex">
                      <span className="w-36 text-muted-foreground shrink-0">Departments:</span>
                      <span className="font-medium text-foreground">{formatDepartments(member.departments)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 text-muted-foreground shrink-0">Groups:</span>
                      <span className="font-medium text-foreground">{formatGroups(member.groups)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-36 text-muted-foreground shrink-0">Life Development:</span>
                      <span className="font-medium text-foreground">{member.lifeDevelopment || '—'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 text-muted-foreground shrink-0">Water Baptism:</span>
                      <Badge variant={member.waterBaptism === 'Yes' ? 'success' : 'neutral'} size="sm">
                        {member.waterBaptism || 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <span className="w-36 text-muted-foreground shrink-0">Holy Ghost Baptism:</span>
                      <Badge variant={member.holyGhostBaptism === 'Yes' ? 'success' : 'neutral'} size="sm">
                        {member.holyGhostBaptism || 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section 3: Leadership & Invitation */}
              <Card className="p-5">
                <h3 className="font-heading text-base font-semibold mb-4">
                  Leadership & Invitation
                </h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex">
                    <span className="w-36 text-muted-foreground shrink-0">Leadership Role:</span>
                    <span className="font-medium text-foreground">{member.leadershipRole || 'N/A'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-36 text-muted-foreground shrink-0">Invited By:</span>
                    <span className="font-medium text-foreground">{formatInvitedBy(member)}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* TAB 2: FAMILY */}
            {/* ========================================================================= */}
            <TabsContent value="family" className="mt-4 space-y-4 focus-visible:outline-none">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-heading text-base font-semibold">
                    Family Members ({mockFamilyMembers.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/members/${member.id}/family/add`}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Family Member
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/members/${member.id}/family`}>
                        Manage Family
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockFamilyMembers.map((fam) => (
                        <TableRow key={fam.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{fam.fullName}</div>
                            <div className="text-xs text-muted-foreground">{fam.gender}</div>
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {fam.relationship}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {calculateAge(fam.dateOfBirth)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div>{fam.phone}</div>
                            <div className="text-xs">{fam.email}</div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={fam.status} size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/dashboard/members/${member.id}/family`}>
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* TAB 3: HISTORY */}
            {/* ========================================================================= */}
            <TabsContent value="history" className="mt-4 space-y-4 focus-visible:outline-none">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Total Services</div>
                  <div className="font-heading text-xl font-bold mt-1">{mockAttendanceStats.totalServices}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Attended</div>
                  <div className="font-heading text-xl font-bold mt-1">{mockAttendanceStats.attendedServices}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Attendance Rate</div>
                  <div className="font-heading text-xl font-bold text-primary mt-1">{mockAttendanceStats.attendanceRate}%</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Current Streak</div>
                  <div className="font-heading text-xl font-bold mt-1">{mockAttendanceStats.currentStreak} wks</div>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-heading text-base font-semibold">
                    Activity History
                  </h3>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/members/${member.id}/history`}>
                      <ExternalLink className="mr-1.5 h-4 w-4" />
                      Full History
                    </Link>
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event / Service</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockActivities.map((act) => (
                        <TableRow key={act.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{act.title}</div>
                            <div className="text-xs text-muted-foreground">{act.description}</div>
                          </TableCell>
                          <TableCell className="capitalize text-sm text-muted-foreground">
                            {act.type}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div>{formatDate(act.date)}</div>
                            <div className="text-xs">{act.time}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {act.location}
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={act.status} size="sm" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* TAB 4: DOCUMENTS */}
            {/* ========================================================================= */}
            <TabsContent value="documents" className="mt-4 space-y-4 focus-visible:outline-none">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-heading text-base font-semibold">
                    Member Documents ({mockDocuments.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/members/${member.id}/documents/upload`}>
                        <Upload className="mr-1.5 h-4 w-4" />
                        Upload Document
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/members/${member.id}/documents`}>
                        View All
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <div className="font-medium text-foreground">{doc.title}</div>
                            <div className="text-xs text-muted-foreground font-mono">{doc.fileName}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="neutral" size="sm">
                              {doc.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {doc.fileType} • {doc.fileSize}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div>{formatDate(doc.uploadedAt)}</div>
                            <div className="text-xs">By {doc.uploadedBy}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Downloading Document",
                                  description: `Downloading ${doc.fileName}...`,
                                });
                              }}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            {/* ========================================================================= */}
            {/* TAB 5: GIVING */}
            {/* ========================================================================= */}
            <TabsContent value="giving" className="mt-4 space-y-4 focus-visible:outline-none">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Total Contributions</div>
                  <div className="font-heading text-xl font-bold mt-1">GHS 2,150.00</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Tithes (YTD)</div>
                  <div className="font-heading text-xl font-bold mt-1">GHS 500.00</div>
                </Card>
                <Card className="p-4">
                  <div className="text-xs text-muted-foreground">Building & Missions</div>
                  <div className="font-heading text-xl font-bold mt-1">GHS 1,250.00</div>
                </Card>
              </div>

              <Card className="overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-heading text-base font-semibold">
                    Giving Records ({mockGiving.length})
                  </h3>

                  <div className="flex items-center gap-2">
                    <Button asChild size="sm">
                      <Link href={`/dashboard/members/${member.id}/giving/add`}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Record
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/members/${member.id}/giving`}>
                        Statement
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Receipt #</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockGiving.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(item.date)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{item.type}</div>
                            <div className="text-xs text-muted-foreground">{item.category}</div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {item.method}
                          </TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {item.receiptNumber}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">
                            {item.currency} {item.amount}
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={item.status} size="sm" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}