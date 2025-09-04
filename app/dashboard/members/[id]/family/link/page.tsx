'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Users,
  Plus,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

// Form validation schema for linking family member
const linkFamilyMemberSchema = z.object({
  relationship: z.enum(['Spouse', 'Child', 'Parent', 'Sibling', 'Grandparent', 'Other']),
});

type LinkFamilyMemberData = z.infer<typeof linkFamilyMemberSchema>;

// Mock existing members data for development
const mockExistingMembers: Member[] = [
  {
    id: '5',
    firstName: 'Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@email.com',
    phone: '+233 24 123 4571',
    address: '456 Oak Street, Accra, Ghana',
    dateOfBirth: '1985-12-03',
    gender: 'Female',
    membershipStatus: 'Active',
    joinDate: '2022-08-20',
    avatar: null,
    familyId: undefined,
    emergencyContact: {
      name: 'David Johnson',
      phone: '+233 24 123 4572',
      relationship: 'Spouse'
    },
    customFields: {},
    createdAt: '2022-08-20T00:00:00Z',
    updatedAt: '2022-08-20T00:00:00Z'
  },
  {
    id: '6',
    firstName: 'David',
    lastName: 'Johnson',
    email: 'david.johnson@email.com',
    phone: '+233 24 123 4572',
    address: '456 Oak Street, Accra, Ghana',
    dateOfBirth: '1983-07-15',
    gender: 'Male',
    membershipStatus: 'Active',
    joinDate: '2022-08-20',
    avatar: null,
    familyId: undefined,
    emergencyContact: {
      name: 'Mary Johnson',
      phone: '+233 24 123 4571',
      relationship: 'Spouse'
    },
    customFields: {},
    createdAt: '2022-08-20T00:00:00Z',
    updatedAt: '2022-08-20T00:00:00Z'
  },
  {
    id: '7',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.williams@email.com',
    phone: '+233 24 123 4573',
    address: '789 Pine Avenue, Accra, Ghana',
    dateOfBirth: '1992-04-12',
    gender: 'Female',
    membershipStatus: 'Active',
    joinDate: '2023-05-10',
    avatar: null,
    familyId: undefined,
    emergencyContact: {
      name: 'Robert Williams',
      phone: '+233 24 123 4574',
      relationship: 'Father'
    },
    customFields: {},
    createdAt: '2023-05-10T00:00:00Z',
    updatedAt: '2023-05-10T00:00:00Z'
  },
];

export default function LinkFamilyMemberPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [existingMembers, setExistingMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
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

  const form = useForm<LinkFamilyMemberData>({
    resolver: zodResolver(linkFamilyMemberSchema),
    defaultValues: {
      relationship: 'Spouse',
    },
  });

  // Load member data
  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API call:
        // const response = await membersService.getMember(memberId);
        // setMember(response.data);
        setMember(mockMember);
        setExistingMembers(mockExistingMembers);
        setFilteredMembers(mockExistingMembers);
      } catch (err: any) {
        setError(err.message || 'Failed to load member');
        toast({
          title: 'Error',
          description: 'Failed to load member details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadMember();
    }
  }, [memberId, toast]);

  // Filter members based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(existingMembers);
    } else {
      const filtered = existingMembers.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
      );
      setFilteredMembers(filtered);
    }
  }, [searchTerm, existingMembers]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearching(true);
      // For now, use mock data. Replace with actual API call:
      // const response = await membersService.searchMembers(searchTerm);
      // setFilteredMembers(response);
      const filtered = mockExistingMembers.filter(member => 
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm)
      );
      setFilteredMembers(filtered);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to search members',
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleLinkMember = async (selectedMember: Member) => {
    try {
      setLinking(true);
      const relationship = form.getValues('relationship');
      
      await membersService.linkFamilyMember(memberId, selectedMember.id, relationship);
      
      toast({
        title: 'Success',
        description: `${selectedMember.firstName} ${selectedMember.lastName} has been linked as ${relationship}`,
      });
      
      router.push(`/dashboard/members/${memberId}/family`);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to link family member',
        variant: 'destructive',
      });
    } finally {
      setLinking(false);
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
      header: 'Member',
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar || ''} />
              <AvatarFallback>
                {member.firstName[0]}{member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{member.firstName} {member.lastName}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
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
        return <Badge variant={status === 'Active' ? 'default' : 'secondary'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ row }) => {
        const member = row.original;
        return <span className="text-sm">{calculateAge(member.dateOfBirth)} years</span>;
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
        const member = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLinkMember(member)}
            disabled={linking}
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Link
          </Button>
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
            <Link href={`/dashboard/members/${member.id}/family`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Family
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Link Existing Member</h1>
            <p className="text-muted-foreground">
              Link an existing member to {member.firstName} {member.lastName}'s family
            </p>
          </div>
        </div>
      </div>

      {/* Search and Relationship Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Members</CardTitle>
            <CardDescription>
              Search for existing members to link to the family
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to {member.firstName}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Spouse">Spouse</SelectItem>
                          <SelectItem value="Child">Child</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                          <SelectItem value="Sibling">Sibling</SelectItem>
                          <SelectItem value="Grandparent">Grandparent</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Alternative ways to add family members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href={`/dashboard/members/${member.id}/family/add`}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Family Member
              </Link>
            </Button>
            <Button variant="outline" className="w-full">
              <Users className="mr-2 h-4 w-4" />
              Import from CSV
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Search Results */}
      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {filteredMembers.length} member(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredMembers}
              loading={searching}
              error={error || undefined}
              searchKey="name"
              showSearch={false}
              showFilters={false}
              pagination={{
                pageSize: 10,
                pageSizeOptions: [10, 20, 50],
              }}
              className="bg-card"
            />
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No members found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or add a new family member instead
              </p>
              <Button asChild>
                <Link href={`/dashboard/members/${member.id}/family/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Family Member
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}