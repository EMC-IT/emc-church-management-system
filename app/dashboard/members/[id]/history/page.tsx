'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { membersService } from '@/services';
import { Member } from '@/lib/types';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  User,
  Users,
  Activity,
  FileText,
  Download,
  Filter,
  CalendarDays,
  TrendingUp,
  Award,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

// Mock activity data
const mockActivities = [
  {
    id: '1',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Attended Sunday service',
    date: '2024-01-14',
    time: '09:00',
    status: 'present',
    location: 'Main Sanctuary'
  },
  {
    id: '2',
    type: 'attendance',
    title: 'Bible Study',
    description: 'Attended Wednesday Bible study',
    date: '2024-01-10',
    time: '19:00',
    status: 'present',
    location: 'Fellowship Hall'
  },
  {
    id: '3',
    type: 'volunteer',
    title: 'Ushering',
    description: 'Served as usher during service',
    date: '2024-01-07',
    time: '08:30',
    status: 'completed',
    location: 'Main Sanctuary'
  },
  {
    id: '4',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Attended Sunday service',
    date: '2024-01-07',
    time: '09:00',
    status: 'present',
    location: 'Main Sanctuary'
  },
  {
    id: '5',
    type: 'event',
    title: 'Christmas Celebration',
    description: 'Participated in Christmas celebration',
    date: '2023-12-25',
    time: '18:00',
    status: 'completed',
    location: 'Church Grounds'
  },
  {
    id: '6',
    type: 'attendance',
    title: 'Sunday Service',
    description: 'Attended Sunday service',
    date: '2023-12-24',
    time: '09:00',
    status: 'present',
    location: 'Main Sanctuary'
  }
];

// Mock attendance statistics
const mockAttendanceStats = {
  totalServices: 156,
  attendedServices: 142,
  attendanceRate: 91.0,
  currentStreak: 8,
  longestStreak: 24,
  volunteerHours: 45,
  eventsParticipated: 12
};

export default function MemberHistoryPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [activities, setActivities] = useState(mockActivities);
  const [attendanceStats, setAttendanceStats] = useState(mockAttendanceStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const memberId = params.id as string;

  // Mock member data for development
  const mockMember: Member = {
    id: memberId,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+233 24 123 4567',
    address: '123 Main Street, Accra, Ghana',
    dateOfBirth: '1988-05-15',
    gender: 'Male',
    membershipStatus: 'Active',
    joinDate: '2023-01-15',
    avatar: null,
    familyId: 'fam1',
    emergencyContact: {
      name: 'Jane Smith',
      phone: '+233 24 123 4568',
      relationship: 'Spouse'
    },
    customFields: {},
    createdAt: '2023-01-15T00:00:00Z',
    updatedAt: '2023-01-15T00:00:00Z'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // For now, use mock data. Replace with actual API calls:
        // const [memberResponse, activitiesResponse, statsResponse] = await Promise.all([
        //   membersService.getMember(memberId),
        //   membersService.getMemberActivities(memberId),
        //   membersService.getMemberAttendanceStats(memberId)
        // ]);
        // setMember(memberResponse.data);
        // setActivities(activitiesResponse.data);
        // setAttendanceStats(statsResponse.data);
        setMember(mockMember);
      } catch (err: any) {
        setError(err.message || 'Failed to load member history');
        toast({
          title: 'Error',
          description: 'Failed to load member history',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (memberId) {
      loadData();
    }
  }, [memberId, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="h-4 w-4" />;
      case 'volunteer':
        return <Users className="h-4 w-4" />;
      case 'event':
        return <Award className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
      case 'completed':
        return <Badge variant="default">Present</Badge>;
      case 'absent':
        return <Badge variant="secondary">Absent</Badge>;
      case 'late':
        return <Badge variant="outline">Late</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-semibold">
          {error || 'Member not found'}
        </div>
        <Button asChild>
          <Link href="/dashboard/members">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Members
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/members/${member.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Member History</h1>
            <p className="text-muted-foreground">
              Activity history and attendance records for {member.firstName} {member.lastName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Attendance Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {attendanceStats.attendedServices} of {attendanceStats.totalServices} services
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">consecutive services</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteer Hours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.volunteerHours}</div>
            <p className="text-xs text-muted-foreground">hours this year</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Participated</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.eventsParticipated}</div>
            <p className="text-xs text-muted-foreground">events this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Recent activities and attendance records for {member.firstName} {member.lastName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Activities</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {getActivityIcon(activity.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(activity.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="attendance" className="space-y-4">
              <div className="space-y-4">
                {activities.filter(a => a.type === 'attendance').map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(activity.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="volunteer" className="space-y-4">
              <div className="space-y-4">
                {activities.filter(a => a.type === 'volunteer').map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(activity.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="events" className="space-y-4">
              <div className="space-y-4">
                {activities.filter(a => a.type === 'event').map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">{activity.title}</h4>
                        {getStatusBadge(activity.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(activity.date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {activity.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {activity.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 