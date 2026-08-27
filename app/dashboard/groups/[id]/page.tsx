'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { groupsService } from '@/services';
import { Group, GroupMember, GroupEvent } from '@/lib/types/groups';
import { toast } from 'sonner';

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
      
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      } else {
        toast.error('Group not found');
        router.push('/dashboard/groups');
        return;
      }
      
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      const eventsResponse = await groupsService.getGroupEvents(groupId);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
    } catch {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-bold">Group Not Found</h2>
          <p className="text-sm text-muted-foreground mt-1">The group you are looking for does not exist.</p>
          <Button onClick={() => router.push('/dashboard/groups')} size="sm" className="mt-4">
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/groups">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">{group.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/groups/${groupId}/edit`)}>
            <Edit className="mr-1.5 h-4 w-4" />
            Edit Group
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Members"
          value={`${group.members} / ${group.maxMembers}`}
          icon={Users}
        />
        <StatCard
          title="Engagement"
          value={`${group.engagement}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Upcoming Events"
          value={events.length}
          icon={CalendarDays}
        />
        <StatCard
          title="Status"
          value={<StatusBadge status={group.status} />}
          icon={Settings}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-sm">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>
        
        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Group Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">Category</span>
                      <p className="mt-1">
                        <Badge variant="neutral">{group.category}</Badge>
                      </p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Status</span>
                      <p className="mt-1">
                        <StatusBadge status={group.status} />
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs text-muted-foreground">Description</span>
                    <p className="text-sm text-foreground mt-1">{group.description || 'No description provided.'}</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-border">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Schedule</span>
                        <span className="text-foreground">{group.meetingSchedule || 'Not set'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Location</span>
                        <span className="text-foreground">{group.location || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Management Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/groups/${groupId}/members`)}
                      className="justify-start text-sm"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Manage Members
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/groups/${groupId}/roles`)}
                      className="justify-start text-sm"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Roles
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/groups/${groupId}/events`)}
                      className="justify-start text-sm"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Manage Events
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/dashboard/groups/${groupId}/reports`)}
                      className="justify-start text-sm"
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Group Leader</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                        {group.leader.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm text-foreground">{group.leader.name}</p>
                      
                      <div className="space-y-1 text-xs text-muted-foreground pt-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{group.leader.email}</span>
                        </div>
                        
                        {group.leader.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3.5 w-3.5" />
                            <span>{group.leader.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Created</span>
                      <span className="font-medium text-foreground">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Last Updated</span>
                      <span className="font-medium text-foreground">
                        {new Date(group.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Members */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Members ({members.length})</h3>
            <Button size="sm" onClick={() => router.push(`/dashboard/groups/${groupId}/members`)}>
              <UserPlus className="mr-1.5 h-4 w-4" />
              Manage Members
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id} className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {member.memberName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{member.memberName}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                  <StatusBadge status={member.status} size="sm" />
                </div>
              </Card>
            ))}
          </div>
          
          {members.length === 0 && (
            <div className="text-center py-8 border rounded-lg bg-card text-muted-foreground text-sm">
              No members enrolled yet.
            </div>
          )}
        </TabsContent>
        
        {/* Events */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Events ({events.length})</h3>
            <Button size="sm" onClick={() => router.push(`/dashboard/groups/${groupId}/events`)}>
              <CalendarDays className="mr-1.5 h-4 w-4" />
              Manage Events
            </Button>
          </div>
          
          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm text-foreground">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
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
                  
                  <Badge variant={event.status === 'Upcoming' ? 'primary' : 'neutral'} size="sm">
                    {event.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
          
          {events.length === 0 && (
            <div className="text-center py-8 border rounded-lg bg-card text-muted-foreground text-sm">
              No events scheduled yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}