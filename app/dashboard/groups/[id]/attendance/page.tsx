'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Plus,
  Search,
  Calendar,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Clock,
  Save,
  Download,
  Filter,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupMember, GroupAttendance, GroupAttendanceFormData, GroupEvent } from '@/lib/types/groups';
import { AttendanceStatus } from '@/lib/types/attendance';
import { toast } from 'sonner';
import Breadcrumb from '@/components/ui/breadcrumb';

const attendanceStatusOptions = ['All', 'Present', 'Absent', 'Excused'];
const eventTypeOptions = ['All', 'Meeting', 'Bible Study', 'Prayer Meeting', 'Fellowship', 'Service Project', 'Other'];

export default function GroupAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [attendance, setAttendance] = useState<GroupAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [showTakeAttendance, setShowTakeAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; notes: string }>>({});

  useEffect(() => {
    if (groupId) {
      loadData();
    }
  }, [groupId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load group details
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
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
      
      // Load attendance records
      const attendanceResponse = await groupsService.getGroupAttendance(groupId);
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const event = events.find(e => e.id === record.eventId);
    const member = members.find(m => m.id === record.memberId);
    
    const matchesSearch = member ? 
      member.memberName.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesEventType = eventTypeFilter === 'All' || true; // Remove event type filtering since GroupEvent doesn't have type
    
    return matchesSearch && matchesStatus && matchesEventType;
  });

  const handleBack = () => {
    router.push(`/dashboard/groups/${groupId}`);
  };

  const handleTakeAttendance = () => {
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }
    
    // Initialize attendance data for all members
    const initialData: Record<string, { status: string; notes: string }> = {};
    members.forEach(member => {
      const existingRecord = attendance.find(a => a.eventId === selectedEvent && a.memberId === member.id);
      initialData[member.id] = {
        status: existingRecord?.status || 'Present',
        notes: existingRecord?.notes || ''
      };
    });
    
    setAttendanceData(initialData);
    setShowTakeAttendance(true);
  };

  const handleAttendanceChange = (memberId: string, field: 'status' | 'notes', value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const handleSaveAttendance = async () => {
    if (!selectedEvent) return;
    
    setSaving(true);
    
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([memberId, data]) => ({
        eventId: selectedEvent,
        memberId,
        status: data.status,
        notes: data.notes,
        recordedAt: new Date().toISOString(),
        recordedBy: 'current-user' // This should come from auth context
      }));
      
      const response = await groupsService.saveGroupAttendance(groupId, attendanceRecords);
      
      if (response.success) {
        toast.success('Attendance saved successfully');
        setShowTakeAttendance(false);
        loadData(); // Reload data to show updated attendance
      } else {
        toast.error(response.message || 'Failed to save attendance');
      }
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    const excusedCount = attendance.filter(a => a.status === 'excused').length;
    
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    return {
      totalRecords,
      presentCount,
      absentCount,
      excusedCount,
      attendanceRate
    };
  };

  const getMemberAttendanceRate = (memberId: string) => {
    const memberRecords = attendance.filter(a => a.memberId === memberId);
    const presentRecords = memberRecords.filter(a => a.status === 'present');
    
    return memberRecords.length > 0 ? Math.round((presentRecords.length / memberRecords.length) * 100) : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'excused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'excused': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Groups', href: '/dashboard/groups' },
    { label: group?.name || 'Group', href: `/dashboard/groups/${groupId}` },
    { label: 'Attendance', isCurrentPage: true }
  ];

  const stats = getAttendanceStats();

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
              <h1 className="text-3xl font-bold tracking-tight">Group Attendance</h1>
              <p className="text-muted-foreground">
                Track attendance for {group?.name}
              </p>
            </div>
          </div>
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={showTakeAttendance} onOpenChange={setShowTakeAttendance}>
            <DialogTrigger asChild>
              <Button className="bg-brand-primary hover:bg-brand-primary/90">
                <UserCheck className="mr-2 h-4 w-4" />
                Take Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Take Attendance</DialogTitle>
                <DialogDescription>
                  Mark attendance for the selected event
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Event</label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.startDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEvent && (
                  <div className="space-y-4">
                    <div className="grid gap-4">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-brand-primary">
                                {member.memberName[0]}{member.memberName.split(' ')[1]?.[0] || ''}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{member.memberName}</p>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <Select
                              value={attendanceData[member.id]?.status || 'present'}
                              onValueChange={(value) => handleAttendanceChange(member.id, 'status', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="excused">Excused</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input
                              placeholder="Notes (optional)"
                              value={attendanceData[member.id]?.notes || ''}
                              onChange={(e) => handleAttendanceChange(member.id, 'notes', e.target.value)}
                              className="w-48"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTakeAttendance(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveAttendance} 
                  disabled={!selectedEvent || saving}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              Overall attendance
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentCount}</div>
            <p className="text-xs text-muted-foreground">
              Total present records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absentCount}</div>
            <p className="text-xs text-muted-foreground">
              Total absent records
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              All attendance records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Member Attendance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Member Attendance Overview</CardTitle>
          <CardDescription>
            Individual attendance rates for group members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const attendanceRate = getMemberAttendanceRate(member.id);
              const memberRecords = attendance.filter(a => a.memberId === member.id);
              
              return (
                <div key={member.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-brand-primary">
                        {member.memberName[0]}{member.memberName.split(' ')[1]?.[0] || ''}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{member.memberName}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Attendance Rate</span>
                      <span className="font-medium">{attendanceRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${attendanceRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{memberRecords.length} total records</span>
                      <span>{memberRecords.filter(r => r.status === 'present').length} present</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            Detailed attendance history for all events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {attendanceStatusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by event type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Recorded By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  const member = members.find(m => m.id === record.memberId);
                  const event = events.find(e => e.id === record.eventId);
                  
                  return (
                    <TableRow key={`${record.eventId}-${record.memberId}`}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-brand-primary">
                              {member?.memberName[0]}{member?.memberName.split(' ')[1]?.[0] || ''}
                            </span>
                          </div>
                          <span>{member?.memberName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{event?.title}</p>
                          <p className="text-sm text-muted-foreground">{event?.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {event ? new Date(event.startDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(record.status)}
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{record.notes || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{record.recordedBy}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredAttendance.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No attendance records found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'All' || eventTypeFilter !== 'All'
                  ? 'Try adjusting your filters'
                  : 'Start taking attendance for group events'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}