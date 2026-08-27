'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  UserCheck,
  Search,
  Download,
  Upload,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  UserPlus,
  UserMinus,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Attendee interface
interface Attendee {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  checkedInAt: string | null;
  checkedInBy: string | null;
  notes: string;
}

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Sunday Service',
  date: '2024-01-21',
  startTime: '10:00',
  location: 'Main Sanctuary',
  maxAttendees: 500
};

// Mock attendance data
const mockAttendees: Attendee[] = [
  {
    id: '1',
    memberId: 'M001',
    name: 'John Doe',
    email: 'john@email.com',
    phone: '(555) 123-4567',
    group: 'Adult Ministry',
    status: 'Present',
    checkedInAt: '2024-01-21T09:45:00',
    checkedInBy: 'Admin',
    notes: ''
  },
  {
    id: '2',
    memberId: 'M002',
    name: 'Jane Smith',
    email: 'jane@email.com',
    phone: '(555) 234-5678',
    group: 'Worship Team',
    status: 'Present',
    checkedInAt: '2024-01-21T09:50:00',
    checkedInBy: 'Admin',
    notes: 'Arrived early for setup'
  },
  {
    id: '3',
    memberId: 'M003',
    name: 'Bob Johnson',
    email: 'bob@email.com',
    phone: '(555) 345-6789',
    group: 'Youth Ministry',
    status: 'Absent',
    checkedInAt: null,
    checkedInBy: null,
    notes: 'Called in sick'
  },
  {
    id: '4',
    memberId: 'M004',
    name: 'Sarah Wilson',
    email: 'sarah@email.com',
    phone: '(555) 456-7890',
    group: 'Children Ministry',
    status: 'Late',
    checkedInAt: '2024-01-21T10:15:00',
    checkedInBy: 'Admin',
    notes: 'Traffic delay'
  },
  {
    id: '5',
    memberId: 'M005',
    name: 'Mike Davis',
    email: 'mike@email.com',
    phone: '(555) 567-8901',
    group: 'Ushering Team',
    status: 'Present',
    checkedInAt: '2024-01-21T09:30:00',
    checkedInBy: 'Admin',
    notes: 'Early arrival for duties'
  }
];

const statusOptions = ['All', 'Present', 'Absent', 'Late', 'Excused'];
const groupOptions = ['All', 'Adult Ministry', 'Youth Ministry', 'Children Ministry', 'Worship Team', 'Ushering Team'];

