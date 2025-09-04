'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Users, Crown, Shield, FileText, DollarSign, User, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
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

export default function DepartmentRolesPage() {
  const params = useParams();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [roles, setRoles] = useState<DepartmentRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<DepartmentRole | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    level: 'member' as 'leader' | 'assistant' | 'member'
  });

  useEffect(() => {
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
      } catch (error) {
        console.error('Error loading department roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [departmentId]);



  const filteredRoles = roles.filter(role => 
    role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const roleData = {
        memberId: 'temp-member-id', // This should be selected from a member picker
        roleType: formData.level as any,
        title: formData.title,
        description: formData.description,
        responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
        startDate: new Date().toISOString().split('T')[0],
        endDate: undefined
      };
      
      if (editingRole) {
        await departmentsService.updateDepartmentRole(departmentId, editingRole.id, roleData);
        setRoles(roles.map(role => 
          role.id === editingRole.id ? { ...role, ...roleData } : role
        ));
        setShowEditDialog(false);
      } else {
        const newRole = await departmentsService.createDepartmentRole({ ...roleData, departmentId });
        if (newRole.success && newRole.data) {
          setRoles([...roles, newRole.data]);
        }
        setShowAddDialog(false);
      }
      
      setFormData({
        title: '',
        description: '',
        responsibilities: '',
        requirements: '',
        level: 'member'
      });
      setEditingRole(null);
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const handleEdit = (role: DepartmentRole) => {
    setEditingRole(role);
    setFormData({
      title: role.title,
      description: role.description || '',
      responsibilities: role.responsibilities.join('\n'),
      requirements: '',
      level: role.roleType as any
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (roleId: string) => {
    try {
      await departmentsService.deleteDepartmentRole(departmentId, roleId);
      setRoles(roles.filter(role => role.id !== roleId));
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'head': return <Crown className="h-5 w-5 text-brand-primary" />;
      case 'assistant_head': return <UserCheck className="h-5 w-5 text-green-600" />;
      case 'secretary': return <FileText className="h-5 w-5 text-purple-600" />;
      case 'treasurer': return <DollarSign className="h-5 w-5 text-orange-600" />;
      case 'coordinator': return <Users className="h-5 w-5 text-yellow-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (roleType: string) => {
    switch (roleType) {
      case 'head': return 'bg-blue-100 text-blue-800';
      case 'assistant_head': return 'bg-green-100 text-green-800';
      case 'secretary': return 'bg-purple-100 text-purple-800';
      case 'treasurer': return 'bg-orange-100 text-orange-800';
      case 'coordinator': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{department?.name} Roles</h1>
          <p className="text-muted-foreground">
            Define and manage leadership roles and responsibilities
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role with its responsibilities and requirements.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Role Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Worship Leader"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="level">Role Level</Label>
                  <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leader">Leader</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the role..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="responsibilities">Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="List responsibilities (one per line)..."
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List requirements (one per line)..."
                  rows={3}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Role
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Roles List */}
      <div className="grid gap-4">
        {filteredRoles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Crown className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No roles found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? 'No roles match your search criteria.'
                  : 'This department doesn\'t have any defined roles yet.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Role
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredRoles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-primary/10 rounded-lg">
                      {getRoleIcon(role.roleType)}
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.title}
                        <Badge className={getRoleBadgeColor(role.roleType)}>
                          {role.roleType}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Role</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{role.title}" role? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(role.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Responsibilities
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {role.responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1 h-1 bg-brand-primary rounded-full mt-2 flex-shrink-0" />
                          {responsibility}
                        </li>
                      ))}
                    </ul>
                  </div>
                  

                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-2">Current Holder</h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {role.memberName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{role.memberName}</p>
                      <p className="text-sm text-muted-foreground">{role.memberEmail}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role details and responsibilities.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Role Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-level">Role Level</Label>
                <Select value={formData.level} onValueChange={(value: any) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leader">Leader</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-responsibilities">Responsibilities</Label>
              <Textarea
                id="edit-responsibilities"
                value={formData.responsibilities}
                onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-requirements">Requirements</Label>
              <Textarea
                id="edit-requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Roles Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">{roles.length}</div>
              <div className="text-sm text-muted-foreground">Total Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {roles.filter(r => r.roleType === 'head').length}
              </div>
              <div className="text-sm text-muted-foreground">Leadership</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {roles.filter(r => r.roleType === 'assistant_head').length}
              </div>
              <div className="text-sm text-muted-foreground">Assistant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {roles.filter(r => r.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Filled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}