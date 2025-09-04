'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
  TrendingUp,
  UserPlus,
  Settings,
  BarChart3,
  CalendarDays,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { groupsService } from '@/services';
import { Group, GroupMember, GroupEvent } from '@/lib/types/groups';
import { toast } from 'sonner';
import Breadcrumb from '@/components/ui/breadcrumb';

export default function GroupDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      } else {
        toast.error('Group not found');
        router.push('/dashboard/groups');
        return;
      }
      
      // Load group members
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      // Load group events
      const eventsResponse = await groupsService.getGroupEvents(groupId);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/groups');
  };

  const handleEdit = () => {
    router.push(`/dashboard/groups/${groupId}/edit`);
  };

  const handleManageMembers = () => {
    router.push(`/dashboard/groups/${groupId}/members`);
  };

  const handleManageRoles = () => {
    router.push(`/dashboard/groups/${groupId}/roles`);
  };

  const handleManageEvents = () => {
    router.push(`/dashboard/groups/${groupId}/events`);
  };

  const handleViewReports = () => {
    router.push(`/dashboard/groups/${groupId}/reports`);
  };

  const handleViewAttendance = () => {
    router.push(`/dashboard/groups/${groupId}/attendance`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Group Not Found</h2>
          <p className="text-muted-foreground mt-2">The group you're looking for doesn't exist.</p>
          <Button onClick={handleBack} className="mt-4">
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/dashboard/groups' },
    { label: group.name, isCurrentPage: true }
  ];

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 90) return 'text-brand-success';
    if (engagement >= 75) return 'text-brand-secondary';
    return 'text-destructive';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-brand-success';
      case 'Inactive': return 'bg-yellow-500';
      case 'Archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <p className="text-muted-foreground">{group.description}</p>
            </div>
          </div>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Group
          </Button>
        </div>
      </div>

      {/* Group Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{group.members}</div>
            <p className="text-xs text-muted-foreground">
              of {group.maxMembers} maximum
            </p>
            <Progress 
              value={(group.members / group.maxMembers) * 100} 
              className="mt-2 h-2" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEngagementColor(group.engagement)}`}>
              {group.engagement}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average participation
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming events
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(group.status)}>
              {group.status}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Current status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Group Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                      <p className="mt-1">
                        <Badge variant="outline">{group.category}</Badge>
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <p className="mt-1">
                        <Badge className={getStatusColor(group.status)}>
                          {group.status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="mt-1">{group.description}</p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Meeting Schedule</Label>
                        <p className="text-sm">{group.meetingSchedule}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                        <p className="text-sm">{group.location}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage different aspects of this group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Button 
                      variant="outline" 
                      onClick={handleManageMembers}
                      className="justify-start"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Manage Members
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleManageRoles}
                      className="justify-start"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Roles
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleManageEvents}
                      className="justify-start"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Manage Events
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleViewReports}
                      className="justify-start"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Group Leader */}
              <Card>
                <CardHeader>
                  <CardTitle>Group Leader</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {group.leader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium">{group.leader.name}</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{group.leader.email}</span>
                        </div>
                        
                        {group.leader.phone && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{group.leader.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-brand-primary rounded-full" />
                      <span>Group created</span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-brand-secondary rounded-full" />
                      <span>Last updated</span>
                      <span className="text-muted-foreground ml-auto">
                        {new Date(group.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Group Members</h3>
            <Button onClick={handleManageMembers}>
              <UserPlus className="mr-2 h-4 w-4" />
              Manage Members
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {member.memberName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.memberName}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={member.status === 'Active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {members.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No members yet</h3>
              <p className="text-muted-foreground mb-4">Start adding members to this group</p>
              <Button onClick={handleManageMembers}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Members
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Group Events</h3>
            <Button onClick={handleManageEvents}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Manage Events
            </Button>
          </div>
          
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.registeredAttendees}/{event.maxAttendees}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant={event.status === 'Upcoming' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {events.length === 0 && (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No events scheduled</h3>
              <p className="text-muted-foreground mb-4">Create events for this group</p>
              <Button onClick={handleManageEvents}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}