'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EventGroupRoleBadge } from '@/components/ui/category-badges';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Users,
  Plus,
  Trash2,
  Edit,
  Mail,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';

// Types
interface LinkedGroup {
  id: string;
  name: string;
  role: string;
  responsibilities: string;
  assignedAt: string;
  assignedBy: string;
  status: string;
  notes: string;
}

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Sunday Service',
  date: '2024-01-21',
  startTime: '10:00',
  location: 'Main Sanctuary'
};

// Mock groups data
const availableGroups = [
  {
    id: '1',
    name: 'Youth Ministry',
    description: 'Ministry focused on young people aged 13-25',
    leader: 'Pastor Mike',
    memberCount: 45,
    contactEmail: 'youth@church.com',
    contactPhone: '(555) 123-4567'
  },
  {
    id: '2',
    name: 'Children Ministry',
    description: 'Ministry for children aged 3-12',
    leader: 'Sister Sarah',
    memberCount: 32,
    contactEmail: 'children@church.com',
    contactPhone: '(555) 234-5678'
  },
  {
    id: '3',
    name: 'Worship Team',
    description: 'Musicians and vocalists for worship services',
    leader: 'Brother John',
    memberCount: 18,
    contactEmail: 'worship@church.com',
    contactPhone: '(555) 345-6789'
  },
  {
    id: '4',
    name: 'Ushering Team',
    description: 'Welcoming and seating congregation members',
    leader: 'Deacon James',
    memberCount: 25,
    contactEmail: 'ushers@church.com',
    contactPhone: '(555) 456-7890'
  },
  {
    id: '5',
    name: 'Media Team',
    description: 'Audio, video, and technical support',
    leader: 'Brother David',
    memberCount: 12,
    contactEmail: 'media@church.com',
    contactPhone: '(555) 567-8901'
  },
  {
    id: '6',
    name: 'Prayer Team',
    description: 'Intercessory prayer and spiritual support',
    leader: 'Sister Mary',
    memberCount: 28,
    contactEmail: 'prayer@church.com',
    contactPhone: '(555) 678-9012'
  },
  {
    id: '7',
    name: 'Outreach Team',
    description: 'Community outreach and evangelism',
    leader: 'Pastor Paul',
    memberCount: 22,
    contactEmail: 'outreach@church.com',
    contactPhone: '(555) 789-0123'
  },
  {
    id: '8',
    name: 'Finance Committee',
    description: 'Financial oversight and stewardship',
    leader: 'Treasurer Lisa',
    memberCount: 8,
    contactEmail: 'finance@church.com',
    contactPhone: '(555) 890-1234'
  }
];

// Mock linked groups for this event
const mockLinkedGroups = [
  {
    id: '3',
    name: 'Worship Team',
    role: 'Leading',
    responsibilities: 'Lead worship music, sound check at 9:00 AM',
    assignedAt: '2024-01-10T14:30:00',
    assignedBy: 'Pastor John',
    status: 'Confirmed',
    notes: 'Special music planned for communion'
  },
  {
    id: '4',
    name: 'Ushering Team',
    role: 'Supporting',
    responsibilities: 'Welcome guests, distribute bulletins, assist with seating',
    assignedAt: '2024-01-10T14:35:00',
    assignedBy: 'Pastor John',
    status: 'Confirmed',
    notes: 'Extra ushers needed for expected large attendance'
  },
  {
    id: '5',
    name: 'Media Team',
    role: 'Technical',
    responsibilities: 'Audio/video setup, live streaming, recording',
    assignedAt: '2024-01-10T14:40:00',
    assignedBy: 'Pastor John',
    status: 'Pending',
    notes: 'Need to test new camera equipment'
  }
];

const roleOptions = ['Leading', 'Supporting', 'Technical', 'Assisting', 'Coordinating'];
const statusOptions = ['Pending', 'Confirmed', 'Declined'];

