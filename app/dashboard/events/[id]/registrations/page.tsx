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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Search,
  Download,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  MoreHorizontal,
  Send,
  Calendar,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock event data
const mockEvent = {
  id: '1',
  title: 'Sunday Service',
  date: '2024-01-21',
  startTime: '10:00',
  location: 'Main Sanctuary',
  maxAttendees: 500,
  registrationDeadline: '2024-01-20'
};

// Mock registration data
const mockRegistrations = [
  {
    id: '1',
    memberId: 'M001',
    name: 'John Doe',
    email: 'john@email.com',
    phone: '(555) 123-4567',
    group: 'Adult Ministry',
    status: 'Confirmed',
    registeredAt: '2024-01-15T10:30:00',
    confirmedAt: '2024-01-15T10:35:00',
    notes: 'Looking forward to the service',
    specialRequests: 'Wheelchair accessible seating'
  },
  {
    id: '2',
    memberId: 'M002',
    name: 'Jane Smith',
    email: 'jane@email.com',
    phone: '(555) 234-5678',
    group: 'Worship Team',
    status: 'Pending',
    registeredAt: '2024-01-16T14:20:00',
    confirmedAt: null,
    notes: 'Will be helping with music setup',
    specialRequests: ''
  },
  {
    id: '3',
    memberId: 'M003',
    name: 'Bob Johnson',
    email: 'bob@email.com',
    phone: '(555) 345-6789',
    group: 'Youth Ministry',
    status: 'Waitlisted',
    registeredAt: '2024-01-17T09:15:00',
    confirmedAt: null,
    notes: 'Bringing youth group members',
    specialRequests: 'Group seating for 8 people'
  },
  {
    id: '4',
    memberId: 'M004',
    name: 'Sarah Wilson',
    email: 'sarah@email.com',
    phone: '(555) 456-7890',
    group: 'Children Ministry',
    status: 'Cancelled',
    registeredAt: '2024-01-14T16:45:00',
    confirmedAt: null,
    notes: 'Family emergency',
    specialRequests: ''
  },
  {
    id: '5',
    memberId: 'M005',
    name: 'Mike Davis',
    email: 'mike@email.com',
    phone: '(555) 567-8901',
    group: 'Ushering Team',
    status: 'Confirmed',
    registeredAt: '2024-01-13T11:00:00',
    confirmedAt: '2024-01-13T11:05:00',
    notes: 'Will arrive early for setup',
    specialRequests: ''
  }
];

const statusOptions = ['All', 'Pending', 'Confirmed', 'Waitlisted', 'Cancelled'];
const groupOptions = ['All', 'Adult Ministry', 'Youth Ministry', 'Children Ministry', 'Worship Team', 'Ushering Team'];