export default function AttendancePage() {
  const params = useParams();
  const eventId = (params.id as string) || mockEvent.id;
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [quickCheckInInput, setQuickCheckInInput] = useState('');

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || attendee.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || attendee.group === groupFilter;
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const stats = {
    total: attendees.length,
    present: attendees.filter(a => a.status === 'Present').length,
    absent: attendees.filter(a => a.status === 'Absent').length,
    late: attendees.filter(a => a.status === 'Late').length,
    excused: attendees.filter(a => a.status === 'Excused').length,
  };

  const handleCheckIn = async (attendeeId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAttendees(prev => prev.map(attendee => 
        attendee.id === attendeeId 
          ? { 
              ...attendee, 
              status: 'Present', 
              checkedInAt: new Date().toISOString(),
              checkedInBy: 'Admin'
            }
          : attendee
      ));
      toast.success('Member checked in successfully');
    } catch {
      toast.error('Failed to check in member');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (attendeeId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAttendees(prev => prev.map(attendee => 
        attendee.id === attendeeId 
          ? { 
              ...attendee, 
              status: 'Absent', 
              checkedInAt: null,
              checkedInBy: null
            }
          : attendee
      ));
      toast.success('Member marked as absent');
    } catch {
      toast.error('Failed to mark member as absent');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLate = async (attendeeId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAttendees(prev => prev.map(attendee => 
        attendee.id === attendeeId 
          ? { 
              ...attendee, 
              status: 'Late', 
              checkedInAt: new Date().toISOString(),
              checkedInBy: 'Admin'
            }
          : attendee
      ));
      toast.success('Member marked as late');
    } catch {
      toast.error('Failed to mark member as late');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExcused = async (attendeeId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setAttendees(prev => prev.map(attendee => 
        attendee.id === attendeeId 
          ? { 
              ...attendee, 
              status: 'Excused', 
              checkedInAt: null,
              checkedInBy: 'Admin'
            }
          : attendee
      ));
      toast.success('Member marked as excused');
    } catch {
      toast.error('Failed to mark member as excused');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCheckIn = async () => {
    if (selectedAttendees.length === 0) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setAttendees(prev => prev.map(attendee => 
        selectedAttendees.includes(attendee.id)
          ? { 
              ...attendee, 
              status: 'Present', 
              checkedInAt: new Date().toISOString(),
              checkedInBy: 'Admin'
            }
          : attendee
      ));
      setSelectedAttendees([]);
      toast.success(`${selectedAttendees.length} members checked in successfully`);
    } catch {
      toast.error('Failed to check in selected members');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkLate = async () => {
    if (selectedAttendees.length === 0) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setAttendees(prev => prev.map(attendee => 
        selectedAttendees.includes(attendee.id)
          ? { 
              ...attendee, 
              status: 'Late', 
              checkedInAt: new Date().toISOString(),
              checkedInBy: 'Admin'
            }
          : attendee
      ));
      setSelectedAttendees([]);
      toast.success(`${selectedAttendees.length} members marked as late`);
    } catch {
      toast.error('Failed to mark selected members as late');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkExcused = async () => {
    if (selectedAttendees.length === 0) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setAttendees(prev => prev.map(attendee => 
        selectedAttendees.includes(attendee.id)
          ? { 
              ...attendee, 
              status: 'Excused', 
              checkedInAt: null,
              checkedInBy: 'Admin'
            }
          : attendee
      ));
      setSelectedAttendees([]);
      toast.success(`${selectedAttendees.length} members marked as excused`);
    } catch {
      toast.error('Failed to mark selected members as excused');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(a => a.id));
    }
  };

  const handleSelectAttendee = (attendeeId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const exportAttendance = () => {
    toast.success('Attendance report exported successfully');
  };

  const handleQuickCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCheckInInput.trim()) return;
    
    const matched = attendees.find(a => 
      a.memberId.toLowerCase() === quickCheckInInput.toLowerCase() ||
      a.name.toLowerCase().includes(quickCheckInInput.toLowerCase())
    );
    
    if (matched) {
      handleCheckIn(matched.id);
      setQuickCheckInInput('');
    } else {
      toast.error('Member not found in attendee list');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            asChild
          >
            <Link href={`/dashboard/events/${eventId}`} aria-label="Back to Event Details">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Event Attendance</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mockEvent.title} • {format(new Date(mockEvent.date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportAttendance}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-1.5 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Expected" value={stats.total} icon={Users} />
        <StatCard title="Present" value={stats.present} icon={CheckCircle2} />
        <StatCard title="Absent" value={stats.absent} icon={XCircle} />
        <StatCard title="Late" value={stats.late} icon={Clock} />
        <StatCard title="Excused" value={stats.excused} icon={Info} />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Attendance Management</CardTitle>
          <CardDescription className="text-xs">Record and monitor attendee check-ins</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="h-9">
              <TabsTrigger value="list" className="text-xs">List View</TabsTrigger>
              <TabsTrigger value="checkin" className="text-xs">Quick Check-in</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4 pt-1">
              {/* Filters and Search */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or member ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36 h-9">
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
                
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-full sm:w-44 h-9">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groupOptions.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              {selectedAttendees.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/60 rounded-lg border border-border">
                  <span className="text-xs font-semibold text-foreground mr-2">
                    {selectedAttendees.length} selected
                  </span>
                  <Button size="sm" onClick={handleBulkCheckIn} disabled={loading}>
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    Check In
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkMarkLate} disabled={loading}>
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    Mark Late
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkMarkExcused} disabled={loading}>
                    <Info className="mr-1.5 h-3.5 w-3.5" />
                    Mark Excused
                  </Button>
                </div>
              )}

              {/* Attendees List */}
              <div className="space-y-2">
                {/* Table Header */}
                <div className="hidden sm:flex items-center p-2.5 bg-muted/50 rounded-lg font-medium text-xs text-muted-foreground border border-border/40">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span>Member</span>
                  </div>
                  <div className="w-32">Group</div>
                  <div className="w-24">Status</div>
                  <div className="w-32">Check-in Time</div>
                  <div className="w-12 text-right">Action</div>
                </div>

                {/* Attendee Rows */}
                {filteredAttendees.map((attendee) => (
                  <div key={attendee.id} className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:border-foreground/20 transition-colors gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedAttendees.includes(attendee.id)}
                        onCheckedChange={() => handleSelectAttendee(attendee.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-foreground truncate">{attendee.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{attendee.email} • {attendee.memberId}</p>
                      </div>
                    </div>
                    
                    <div className="sm:w-32 text-xs text-muted-foreground">
                      {attendee.group}
                    </div>
                    
                    <div className="sm:w-24">
                      <StatusBadge status={attendee.status} />
                    </div>
                    
                    <div className="sm:w-32 text-xs text-muted-foreground">
                      {attendee.checkedInAt ? (
                        <span>{format(new Date(attendee.checkedInAt), 'HH:mm • MMM dd')}</span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </div>
                    
                    <div className="sm:w-12 flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {attendee.status !== 'Present' && (
                            <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Mark Present
                            </DropdownMenuItem>
                          )}
                          {attendee.status !== 'Late' && (
                            <DropdownMenuItem onClick={() => handleMarkLate(attendee.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Mark Late
                            </DropdownMenuItem>
                          )}
                          {attendee.status !== 'Excused' && (
                            <DropdownMenuItem onClick={() => handleMarkExcused(attendee.id)}>
                              <Info className="mr-2 h-4 w-4" />
                              Mark Excused
                            </DropdownMenuItem>
                          )}
                          {attendee.status !== 'Absent' && (
                            <DropdownMenuItem onClick={() => handleMarkAbsent(attendee.id)}>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Mark Absent
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm font-medium">No attendees found matching your criteria.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checkin" className="space-y-4 pt-4">
              <div className="text-center py-8 max-w-md mx-auto">
                <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-semibold mb-1">Quick Check-in</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Enter member ID or full name to instantly record check-in
                </p>
                
                <form onSubmit={handleQuickCheckInSubmit} className="space-y-3">
                  <Input
                    placeholder="Enter member ID (e.g. M001) or name..."
                    className="text-center h-10"
                    value={quickCheckInInput}
                    onChange={(e) => setQuickCheckInInput(e.target.value)}
                  />
                  <Button type="submit" className="w-full" disabled={loading || !quickCheckInInput.trim()}>
                    <UserPlus className="mr-1.5 h-4 w-4" />
                    Check In Member
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}