'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Share2,
  Download,
  Settings,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { DeleteDialog, useDeleteDialog } from '@/components/ui/delete-dialog';

// Mock data - in real app, this would come from API
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
    // In real app, fetch event data based on params.id
    setLoading(true);
    setTimeout(() => {
      setEvent(mockEvent);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'default';
      case 'ongoing': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
  };

  const attendancePercentage = (event.currentAttendees / event.maxAttendees) * 100;
  const registrationPercentage = (event.registrations.length / event.maxAttendees) * 100;

  const handleDeleteEvent = () => {
    deleteDialog.openDialog({ id: event.id, name: event.title });
  };

  const confirmDeleteEvent = async (item: { id: string; name: string }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Event deleted successfully');
      router.push('/dashboard/events');
    } catch (error) {
      toast.error('Failed to delete event');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

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
            <CalendarIcon className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-muted-foreground">Event Details & Management</p>
          </div>
        </div>
      </div>

      {/* Event Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{event.title}</h2>
                <Badge variant={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
                <Badge variant="outline">
                  {event.category}
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">{event.description}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={`/dashboard/events/${event.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleDeleteEvent}
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {event.startTime} - {event.endTime}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Attendance</p>
                <p className="text-sm text-muted-foreground">
                  {event.currentAttendees} / {event.maxAttendees}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registration Progress</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{event.registrations.length}</div>
            <Progress value={registrationPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {registrationPercentage.toFixed(1)}% of capacity
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
              {attendancePercentage.toFixed(1)}% capacity
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
              Groups involved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
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
                <CardTitle>Organizer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {event.organizer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{event.organizer}</p>
                    <p className="text-sm text-muted-foreground">Event Organizer</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.contactPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Registration Required</p>
                    <p className="text-sm text-muted-foreground">
                      {event.registrationRequired ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  {event.registrationRequired && (
                    <div>
                      <p className="text-sm font-medium">Registration Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.registrationDeadline), 'PPP')}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium">Maximum Attendees</p>
                    <p className="text-sm text-muted-foreground">{event.maxAttendees}</p>
                  </div>
                </div>
                
                {event.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Additional Notes</p>
                      <p className="text-sm text-muted-foreground">{event.notes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="registrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Event Registrations</h3>
            <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
              <Link href={`/dashboard/events/${event.id}/registrations`}>
                Manage Registrations
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {event.registrations.map((registration) => (
                  <div key={registration.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {registration.memberName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{registration.memberName}</p>
                        <p className="text-sm text-muted-foreground">{registration.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {format(new Date(registration.registeredAt), 'MMM dd')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(registration.registeredAt), 'HH:mm')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(registration.status)}
                        <Badge variant={registration.status === 'Confirmed' ? 'default' : 'secondary'}>
                          {registration.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Attendance Tracking</h3>
            <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
              <Link href={`/dashboard/events/${event.id}/attendance`}>
                Manage Attendance
              </Link>
            </Button>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {event.attendance.map((attendee) => (
                  <div key={attendee.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {attendee.memberName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.memberName}</p>
                        <p className="text-sm text-muted-foreground">
                          {attendee.checkedInAt ? `Checked in at ${attendee.checkedInAt}` : 'Not checked in'}
                        </p>
                      </div>
                    </div>
                    
                    <Badge variant={attendee.status === 'Present' ? 'default' : 'secondary'}>
                      {attendee.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Linked Groups & Departments</h3>
            <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
              <Link href={`/dashboard/events/${event.id}/groups`}>
                Manage Groups
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {event.linkedGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <p className="text-sm text-muted-foreground">{group.role}</p>
                    </div>
                    <Badge variant="outline">{group.role}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 flex items-center gap-3">
                    <div className="h-2 w-2 bg-brand-primary rounded-full" />
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