export default function RegistrationsPage() {
  const params = useParams();
  const eventId = (params.id as string) || mockEvent.id;
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState(mockRegistrations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || reg.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || reg.group === groupFilter;
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'Confirmed').length,
    pending: registrations.filter(r => r.status === 'Pending').length,
    waitlisted: registrations.filter(r => r.status === 'Waitlisted').length,
    cancelled: registrations.filter(r => r.status === 'Cancelled').length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setRegistrations(prev => prev.map(reg => 
        reg.id === id ? { ...reg, status: newStatus } : reg
      ));
      toast.success(`Registration status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update registration status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedRegistrations.length === 0) return;

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setRegistrations(prev => prev.map(reg => 
        selectedRegistrations.includes(reg.id) ? { ...reg, status: newStatus } : reg
      ));
      setSelectedRegistrations([]);
      toast.success(`Updated ${selectedRegistrations.length} registrations to ${newStatus}`);
    } catch {
      toast.error('Failed to update registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedRegistrations.length === filteredRegistrations.length) {
      setSelectedRegistrations([]);
    } else {
      setSelectedRegistrations(filteredRegistrations.map(r => r.id));
    }
  };

  const handleSelectRegistration = (registrationId: string) => {
    setSelectedRegistrations(prev => 
      prev.includes(registrationId)
        ? prev.filter(id => id !== registrationId)
        : [...prev, registrationId]
    );
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    if (selectedRegistrations.length === 0) {
      toast.error('Please select registrations to email');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Email sent to ${selectedRegistrations.length} registrants`);
      setEmailDialogOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      setSelectedRegistrations([]);
    } catch {
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const exportRegistrations = () => {
    toast.success('Registration report exported successfully');
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
            <h1 className="font-heading text-2xl font-bold tracking-tight">Event Registrations</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {mockEvent.title} • {format(new Date(mockEvent.date), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={selectedRegistrations.length === 0}>
                <Mail className="mr-1.5 h-4 w-4" />
                Email Selected
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                  Send email to {selectedRegistrations.length} selected registrants
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs">Subject</Label>
                  <Input
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs">Message</Label>
                  <Textarea
                    id="message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Email message..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSendEmail} disabled={loading}>
                  <Send className="mr-1.5 h-4 w-4" />
                  {loading ? 'Sending...' : 'Send Email'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" size="sm" onClick={exportRegistrations}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Event Date</p>
                <p className="text-muted-foreground">{format(new Date(mockEvent.date), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Location</p>
                <p className="text-muted-foreground truncate">{mockEvent.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Users className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Capacity</p>
                <p className="text-muted-foreground">{stats.confirmed} / {mockEvent.maxAttendees}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="font-medium text-foreground">Deadline</p>
                <p className="text-muted-foreground">{format(new Date(mockEvent.registrationDeadline), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Registrations" value={stats.total} icon={Users} />
        <StatCard title="Confirmed" value={stats.confirmed} icon={CheckCircle2} />
        <StatCard title="Pending" value={stats.pending} icon={Clock} />
        <StatCard title="Waitlisted" value={stats.waitlisted} icon={AlertCircle} />
        <StatCard title="Cancelled" value={stats.cancelled} icon={XCircle} />
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registration Management</CardTitle>
          <CardDescription className="text-xs">Manage attendees and RSVP status</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="h-9">
              <TabsTrigger value="list" className="text-xs">Registration List</TabsTrigger>
              <TabsTrigger value="summary" className="text-xs">Summary Report</TabsTrigger>
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
              {selectedRegistrations.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-muted/60 rounded-lg border border-border">
                  <span className="text-xs font-semibold text-foreground mr-2">
                    {selectedRegistrations.length} selected
                  </span>
                  <Button size="sm" onClick={() => handleBulkStatusChange('Confirmed')} disabled={loading}>
                    Confirm Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('Waitlisted')} disabled={loading}>
                    Waitlist Selected
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleBulkStatusChange('Cancelled')} disabled={loading}>
                    Cancel Selected
                  </Button>
                </div>
              )}

              {/* Registration List */}
              <div className="space-y-2">
                {/* Header */}
                <div className="hidden sm:flex items-center p-2.5 bg-muted/50 rounded-lg font-medium text-xs text-muted-foreground border border-border/40">
                  <div className="flex items-center gap-3 flex-1">
                    <Checkbox
                      checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span>Registrant</span>
                  </div>
                  <div className="w-32">Group</div>
                  <div className="w-24">Status</div>
                  <div className="w-32">Registered</div>
                  <div className="w-12 text-right">Action</div>
                </div>

                {/* Registration Rows */}
                {filteredRegistrations.map((registration) => (
                  <div key={registration.id} className="flex flex-col sm:flex-row sm:items-center p-3 border rounded-lg hover:border-foreground/20 transition-colors gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Checkbox
                        checked={selectedRegistrations.includes(registration.id)}
                        onCheckedChange={() => handleSelectRegistration(registration.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {registration.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-xs text-foreground truncate">{registration.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{registration.email}</p>
                        {registration.specialRequests && (
                          <p className="text-[11px] text-primary mt-0.5">
                            Special: {registration.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:w-32 text-xs text-muted-foreground">
                      {registration.group}
                    </div>
                    
                    <div className="sm:w-24">
                      <StatusBadge status={registration.status} />
                    </div>
                    
                    <div className="sm:w-32 text-xs text-muted-foreground">
                      {format(new Date(registration.registeredAt), 'MMM dd, HH:mm')}
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
                          <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'Confirmed')}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'Waitlisted')}>
                            <Clock className="mr-2 h-4 w-4" />
                            Waitlist
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(registration.id, 'Cancelled')}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRegistrations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm font-medium">No registrations found matching your criteria.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4 pt-1">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Recent Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {registrations
                        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
                        .slice(0, 5)
                        .map((registration) => (
                          <div key={registration.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-primary rounded-full" />
                              <span className="font-medium text-foreground">{registration.name}</span>
                            </div>
                            <span className="text-muted-foreground">
                              {format(new Date(registration.registeredAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Group Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {groupOptions.slice(1).map((group) => {
                        const count = registrations.filter(r => r.group === group).length;
                        const percentage = registrations.length > 0 ? (count / registrations.length) * 100 : 0;
                        return (
                          <div key={group} className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{group}</span>
                              <span className="font-medium text-foreground">{count}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-primary h-1.5 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}