'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  UserCheck,
  Search,
  Filter,
  Download,
  Upload,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>(mockAttendees);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('list');

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
    excused: attendees.filter(a => a.status === 'Excused').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present': return 'default';
      case 'Absent': return 'destructive';
      case 'Late': return 'secondary';
      case 'Excused': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Present': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Late': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Excused': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCheckIn = async (attendeeId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } catch (error) {
      toast.error('Failed to check in member');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAbsent = async (attendeeId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      toast.success('Member marked as absent successfully');
    } catch (error) {
      toast.error('Failed to mark member as absent');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkLate = async (attendeeId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } catch (error) {
      toast.error('Failed to mark member as late');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkExcused = async (attendeeId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    } catch (error) {
      toast.error('Failed to mark member as excused');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = async (attendeeId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      toast.success('Member marked as present');
    } catch (error) {
      toast.error('Failed to mark member as present');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCheckIn = async () => {
    if (selectedAttendees.length === 0) {
      toast.error('Please select attendees to check in');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (error) {
      toast.error('Failed to check in selected members');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkLate = async () => {
    if (selectedAttendees.length === 0) {
      toast.error('Please select attendees to mark as late');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (error) {
      toast.error('Failed to mark selected members as late');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkMarkExcused = async () => {
    if (selectedAttendees.length === 0) {
      toast.error('Please select attendees to mark as excused');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
    } catch (error) {
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
    // Simulate export functionality
    toast.success('Attendance report exported successfully');
  };

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
            <UserCheck className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Tracking</h1>
            <p className="text-muted-foreground">{mockEvent.title} - {format(new Date(mockEvent.date), 'PPP')}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.present / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.absent / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.late / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excused</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.excused / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Management</CardTitle>
              <CardDescription>Track and manage event attendance</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={exportAttendance}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="checkin">Quick Check-in</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {/* Filters and Search */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or member ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
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
                  <SelectTrigger className="w-48">
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
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedAttendees.length} selected
                  </span>
                  <Button size="sm" onClick={handleBulkCheckIn} disabled={loading}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Check In Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkMarkLate} disabled={loading}>
                    <Clock className="mr-2 h-4 w-4" />
                    Mark Late
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleBulkMarkExcused} disabled={loading}>
                    <Info className="mr-2 h-4 w-4" />
                    Mark Excused
                  </Button>
                </div>
              )}

              {/* Attendees List */}
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-center p-3 bg-muted/50 rounded-lg font-medium text-sm">
                  <div className="flex items-center space-x-3 flex-1">
                    <Checkbox
                      checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span>Member</span>
                  </div>
                  <div className="w-32">Group</div>
                  <div className="w-24">Status</div>
                  <div className="w-32">Check-in Time</div>
                  <div className="w-20">Actions</div>
                </div>

                {/* Attendee Rows */}
                {filteredAttendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedAttendees.includes(attendee.id)}
                        onCheckedChange={() => handleSelectAttendee(attendee.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                      </div>
                    </div>
                    
                    <div className="w-32">
                      <Badge variant="outline" className="text-xs">
                        {attendee.group}
                      </Badge>
                    </div>
                    
                    <div className="w-24">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(attendee.status)}
                        <Badge variant={getStatusColor(attendee.status)} className="text-xs">
                          {attendee.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="w-32 text-sm text-muted-foreground">
                      {attendee.checkedInAt ? (
                        <div>
                          <div>{format(new Date(attendee.checkedInAt), 'HH:mm')}</div>
                          <div className="text-xs">{format(new Date(attendee.checkedInAt), 'MMM dd')}</div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </div>
                    
                    <div className="w-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {attendee.status === 'Present' && (
                            <>
                              <DropdownMenuItem onClick={() => handleMarkLate(attendee.id)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Mark Late
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkExcused(attendee.id)}>
                                <Info className="mr-2 h-4 w-4" />
                                Mark Excused
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkAbsent(attendee.id)}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                Mark Absent
                              </DropdownMenuItem>
                            </>
                          )}
                          {attendee.status === 'Absent' && (
                            <>
                              <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Mark Present
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkLate(attendee.id)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Mark Late
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkExcused(attendee.id)}>
                                <Info className="mr-2 h-4 w-4" />
                                Mark Excused
                              </DropdownMenuItem>
                            </>
                          )}
                          {attendee.status === 'Late' && (
                            <>
                              <DropdownMenuItem onClick={() => handleMarkPresent(attendee.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark Present
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkExcused(attendee.id)}>
                                <Info className="mr-2 h-4 w-4" />
                                Mark Excused
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkAbsent(attendee.id)}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                Mark Absent
                              </DropdownMenuItem>
                            </>
                          )}
                          {attendee.status === 'Excused' && (
                            <>
                              <DropdownMenuItem onClick={() => handleCheckIn(attendee.id)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Check In
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkLate(attendee.id)}>
                                <Clock className="mr-2 h-4 w-4" />
                                Mark Late
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleMarkPresent(attendee.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark Present
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No attendees found matching your criteria.
                </div>
              )}
            </TabsContent>

            <TabsContent value="checkin" className="space-y-4">
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quick Check-in</h3>
                <p className="text-muted-foreground mb-4">
                  Scan member ID or search by name for quick check-in
                </p>
                
                <div className="max-w-md mx-auto space-y-4">
                  <Input
                    placeholder="Enter member ID or name..."
                    className="text-center"
                  />
                  <Button className="w-full bg-brand-primary hover:bg-brand-primary/90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Check In Member
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}