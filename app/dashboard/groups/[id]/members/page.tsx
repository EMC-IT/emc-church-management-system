'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  UserPlus,
  Search,
  Users,
  Mail,
  Phone,
  MoreHorizontal,
  Trash2,
  Loader2,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupMember, GroupRole } from '@/lib/types/groups';
import { toast } from 'sonner';

export default function GroupMembersPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [roles, setRoles] = useState<GroupRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(null);
  const [deletingMember, setDeletingMember] = useState(false);

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
      
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      const rolesResponse = await groupsService.getGroupRoles(groupId);
      if (rolesResponse.success && rolesResponse.data) {
        setRoles(rolesResponse.data);
      }
    } catch {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await groupsService.updateGroupMemberRole(groupId, memberId, newRole);
      if (response.success) {
        toast.success('Member role updated');
        loadData();
      } else {
        toast.error(response.message || 'Failed to update role');
      }
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToDelete) return;
    setDeletingMember(true);
    try {
      const response = await groupsService.removeGroupMember(groupId, memberToDelete.memberId);
      if (response.success) {
        toast.success('Member removed');
        setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
        setMemberToDelete(null);
      } else {
        toast.error(response.message || 'Failed to remove member');
      }
    } catch {
      toast.error('Failed to remove member');
    } finally {
      setDeletingMember(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const uniqueRoles = Array.from(new Set(members.map(m => m.role)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Group Members</h1>
          </div>
        </div>

        <Button size="sm" onClick={() => router.push(`/dashboard/groups/${groupId}/members/add`)}>
          <UserPlus className="mr-1.5 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={members.length}
          icon={Users}
          description={`of ${group?.maxMembers || 0} maximum`}
        />
        <StatCard
          title="Active Members"
          value={members.filter(m => m.status === 'Active').length}
          icon={User}
        />
        <StatCard
          title="Leaders"
          value={members.filter(m => m.role.includes('Leader')).length}
          icon={Crown}
        />
        <StatCard
          title="Available Spots"
          value={Math.max(0, (group?.maxMembers || 0) - members.length)}
          icon={Shield}
        />
      </div>

      {/* Members Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Members ({filteredMembers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Members Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {member.memberName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground truncate">{member.memberName}</h4>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.memberId, 'Leader')}>
                        Set as Leader
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.memberId, 'Assistant Leader')}>
                        Set as Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.memberId, 'Member')}>
                        Set as Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setMemberToDelete(member)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove from Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{member.memberEmail}</span>
                  </div>
                  {member.memberPhone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{member.memberPhone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-muted-foreground">Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                  <StatusBadge status={member.status} size="sm" />
                </div>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No members found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{memberToDelete?.memberName}&quot; from {group?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingMember}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              disabled={deletingMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingMember ? 'Removing...' : 'Remove Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}