'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, MoreHorizontal, ArrowLeft, Loader2, Users, UserCheck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { departmentsService } from '@/services';
import { Department, DepartmentMember } from '@/lib/types/departments';
import { Member } from '@/lib/types';
import { toast } from 'sonner';

export default function DepartmentMembersPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [members, setMembers] = useState<DepartmentMember[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('member');

  useEffect(() => {
    loadData();
  }, [departmentId]);

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
    } catch {
      toast.error('Failed to load department members');
    } finally {
      setLoading(false);
    }
  };

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
    if (selectedMembers.length === 0 || !selectedRole) {
      toast.error('Please select at least one member and a role');
      return;
    }
    
    try {
      setSubmitting(true);
      await departmentsService.addMembersToRole(departmentId, selectedMembers, selectedRole);
      toast.success('Member(s) added successfully');
      setShowAddDialog(false);
      setSelectedMembers([]);
      setSelectedRole('member');
      loadData();
    } catch {
      toast.error('Failed to add members');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await departmentsService.removeMemberFromDepartment(departmentId, memberId);
      toast.success('Member removed');
      setMembers(members.filter(m => m.memberId !== memberId));
    } catch {
      toast.error('Failed to remove member');
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
            <h1 className="font-heading text-2xl font-bold tracking-tight">Department Members</h1>
          </div>
        </div>

        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Members
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Members"
          value={members.length}
          icon={Users}
        />
        <StatCard
          title="Active Members"
          value={members.filter(m => m.isActive).length}
          icon={UserCheck}
        />
        <StatCard
          title="Assigned Roles"
          value={members.filter(m => m.roles && m.roles.length > 0).length}
          icon={Shield}
        />
      </div>

      {/* Member Directory */}
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="head">Head</SelectItem>
                <SelectItem value="assistant_head">Assistant Head</SelectItem>
                <SelectItem value="secretary">Secretary</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary shrink-0">
                      {member.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {member.memberName}
                        </span>
                        <StatusBadge status={member.isActive ? 'active' : 'inactive'} size="sm" />
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {member.memberEmail || member.memberPhone || 'No contact provided'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {member.roles && member.roles.length > 0 && (
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {member.roles[0].roleType.replace('_', ' ')}
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRemoveMember(member.memberId)}
                          className="text-destructive focus:text-destructive"
                        >
                          Remove from Department
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredMembers.length === 0 && !loading && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No members found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Members Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add Members to Department</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role">Assign Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
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
              <Label>Select Church Members ({selectedMembers.length} selected)</Label>
              <div className="max-h-56 overflow-y-auto border border-border rounded-md p-2 space-y-2">
                {availableMembers.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-3 p-1.5 rounded hover:bg-muted/40 cursor-pointer text-xs"
                  >
                    <Checkbox
                      checked={selectedMembers.includes(m.id)}
                      onCheckedChange={(checked) => {
                        setSelectedMembers(prev =>
                          checked ? [...prev, m.id] : prev.filter(id => id !== m.id)
                        );
                      }}
                    />
                    <span className="font-medium text-foreground">
                      {m.firstName} {m.lastName}
                    </span>
                    <span className="text-muted-foreground ml-auto">{m.email}</span>
                  </label>
                ))}
                {availableMembers.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    All church members are already in this department.
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers} disabled={submitting || selectedMembers.length === 0}>
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add (${selectedMembers.length})`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}