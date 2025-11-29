'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Activity,
  Search,
  Download,
  RefreshCw,
  Eye,
  User,
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Shield,
  TrendingUp,
  TrendingDown,
  BarChart3,
  FileText,
  Filter,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartConfig } from '@/components/ui/chart';

// Activity Log Type (same as main page)
interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT';
  actionDescription: string;
  module: 'Members' | 'Finance' | 'Attendance' | 'Events' | 'Groups' | 'Communications' | 'Settings' | 'Sunday School' | 'Departments' | 'Assets' | 'Auth';
  resourceType: string;
  resourceId: string;
  resourceName: string;
  timestamp: string;
  timestampLocal: string;
  reason?: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
    location?: string;
    changes?: {
      field: string;
      oldValue: any;
      newValue: any;
    }[];
    additionalInfo?: Record<string, any>;
  };
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  avatar?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

// Mock user data
const mockUserProfile: UserProfile = {
  id: 'USR001',
  name: 'John Doe',
  email: 'john.doe@church.org',
  phone: '+1 (555) 123-4567',
  role: 'Admin',
  department: 'IT & Administration',
  joinDate: '2023-01-15',
  status: 'Active',
};

// Mock activity logs for the user
const mockUserActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'LOGIN',
    actionDescription: 'User logged into the system',
    module: 'Auth',
    resourceType: 'Session',
    resourceId: 'SESS-2024-001',
    resourceName: 'Login Session',
    timestamp: '2024-01-20T14:30:00Z',
    timestampLocal: '2024-01-20 09:30:00 AM EST',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      additionalInfo: { deviceType: 'Desktop', browser: 'Chrome' }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '2',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'CREATE',
    actionDescription: 'Created new member profile',
    module: 'Members',
    resourceType: 'Member',
    resourceId: 'MEM-2024-001',
    resourceName: 'Jane Smith',
    timestamp: '2024-01-20T14:35:00Z',
    timestampLocal: '2024-01-20 09:35:00 AM EST',
    reason: 'New member registration during Sunday service',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      changes: [
        { field: 'firstName', oldValue: null, newValue: 'Jane' },
        { field: 'lastName', oldValue: null, newValue: 'Smith' },
        { field: 'email', oldValue: null, newValue: 'jane.smith@email.com' }
      ]
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '3',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'UPDATE',
    actionDescription: 'Updated member information',
    module: 'Members',
    resourceType: 'Member',
    resourceId: 'MEM-2024-001',
    resourceName: 'Jane Smith',
    timestamp: '2024-01-20T14:40:00Z',
    timestampLocal: '2024-01-20 09:40:00 AM EST',
    reason: 'Added phone number and address',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      changes: [
        { field: 'phone', oldValue: null, newValue: '+1 (555) 987-6543' },
        { field: 'address', oldValue: null, newValue: '123 Main St, City' }
      ]
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '4',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'DELETE',
    actionDescription: 'Deleted duplicate event',
    module: 'Events',
    resourceType: 'Event',
    resourceId: 'EVT-2024-025',
    resourceName: 'Youth Conference 2024',
    timestamp: '2024-01-20T12:15:00Z',
    timestampLocal: '2024-01-20 07:15:00 AM EST',
    reason: 'Duplicate entry - Original event is EVT-2024-024',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      additionalInfo: { 
        deletionType: 'Soft Delete',
        originalEventId: 'EVT-2024-024'
      }
    },
    status: 'SUCCESS',
    severity: 'HIGH'
  },
  {
    id: '5',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'EXPORT',
    actionDescription: 'Exported members list',
    module: 'Members',
    resourceType: 'Report',
    resourceId: 'RPT-MEM-2024-01',
    resourceName: 'Active Members Report',
    timestamp: '2024-01-20T11:00:00Z',
    timestampLocal: '2024-01-20 06:00:00 AM EST',
    reason: 'Monthly report for leadership meeting',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      additionalInfo: {
        format: 'Excel',
        recordCount: 450
      }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '6',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'APPROVE',
    actionDescription: 'Approved budget request',
    module: 'Finance',
    resourceType: 'Budget',
    resourceId: 'BDG-2024-Q1-001',
    resourceName: 'Youth Ministry Q1 Budget',
    timestamp: '2024-01-20T10:30:00Z',
    timestampLocal: '2024-01-20 05:30:00 AM EST',
    reason: 'Budget within allocation limits',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      changes: [
        { field: 'status', oldValue: 'Pending', newValue: 'Approved' }
      ],
      additionalInfo: {
        amount: '$5,000.00',
        approvalLevel: 'Senior Leadership'
      }
    },
    status: 'SUCCESS',
    severity: 'MEDIUM'
  },
  {
    id: '7',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'UPDATE',
    actionDescription: 'Changed user permissions',
    module: 'Settings',
    resourceType: 'User Permissions',
    resourceId: 'USR-006',
    resourceName: 'Jessica Martinez',
    timestamp: '2024-01-20T08:00:00Z',
    timestampLocal: '2024-01-20 03:00:00 AM EST',
    reason: 'Promoted to Group Leader role',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      changes: [
        { field: 'role', oldValue: 'Member', newValue: 'Group Leader' },
        { field: 'permissions', oldValue: 'Basic', newValue: 'Groups:Full, Members:Read' }
      ]
    },
    status: 'SUCCESS',
    severity: 'HIGH'
  },
  {
    id: '8',
    userId: 'USR001',
    userName: 'John Doe',
    userRole: 'Admin',
    userEmail: 'john.doe@church.org',
    action: 'LOGOUT',
    actionDescription: 'User logged out of the system',
    module: 'Auth',
    resourceType: 'Session',
    resourceId: 'SESS-2024-001',
    resourceName: 'Logout Session',
    timestamp: '2024-01-20T18:00:00Z',
    timestampLocal: '2024-01-20 01:00:00 PM EST',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      additionalInfo: { 
        sessionDuration: '3 hours 30 minutes'
      }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
];