export default function EventGroupsPage() {
  const params = useParams();
  const eventId = (params.id as string) || mockEvent.id;
  const [loading, setLoading] = useState(false);
  const [linkedGroups, setLinkedGroups] = useState(mockLinkedGroups);
  const [addGroupDialogOpen, setAddGroupDialogOpen] = useState(false);
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<LinkedGroup | null>(null);
  const [newGroupAssignment, setNewGroupAssignment] = useState({
    groupId: '',
    role: '',
    responsibilities: '',
    notes: ''
  });
  const deleteDialog = useDeleteDialog();

  const availableUnlinkedGroups = availableGroups.filter(
    group => !linkedGroups.some(linked => linked.id === group.id)
  );

  const handleAddGroup = async () => {
    if (!newGroupAssignment.groupId || !newGroupAssignment.role) {
      toast.error('Please select a group and assign a role');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const selectedGroupData = availableGroups.find(g => g.id === newGroupAssignment.groupId);
      if (selectedGroupData) {
        const newLinkedGroup = {
          id: selectedGroupData.id,
          name: selectedGroupData.name,
          role: newGroupAssignment.role,
          responsibilities: newGroupAssignment.responsibilities,
          assignedAt: new Date().toISOString(),
          assignedBy: 'Admin',
          status: 'Pending',
          notes: newGroupAssignment.notes
        };
        
        setLinkedGroups(prev => [...prev, newLinkedGroup]);
        setNewGroupAssignment({ groupId: '', role: '', responsibilities: '', notes: '' });
        setAddGroupDialogOpen(false);
        toast.success('Group assigned to event successfully');
      }
    } catch {
      toast.error('Failed to assign group to event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setLinkedGroups(prev => prev.map(group => 
        group.id === selectedGroup.id ? selectedGroup : group
      ));
      setEditGroupDialogOpen(false);
      setSelectedGroup(null);
      toast.success('Group assignment updated successfully');
    } catch {
      toast.error('Failed to update group assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGroup = (groupId: string) => {
    const groupToRemove = linkedGroups.find(group => group.id === groupId);
    if (groupToRemove) {
      deleteDialog.openDialog({ id: groupId, name: groupToRemove.name });
    }
  };

  const confirmRemoveGroup = async (item: { id: string; name: string }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setLinkedGroups(prev => prev.filter(group => group.id !== item.id));
      toast.success('Group removed from event successfully');
    } catch (error) {
      toast.error('Failed to remove group from event');
      throw error;
    }
  };

  const handleStatusChange = async (groupId: string, newStatus: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setLinkedGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, status: newStatus } : group
      ));
      toast.success(`Group status updated to ${newStatus.toLowerCase()}`);
    } catch {
      toast.error('Failed to update group status');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToGroups = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notifications sent to all assigned groups');
    } catch {
      toast.error('Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href={`/dashboard/events/${eventId}`} aria-label="Back to Event Details">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Event Groups & Departments</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mockEvent.title} • {format(new Date(mockEvent.date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={sendNotificationToGroups} disabled={loading}>
            <Mail className="mr-1.5 h-4 w-4" />
            Notify All Groups
          </Button>
          
          <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-1.5 h-4 w-4" />
                Assign Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Group to Event</DialogTitle>
                <DialogDescription>
                  Select a group and define their role in this event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="group" className="text-xs">Select Group</Label>
                  <Select value={newGroupAssignment.groupId} onValueChange={(value) => setNewGroupAssignment(prev => ({ ...prev, groupId: value }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Choose a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnlinkedGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs">Role</Label>
                  <Select value={newGroupAssignment.role} onValueChange={(value) => setNewGroupAssignment(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Assign a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="responsibilities" className="text-xs">Responsibilities</Label>
                  <Textarea
                    id="responsibilities"
                    value={newGroupAssignment.responsibilities}
                    onChange={(e) => setNewGroupAssignment(prev => ({ ...prev, responsibilities: e.target.value }))}
                    placeholder="Describe their responsibilities..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newGroupAssignment.notes}
                    onChange={(e) => setNewGroupAssignment(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setAddGroupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddGroup} disabled={loading}>
                  {loading ? 'Assigning...' : 'Assign Group'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Event Date</p>
                <p className="text-muted-foreground">{format(new Date(mockEvent.date), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Start Time</p>
                <p className="text-muted-foreground">{mockEvent.startTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-muted-foreground truncate">{mockEvent.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Assigned Groups" value={linkedGroups.length} icon={Users} />
        <StatCard title="Confirmed" value={linkedGroups.filter(g => g.status === 'Confirmed').length} icon={CheckCircle2} />
        <StatCard title="Pending" value={linkedGroups.filter(g => g.status === 'Pending').length} icon={AlertCircle} />
        <StatCard
          title="Total Group Members"
          value={linkedGroups.reduce((total, group) => {
            const groupData = availableGroups.find(g => g.id === group.id);
            return total + (groupData?.memberCount || 0);
          }, 0)}
          icon={UserCheck}
        />
      </div>

      {/* Assigned Groups List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assigned Groups</CardTitle>
          <CardDescription className="text-xs">Departments and teams assigned to this event</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {linkedGroups.map((linkedGroup) => {
              const groupData = availableGroups.find(g => g.id === linkedGroup.id);
              if (!groupData) return null;
              
              return (
                <div key={linkedGroup.id} className="p-4 border rounded-lg hover:border-foreground/20 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {groupData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sm text-foreground">{groupData.name}</h3>
                          <EventGroupRoleBadge role={linkedGroup.role} />
                          <StatusBadge status={linkedGroup.status} />
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {groupData.description}
                        </p>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-muted-foreground pt-1">
                          <div>
                            <span className="font-medium text-foreground">Leader:</span> {groupData.leader}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Members:</span> {groupData.memberCount}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Contact:</span> {groupData.contactEmail}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">Assigned:</span> {format(new Date(linkedGroup.assignedAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                        
                        {linkedGroup.responsibilities && (
                          <div className="text-xs text-muted-foreground pt-1 border-t border-border/40">
                            <span className="font-medium text-foreground">Responsibilities:</span> {linkedGroup.responsibilities}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      <Select value={linkedGroup.status} onValueChange={(value) => handleStatusChange(linkedGroup.id, value)}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setSelectedGroup(linkedGroup);
                          setEditGroupDialogOpen(true);
                        }}
                        aria-label="Edit group assignment"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive focus:text-destructive"
                        onClick={() => handleRemoveGroup(linkedGroup.id)}
                        disabled={loading}
                        aria-label="Remove group"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {linkedGroups.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No groups assigned to this event yet.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Group Dialog */}
      <Dialog open={editGroupDialogOpen} onOpenChange={setEditGroupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Group Assignment</DialogTitle>
            <DialogDescription>
              Update the group&apos;s role and responsibilities
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="editRole" className="text-xs">Role</Label>
                <Select value={selectedGroup.role} onValueChange={(value) => setSelectedGroup((prev: LinkedGroup | null) => prev ? ({ ...prev, role: value }) : null)}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="editResponsibilities" className="text-xs">Responsibilities</Label>
                <Textarea
                  id="editResponsibilities"
                  value={selectedGroup.responsibilities}
                  onChange={(e) => setSelectedGroup((prev: LinkedGroup | null) => prev ? ({ ...prev, responsibilities: e.target.value }) : null)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="editNotes" className="text-xs">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={selectedGroup.notes}
                  onChange={(e) => setSelectedGroup((prev: LinkedGroup | null) => prev ? ({ ...prev, notes: e.target.value }) : null)}
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpdateGroup} disabled={loading}>
              {loading ? 'Updating...' : 'Update Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(confirmRemoveGroup)}
        title="Remove Group from Event?"
        description="This will remove the group from this event. The group itself will not be deleted."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
        confirmText="Remove Group"
        destructive={false}
      />
    </div>
  );
}