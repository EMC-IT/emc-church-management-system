'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Separator } from '@/components/ui/separator';
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
  Shield,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Comprehensive permission structure matching permissions page (127 permissions)
const permissionCategories = [
  {
    id: 'dashboard',
    name: 'Dashboard & Analytics',
    permissions: [
      { id: 'dashboard.view', name: 'View Dashboard' },
      { id: 'analytics.view', name: 'View Analytics' },
      { id: 'analytics.export', name: 'Export Analytics' },
      { id: 'analytics.attendance', name: 'View Attendance Analytics' },
    ]
  },
  {
    id: 'members',
    name: 'Members Management',
    permissions: [
      { id: 'members.view', name: 'View Members' },
      { id: 'members.create', name: 'Add Members' },
      { id: 'members.edit', name: 'Edit Members' },
      { id: 'members.delete', name: 'Delete Members' },
      { id: 'members.import', name: 'Import Members' },
      { id: 'members.export', name: 'Export Members' },
      { id: 'members.contact', name: 'View Contact Info' },
    ]
  },
  {
    id: 'attendance',
    name: 'Attendance Management',
    permissions: [
      { id: 'attendance.view', name: 'View Attendance' },
      { id: 'attendance.take', name: 'Take Attendance' },
      { id: 'attendance.edit', name: 'Edit Attendance' },
      { id: 'attendance.delete', name: 'Delete Attendance' },
      { id: 'attendance.qr', name: 'QR Check-in' },
      { id: 'attendance.history', name: 'View History' },
      { id: 'attendance.reports', name: 'View Reports' },
      { id: 'attendance.groups', name: 'Group Attendance' },
      { id: 'attendance.department', name: 'Department Attendance' },
      { id: 'attendance.member', name: 'Member Attendance' },
    ]
  },
  {
    id: 'groups',
    name: 'Groups Management',
    permissions: [
      { id: 'groups.view', name: 'View Groups' },
      { id: 'groups.create', name: 'Create Groups' },
      { id: 'groups.edit', name: 'Edit Groups' },
      { id: 'groups.delete', name: 'Delete Groups' },
      { id: 'groups.categories', name: 'Manage Categories' },
      { id: 'groups.members', name: 'Manage Members' },
    ]
  },
  {
    id: 'events',
    name: 'Events Management',
    permissions: [
      { id: 'events.view', name: 'View Events' },
      { id: 'events.create', name: 'Create Events' },
      { id: 'events.edit', name: 'Edit Events' },
      { id: 'events.delete', name: 'Delete Events' },
      { id: 'events.calendar', name: 'View Calendar' },
      { id: 'events.categories', name: 'Manage Categories' },
      { id: 'events.templates', name: 'Manage Templates' },
      { id: 'events.registrations', name: 'Manage Registrations' },
      { id: 'events.attendance', name: 'Event Attendance' },
      { id: 'events.export', name: 'Export Events' },
      { id: 'events.bulk', name: 'Bulk Actions' },
    ]
  },
  {
    id: 'communications',
    name: 'Communications',
    permissions: [
      { id: 'communications.view', name: 'View Communications' },
      { id: 'communications.send', name: 'Send Messages' },
      { id: 'communications.campaigns', name: 'Manage Campaigns' },
      { id: 'communications.campaigns.create', name: 'Create Campaigns' },
      { id: 'communications.campaigns.edit', name: 'Edit Campaigns' },
      { id: 'communications.campaigns.delete', name: 'Delete Campaigns' },
      { id: 'communications.announcements', name: 'Manage Announcements' },
      { id: 'communications.newsletters', name: 'Manage Newsletters' },
      { id: 'communications.templates', name: 'Message Templates' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance Management',
    permissions: [
      { id: 'finance.view', name: 'View Finance' },
      { id: 'finance.income.view', name: 'View Income' },
      { id: 'finance.income.create', name: 'Record Income' },
      { id: 'finance.income.edit', name: 'Edit Income' },
      { id: 'finance.income.delete', name: 'Delete Income' },
      { id: 'finance.expenses.view', name: 'View Expenses' },
      { id: 'finance.expenses.create', name: 'Record Expenses' },
      { id: 'finance.expenses.edit', name: 'Edit Expenses' },
      { id: 'finance.expenses.delete', name: 'Delete Expenses' },
      { id: 'finance.giving.view', name: 'View Giving' },
      { id: 'finance.giving.manage', name: 'Manage Giving' },
      { id: 'finance.tithes.view', name: 'View Tithes & Offerings' },
      { id: 'finance.tithes.manage', name: 'Manage Tithes & Offerings' },
      { id: 'finance.budgets.view', name: 'View Budgets' },
      { id: 'finance.budgets.create', name: 'Create Budgets' },
      { id: 'finance.budgets.edit', name: 'Edit Budgets' },
      { id: 'finance.budgets.delete', name: 'Delete Budgets' },
      { id: 'finance.budgets.categories', name: 'Manage Budget Categories' },
      { id: 'finance.budgets.allocations', name: 'Manage Allocations' },
      { id: 'finance.reports', name: 'View Financial Reports' },
      { id: 'finance.export', name: 'Export Financial Data' },
    ]
  },
  {
    id: 'assets',
    name: 'Assets Management',
    permissions: [
      { id: 'assets.view', name: 'View Assets' },
      { id: 'assets.create', name: 'Add Assets' },
      { id: 'assets.edit', name: 'Edit Assets' },
      { id: 'assets.delete', name: 'Delete Assets' },
      { id: 'assets.categories', name: 'Manage Categories' },
      { id: 'assets.reports', name: 'View Reports' },
      { id: 'assets.export', name: 'Export Assets' },
    ]
  },
  {
    id: 'departments',
    name: 'Departments',
    permissions: [
      { id: 'departments.view', name: 'View Departments' },
      { id: 'departments.create', name: 'Create Departments' },
      { id: 'departments.edit', name: 'Edit Departments' },
      { id: 'departments.delete', name: 'Delete Departments' },
      { id: 'departments.categories', name: 'Manage Categories' },
      { id: 'departments.members', name: 'Manage Members' },
    ]
  },
  {
    id: 'sunday-school',
    name: 'Sunday School',
    permissions: [
      { id: 'sunday-school.view', name: 'View Sunday School' },
      { id: 'sunday-school.classes.view', name: 'View Classes' },
      { id: 'sunday-school.classes.create', name: 'Create Classes' },
      { id: 'sunday-school.classes.edit', name: 'Edit Classes' },
      { id: 'sunday-school.classes.delete', name: 'Delete Classes' },
      { id: 'sunday-school.students.view', name: 'View Students' },
      { id: 'sunday-school.students.manage', name: 'Manage Students' },
      { id: 'sunday-school.teachers.view', name: 'View Teachers' },
      { id: 'sunday-school.teachers.manage', name: 'Manage Teachers' },
      { id: 'sunday-school.materials.view', name: 'View Materials' },
      { id: 'sunday-school.materials.manage', name: 'Manage Materials' },
      { id: 'sunday-school.attendance', name: 'Take Attendance' },
      { id: 'sunday-school.reports', name: 'View Reports' },
    ]
  },
  {
    id: 'prayer-requests',
    name: 'Prayer Requests',
    permissions: [
      { id: 'prayer-requests.view', name: 'View Prayer Requests' },
      { id: 'prayer-requests.view-confidential', name: 'View Confidential Requests' },
      { id: 'prayer-requests.create', name: 'Create Requests' },
      { id: 'prayer-requests.edit', name: 'Edit Requests' },
      { id: 'prayer-requests.delete', name: 'Delete Requests' },
      { id: 'prayer-requests.respond', name: 'Respond to Requests' },
      { id: 'prayer-requests.assign', name: 'Assign to Prayer Team' },
      { id: 'prayer-requests.categories', name: 'Manage Categories' },
      { id: 'prayer-requests.status', name: 'Update Status' },
    ]
  },
  {
    id: 'settings',
    name: 'Settings & Administration',
    permissions: [
      { id: 'settings.view', name: 'View Settings' },
      { id: 'settings.church-profile', name: 'Manage Church Profile' },
      { id: 'settings.branches.view', name: 'View Branches' },
      { id: 'settings.branches.create', name: 'Create Branches' },
      { id: 'settings.branches.edit', name: 'Edit Branches' },
      { id: 'settings.branches.delete', name: 'Delete Branches' },
      { id: 'settings.users.view', name: 'View Users' },
      { id: 'settings.users.create', name: 'Create Users' },
      { id: 'settings.users.edit', name: 'Edit Users' },
      { id: 'settings.users.delete', name: 'Delete Users' },
      { id: 'settings.users.suspend', name: 'Suspend Users' },
      { id: 'settings.roles.view', name: 'View Roles' },
      { id: 'settings.roles.create', name: 'Create Roles' },
      { id: 'settings.roles.edit', name: 'Edit Roles' },
      { id: 'settings.roles.delete', name: 'Delete Roles' },
      { id: 'settings.permissions.manage', name: 'Manage Permissions' },
      { id: 'settings.system', name: 'System Configuration' },
    ]
  },
];

// Mock role data
const mockRole = {
  id: '1',
  name: 'SuperAdmin',
  description: 'Full system access with all permissions',
  permissions: ['members.view', 'members.create', 'members.edit', 'finance.view', 'events.view', 'events.create'],
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
    const category = permissionCategories.find(c => c.id === categoryId);
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
    const category = permissionCategories.find(c => c.id === categoryId);
    if (!category) return false;
    return category.permissions.every(p => selectedPermissions.has(p.id));
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const category = permissionCategories.find(c => c.id === categoryId);
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
      // TODO: Implement actual API call
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
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Role deleted successfully');
      router.push('/dashboard/settings?tab=roles');
    } catch (error) {
      toast.error('Failed to delete role');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPermissions = permissionCategories.reduce((sum, cat) => sum + cat.permissions.length, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings?tab=roles">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Role</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Update role identification, descriptions, and assigned system permissions.
            </p>
          </div>
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
            <div>
              <h2 className="text-base font-semibold text-foreground">Role Information</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Role name, usage metrics, and descriptive purpose</p>
            </div>

            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 sm:col-span-8 space-y-2">
                <Label htmlFor="roleName">Role Name *</Label>
                <Input
                  id="roleName"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g., Administrator"
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
                  placeholder="Describe the role and its responsibilities..."
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
              <div>
                <h2 className="text-base font-semibold text-foreground">Role Permissions</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedPermissions.size} of {totalPermissions} permissions selected
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const allPermissions = new Set<string>();
                    permissionCategories.forEach(category => {
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
              {permissionCategories.map((category) => {
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