// Activity statistics for charts
const activityByModule = [
  { name: 'Members', value: 35, color: '#2E8DB0' },
  { name: 'Finance', value: 25, color: '#28ACD1' },
  { name: 'Events', value: 15, color: '#C49831' },
  { name: 'Settings', value: 12, color: '#A5CF5D' },
  { name: 'Auth', value: 8, color: '#FF6B6B' },
  { name: 'Others', value: 5, color: '#4ECDC4' },
];

const activityByAction = [
  { action: 'CREATE', count: 45 },
  { action: 'UPDATE', count: 38 },
  { action: 'DELETE', count: 8 },
  { action: 'VIEW', count: 62 },
  { action: 'EXPORT', count: 15 },
  { action: 'APPROVE', count: 12 },
];

const activityTimeline = [
  { date: 'Mon', count: 12 },
  { date: 'Tue', count: 19 },
  { date: 'Wed', count: 15 },
  { date: 'Thu', count: 22 },
  { date: 'Fri', count: 18 },
  { date: 'Sat', count: 8 },
  { date: 'Sun', count: 6 },
];

// Chart configs
const moduleChartConfig = {
  value: { label: 'Activities', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

const actionChartConfig = {
  count: { label: 'Count', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const timelineChartConfig = {
  count: { label: 'Activities', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig;

export default function UserActivityHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [userProfile, setUserProfile] = useState<UserProfile>(mockUserProfile);
  const [activities, setActivities] = useState<ActivityLog[]>(mockUserActivityLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredActivities = activities.filter(log => {
    const matchesSearch = 
      log.actionDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  const handleExport = () => {
    console.log('Exporting user activity history...');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      VIEW: 'bg-gray-100 text-gray-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      LOGOUT: 'bg-purple-100 text-purple-800',
      EXPORT: 'bg-yellow-100 text-yellow-800',
      APPROVE: 'bg-green-100 text-green-800',
      REJECT: 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-gray-100 text-gray-800',
      MEDIUM: 'bg-blue-100 text-blue-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/activity-logs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Activity Logs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Activity History</h1>
            <p className="text-muted-foreground mt-1">
              Complete activity timeline for {userProfile.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback className="text-xl bg-brand-primary text-white">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                  <p className="text-muted-foreground">{userProfile.role} • {userProfile.department}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge className={
              userProfile.status === 'Active' ? 'bg-green-100 text-green-800' :
              userProfile.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }>
              {userProfile.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-3xl font-bold">{activities.length}</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+12% from last week</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Today's Activity</p>
              <p className="text-3xl font-bold">8</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Last: 2 hours ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Most Active Module</p>
              <p className="text-3xl font-bold">Members</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                <span>35% of activities</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold">98.5%</p>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Excellent performance</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Activity by Module</CardTitle>
            <CardDescription>Distribution across modules</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={moduleChartConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={activityByModule}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={2}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {activityByModule.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity by Action Type</CardTitle>
            <CardDescription>Actions performed</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={actionChartConfig} className="h-[250px] w-full">
              <BarChart data={activityByAction} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="action" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                  content={<ChartTooltipContent indicator="dot" />} 
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={timelineChartConfig} className="h-[250px] w-full">
              <LineChart data={activityTimeline} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  className="text-xs"
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  className="text-xs"
                />
                <ChartTooltip 
                  cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                  content={<ChartTooltipContent indicator="line" />} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-1))' }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>Detailed activity history</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                <SelectItem value="Members">Members</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
                <SelectItem value="Auth">Auth</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login/Logout</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activity Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell>{getStatusIcon(log.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getActionBadge(log.action)}>
                            {log.action}
                          </Badge>
                          <p className="text-sm">{log.actionDescription}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{log.module}</p>
                        <p className="text-xs text-muted-foreground">{log.resourceType}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{log.resourceName}</p>
                        <p className="text-xs text-muted-foreground">{log.resourceId}</p>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {new Date(log.timestamp).toLocaleDateString()}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadge(log.severity)}>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog (same as main activity logs page) */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Details</DialogTitle>
            <DialogDescription>Complete information about this activity</DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* Activity Details sections similar to main page */}
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Action</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getActionBadge(selectedLog.action)}>{selectedLog.action}</Badge>
                    {getStatusIcon(selectedLog.status)}
                  </div>
                  <p className="text-sm">{selectedLog.actionDescription}</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Resource</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span> {selectedLog.resourceType}
                    </div>
                    <div>
                      <span className="text-muted-foreground">ID:</span> {selectedLog.resourceId}
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Name:</span> {selectedLog.resourceName}
                    </div>
                  </div>
                </div>

                {selectedLog.metadata.changes && selectedLog.metadata.changes.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Changes</h4>
                    <div className="space-y-2">
                      {selectedLog.metadata.changes.map((change, index) => (
                        <div key={index} className="text-sm bg-background rounded p-2">
                          <p className="font-medium">{change.field}</p>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            <span className="text-red-600">
                              {change.oldValue === null ? 'N/A' : String(change.oldValue)}
                            </span>
                            <span>→</span>
                            <span className="text-green-600">{String(change.newValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.reason && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Reason</h4>
                    <p className="text-sm">{selectedLog.reason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
