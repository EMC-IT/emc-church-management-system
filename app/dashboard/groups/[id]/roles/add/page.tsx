'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupRoleFormData } from '@/lib/types/groups';
import { toast } from 'sonner';

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
  }
];

export default function AddGroupRolePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params.id as string;
  const editRoleId = searchParams.get('edit');
  const isEditing = !!editRoleId;
  
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
  }, [groupId, editRoleId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await groupsService.getGroup(groupId);
      if (response.success && response.data) {
        setGroup(response.data);
      }
      
      if (isEditing && editRoleId) {
        const rolesResponse = await groupsService.getGroupRoles(groupId);
        if (rolesResponse.success && rolesResponse.data) {
          const role = rolesResponse.data.find(r => r.id === editRoleId);
          if (role) {
            setFormData({
              name: role.name,
              description: role.description,
              permissions: role.permissions,
              isDefault: role.isDefault || false
            });
          }
        }
      }
    } catch {
      toast.error('Failed to load role data');
    } finally {
      setLoading(false);
    }
  };

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
    
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }
    
    if (formData.permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }
    
    setSaving(true);
    try {
      const response = isEditing && editRoleId
        ? await groupsService.updateGroupRole(editRoleId, formData)
        : await groupsService.createGroupRole(groupId, formData);
      
      if (response.success) {
        toast.success(`Role ${isEditing ? 'updated' : 'created'} successfully`);
        router.push(`/dashboard/groups/${groupId}/roles`);
      } else {
        toast.error(response.message || 'Failed to save role');
      }
    } catch {
      toast.error('Failed to save role');
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/groups/${groupId}/roles`)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          {isEditing ? 'Edit Role' : 'Create Group Role'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Role Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g. Treasurer, Coordinator, Secretary"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Role responsibilities and scope..."
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleInputChange('isDefault', checked)}
              />
              <Label htmlFor="isDefault" className="text-xs text-muted-foreground cursor-pointer">
                Set as default role for new members joining this group
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {availablePermissions.map((category) => {
              const categoryPermissionIds = category.permissions.map(p => p.id);
              const selectedInCategory = categoryPermissionIds.filter(id => 
                formData.permissions.includes(id)
              ).length;
              const allSelected = selectedInCategory === categoryPermissionIds.length;
              
              return (
                <div key={category.category} className="space-y-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">{category.category}</h4>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`all-${category.category}`}
                        checked={allSelected}
                        onCheckedChange={(checked) => 
                          handleSelectAllInCategory(category.permissions, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={`all-${category.category}`}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Select All
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {category.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2.5 p-2 rounded-md hover:bg-muted/40 transition-colors">
                        <Checkbox
                          id={permission.id}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => 
                            handlePermissionToggle(permission.id, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <div className="space-y-0.5">
                          <label 
                            htmlFor={permission.id} 
                            className="text-xs font-medium text-foreground cursor-pointer block"
                          >
                            {permission.name}
                          </label>
                          <p className="text-[11px] text-muted-foreground">
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

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/groups/${groupId}/roles`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Create Role'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}