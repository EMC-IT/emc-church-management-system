'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, StatusBadge } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Download,
  Upload,
  RefreshCw,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member, SearchParams } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Mock data for development
const mockMembers: Member[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+233 24 123 4567',
    address: '123 Main Street, Accra',
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
    updatedAt: '2023-01-15T00:00:00Z',
    branch: 'Adenta (HQ)',
  },
  {
    id: '2',
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@email.com',
    phone: '+233 24 234 5678',
    address: '456 Oak Avenue, Kumasi',
    dateOfBirth: '1995-03-22',
    gender: 'Female',
    membershipStatus: 'Active',
    joinDate: '2023-03-22',
    avatar: null,
    familyId: 'fam2',
    emergencyContact: {
      name: 'Robert Johnson',
      phone: '+233 24 234 5679',
      relationship: 'Father'
    },
    customFields: {},
    createdAt: '2023-03-22T00:00:00Z',
    updatedAt: '2023-03-22T00:00:00Z',
    branch: 'Somanya',
  },
  {
    id: '3',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@email.com',
    phone: '+233 24 345 6789',
    address: '789 Pine Street, Tamale',
    dateOfBirth: '1981-07-10',
    gender: 'Male',
    membershipStatus: 'New',
    joinDate: '2024-01-05',
    avatar: null,
    familyId: 'fam3',
    emergencyContact: {
      name: 'Sarah Brown',
      phone: '+233 24 345 6790',
      relationship: 'Sister'
    },
    customFields: {},
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
    branch: 'Adusa',
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Wilson',
    email: 'sarah.wilson@email.com',
    phone: '+233 24 456 7890',
    address: '321 Elm Street, Cape Coast',
    dateOfBirth: '1992-11-08',
    gender: 'Female',
    membershipStatus: 'Active',
    joinDate: '2022-08-10',
    avatar: null,
    familyId: 'fam4',
    emergencyContact: {
      name: 'Michael Wilson',
      phone: '+233 24 456 7891',
      relationship: 'Brother'
    },
    customFields: {},
    createdAt: '2022-08-10T00:00:00Z',
    updatedAt: '2022-08-10T00:00:00Z',
    branch: 'Liberia',
  },
  {
    id: '5',
    firstName: 'Michael',
    lastName: 'Davis',
    email: 'michael.davis@email.com',
    phone: '+233 24 567 8901',
    address: '654 Maple Drive, Sekondi',
    dateOfBirth: '1978-12-03',
    gender: 'Male',
    membershipStatus: 'Inactive',
    joinDate: '2021-12-03',
    avatar: null,
    familyId: 'fam5',
    emergencyContact: {
      name: 'Lisa Davis',
      phone: '+233 24 567 8902',
      relationship: 'Wife'
    },
    customFields: {},
    createdAt: '2021-12-03T00:00:00Z',
    updatedAt: '2021-12-03T00:00:00Z',
    branch: 'Mampong',
  },
  // New Convert mock data
  {
    id: '6',
    firstName: '',
    lastName: '',
    email: '',
    phone: '+233 24 999 8888',
    address: '',
    dateOfBirth: '2002-06-15',
    gender: 'Male',
    membershipStatus: 'New', // Use allowed value
    joinDate: '2024-04-01',
    avatar: null,
    familyId: '',
    emergencyContact: { name: '', phone: '', relationship: '' }, // Provide valid object
    customFields: { isConvert: true, fullName: 'Emmanuel Owusu' }, // Mark as convert
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-01T00:00:00Z',
    branch: 'Adenta (HQ)',
  },
  {
    id: '7',
    firstName: '',
    lastName: '',
    email: '',
    phone: '+233 20 123 4567',
    address: '',
    dateOfBirth: '1999-12-25',
    gender: 'Female',
    membershipStatus: 'New', // Use allowed value
    joinDate: '2024-04-02',
    avatar: null,
    familyId: '',
    emergencyContact: { name: '', phone: '', relationship: '' }, // Provide valid object
    customFields: { isConvert: true, fullName: 'Akosua Mensimah' }, // Mark as convert
    createdAt: '2024-04-02T00:00:00Z',
    updatedAt: '2024-04-02T00:00:00Z',
    branch: 'Somanya',
  },
];

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Load members data
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await membersService.getMembers();
        // setMembers(response.data);
        setMembers(mockMembers);
      } catch (err: any) {
        setError(err.message || 'Failed to load members');
        toast({
          title: 'Error',
          description: 'Failed to load members',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [toast]);

  // Handle member deletion
  const handleDeleteMember = async (memberId: string) => {
    try {
      await membersService.deleteMember(memberId);
      setMembers(members.filter(m => m.id !== memberId));
      toast({
        title: 'Success',
        description: 'Member deleted successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete member',
        variant: 'destructive',
      });
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      await membersService.exportMembers();
      toast({
        title: 'Success',
        description: 'Members exported successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to export members',
        variant: 'destructive',
      });
    }
  };

  // Handle search
  const handleSearch = async (query: string, filters: Record<string, any>) => {
    try {
      setLoading(true);
      const searchParams: SearchParams = {
        search: query,
        ...filters,
      };
      // For now, filter locally. Replace with API call:
      // const response = await membersService.searchMembers(searchParams);
      // setMembers(response.data);
      const filtered = mockMembers.filter(member => {
        const matchesSearch = query === '' || 
          member.firstName.toLowerCase().includes(query.toLowerCase()) ||
          member.lastName.toLowerCase().includes(query.toLowerCase()) ||
          member.email.toLowerCase().includes(query.toLowerCase());
        
        const matchesStatus = !filters.status || member.membershipStatus === filters.status;
        const matchesGender = !filters.gender || member.gender === filters.gender;
        
        return matchesSearch && matchesStatus && matchesGender;
      });
      setMembers(filtered);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: 'Failed to search members',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToMember = (memberId: string) => {
    setMembers(prevMembers => prevMembers.map(m =>
      m.id === memberId && m.customFields?.isConvert
        ? {
            ...m,
            membershipStatus: 'Active',
            customFields: { ...m.customFields, isConvert: false },
          }
        : m
    ));
    toast({ title: 'Success', description: 'Convert promoted to Member' });
  };

  // Table columns definition
  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: 'name',
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original;
        const isConvert = member.customFields?.isConvert === true;
        const displayName = member.customFields?.fullName || (member.firstName || member.lastName ? `${member.firstName} ${member.lastName}`.trim() : isConvert ? 'New Convert' : member.phone || member.id);
        const avatarFallback = member.customFields?.fullName
          ? member.customFields.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          : (member.firstName && member.lastName)
            ? `${member.firstName[0]}${member.lastName[0]}`
            : isConvert
              ? 'NC'
              : '?';
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar || ''} />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'convert',
      header: 'Convert',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <span className="text-sm font-medium">
            {member.customFields?.isConvert === true ? 'Yes' : 'No'}
          </span>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-3 w-3 text-muted-foreground" />
              {member.phone}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-2 h-3 w-3" />
              {member.address}
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
        return <StatusBadge status={status.toLowerCase() as any} />;
      },
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      cell: ({ row }) => {
        const date = row.getValue('joinDate') as string;
        return (
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
            {new Date(date).toLocaleDateString()}
          </div>
        );
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
      accessorKey: 'branch',
      header: 'Branch',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <span className="text-sm">{member.branch}</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const member = row.original;
        if (member.customFields?.isConvert === true) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/members/${member.id}/convert`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/dashboard/members/${member.id}/convert/edit`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Convert
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    handlePromoteToMember(member.id);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Make as Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={e => {
                    e.stopPropagation();
                    setMemberToDelete(member);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Convert
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        } else {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/members/${member.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/dashboard/members/${member.id}/edit`);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Member
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={e => {
                    e.stopPropagation();
                    setMemberToDelete(member);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Member
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      },
    },
  ];

  // Search filters
  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'New', label: 'New' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Transferred', label: 'Transferred' },
        { value: 'Archived', label: 'Archived' },
      ],
    },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select' as const,
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
      ],
    },
  ];

  // Calculate statistics
  const stats = {
    total: members.length,
    active: members.filter(m => m.membershipStatus === 'Active').length,
    new: members.filter(m => m.membershipStatus === 'New').length,
    inactive: members.filter(m => m.membershipStatus === 'Inactive').length,
    transferred: members.filter(m => m.membershipStatus === 'Transferred').length,
    archived: members.filter(m => m.membershipStatus === 'Archived').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">Manage your church members and their information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
            <Link href="/dashboard/members/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
          <CardDescription>Search and filter through your church members</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchInput
            placeholder="Search members by name, email, or phone..."
            onSearch={handleSearch}
            filters={searchFilters}
            showFilters={true}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Members Table */}
      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        error={error || undefined}
        searchKey="name"
        showSearch={false}
        showFilters={false}
        pagination={{
          pageSize: 10,
          pageSizeOptions: [10, 20, 50, 100],
        }}
        onRowClick={(member) => {
          if (member.customFields?.isConvert === true) {
            router.push(`/dashboard/members/${member.id}/convert`);
          } else {
            router.push(`/dashboard/members/${member.id}`);
          }
        }}
        className="bg-card"
      />

      {/* Render the AlertDialog once at the page level */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (memberToDelete) {
                  handleDeleteMember(memberToDelete.id);
                  setDeleteDialogOpen(false);
                  setMemberToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}