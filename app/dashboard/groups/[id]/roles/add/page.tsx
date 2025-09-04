'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft,
  Save,
  Loader2,
  Shield,
  Users,
  Settings,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  BarChart3
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupRole, GroupRoleFormData } from '@/lib/types/groups';
import { toast } from 'sonner';
import Breadcrumb from '@/components/ui/breadcrumb';

const availablePermissions = [
  {
    category: 'Group Management',
    permissions: [
      { id: 'manage_group', name: 'Manage Group', description: 'Edit group details and settings' },
      { id: 'delete_group', name: 'Delete Group', description: 'Delete the entire group' },
      { id: 'view_group', name: 'View Group', description: 'View group information' }
    ]
  },
  {
    category: 'Member Management',
    permissions: [
      { id: 'manage_members', name: 'Manage Members', description: 'Add, remove, and edit member details' },
      { id: 'view_members', name: 'View Members', description: 'View member list and details' },
      { id: 'assign_roles', name: 'Assign Roles', description: 'Assign roles to group members' }
    ]
  },
  {
    category: 'Event Management',
    permissions: [
      { id: 'manage_events', name: 'Manage Events', description: 'Create, edit, and delete group events' },
      { id: 'view_events', name: 'View Events', description: 'View group events and schedules' },
      { id: 'manage_attendance', name: 'Manage Attendance', description: 'Take and manage event attendance' }
    ]
  },
  {
    category: 'Reports & Analytics',
    permissions: [
      { id: 'view_reports', name: 'View Reports', description: 'Access group reports and analytics' },
      { id: 'export_data', name: 'Export Data', description: 'Export group data and reports' }
    ]
  },
  {
    category: 'Communication',
    permissions: [
      { id: 'send_messages', name: 'Send Messages', description: 'Send messages to group members' },
      { id: 'manage_announcements', name: 'Manage Announcements', description: 'Create and manage group announcements' }
    ]
  }
];

export default function AddGroupRolePage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<GroupRoleFormData>({
    name: '',
    description: '',
    permissions: [],
    isDefault: false
  });

  useEffect(() => {
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  const loadGroup = async () => {
    try {
      const response = await groupsService.getGroup(groupId);
      
      if (response.success && response.data) {
        setGroup(response.data);
      } else {
        toast.error('Group not found');
        router.push('/dashboard/groups');
      }
    } catch (error) {
      toast.error('Failed to load group');
      router.push('/dashboard/groups');
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/dashboard/groups' },
    { label: group?.name || 'Group', href: `/dashboard/groups/${groupId}` },
    { label: 'Roles', href: `/dashboard/groups/${groupId}/roles` },
    { label: 'Create Role', isCurrentPage: true }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permissionId]
        : prev.permissions.filter(p => p !== permissionId)
    }));
  };

  const handleSelectAllInCategory = (categoryPermissions: any[], checked: boolean) => {
    const permissionIds = categoryPermissions.map(p => p.id);
    
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? Array.from(new Set([...prev.permissions, ...permissionIds]))
        : prev.permissions.filter(p => !permissionIds.includes(p))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Role description is required');
      return;
    }
    
    if (formData.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }
    
    setSaving(true);
    
    try {
      const response = await groupsService.createGroupRole(groupId, formData);
      
      if (response.success) {
        toast.success('Role created successfully');
        router.push(`/dashboard/groups/${groupId}/roles`);
      } else {
        toast.error(response.message || 'Failed to create role');
      }
    } catch (error) {
      toast.error('Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/groups/${groupId}/roles`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Group Management': return <Settings className="h-4 w-4" />;
      case 'Member Management': return <Users className="h-4 w-4" />;
      case 'Event Management': return <Calendar className="h-4 w-4" />;
      case 'Reports & Analytics': return <BarChart3 className="h-4 w-4" />;
      case 'Communication': return <UserPlus className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

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
              <h1 className="text-3xl font-bold tracking-tight">Create Group Role</h1>
              <p className="text-muted-foreground">
                Define a new role with specific permissions for {group?.name}
              </p>
            </div>
          </div>
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Role Information</span>
                </CardTitle>
                <CardDescription>
                  Define the basic details for this role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Treasurer, Secretary, Assistant Leader"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the responsibilities and purpose of this role"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isDefault"
                    checked={formData.isDefault}
                    onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
                  />
                  <Label htmlFor="isDefault" className="text-sm">
                    Set as default role for new members
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Permissions</span>
                </CardTitle>
                <CardDescription>
                  Select the permissions this role should have
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {availablePermissions.map((category) => {
                  const categoryPermissionIds = category.permissions.map(p => p.id);
                  const selectedInCategory = categoryPermissionIds.filter(id => 
                    formData.permissions.includes(id)
                  ).length;
                  const allSelected = selectedInCategory === categoryPermissionIds.length;
                  const someSelected = selectedInCategory > 0 && selectedInCategory < categoryPermissionIds.length;
                  
                  return (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(category.category)}
                          <h4 className="font-medium">{category.category}</h4>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={allSelected}
                            ref={(el) => {
                              if (el) {
                                const input = el.querySelector('input');
                                if (input) input.indeterminate = someSelected;
                              }
                            }}
                            onCheckedChange={(checked) => 
                              handleSelectAllInCategory(category.permissions, checked as boolean)
                            }
                          />
                          <Label className="text-sm text-muted-foreground">
                            Select All
                          </Label>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 md:grid-cols-1 pl-6">
                        {category.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3">
                            <Checkbox
                              id={permission.id}
                              checked={formData.permissions.includes(permission.id)}
                              onCheckedChange={(checked) => 
                                handlePermissionToggle(permission.id, checked as boolean)
                              }
                            />
                            <div className="space-y-1">
                              <Label 
                                htmlFor={permission.id} 
                                className="text-sm font-medium cursor-pointer"
                              >
                                {permission.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
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
                  Save or cancel role creation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Role
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

            {/* Permission Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Summary</CardTitle>
                <CardDescription>
                  {formData.permissions.length} permission(s) selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formData.permissions.length > 0 ? (
                  <div className="space-y-2">
                    {availablePermissions.map((category) => {
                      const selectedInCategory = category.permissions.filter(p => 
                        formData.permissions.includes(p.id)
                      );
                      
                      if (selectedInCategory.length === 0) return null;
                      
                      return (
                        <div key={category.category} className="space-y-1">
                          <h5 className="text-sm font-medium">{category.category}</h5>
                          <ul className="text-xs text-muted-foreground space-y-1 pl-3">
                            {selectedInCategory.map((permission) => (
                              <li key={permission.id}>• {permission.name}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No permissions selected yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Choose a descriptive name that reflects the role's purpose</p>
                <p>• Grant only necessary permissions for security</p>
                <p>• Default roles are automatically assigned to new members</p>
                <p>• You can modify permissions later if needed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

function Label({ children, className, htmlFor }: { children: React.ReactNode; className?: string; htmlFor?: string }) {
  return <label className={className} htmlFor={htmlFor}>{children}</label>;
}