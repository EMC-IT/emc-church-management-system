'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Search, Calendar, Clock, MapPin, Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { departmentsService } from '@/services';
import { Department, DepartmentMeeting, MeetingType, MeetingStatus } from '@/lib/types/departments';

export default function DepartmentMeetingsPage() {
  const params = useParams();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [meetings, setMeetings] = useState<DepartmentMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<DepartmentMeeting | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: MeetingType.REGULAR,
    agenda: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [deptData, meetingsData] = await Promise.all([
          departmentsService.getDepartment(departmentId),
          departmentsService.getDepartmentMeetings(departmentId)
        ]);
        if (deptData.success && deptData.data) {
          setDepartment(deptData.data);
        }
        if (meetingsData.success && meetingsData.data) {
          setMeetings(meetingsData.data);
        }
      } catch (error) {
        console.error('Error loading department meetings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [departmentId]);



  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const meetingData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        startTime: formData.time,
        endTime: formData.time, // You might want to add an endTime field to the form
        location: formData.location,
        agenda: formData.agenda.split('\n').filter(item => item.trim()),
        attendees: [], // Initialize with empty attendees array
        departmentId
      };
      
      if (editingMeeting) {
        await departmentsService.updateDepartmentMeeting(departmentId, editingMeeting.id, meetingData);
        setMeetings(meetings.map(meeting => 
          meeting.id === editingMeeting.id ? { ...meeting, ...meetingData } : meeting
        ));
        setShowEditDialog(false);
      } else {
        const newMeeting = await departmentsService.createDepartmentMeeting(meetingData);
        if (newMeeting.success && newMeeting.data) {
          setMeetings([...meetings, newMeeting.data]);
        }
        setShowAddDialog(false);
      }
      
      setFormData({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          type: MeetingType.REGULAR,
          agenda: ''
        });
      setEditingMeeting(null);
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  const handleEdit = (meeting: DepartmentMeeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      time: meeting.startTime,
      location: meeting.location,
      type: meeting.type,
      agenda: meeting.agenda.join('\n')
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (meetingId: string) => {
    try {
      await departmentsService.deleteDepartmentMeeting(departmentId, meetingId);
      setMeetings(meetings.filter(meeting => meeting.id !== meetingId));
    } catch (error) {
      console.error('Error deleting meeting:', error);
    }
  };

  const handleStatusUpdate = async (meetingId: string, newStatus: MeetingStatus) => {
    try {
      await departmentsService.updateMeetingStatus(departmentId, meetingId, newStatus);
      setMeetings(meetings.map(meeting => 
        meeting.id === meetingId ? { ...meeting, status: newStatus } : meeting
      ));
    } catch (error) {
      console.error('Error updating meeting status:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'regular': return 'bg-gray-100 text-gray-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (meeting: DepartmentMeeting) => {
    const date = new Date(meeting.date);
    return {
      date: date.toLocaleDateString(),
      time: meeting.startTime
    };
  };

  const isUpcoming = (meeting: DepartmentMeeting) => {
    const meetingDateTime = new Date(`${meeting.date}T${meeting.startTime}`);
    return meetingDateTime > new Date();
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
          <h1 className="text-3xl font-bold">{department?.name} Meetings</h1>
          <p className="text-muted-foreground">
            Schedule and manage department meetings and activities
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Meeting</DialogTitle>
              <DialogDescription>
                Create a new meeting for this department.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Monthly Planning Meeting"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the meeting..."
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Conference Room A"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Meeting Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MeetingType.REGULAR}>Regular</SelectItem>
                      <SelectItem value={MeetingType.PLANNING}>Planning</SelectItem>
                      <SelectItem value={MeetingType.TRAINING}>Training</SelectItem>
                      <SelectItem value={MeetingType.EMERGENCY}>Emergency</SelectItem>
                      <SelectItem value={MeetingType.RETREAT}>Retreat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="agenda">Agenda</Label>
                <Textarea
                  id="agenda"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="List agenda items (one per line)..."
                  rows={4}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Schedule Meeting
                </Button>
              </DialogFooter>
            </form>
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
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <div className="grid gap-4">
        {filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No meetings found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No meetings match your current filters.'
                  : 'No meetings have been scheduled for this department yet.'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule First Meeting
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMeetings.map((meeting) => {
            const { date, time } = formatDateTime(meeting);
            const upcoming = isUpcoming(meeting);
            
            return (
              <Card key={meeting.id} className={upcoming ? 'border-brand-primary/20' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-brand-primary/10 rounded-lg">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {meeting.title}
                          <Badge className={getStatusBadgeColor(meeting.status)}>
                            {meeting.status}
                          </Badge>
                          <Badge className={getTypeBadgeColor(meeting.type)}>
                            {meeting.type}
                          </Badge>
                          {upcoming && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Upcoming
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{meeting.description}</CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {meeting.status === MeetingStatus.SCHEDULED && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusUpdate(meeting.id, MeetingStatus.COMPLETED)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleStatusUpdate(meeting.id, MeetingStatus.CANCELLED)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      <Button variant="outline" size="sm" onClick={() => handleEdit(meeting)}>
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
                            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{meeting.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(meeting.id)}>
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
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{meeting.attendees.length} attendees</span>
                      </div>
                    </div>
                    
                    {meeting.agenda.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Agenda</h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {meeting.agenda.map((item, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-brand-primary rounded-full mt-2 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {meeting.attendees.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-2">Attendees</h4>
                      <div className="flex flex-wrap gap-2">
                        {meeting.attendees.slice(0, 5).map((attendeeId, index) => (
                          <div key={attendeeId} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {`M${index + 1}`}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium">Member {index + 1}</span>
                          </div>
                        ))}
                        {meeting.attendees.length > 5 && (
                          <div className="flex items-center justify-center bg-gray-100 rounded-full px-3 py-1">
                            <span className="text-xs text-gray-600">+{meeting.attendees.length - 5} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
            <DialogDescription>
              Update the meeting details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Meeting Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Meeting Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                           <SelectItem value={MeetingType.REGULAR}>Regular</SelectItem>
                           <SelectItem value={MeetingType.PLANNING}>Planning</SelectItem>
                           <SelectItem value={MeetingType.TRAINING}>Training</SelectItem>
                           <SelectItem value={MeetingType.EMERGENCY}>Emergency</SelectItem>
                           <SelectItem value={MeetingType.RETREAT}>Retreat</SelectItem>
                         </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-agenda">Agenda</Label>
              <Textarea
                id="edit-agenda"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                rows={4}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Update Meeting
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Meetings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">{meetings.length}</div>
              <div className="text-sm text-muted-foreground">Total Meetings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {meetings.filter(m => m.status === MeetingStatus.SCHEDULED).length}
              </div>
              <div className="text-sm text-muted-foreground">Scheduled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {meetings.filter(m => m.status === MeetingStatus.COMPLETED).length}
              </div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {meetings.filter(m => isUpcoming(m) && m.status === MeetingStatus.SCHEDULED).length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}