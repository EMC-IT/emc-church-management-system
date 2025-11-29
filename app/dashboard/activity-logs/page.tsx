'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  User,
  Calendar,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Plus,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  Mail,
  Bell,
  DollarSign,
  Users,
  MoreVertical,
} from 'lucide-react';

// Activity Log Type Definition
interface ActivityLog {
  id: string;
  // WHO: User who performed the action
  userId: string;
  userName: string;
  userRole: string;
  userEmail: string;
  // WHAT: The action performed
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT';
  actionDescription: string;
  // WHERE: The affected resource/module
  module: 'Members' | 'Finance' | 'Attendance' | 'Events' | 'Groups' | 'Communications' | 'Settings' | 'Sunday School' | 'Departments' | 'Assets' | 'Auth';
  resourceType: string; // e.g., 'Member', 'Transaction', 'Event'
  resourceId: string;
  resourceName: string;
  // WHEN: Timestamp information
  timestamp: string; // ISO 8601 UTC timestamp
  timestampLocal: string; // Local time for display
  // WHY: Context and details
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
  // Status
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Mock data for demonstration
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
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
    timestamp: '2024-01-20T14:30:00Z',
    timestampLocal: '2024-01-20 09:30:00 AM EST',
    reason: 'New member registration during Sunday service',
    metadata: {
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Main Office',
      changes: [
        { field: 'firstName', oldValue: null, newValue: 'Jane' },
        { field: 'lastName', oldValue: null, newValue: 'Smith' },
        { field: 'email', oldValue: null, newValue: 'jane.smith@email.com' }
      ],
      additionalInfo: { source: 'Manual Entry', formVersion: '2.0' }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '2',
    userId: 'USR002',
    userName: 'Sarah Johnson',
    userRole: 'Finance Manager',
    userEmail: 'sarah.j@church.org',
    action: 'UPDATE',
    actionDescription: 'Updated tithe transaction',
    module: 'Finance',
    resourceType: 'Transaction',
    resourceId: 'TXN-2024-0152',
    resourceName: 'Tithe Payment - Michael Brown',
    timestamp: '2024-01-20T13:45:00Z',
    timestampLocal: '2024-01-20 08:45:00 AM EST',
    reason: 'Correction: Updated payment method from Cash to Check',
    metadata: {
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      location: 'Finance Department',
      changes: [
        { field: 'paymentMethod', oldValue: 'Cash', newValue: 'Check' },
        { field: 'checkNumber', oldValue: null, newValue: 'CHK-5678' },
        { field: 'amount', oldValue: '500.00', newValue: '500.00' }
      ]
    },
    status: 'SUCCESS',
    severity: 'MEDIUM'
  },
  {
    id: '3',
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
        originalEventId: 'EVT-2024-024',
        approvedBy: 'Senior Pastor'
      }
    },
    status: 'SUCCESS',
    severity: 'HIGH'
  },
  {
    id: '4',
    userId: 'USR003',
    userName: 'Mike Wilson',
    userRole: 'Attendance Coordinator',
    userEmail: 'mike.w@church.org',
    action: 'EXPORT',
    actionDescription: 'Exported attendance report',
    module: 'Attendance',
    resourceType: 'Report',
    resourceId: 'RPT-ATT-2024-01',
    resourceName: 'January 2024 Attendance Summary',
    timestamp: '2024-01-20T11:00:00Z',
    timestampLocal: '2024-01-20 06:00:00 AM EST',
    reason: 'Monthly report for board meeting',
    metadata: {
      ipAddress: '192.168.1.108',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'Remote',
      additionalInfo: {
        format: 'PDF',
        dateRange: '2024-01-01 to 2024-01-31',
        recordCount: 450
      }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '5',
    userId: 'SYS',
    userName: 'System',
    userRole: 'System',
    userEmail: 'system@church.org',
    action: 'UPDATE',
    actionDescription: 'Automated backup completed',
    module: 'Settings',
    resourceType: 'System',
    resourceId: 'BACKUP-2024-01-20',
    resourceName: 'Daily Database Backup',
    timestamp: '2024-01-20T02:00:00Z',
    timestampLocal: '2024-01-19 09:00:00 PM EST',
    metadata: {
      ipAddress: '127.0.0.1',
      userAgent: 'System Scheduler',
      location: 'Server',
      additionalInfo: {
        backupSize: '2.5 GB',
        duration: '15 minutes',
        status: 'Completed Successfully'
      }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '6',
    userId: 'USR004',
    userName: 'Emily Davis',
    userRole: 'Communications Lead',
    userEmail: 'emily.d@church.org',
    action: 'CREATE',
    actionDescription: 'Sent mass email notification',
    module: 'Communications',
    resourceType: 'Email Campaign',
    resourceId: 'EML-2024-012',
    resourceName: 'Easter Service Announcement',
    timestamp: '2024-01-20T10:30:00Z',
    timestampLocal: '2024-01-20 05:30:00 AM EST',
    reason: 'Scheduled announcement for upcoming Easter services',
    metadata: {
      ipAddress: '192.168.1.112',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      location: 'Communications Office',
      additionalInfo: {
        recipients: 450,
        deliveryRate: '98.5%',
        openRate: '65%',
        template: 'Easter 2024'
      }
    },
    status: 'SUCCESS',
    severity: 'LOW'
  },
  {
    id: '7',
    userId: 'USR002',
    userName: 'Sarah Johnson',
    userRole: 'Finance Manager',
    userEmail: 'sarah.j@church.org',
    action: 'APPROVE',
    actionDescription: 'Approved expense request',
    module: 'Finance',
    resourceType: 'Expense',
    resourceId: 'EXP-2024-089',
    resourceName: 'Audio Equipment Purchase',
    timestamp: '2024-01-20T09:15:00Z',
    timestampLocal: '2024-01-20 04:15:00 AM EST',
    reason: 'Approved within budget allocation for worship ministry',
    metadata: {
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
      location: 'Finance Department',
      changes: [
        { field: 'status', oldValue: 'Pending', newValue: 'Approved' },
        { field: 'approvedBy', oldValue: null, newValue: 'Sarah Johnson' },
        { field: 'approvalDate', oldValue: null, newValue: '2024-01-20' }
      ],
      additionalInfo: {
        amount: '$2,500.00',
        department: 'Worship Ministry',
        budgetRemaining: '$12,500.00'
      }
    },
    status: 'SUCCESS',
    severity: 'MEDIUM'
  },
  {
    id: '8',
    userId: 'USR005',
    userName: 'David Lee',
    userRole: 'IT Admin',
    userEmail: 'david.l@church.org',
    action: 'UPDATE',
    actionDescription: 'Changed user permissions',
    module: 'Settings',
    resourceType: 'User Permissions',
    resourceId: 'USR-006',
    resourceName: 'Jessica Martinez',
    timestamp: '2024-01-20T08:00:00Z',
    timestampLocal: '2024-01-20 03:00:00 AM EST',
    reason: 'Promoted to Group Leader role - requires additional permissions',
    metadata: {
      ipAddress: '192.168.1.120',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      location: 'IT Department',
      changes: [
        { field: 'role', oldValue: 'Member', newValue: 'Group Leader' },
        { field: 'permissions', oldValue: 'Basic', newValue: 'Groups:Full, Members:Read' }
      ],
      additionalInfo: {
        approvedBy: 'Senior Pastor',
        effectiveDate: '2024-01-21'
      }
    },
    status: 'SUCCESS',
    severity: 'HIGH'
  }
];

const activityStats = [
  { label: 'Total Activities', value: '12,456', icon: Activity, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { label: "Today's Actions", value: '234', icon: Clock, color: 'text-green-600', bgColor: 'bg-green-50' },
  { label: 'Failed Actions', value: '12', icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-50' },
  { label: 'Active Users', value: '45', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
];

export default function ActivityLogsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredLogs = mockActivityLogs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const matchesAction = selectedAction === 'all' || log.action === selectedAction;
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;

    return matchesSearch && matchesModule && matchesAction && matchesSeverity;
  });

  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
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
      IMPORT: 'bg-yellow-100 text-yellow-800',
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

  const handleExport = () => {
    // Implementation for exporting logs
    console.log('Exporting activity logs...');
  };

  const handleRefresh = () => {
    // Implementation for refreshing logs
    console.log('Refreshing activity logs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities with comprehensive audit trails
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {activityStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Filters</CardTitle>
          <CardDescription>Filter and search through system activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
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
                <SelectItem value="Attendance">Attendance</SelectItem>
                <SelectItem value="Events">Events</SelectItem>
                <SelectItem value="Groups">Groups</SelectItem>
                <SelectItem value="Communications">Communications</SelectItem>
                <SelectItem value="Settings">Settings</SelectItem>
                <SelectItem value="Sunday School">Sunday School</SelectItem>
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
                <SelectItem value="VIEW">View</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
                <SelectItem value="EXPORT">Export</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="All Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>
                {filteredLogs.length} activities found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>WHO</TableHead>
                  <TableHead>WHAT</TableHead>
                  <TableHead>WHERE</TableHead>
                  <TableHead>WHEN</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No activities found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell>
                        {getStatusIcon(log.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4 text-brand-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{log.userName}</p>
                            <p className="text-xs text-muted-foreground">{log.userRole}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionBadge(log.action)}>
                              {log.action}
                            </Badge>
                          </div>
                          <p className="text-sm">{log.actionDescription}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.resourceType}: {log.resourceName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{log.module}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {log.metadata.location || 'N/A'}
                          </div>
                        </div>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(log)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Export Log
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/activity-logs/user/${log.userId}`)}>
                              <FileText className="h-4 w-4 mr-2" />
                              View User History
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Activity Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this activity
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              {/* WHO Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  WHO - User Information
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="text-sm font-medium">{selectedLog.userId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">User Name</p>
                      <p className="text-sm font-medium">{selectedLog.userName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Role</p>
                      <p className="text-sm font-medium">{selectedLog.userRole}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{selectedLog.userEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHAT Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  WHAT - Action Performed
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getActionBadge(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                    <Badge className={getSeverityBadge(selectedLog.severity)}>
                      {selectedLog.severity}
                    </Badge>
                    {getStatusIcon(selectedLog.status)}
                  </div>
                  <p className="text-sm">{selectedLog.actionDescription}</p>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Resource Type</p>
                      <p className="text-sm font-medium">{selectedLog.resourceType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resource ID</p>
                      <p className="text-sm font-medium">{selectedLog.resourceId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Resource Name</p>
                    <p className="text-sm font-medium">{selectedLog.resourceName}</p>
                  </div>
                </div>
              </div>

              {/* WHERE Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  WHERE - Location & Context
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Module</p>
                      <p className="text-sm font-medium">{selectedLog.module}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium">{selectedLog.metadata.location || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">IP Address</p>
                      <p className="text-sm font-medium font-mono">{selectedLog.metadata.ipAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">User Agent</p>
                      <p className="text-sm font-medium truncate" title={selectedLog.metadata.userAgent}>
                        {selectedLog.metadata.userAgent}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHEN Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  WHEN - Timestamp
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">UTC Time</p>
                      <p className="text-sm font-medium font-mono">{selectedLog.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Local Time</p>
                      <p className="text-sm font-medium">{selectedLog.timestampLocal}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WHY Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  WHY - Reason & Changes
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  {selectedLog.reason && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Reason</p>
                      <p className="text-sm">{selectedLog.reason}</p>
                    </div>
                  )}

                  {selectedLog.metadata.changes && selectedLog.metadata.changes.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Changes Made</p>
                      <div className="space-y-2">
                        {selectedLog.metadata.changes.map((change, index) => (
                          <div key={index} className="bg-background rounded p-3 text-sm">
                            <p className="font-medium mb-1">{change.field}</p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-red-600">
                                Old: {change.oldValue === null ? 'N/A' : String(change.oldValue)}
                              </span>
                              <span>→</span>
                              <span className="text-green-600">
                                New: {String(change.newValue)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLog.metadata.additionalInfo && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Additional Information</p>
                      <div className="bg-background rounded p-3">
                        <pre className="text-xs whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.metadata.additionalInfo, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
