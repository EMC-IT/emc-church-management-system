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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  UserPlus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  AlertCircle,
  MoreHorizontal,
  Send,
  FileText,
  Calendar,
  MapPin
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
  const router = useRouter();
  const params = useParams();
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

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || registration.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || registration.group === groupFilter;
    
    return matchesSearch && matchesStatus && matchesGroup;
  });

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'Confirmed').length,
    pending: registrations.filter(r => r.status === 'Pending').length,
    waitlisted: registrations.filter(r => r.status === 'Waitlisted').length,
    cancelled: registrations.filter(r => r.status === 'Cancelled').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'default';
      case 'Pending': return 'secondary';
      case 'Waitlisted': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'Pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'Waitlisted': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'Cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleStatusChange = async (registrationId: string, newStatus: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setRegistrations(prev => prev.map(registration => 
        registration.id === registrationId 
          ? { 
              ...registration, 
              status: newStatus,
              confirmedAt: newStatus === 'Confirmed' ? new Date().toISOString() : null
            }
          : registration
      ));
      
      toast.success(`Registration ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      toast.error('Failed to update registration status');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedRegistrations.length === 0) {
      toast.error('Please select registrations to update');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRegistrations(prev => prev.map(registration => 
        selectedRegistrations.includes(registration.id)
          ? { 
              ...registration, 
              status: newStatus,
              confirmedAt: newStatus === 'Confirmed' ? new Date().toISOString() : null
            }
          : registration
      ));
      
      setSelectedRegistrations([]);
      toast.success(`${selectedRegistrations.length} registrations ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      toast.error('Failed to update selected registrations');
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Email sent to ${selectedRegistrations.length} registrants`);
      setEmailDialogOpen(false);
      setEmailSubject('');
      setEmailMessage('');
      setSelectedRegistrations([]);
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const exportRegistrations = () => {
    // Simulate export functionality
    toast.success('Registration report exported successfully');
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
            <UserPlus className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Event Registrations</h1>
            <p className="text-muted-foreground">{mockEvent.title} - {format(new Date(mockEvent.date), 'PPP')}</p>
          </div>
        </div>
      </div>

      {/* Event Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Event Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(mockEvent.date), 'PPP')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">{mockEvent.location}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {stats.confirmed} / {mockEvent.maxAttendees}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Registration Deadline</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(mockEvent.registrationDeadline), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.confirmed / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.pending / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waitlisted</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.waitlisted}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.waitlisted / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.cancelled / stats.total) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registration Management</CardTitle>
              <CardDescription>Manage event registrations and communications</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={selectedRegistrations.length === 0}>
                    <Mail className="mr-2 h-4 w-4" />
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Email subject..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
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
                    <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendEmail} disabled={loading}>
                      <Send className="mr-2 h-4 w-4" />
                      {loading ? 'Sending...' : 'Send Email'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={exportRegistrations}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="list">Registration List</TabsTrigger>
              <TabsTrigger value="summary">Summary Report</TabsTrigger>
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
              {selectedRegistrations.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
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
                <div className="flex items-center p-3 bg-muted/50 rounded-lg font-medium text-sm">
                  <div className="flex items-center space-x-3 flex-1">
                    <Checkbox
                      checked={selectedRegistrations.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <span>Registrant</span>
                  </div>
                  <div className="w-32">Group</div>
                  <div className="w-24">Status</div>
                  <div className="w-32">Registered</div>
                  <div className="w-20">Actions</div>
                </div>

                {/* Registration Rows */}
                {filteredRegistrations.map((registration) => (
                  <div key={registration.id} className="flex items-center p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center space-x-3 flex-1">
                      <Checkbox
                        checked={selectedRegistrations.includes(registration.id)}
                        onCheckedChange={() => handleSelectRegistration(registration.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {registration.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{registration.name}</p>
                        <p className="text-sm text-muted-foreground">{registration.email}</p>
                        {registration.specialRequests && (
                          <p className="text-xs text-blue-600 mt-1">
                            Special: {registration.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-32">
                      <Badge variant="outline" className="text-xs">
                        {registration.group}
                      </Badge>
                    </div>
                    
                    <div className="w-24">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(registration.status)}
                        <Badge variant={getStatusColor(registration.status)} className="text-xs">
                          {registration.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="w-32 text-sm text-muted-foreground">
                      <div>{format(new Date(registration.registeredAt), 'MMM dd')}</div>
                      <div className="text-xs">{format(new Date(registration.registeredAt), 'HH:mm')}</div>
                    </div>
                    
                    <div className="w-20">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
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
                <div className="text-center py-8 text-muted-foreground">
                  No registrations found matching your criteria.
                </div>
              )}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {registrations
                        .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
                        .slice(0, 5)
                        .map((registration) => (
                          <div key={registration.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 bg-brand-primary rounded-full" />
                              <span className="text-sm font-medium">{registration.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(registration.registeredAt), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Group Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {groupOptions.slice(1).map((group) => {
                        const count = registrations.filter(r => r.group === group).length;
                        const percentage = (count / registrations.length) * 100;
                        return (
                          <div key={group} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{group}</span>
                              <span>{count}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-brand-primary h-2 rounded-full" 
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