'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Search, Calendar, Clock, MapPin, Edit, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
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
import { toast } from 'sonner';

export default function DepartmentMeetingsPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;
  
  const [department, setDepartment] = useState<Department | null>(null);
  const [meetings, setMeetings] = useState<DepartmentMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<DepartmentMeeting | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<DepartmentMeeting | null>(null);

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
    loadData();
  }, [departmentId]);

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
    } catch {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meeting.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setEditingMeeting(null);
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: MeetingType.REGULAR,
      agenda: ''
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (meeting: DepartmentMeeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      date: meeting.date,
      time: meeting.startTime,
      location: meeting.location,
      type: meeting.type,
      agenda: Array.isArray(meeting.agenda) ? meeting.agenda.join('\n') : ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const meetingData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        date: formData.date,
        startTime: formData.time,
        endTime: formData.time,
        location: formData.location,
        agenda: formData.agenda.split('\n').filter(item => item.trim()),
        attendees: editingMeeting ? editingMeeting.attendees : [],
        departmentId
      };

      if (editingMeeting) {
        await departmentsService.updateDepartmentMeeting(departmentId, editingMeeting.id, meetingData);
        toast.success('Meeting updated successfully');
      } else {
        await departmentsService.createDepartmentMeeting(meetingData);
        toast.success('Meeting scheduled successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch {
      toast.error('Failed to save meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return;
    try {
      await departmentsService.deleteDepartmentMeeting(departmentId, meetingToDelete.id);
      toast.success('Meeting deleted');
      setMeetings(meetings.filter(m => m.id !== meetingToDelete.id));
    } catch {
      toast.error('Failed to delete meeting');
    } finally {
      setDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={5} />;
  }

  const upcomingCount = meetings.filter(m => m.status === MeetingStatus.SCHEDULED).length;
  const completedCount = meetings.filter(m => m.status === MeetingStatus.COMPLETED).length;

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
            <h1 className="font-heading text-2xl font-bold tracking-tight">Department Meetings</h1>
          </div>
        </div>

        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Meetings" value={meetings.length} icon={Calendar} />
        <StatCard title="Upcoming" value={upcomingCount} icon={Clock} />
        <StatCard title="Completed" value={completedCount} icon={Calendar} />
      </div>

      {/* Meetings List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Meetings ({filteredMeetings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={MeetingStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={MeetingStatus.ONGOING}>Ongoing</SelectItem>
                <SelectItem value={MeetingStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={MeetingStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredMeetings.map((meeting) => (
              <Card key={meeting.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-foreground">{meeting.title}</h4>
                      <Badge variant="neutral" size="sm" className="capitalize">
                        {meeting.type.toLowerCase()}
                      </Badge>
                      <StatusBadge status={(meeting.status || 'scheduled').toLowerCase() as any} size="sm" />
                    </div>

                    {meeting.description && (
                      <p className="text-xs text-muted-foreground">{meeting.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {meeting.startTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {meeting.location}
                      </span>
                    </div>

                    {meeting.agenda && meeting.agenda.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <span className="text-[11px] font-medium text-muted-foreground">Agenda:</span>
                        <ul className="text-xs text-muted-foreground list-disc list-inside mt-1 space-y-0.5">
                          {meeting.agenda.map((item, index) => (
                            <li key={index} className="truncate">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(meeting)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={() => {
                        setMeetingToDelete(meeting);
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

          {filteredMeetings.length === 0 && !loading && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No meetings found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Weekly Department Coordination"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker
                  id="date"
                  value={formData.date}
                  onChange={(_, dateStr) => setFormData({ ...formData, date: dateStr })}
                  placeholder="Select meeting date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Start Time *</Label>
                <TimePicker
                  id="time"
                  value={formData.time}
                  onChange={(timeStr) => setFormData({ ...formData, time: timeStr })}
                  placeholder="Select meeting time"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Conference Room A"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Meeting Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(val) => setFormData({ ...formData, type: val as MeetingType })}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MeetingType.REGULAR}>Regular</SelectItem>
                    <SelectItem value={MeetingType.EMERGENCY}>Emergency</SelectItem>
                    <SelectItem value={MeetingType.PLANNING}>Planning</SelectItem>
                    <SelectItem value={MeetingType.TRAINING}>Training</SelectItem>
                    <SelectItem value={MeetingType.RETREAT}>Retreat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Meeting notes or purpose..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda">Agenda (one item per line)</Label>
              <Textarea
                id="agenda"
                value={formData.agenda}
                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="Opening prayer&#10;Monthly review&#10;Upcoming event assignments"
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
                  editingMeeting ? 'Save Changes' : 'Schedule'
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
            <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{meetingToDelete?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeeting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Meeting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}