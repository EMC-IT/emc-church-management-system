'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Plus, 
  Users, 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

// Mock family members data
const mockFamilyMembers: Member[] = [
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

export default function FamilyPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [familyMembers, setFamilyMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  // Mock member data for development
  const mockMember: Member = {
    id: memberId,
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [memberResponse, familyResponse] = await Promise.all([
        //   membersService.getMember(memberId),
        //   membersService.getFamilyMembers(memberId)
        // ]);
        // setMember(memberResponse.data);
        // setFamilyMembers(familyResponse.data);
        setMember(mockMember);
        setFamilyMembers(mockFamilyMembers);
      } catch (err: any) {
        setError(err.message || 'Failed to load family data');
        toast({
          title: 'Error',
          description: 'Failed to load family information',
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

  const handleRemoveFamilyMember = async (familyMemberId: string) => {
    try {
      await membersService.removeFamilyMember(memberId, familyMemberId);
      setFamilyMembers(familyMembers.filter(m => m.id !== familyMemberId));
      toast({
        title: 'Success',
        description: 'Family member removed successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to remove family member',
        variant: 'destructive',
      });
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

  // Table columns definition
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: 'name',
      header: 'Family Member',
      cell: ({ row }) => {
        const familyMember = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={familyMember.avatar || ''} />
              <AvatarFallback>
                {familyMember.firstName[0]}{familyMember.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{familyMember.firstName} {familyMember.lastName}</p>
              <p className="text-sm text-muted-foreground">{familyMember.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const familyMember = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
              {familyMember.phone}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-3 w-3" />
              {familyMember.address}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'membershipStatus',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('membershipStatus') as string;
        return <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => {
        const familyMember = row.original;
        return <span className="text-sm">{calculateAge(familyMember.dateOfBirth)} years</span>;
      },
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ row }) => {
        const gender = row.getValue('gender') as string;
        return (
          <div className="flex items-center">
            <User className="mr-2 h-3 w-3 text-muted-foreground" />
            {gender}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const familyMember = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/members/${familyMember.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/members/${familyMember.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveFamilyMember(familyMember.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

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
            <Link href={`/dashboard/members/${member.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Family Management</h1>
            <p className="text-muted-foreground">
              Manage family relationships for {member.firstName} {member.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/members/${member.id}/family/link`}>
              <LinkIcon className="mr-2 h-4 w-4" />
              Link Existing Member
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/members/${member.id}/family/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Family Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Family Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{familyMembers.length + 1}</div>
            <p className="text-xs text-muted-foreground">
              Including {member.firstName} {member.lastName}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {familyMembers.filter(m => m.membershipStatus === 'Active').length + 
               (member.membershipStatus === 'Active' ? 1 : 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family ID</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono">{member.familyId}</div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members</CardTitle>
          <CardDescription>
            View and manage family relationships for {member.firstName} {member.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={familyMembers}
            loading={loading}
            error={error || undefined}
            searchKey="name"
            showSearch={true}
            showFilters={false}
            pagination={{
              pageSize: 10,
              pageSizeOptions: [10, 20, 50],
            }}
            onRowClick={(familyMember) => router.push(`/dashboard/members/${familyMember.id}`)}
            className="bg-card"
          />
        </CardContent>
      </Card>
    </div>
  );
} 