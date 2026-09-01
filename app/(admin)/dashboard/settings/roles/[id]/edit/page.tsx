'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Save,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { PERMISSION_CATEGORIES } from '@/lib/permissions';

// Mock role data
const mockRole = {
  id: '1',
  name: 'SuperAdmin',
  description: 'Full system access with all permissions',
  permissions: ['dashboard.view', 'members.view', 'members.create', 'members.edit', 'finance.view', 'events.view', 'events.create'],
  users: 1,
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-20T14:45:00Z',
};

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;
  
  const [roleName, setRoleName] = useState(mockRole.name);
  const [description, setDescription] = useState(mockRole.description);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(mockRole.permissions)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePermissionToggle = (permissionId: string) => {
    const newPermissions = new Set(selectedPermissions);
    if (newPermissions.has(permissionId)) {
      newPermissions.delete(permissionId);
    } else {
      newPermissions.add(permissionId);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const newPermissions = new Set(selectedPermissions);
    category.permissions.forEach(permission => {
      if (checked) {
        newPermissions.add(permission.id);
      } else {
        newPermissions.delete(permission.id);
      }
    });
    setSelectedPermissions(newPermissions);
  };

  const isCategoryFullySelected = (categoryId: string) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    return category.permissions.every(p => selectedPermissions.has(p.id));
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = PERMISSION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return false;
    const selectedCount = category.permissions.filter(p => selectedPermissions.has(p.id)).length;
    return selectedCount > 0 && selectedCount < category.permissions.length;
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving role:', {
        id: roleId,
        name: roleName,
        description,
        permissions: Array.from(selectedPermissions)
      });
      
      toast.success('Role updated successfully');
      router.push('/dashboard/settings?tab=roles');
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Role deleted successfully');
      router.push('/dashboard/settings?tab=roles');
    } catch (error) {
      toast.error('Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPermissions = PERMISSION_CATEGORIES.reduce((sum, cat) => sum + cat.permissions.length, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings?tab=roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Role</h1>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive self-start sm:self-auto">
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete Role
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the role "{roleName}"? 
                This action cannot be undone. {mockRole.users} user(s) with this role will need to be reassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Role'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-6">
        {/* Role Information Card */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-foreground">Role Information</h2>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="Administrator / Leader"
                />
              </div>

              <div className="col-span-12 sm:col-span-4 rounded-lg border border-border p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Assigned Users</p>
                  <p className="text-lg font-bold text-foreground">{mockRole.users}</p>
                </div>
                <Badge variant="neutral">{selectedPermissions.size}/{totalPermissions} Perms</Badge>
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Role responsibilities and operational scope..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Permissions Card */}
        <Card className="rounded-xl border border-border p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">Role Permissions</h2>
                <Badge variant="neutral">{selectedPermissions.size} of {totalPermissions} selected</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const allPermissions = new Set<string>();
                    PERMISSION_CATEGORIES.forEach(category => {
                      category.permissions.forEach(permission => {
                        allPermissions.add(permission.id);
                      });
                    });
                    setSelectedPermissions(allPermissions);
                    toast.success('All permissions selected');
                  }}
                >
                  Select All
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedPermissions(new Set());
                    toast.success('All permissions cleared');
                  }}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PERMISSION_CATEGORIES.map((category) => {
                const isFullySelected = isCategoryFullySelected(category.id);
                const isPartiallySelected = isCategoryPartiallySelected(category.id);

                return (
                  <div key={category.id} className="rounded-lg border border-border p-4 space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={isFullySelected}
                        onCheckedChange={(checked) => {
                          handleCategoryToggle(category.id, checked as boolean);
                        }}
                        className={isPartiallySelected ? 'data-[state=checked]:bg-primary/50' : ''}
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-semibold cursor-pointer flex-1"
                      >
                        {category.name}
                      </Label>
                      <Badge variant="neutral" className="text-xs">
                        {category.permissions.filter(p => selectedPermissions.has(p.id)).length}/
                        {category.permissions.length}
                      </Badge>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center gap-2.5">
                          <Checkbox
                            id={permission.id}
                            checked={selectedPermissions.has(permission.id)}
                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                          />
                          <Label
                            htmlFor={permission.id}
                            className="text-xs cursor-pointer flex-1"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dashboard/settings?tab=roles')}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-1.5 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
