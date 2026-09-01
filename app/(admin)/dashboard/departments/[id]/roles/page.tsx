'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, ArrowLeft, Loader2, Crown, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { departmentsService } from '@/services';
import { Department, DepartmentRole } from '@/lib/types/departments';
import { toast } from 'sonner';

export default function DepartmentRolesPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [roles, setRoles] = useState<DepartmentRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<DepartmentRole | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<DepartmentRole | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    level: 'member'
  });

  useEffect(() => {
    loadData();
  }, [departmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptData, rolesData] = await Promise.all([
        departmentsService.getDepartment(departmentId),
        departmentsService.getDepartmentRoles(departmentId)
      ]);
      if (deptData.success && deptData.data) {
        setDepartment(deptData.data);
      }
      if (rolesData.success && rolesData.data) {
        setRoles(rolesData.data);
      }
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      title: '',
      description: '',
      responsibilities: '',
      level: 'member'
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (role: DepartmentRole) => {
    setEditingRole(role);
    setFormData({
      title: role.title,
      description: role.description || '',
      responsibilities: Array.isArray(role.responsibilities) ? role.responsibilities.join('\n') : '',
      level: role.roleType || 'member'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Role title is required');
      return;
    }

    try {
      setSubmitting(true);
      const roleData = {
        memberId: 'temp-member-id',
        roleType: formData.level as any,
        title: formData.title,
        description: formData.description,
        responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
        startDate: new Date().toISOString().split('T')[0],
      };

      if (editingRole) {
        await departmentsService.updateDepartmentRole(departmentId, editingRole.id, roleData);
        toast.success('Role updated successfully');
      } else {
        await departmentsService.createDepartmentRole({ ...roleData, departmentId });
        toast.success('Role created successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    try {
      await departmentsService.deleteDepartmentRole(departmentId, roleToDelete.id);
      toast.success('Role deleted');
      setRoles(roles.filter(r => r.id !== roleToDelete.id));
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={4} rows={5} />;
  }

  const leadershipRoles = roles.filter(r => r.roleType === 'head' || r.roleType === 'assistant_head').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/departments/${departmentId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Department Roles</h1>
          </div>
        </div>

        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Role
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Roles" value={roles.length} icon={Shield} />
        <StatCard title="Leadership" value={leadershipRoles} icon={Crown} />
        <StatCard title="Member Roles" value={roles.length - leadershipRoles} icon={Users} />
      </div>

      {/* Roles List */}
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
            {filteredRoles.map((role) => (
              <Card key={role.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-foreground">{role.title}</h4>
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {(role.roleType || 'member').replace('_', ' ')}
                      </Badge>
                    </div>

                    {role.description && (
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    )}

                    {role.responsibilities && role.responsibilities.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-[11px] font-medium text-muted-foreground">Responsibilities:</span>
                        <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-0.5">
                          {role.responsibilities.map((item, index) => (
                            <li key={index} className="truncate">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        setRoleToDelete(role);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredRoles.length === 0 && !loading && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No roles found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingRole ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Role Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Lead Sound Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Role Type / Level</Label>
              <Select
                value={formData.level}
                onValueChange={(val) => setFormData({ ...formData, level: val })}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head">Head</SelectItem>
                  <SelectItem value="assistant_head">Assistant Head</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Role summary..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
              <Textarea
                id="responsibilities"
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                placeholder="Manage sound equipment&#10;Perform sound checks before services&#10;Train apprentice operators"
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingRole ? 'Save Changes' : 'Create Role'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{roleToDelete?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}