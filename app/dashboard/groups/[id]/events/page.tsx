'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Users,
  MapPin,
  Clock,
  Edit,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupEvent } from '@/lib/types/groups';
import { toast } from 'sonner';

const statusOptions = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

export default function GroupEventsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventToDelete, setEventToDelete] = useState<GroupEvent | null>(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      const eventsResponse = await groupsService.getGroupEvents(groupId);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
    } catch {
      toast.error('Failed to load group events');
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    setDeletingEvent(true);
    try {
      const response = await groupsService.deleteGroupEvent(eventToDelete.id);
      if (response.success) {
        toast.success('Event deleted');
        setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
        setEventToDelete(null);
      } else {
        toast.error(response.message || 'Failed to delete event');
      }
    } catch {
      toast.error('Failed to delete event');
    } finally {
      setDeletingEvent(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcoming = events.filter(e => e.status === 'Upcoming').length;
  const totalAttendees = events.reduce((sum, e) => sum + e.registeredAttendees, 0);
  const averageAttendance = events.length > 0 ? Math.round(totalAttendees / events.length) : 0;

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
            onClick={() => router.push(`/dashboard/groups/${groupId}`)}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Group Events</h1>
          </div>
        </div>

        <Button size="sm" onClick={() => router.push(`/dashboard/groups/${groupId}/events/add`)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={events.length} icon={CalendarDays} />
        <StatCard title="Upcoming" value={upcoming} icon={Calendar} />
        <StatCard title="Total Registrations" value={totalAttendees} icon={Users} />
        <StatCard title="Avg Attendance" value={averageAttendance} icon={UserCheck} />
      </div>

      {/* Events List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground truncate">{event.title}</h4>
                      <StatusBadge status={event.status.toLowerCase()} size="sm" />
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>{event.registeredAttendees}/{event.maxAttendees} registered</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 hidden md:block">
                      <Progress 
                        value={Math.min((event.registeredAttendees / event.maxAttendees) * 100, 100)} 
                        className="h-1.5"
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/groups/${groupId}/events/add?edit=${event.id}`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setEventToDelete(event)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No events found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{eventToDelete?.title}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingEvent}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEvent}
              disabled={deletingEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingEvent ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}