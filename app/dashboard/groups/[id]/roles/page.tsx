'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuLabel,
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
  User,
  Settings,
  Loader2,
  Eye,
  UserCheck
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupRole, GroupMember } from '@/lib/types/groups';
import { toast } from 'sonner';


const roleIcons = {
  'Leader': Crown,
  'Assistant Leader': Shield,
  'Member': User,
  'Treasurer': Settings,
  'Secretary': Edit
};

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
      
      // Load group members
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  const handleAddRole = () => {
    router.push(`/dashboard/groups/${groupId}/roles/add`);
  };

  const handleEditRole = (roleId: string) => {
    // For now, navigate to add page with edit mode (could be enhanced later)
    router.push(`/dashboard/groups/${groupId}/roles/add?edit=${roleId}`);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    setDeletingRole(true);
    
    try {
      const response = await groupsService.deleteGroupRole(roleToDelete.id);
      
      if (response.success) {
        toast.success('Role deleted successfully');
        setRoles(prev => prev.filter(r => r.id !== roleToDelete.id));
        setRoleToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete role');
      }
    } catch (error) {
      toast.error('Failed to delete role');
    } finally {
      setDeletingRole(false);
    }
  };

  const getRoleIcon = (roleName: string) => {
    const IconComponent = roleIcons[roleName as keyof typeof roleIcons] || User;
    return <IconComponent className="h-4 w-4" />;
  };

  const getMembersWithRole = (roleName: string) => {
    return members.filter(member => member.role === roleName);
  };

  const getPermissionBadgeColor = (permission: string) => {
    if (permission.includes('manage') || permission.includes('admin')) {
      return 'bg-red-100 text-red-800';
    }
    if (permission.includes('edit') || permission.includes('create')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Group Roles</h1>
              <p className="text-muted-foreground">
                Manage roles and permissions for {group?.name}
              </p>
            </div>
          </div>
    
        </div>
        
        <Button onClick={handleAddRole} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
            <p className="text-xs text-muted-foreground">
              Defined roles
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Roles</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter(r => r.isDefault).length}
            </div>
            <p className="text-xs text-muted-foreground">
              System defaults
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leadership Roles</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter(r => r.name.includes('Leader')).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Leadership positions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              With roles assigned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Roles Management */}
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Define and manage roles with specific permissions for group members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Roles List */}
          <div className="space-y-4">
            {filteredRoles.map((role) => {
              const roleMembers = getMembersWithRole(role.name);
              
              return (
                <Card key={role.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-lg">
                          {getRoleIcon(role.name)}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-lg">{role.name}</h4>
                            {role.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-muted-foreground">{role.description}</p>
                          
                          {/* Permissions */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">Permissions:</h5>
                            <div className="flex flex-wrap gap-2">
                              {role.permissions.map((permission, index) => (
                                <Badge 
                                  key={index} 
                                  variant="secondary"
                                  className={`text-xs ${getPermissionBadgeColor(permission)}`}
                                >
                                  {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          {/* Assigned Members */}
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium">
                              Assigned Members ({roleMembers.length}):
                            </h5>
                            {roleMembers.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {roleMembers.slice(0, 5).map((member) => (
                                  <Badge key={member.id} variant="outline" className="text-xs">
                                    {member.memberName}
                                  </Badge>
                                ))}
                                {roleMembers.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{roleMembers.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No members assigned</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => handleEditRole(role.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Members
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {!role.isDefault && (
                            <DropdownMenuItem
                              onClick={() => setRoleToDelete(role)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredRoles.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No roles found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Create roles to define member permissions'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleAddRole}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Role
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{roleToDelete?.name}"?
              This action cannot be undone and will affect all members currently assigned to this role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingRole}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              disabled={deletingRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Role'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}