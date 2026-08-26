'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  UserPlus,
  Search,
  Users,
  Mail,
  Phone,
  Loader2
} from 'lucide-react';
import { groupsService, membersService } from '@/services';
import { Group, GroupRole, GroupMemberFormData } from '@/lib/types/groups';
import { Member } from '@/lib/types/members';
import { toast } from 'sonner';

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
      
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      const rolesResponse = await groupsService.getGroupRoles(groupId);
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data);
      }
      
      const membersResponse = await membersService.getMembers({ limit: 1000 });
      if (membersResponse.data) {
        const groupMembersResponse = await groupsService.getGroupMembers(groupId);
        const existingMemberIds = groupMembersResponse.success && groupMembersResponse.data 
          ? new Set(groupMembersResponse.data.map(gm => gm.memberId))
          : new Set();
        
        const availableMembers = membersResponse.data.filter(member => 
          !existingMemberIds.has(member.id)
        );
        setAllMembers(availableMembers);
      }
    } catch {
      toast.error('Failed to load members');
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
      if (!memberRoles[memberId]) {
        const defaultRole = roles.find(r => r.isDefault)?.name || roles[0]?.name || 'Member';
        setMemberRoles(prev => ({ ...prev, [memberId]: defaultRole }));
      }
    } else {
      newSelected.delete(memberId);
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
          role: memberRoles[memberId] || 'Member',
        };
        
        return groupsService.addGroupMember(groupId, memberData);
      });
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => r && r.success).length;
      
      if (successful > 0) {
        toast.success(`Successfully added ${successful} member(s) to the group`);
        router.push(`/dashboard/groups/${groupId}/members`);
      } else {
        toast.error('Failed to add members');
      }
    } catch {
      toast.error('Failed to add members');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/groups/${groupId}/members`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Add Group Members</h1>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={saving || selectedMembers.size === 0}
          size="sm"
        >
          {saving ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Add {selectedMembers.size > 0 ? `(${selectedMembers.size})` : ''}
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Select Church Members ({filteredMembers.length} available)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredMembers.map((member) => {
              const isSelected = selectedMembers.has(member.id);
              const memberRole = memberRoles[member.id] || roles.find(r => r.isDefault)?.name || 'Member';
              
              return (
                <div 
                  key={member.id} 
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg gap-3 transition-colors ${
                    isSelected ? 'border-primary/50 bg-primary/5' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => handleMemberToggle(member.id, checked as boolean)}
                    />
                    
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground truncate">
                          {member.firstName} {member.lastName}
                        </p>
                        {member.department && (
                          <Badge variant="neutral" size="sm">{member.department}</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5">
                        <span className="truncate">{member.email}</span>
                        {member.phone && <span>• {member.phone}</span>}
                      </div>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div className="sm:w-44 shrink-0 pl-7 sm:pl-0">
                      <Select
                        value={memberRole}
                        onValueChange={(value) => handleRoleChange(member.id, value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name} className="text-xs">
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
            <div className="text-center py-10 text-muted-foreground text-sm">
              {searchTerm 
                ? 'No members found matching your search.' 
                : 'All registered church members are already enrolled in this group.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}