'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Users,
  Search,
  Plus,
  Trash2,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Settings,
  UserCheck,
  AlertCircle,
  CheckCircle2
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
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [linkedGroups, setLinkedGroups] = useState(mockLinkedGroups);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredAvailableGroups = availableGroups.filter(group => {
    const isNotLinked = !linkedGroups.some(linked => linked.id === group.id);
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    return isNotLinked && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Pending': return 'secondary';
      case 'Declined': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'Declined': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Leading': return 'bg-blue-100 text-blue-800';
      case 'Supporting': return 'bg-green-100 text-green-800';
      case 'Technical': return 'bg-purple-100 text-purple-800';
      case 'Assisting': return 'bg-yellow-100 text-yellow-800';
      case 'Coordinating': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupAssignment.groupId || !newGroupAssignment.role) {
      toast.error('Please select a group and assign a role');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (error) {
      toast.error('Failed to assign group to event');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setLinkedGroups(prev => prev.map(group => 
        group.id === selectedGroup.id ? selectedGroup : group
      ));
      
      setEditGroupDialogOpen(false);
      setSelectedGroup(null);
      toast.success('Group assignment updated successfully');
    } catch (error) {
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLinkedGroups(prev => prev.map(group => 
        group.id === groupId ? { ...group, status: newStatus } : group
      ));
      
      toast.success(`Group status updated to ${newStatus.toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to update group status');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationToGroups = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Notifications sent to all assigned groups');
    } catch (error) {
      toast.error('Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Groups & Departments</h1>
            <p className="text-muted-foreground">{mockEvent.title} - {format(new Date(mockEvent.date), 'PPP')}</p>
          </div>
        </div>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Event Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(mockEvent.date), 'PPP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">{mockEvent.startTime}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{mockEvent.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkedGroups.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {linkedGroups.filter(g => g.status === 'Confirmed').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {linkedGroups.filter(g => g.status === 'Pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {linkedGroups.reduce((total, group) => {
                const groupData = availableGroups.find(g => g.id === group.id);
                return total + (groupData?.memberCount || 0);
              }, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Groups */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assigned Groups</CardTitle>
              <CardDescription>Groups and departments involved in this event</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={sendNotificationToGroups} disabled={loading}>
                <Mail className="mr-2 h-4 w-4" />
                Notify All Groups
              </Button>
              
              <Dialog open={addGroupDialogOpen} onOpenChange={setAddGroupDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-brand-primary hover:bg-brand-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="group">Select Group</Label>
                      <Select value={newGroupAssignment.groupId} onValueChange={(value) => setNewGroupAssignment(prev => ({ ...prev, groupId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredAvailableGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newGroupAssignment.role} onValueChange={(value) => setNewGroupAssignment(prev => ({ ...prev, role: value }))}>
                        <SelectTrigger>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="responsibilities">Responsibilities</Label>
                      <Textarea
                        id="responsibilities"
                        value={newGroupAssignment.responsibilities}
                        onChange={(e) => setNewGroupAssignment(prev => ({ ...prev, responsibilities: e.target.value }))}
                        placeholder="Describe their responsibilities..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
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
                    <Button variant="outline" onClick={() => setAddGroupDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddGroup} disabled={loading}>
                      {loading ? 'Assigning...' : 'Assign Group'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {linkedGroups.map((linkedGroup) => {
              const groupData = availableGroups.find(g => g.id === linkedGroup.id);
              if (!groupData) return null;
              
              return (
                <Card key={linkedGroup.id} className="border-l-4 border-l-brand-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {groupData.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{groupData.name}</h3>
                            <Badge className={getRoleColor(linkedGroup.role)}>
                              {linkedGroup.role}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(linkedGroup.status)}
                              <Badge variant={getStatusColor(linkedGroup.status)}>
                                {linkedGroup.status}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {groupData.description}
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium">Leader</p>
                              <p className="text-sm text-muted-foreground">{groupData.leader}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Members</p>
                              <p className="text-sm text-muted-foreground">{groupData.memberCount} members</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Contact</p>
                              <p className="text-sm text-muted-foreground">{groupData.contactEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Assigned</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(linkedGroup.assignedAt), 'PPP')}
                              </p>
                            </div>
                          </div>
                          
                          {linkedGroup.responsibilities && (
                            <div className="mb-3">
                              <p className="text-sm font-medium">Responsibilities</p>
                              <p className="text-sm text-muted-foreground">{linkedGroup.responsibilities}</p>
                            </div>
                          )}
                          
                          {linkedGroup.notes && (
                            <div>
                              <p className="text-sm font-medium">Notes</p>
                              <p className="text-sm text-muted-foreground">{linkedGroup.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select value={linkedGroup.status} onValueChange={(value) => handleStatusChange(linkedGroup.id, value)}>
                          <SelectTrigger className="w-32">
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
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedGroup(linkedGroup);
                            setEditGroupDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveGroup(linkedGroup.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {linkedGroups.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No groups assigned to this event yet.</p>
                <p className="text-sm">Click "Assign Group" to add groups and departments.</p>
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
              Update the group's role and responsibilities
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select value={selectedGroup.role} onValueChange={(value) => setSelectedGroup((prev: LinkedGroup | null) => prev ? ({ ...prev, role: value }) : null)}>
                  <SelectTrigger>
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
              
              <div className="space-y-2">
                <Label htmlFor="editResponsibilities">Responsibilities</Label>
                <Textarea
                  id="editResponsibilities"
                  value={selectedGroup.responsibilities}
                  onChange={(e) => setSelectedGroup((prev: LinkedGroup | null) => prev ? ({ ...prev, responsibilities: e.target.value }) : null)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
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
            <Button variant="outline" onClick={() => setEditGroupDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateGroup} disabled={loading}>
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