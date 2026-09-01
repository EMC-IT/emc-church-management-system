'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Search,
  Shield,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
  Crown,
  Settings,
  Loader2,
  UserCheck
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupRole, GroupMember } from '@/lib/types/groups';
import { toast } from 'sonner';

export default function GroupRolesPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [roles, setRoles] = useState<GroupRole[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleToDelete, setRoleToDelete] = useState<GroupRole | null>(null);
  const [deletingRole, setDeletingRole] = useState(false);

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
      
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
    } catch {
      toast.error('Failed to load group roles');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeletingRole(true);
    try {
      const response = await groupsService.deleteGroupRole(roleToDelete.id);
      if (response.success) {
        toast.success('Role deleted');
        setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        setRoleToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete role');
      }
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeletingRole(false);
    }
  };

  const getMembersWithRole = (roleName: string) => {
    return members.filter(member => member.role === roleName);
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={4} rows={5} />;
  }

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
            <h1 className="font-heading text-2xl font-bold tracking-tight">Group Roles</h1>
          </div>
        </div>

        <Button size="sm" onClick={() => router.push(`/dashboard/groups/${groupId}/roles/add`)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Roles" value={roles.length} icon={Shield} />
        <StatCard title="Default Roles" value={roles.filter(r => r.isDefault).length} icon={Settings} />
        <StatCard title="Leadership Roles" value={roles.filter(r => r.name.includes('Leader')).length} icon={Crown} />
        <StatCard title="Assigned Members" value={members.length} icon={UserCheck} />
      </div>

      {/* Roles Directory */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          <div className="space-y-3">
            {filteredRoles.map((role) => {
              const roleMembers = getMembersWithRole(role.name);
              
              return (
                <Card key={role.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-foreground">{role.name}</h4>
                        {role.isDefault && (
                          <Badge variant="neutral" size="sm">Default</Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                      
                      {/* Permissions */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {role.permissions.map((permission, index) => (
                          <Badge key={index} variant="neutral" size="sm" className="text-[10px]">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Assigned Members */}
                      <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Assigned: {roleMembers.length} member(s)</span>
                        {roleMembers.length > 0 && (
                          <span className="text-foreground truncate">
                            ({roleMembers.slice(0, 3).map(m => m.memberName).join(', ')}{roleMembers.length > 3 ? `, +${roleMembers.length - 3} more` : ''})
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/groups/${groupId}/roles/add?edit=${role.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        {!role.isDefault && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setRoleToDelete(role)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredRoles.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No roles found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{roleToDelete?.name}&quot; role?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRole}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={deletingRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingRole ? 'Deleting...' : 'Delete Role'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}