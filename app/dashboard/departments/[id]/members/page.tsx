'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Filter, MoreHorizontal, UserPlus, UserMinus, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { departmentsService } from '@/services';
import { Department, DepartmentMember, DepartmentRoleType } from '@/lib/types/departments';
import { Member } from '@/lib/types';

export default function DepartmentMembersPage() {
  const params = useParams();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptData, membersData, allMembersData] = await Promise.all([
          departmentsService.getDepartment(departmentId),
          departmentsService.getDepartmentMembers(departmentId),
          departmentsService.getAllMembers()
        ]);
        if (deptData.success && deptData.data) {
          setDepartment(deptData.data);
        }
        if (membersData.success && membersData.data) {
          setMembers(membersData.data);
        }
        if (allMembersData.success && allMembersData.data) {
          setAllMembers(allMembersData.data);
        }
      } catch (error) {
        console.error('Error loading department members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [departmentId]);



  const filteredMembers = members.filter(member => {
    const matchesSearch = member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (member.roles.length > 0 && member.roles[0].roleType === roleFilter);
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? member.isActive : !member.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const availableMembers = allMembers.filter(member => 
    !members.some(deptMember => deptMember.memberId === member.id)
  );

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0 || !selectedRole) return;
    
    try {
      await departmentsService.addMembersToRole(departmentId, selectedMembers, selectedRole);
      // Reload members
      const updatedMembers = await departmentsService.getDepartmentMembers(departmentId);
      if (updatedMembers.success && updatedMembers.data) {
        setMembers(updatedMembers.data);
      }
      setShowAddDialog(false);
      setSelectedMembers([]);
      setSelectedRole('');
    } catch (error) {
      console.error('Error adding members:', error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await departmentsService.removeMemberFromDepartment(departmentId, memberId);
      setMembers(members.filter(m => m.memberId !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    try {
      await departmentsService.updateMemberRole(departmentId, memberId, newRole);
      setMembers(members.map(m => 
        m.memberId === memberId ? { 
          ...m, 
          roles: [{ ...m.roles[0], roleType: newRole as any }] 
        } : m
      ));
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case DepartmentRoleType.HEAD: return 'bg-blue-100 text-blue-800';
      case DepartmentRoleType.ASSISTANT_HEAD: return 'bg-green-100 text-green-800';
      case DepartmentRoleType.SECRETARY: return 'bg-purple-100 text-purple-800';
      case DepartmentRoleType.TREASURER: return 'bg-orange-100 text-orange-800';
      case DepartmentRoleType.COORDINATOR: return 'bg-yellow-100 text-yellow-800';
      case DepartmentRoleType.MEMBER: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{department?.name} Members</h1>
          <p className="text-muted-foreground">
            Manage members and their roles in this department
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Members
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Members to Department</DialogTitle>
              <DialogDescription>
                Select members to add to this department and assign them a role.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DepartmentRoleType.MEMBER}>Member</SelectItem>
                    <SelectItem value={DepartmentRoleType.ASSISTANT_HEAD}>Assistant Head</SelectItem>
                    <SelectItem value={DepartmentRoleType.SECRETARY}>Secretary</SelectItem>
                    <SelectItem value={DepartmentRoleType.TREASURER}>Treasurer</SelectItem>
                    <SelectItem value={DepartmentRoleType.COORDINATOR}>Coordinator</SelectItem>
                    <SelectItem value={DepartmentRoleType.HEAD}>Head</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Available Members</Label>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2 space-y-2">
                  {availableMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={member.id}
                        checked={selectedMembers.includes(member.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMembers([...selectedMembers, member.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                          }
                        }}
                      />
                      <label htmlFor={member.id} className="flex items-center space-x-2 cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback>
                            {member.firstName?.[0] || 'M'}{member.lastName?.[0] || 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.firstName || 'Member'} {member.lastName || ''}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddMembers}
                disabled={selectedMembers.length === 0 || !selectedRole}
              >
                Add {selectedMembers.length} Member{selectedMembers.length !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={DepartmentRoleType.HEAD}>Head</SelectItem>
                  <SelectItem value={DepartmentRoleType.ASSISTANT_HEAD}>Assistant Head</SelectItem>
                  <SelectItem value={DepartmentRoleType.SECRETARY}>Secretary</SelectItem>
                  <SelectItem value={DepartmentRoleType.TREASURER}>Treasurer</SelectItem>
                  <SelectItem value={DepartmentRoleType.COORDINATOR}>Coordinator</SelectItem>
                  <SelectItem value={DepartmentRoleType.MEMBER}>Member</SelectItem>
                </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <div className="grid gap-4">
        {filteredMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <UserPlus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No members found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'No members match your current filters.'
                  : 'This department doesn\'t have any members yet.'}
              </p>
              {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Member
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.memberId}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.memberAvatar} />
                      <AvatarFallback>
                        {member.memberName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.memberName}</h3>
                        <Badge className={getRoleBadgeColor(member.roles.length > 0 ? member.roles[0].roleType : 'member')}>
                          {member.roles.length > 0 ? member.roles[0].roleType : 'member'}
                        </Badge>
                        <Badge className={getStatusBadgeColor(member.isActive ? 'active' : 'inactive')}>
                          {member.isActive ? 'active' : 'inactive'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.memberEmail}
                        </div>
                        {member.memberPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.memberPhone}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-1">
                        Joined: {new Date(member.joinDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.memberId, DepartmentRoleType.HEAD)}>
                        Make Head
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.memberId, DepartmentRoleType.ASSISTANT_HEAD)}>
                        Make Assistant Head
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateRole(member.memberId, DepartmentRoleType.MEMBER)}>
                        Make Member
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleRemoveMember(member.memberId)}
                        className="text-red-600"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Remove from Department
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Department Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">{members.length}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {members.filter(m => m.isActive).length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {members.filter(m => m.roles.length > 0 && m.roles[0].roleType === DepartmentRoleType.HEAD).length}
              </div>
              <div className="text-sm text-muted-foreground">Leaders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {members.filter(m => m.roles.length > 0 && m.roles[0].roleType === DepartmentRoleType.ASSISTANT_HEAD).length}
              </div>
              <div className="text-sm text-muted-foreground">Assistants</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}