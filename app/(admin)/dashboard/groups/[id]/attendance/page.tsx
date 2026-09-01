'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { TablePageSkeleton } from '@/components/ui/skeleton-loaders';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  ArrowLeft,
  Search,
  Calendar,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
  Loader2,
  Save,
  Clock
} from 'lucide-react';
import { groupsService } from '@/services';
import { Group, GroupMember, GroupAttendance, GroupEvent } from '@/lib/types/groups';
import { toast } from 'sonner';

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
      
      const groupResponse = await groupsService.getGroup(groupId);
      if (groupResponse.success && groupResponse.data) {
        setGroup(groupResponse.data);
      }
      
      const membersResponse = await groupsService.getGroupMembers(groupId);
      if (membersResponse.success && membersResponse.data) {
        setMembers(membersResponse.data);
      }
      
      const eventsResponse = await groupsService.getGroupEvents(groupId);
      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data);
      }
      
      const attendanceResponse = await groupsService.getGroupAttendance(groupId);
      if (attendanceResponse.success && attendanceResponse.data) {
        setAttendance(attendanceResponse.data);
      }
    } catch {
      toast.error('Failed to load group attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeAttendance = () => {
    if (!selectedEvent && events.length > 0) {
      setSelectedEvent(events[0].id);
    }
    
    const initialData: Record<string, { status: string; notes: string }> = {};
    members.forEach(member => {
      const existingRecord = attendance.find(a => a.eventId === (selectedEvent || events[0]?.id) && a.memberId === member.id);
      initialData[member.id] = {
        status: existingRecord?.status || 'present',
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
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }
    
    setSaving(true);
    try {
      const records = Object.entries(attendanceData).map(([memberId, data]) => ({
        eventId: selectedEvent,
        memberId,
        status: data.status,
        notes: data.notes
      }));
      
      await groupsService.saveGroupAttendance(groupId, records);
      toast.success('Attendance recorded successfully');
      setShowTakeAttendance(false);
      loadData();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const calculateStats = () => {
    const totalRecords = attendance.length;
    const presentCount = attendance.filter(a => String(a.status).toLowerCase() === 'present').length;
    const absentCount = attendance.filter(a => String(a.status).toLowerCase() === 'absent').length;
    const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
    
    return {
      totalRecords,
      presentCount,
      absentCount,
      attendanceRate
    };
  };

  const getMemberAttendanceRate = (memberId: string) => {
    const memberRecords = attendance.filter(a => a.memberId === memberId);
    if (memberRecords.length === 0) return 0;
    const presentRecords = memberRecords.filter(a => String(a.status).toLowerCase() === 'present').length;
    return Math.round((presentRecords / memberRecords.length) * 100);
  };

  const filteredMembers = members.filter(member =>
    member.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const csvContent = 'Member Name,Role,Attendance Rate,Status\n' +
      members.map(m => `${m.memberName},${m.role},${getMemberAttendanceRate(m.id)}%,${m.status}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `group-attendance-${groupId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <TablePageSkeleton hasStats={true} columns={5} rows={6} />;
  }

  const stats = calculateStats();

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
            <h1 className="font-heading text-2xl font-bold tracking-tight">Group Attendance</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export Data
          </Button>
          <Button size="sm" onClick={handleTakeAttendance}>
            <UserCheck className="mr-1.5 h-4 w-4" />
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Total Present"
          value={stats.presentCount}
          icon={UserCheck}
        />
        <StatCard
          title="Total Absent"
          value={stats.absentCount}
          icon={UserX}
        />
        <StatCard
          title="Total Records"
          value={stats.totalRecords}
          icon={Calendar}
        />
      </div>

      {/* Member Attendance Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Member Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMembers.map((member) => {
              const rate = getMemberAttendanceRate(member.id);
              return (
                <Card key={member.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-medium text-xs text-primary">
                        {member.memberName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{member.memberName}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <StatusBadge status={member.status} size="sm" />
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Rate</span>
                      <span className="font-medium text-foreground">{rate}%</span>
                    </div>
                    <Progress value={rate} className="h-1.5" />
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No group members found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Take Attendance Dialog */}
      <Dialog open={showTakeAttendance} onOpenChange={setShowTakeAttendance}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Take Attendance</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event..." />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title} — {new Date(event.startDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                      {member.memberName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-xs text-foreground truncate">{member.memberName}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Select
                      value={attendanceData[member.id]?.status || 'present'}
                      onValueChange={(value) => handleAttendanceChange(member.id, 'status', value)}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present" className="text-xs">Present</SelectItem>
                        <SelectItem value="absent" className="text-xs">Absent</SelectItem>
                        <SelectItem value="excused" className="text-xs">Excused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setShowTakeAttendance(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveAttendance} disabled={!selectedEvent || saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}