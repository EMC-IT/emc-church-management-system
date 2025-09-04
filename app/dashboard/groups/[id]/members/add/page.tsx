'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Loader2,
  UserPlus,
  Search,
  Users,
  Mail,
  Phone
} from 'lucide-react';
import { groupsService, membersService } from '@/services';
import { Group, GroupRole, GroupMemberFormData } from '@/lib/types/groups';
import { Member } from '@/lib/types/members';
import { toast } from 'sonner';
import Breadcrumb from '@/components/ui/breadcrumb';

export default function AddGroupMemberPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [roles, setRoles] = useState<GroupRole[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      // Load group roles
      const rolesResponse = await groupsService.getGroupRoles(groupId);
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data);
      }
      
      // Load all church members
      const membersResponse = await membersService.getMembers({ limit: 1000 });
      if (membersResponse.data) {
        // Filter out members who are already in this group
        const groupMembersResponse = await groupsService.getGroupMembers(groupId);
        const existingMemberIds = groupMembersResponse.success && groupMembersResponse.data 
          ? new Set(groupMembersResponse.data.map(gm => gm.memberId))
          : new Set();
        
        const availableMembers = membersResponse.data.filter(member => 
          !existingMemberIds.has(member.id)
        );
        setAllMembers(availableMembers);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = allMembers.filter(member => {
    const searchLower = searchTerm.toLowerCase();
    return member.firstName.toLowerCase().includes(searchLower) ||
           member.lastName.toLowerCase().includes(searchLower) ||
           member.email.toLowerCase().includes(searchLower);
  });

  const handleMemberToggle = (memberId: string, checked: boolean) => {
    const newSelected = new Set(selectedMembers);
    if (checked) {
      newSelected.add(memberId);
      // Set default role if not already set
      if (!memberRoles[memberId]) {
        const defaultRole = roles.find(r => r.isDefault)?.name || roles[0]?.name || 'Member';
        setMemberRoles(prev => ({ ...prev, [memberId]: defaultRole }));
      }
    } else {
      newSelected.delete(memberId);
      // Remove role assignment
      setMemberRoles(prev => {
        const updated = { ...prev };
        delete updated[memberId];
        return updated;
      });
    }
    setSelectedMembers(newSelected);
  };

  const handleRoleChange = (memberId: string, role: string) => {
    setMemberRoles(prev => ({ ...prev, [memberId]: role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMembers.size === 0) {
      toast.error('Please select at least one member to add');
      return;
    }
    
    // Check if all selected members have roles assigned
    const membersWithoutRoles = Array.from(selectedMembers).filter(id => !memberRoles[id]);
    if (membersWithoutRoles.length > 0) {
      toast.error('Please assign roles to all selected members');
      return;
    }
    
    setSaving(true);
    
    try {
      const promises = Array.from(selectedMembers).map(async (memberId) => {
        const member = allMembers.find(m => m.id === memberId);
        if (!member) return null;
        
        const memberData: GroupMemberFormData = {
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          memberEmail: member.email,
          memberPhone: member.phone || '',
          role: memberRoles[memberId]
        };
        
        return groupsService.addGroupMember(groupId, memberData);
      });
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r?.success).length;
      const failCount = results.length - successCount;
      
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} member(s) to the group`);
        if (failCount === 0) {
          router.push(`/dashboard/groups/${groupId}/members`);
        }
      }
      
      if (failCount > 0) {
        toast.error(`Failed to add ${failCount} member(s)`);
      }
    } catch (error) {
      toast.error('Failed to add members to group');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/groups/${groupId}/members`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/dashboard/groups' },
    { label: group?.name || 'Group', href: `/dashboard/groups/${groupId}` },
    { label: 'Members', href: `/dashboard/groups/${groupId}/members` },
    { label: 'Add Members', isCurrentPage: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Add Members to Group</h1>
              <p className="text-muted-foreground">
                Select members to add to {group?.name}
              </p>
            </div>
          </div>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Find Members</span>
                </CardTitle>
                <CardDescription>
                  Search for church members to add to this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Available Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Available Members</span>
                  </div>
                  <Badge variant="outline">
                    {selectedMembers.size} selected
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Select members and assign their roles in the group
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredMembers.map((member) => {
                    const isSelected = selectedMembers.has(member.id);
                    const memberRole = memberRoles[member.id];
                    
                    return (
                      <div key={member.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleMemberToggle(member.id, checked as boolean)}
                        />
                        
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">
                              {member.firstName} {member.lastName}
                            </h4>
                            <Badge variant="outline">{member.department}</Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            
                            {member.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="w-48">
                            <Select
                              value={memberRole}
                              onValueChange={(value) => handleRoleChange(member.id, value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.name}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {filteredMembers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No members found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm 
                        ? 'Try adjusting your search terms'
                        : 'All church members are already in this group'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Add selected members to the group
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={saving || selectedMembers.size === 0}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add {selectedMembers.size} Member{selectedMembers.size !== 1 ? 's' : ''}
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Group Info */}
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <Label className="text-muted-foreground">Group Name</Label>
                  <p className="font-medium">{group?.name}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Current Members</Label>
                  <p className="font-medium">{group?.members} of {group?.maxMembers}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Available Spots</Label>
                  <p className="font-medium">{(group?.maxMembers || 0) - (group?.members || 0)}</p>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-medium">{group?.category}</p>
                </div>
              </CardContent>
            </Card>

            {/* Available Roles */}
            <Card>
              <CardHeader>
                <CardTitle>Available Roles</CardTitle>
                <CardDescription>
                  Roles that can be assigned to members
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                    {role.isDefault && (
                      <Badge variant="outline" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Select multiple members to add them in bulk</p>
                <p>• Assign appropriate roles based on responsibilities</p>
                <p>• Members can be assigned different roles later</p>
                <p>• Check group capacity before adding members</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}