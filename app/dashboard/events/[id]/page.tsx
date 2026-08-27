'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EventCategoryBadge, EventGroupRoleBadge } from '@/components/ui/category-badges';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Mail,
  Phone,
  Edit,
  Trash2,
  UserCheck,
  UserPlus,
  Settings,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';

// Mock data
const mockEvent = {
  id: '1',
  title: 'Sunday Service',
  description: 'Weekly Sunday worship service with communion and special music ministry. Join us for a time of worship, fellowship, and spiritual growth as we come together as a church family.',
  category: 'Worship',
  date: '2024-01-21',
  startTime: '10:00',
  endTime: '12:00',
  location: 'Main Sanctuary',
  organizer: 'Pastor John Smith',
  contactEmail: 'pastor.john@church.com',
  contactPhone: '(555) 123-4567',
  maxAttendees: 500,
  currentAttendees: 450,
  registrationRequired: true,
  registrationDeadline: '2024-01-20',
  status: 'Upcoming',
  notes: 'Please arrive 15 minutes early for seating. Communion will be served during the service.',
  linkedGroups: [
    { id: '1', name: 'Worship Team', role: 'Leading' },
    { id: '2', name: 'Ushering Team', role: 'Supporting' },
    { id: '3', name: 'Media Team', role: 'Technical' }
  ],
  registrations: [
    { id: '1', memberName: 'John Doe', email: 'john@email.com', registeredAt: '2024-01-15', status: 'Confirmed' },
    { id: '2', memberName: 'Jane Smith', email: 'jane@email.com', registeredAt: '2024-01-16', status: 'Confirmed' },
    { id: '3', memberName: 'Bob Johnson', email: 'bob@email.com', registeredAt: '2024-01-17', status: 'Pending' }
  ],
  attendance: [
    { id: '1', memberName: 'John Doe', checkedInAt: '09:45', status: 'Present' },
    { id: '2', memberName: 'Jane Smith', checkedInAt: '09:50', status: 'Present' },
    { id: '3', memberName: 'Bob Johnson', checkedInAt: null, status: 'Absent' }
  ]
};

const recentActivity = [
  { id: '1', action: 'New registration', member: 'Sarah Wilson', time: '2 hours ago' },
  { id: '2', action: 'Registration confirmed', member: 'Mike Davis', time: '4 hours ago' },
  { id: '3', action: 'Event updated', member: 'Pastor John', time: '1 day ago' },
  { id: '4', action: 'Group assigned', member: 'Media Team', time: '2 days ago' }
];

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [event, setEvent] = useState(mockEvent);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const deleteDialog = useDeleteDialog();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setEvent(mockEvent);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [params.id]);

  const attendancePercentage = (event.currentAttendees / event.maxAttendees) * 100;
  const registrationPercentage = (event.registrations.length / event.maxAttendees) * 100;

  const handleDeleteEvent = () => {
    deleteDialog.openDialog({ id: event.id, name: event.title });
  };

  const confirmDeleteEvent = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Event deleted successfully');
      router.push('/dashboard/events');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            asChild
          >
            <Link href="/dashboard/events" aria-label="Back to Events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-bold tracking-tight truncate">{event.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/events/${event.id}/edit`}>
              <Edit className="mr-1.5 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={handleDeleteEvent}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Main Overview Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={event.status} />
            <EventCategoryBadge category={event.category} />
          </div>
          <p className="text-sm text-muted-foreground pt-1">{event.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-medium">
                  {format(new Date(event.date), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-sm font-medium">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium truncate">{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Attendance</p>
                <p className="text-sm font-medium">
                  {event.currentAttendees} / {event.maxAttendees}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Progress</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.registrations.length}</div>
            <Progress value={registrationPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {registrationPercentage.toFixed(0)}% of capacity ({event.maxAttendees} max)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Attendance</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.currentAttendees}</div>
            <Progress value={attendancePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {attendancePercentage.toFixed(0)}% of total capacity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Groups</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.linkedGroups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active ministries involved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organizer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>
                      {event.organizer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{event.organizer}</p>
                    <p className="text-xs text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{event.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{event.contactPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Registration Required</p>
                  <p className="font-medium">
                    {event.registrationRequired ? 'Yes' : 'No'}
                  </p>
                </div>
                
                {event.registrationRequired && (
                  <div>
                    <p className="text-xs text-muted-foreground">Registration Deadline</p>
                    <p className="font-medium">
                      {format(new Date(event.registrationDeadline), 'PPP')}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-muted-foreground">Maximum Attendees</p>
                  <p className="font-medium">{event.maxAttendees}</p>
                </div>
                
                {event.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                      <p className="text-xs text-foreground">{event.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Event Registrations</h3>
            <Button size="sm" asChild>
              <Link href={`/dashboard/events/${event.id}/registrations`}>
                Manage Registrations
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {event.registrations.map((registration) => (
                  <div key={registration.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {registration.memberName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{registration.memberName}</p>
                        <p className="text-xs text-muted-foreground">{registration.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(registration.registeredAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <StatusBadge status={registration.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Attendance Tracking</h3>
            <Button size="sm" asChild>
              <Link href={`/dashboard/events/${event.id}/attendance`}>
                Manage Attendance
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {event.attendance.map((attendee) => (
                  <div key={attendee.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {attendee.memberName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{attendee.memberName}</p>
                        <p className="text-xs text-muted-foreground">
                          {attendee.checkedInAt ? `Checked in at ${attendee.checkedInAt}` : 'Not checked in'}
                        </p>
                      </div>
                    </div>
                    
                    <StatusBadge status={attendee.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Linked Groups & Departments</h3>
            <Button size="sm" asChild>
              <Link href={`/dashboard/events/${event.id}/groups`}>
                Manage Groups
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {event.linkedGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.role}</p>
                  </div>
                  <EventGroupRoleBadge role={group.role} />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="text-base font-semibold">Recent Activity</h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-3.5 flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}</span>
                        {' by '}
                        <span className="font-medium">{activity.member}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={deleteDialog.closeDialog}
        onConfirm={() => deleteDialog.handleConfirm(confirmDeleteEvent)}
        title="Delete Event?"
        description="This action cannot be undone. This will permanently delete the event and all associated data."
        itemName={deleteDialog.itemToDelete?.name}
        loading={deleteDialog.loading}
        confirmText="Delete Event"
        destructive={true}
      />
    </div>
  );
}