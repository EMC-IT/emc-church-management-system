'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  Trash2, 
  Edit, 
  Archive, 
  Copy, 
  Calendar, 
  Clock, 
  MapPin, 
  Users,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  status: 'Upcoming' | 'Planning' | 'Completed' | 'Cancelled';
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Sunday Service',
    description: 'Weekly Sunday worship service',
    date: '2024-01-21',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    category: 'Worship',
    organizer: 'Pastor John',
    attendees: 450,
    maxAttendees: 500,
    status: 'Upcoming',
  },
  {
    id: '2',
    title: 'Bible Study',
    description: 'Weekly Bible study and discussion',
    date: '2024-01-22',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    category: 'Study',
    organizer: 'Elder Mary',
    attendees: 85,
    maxAttendees: 100,
    status: 'Upcoming',
  },
  {
    id: '3',
    title: 'Youth Conference',
    description: 'Annual youth conference with guest speakers',
    date: '2024-02-15',
    time: '9:00 AM',
    location: 'Youth Center',
    category: 'Conference',
    organizer: 'Youth Pastor',
    attendees: 0,
    maxAttendees: 200,
    status: 'Planning',
  },
  {
    id: '4',
    title: 'Community Outreach',
    description: 'Food distribution and community service',
    date: '2024-01-25',
    time: '2:00 PM',
    location: 'Community Center',
    category: 'Outreach',
    organizer: 'Deacon Sarah',
    attendees: 25,
    maxAttendees: 50,
    status: 'Upcoming',
  },
  {
    id: '5',
    title: 'Christmas Service',
    description: 'Special Christmas worship service',
    date: '2023-12-25',
    time: '10:00 AM',
    location: 'Main Sanctuary',
    category: 'Worship',
    organizer: 'Pastor John',
    attendees: 600,
    maxAttendees: 600,
    status: 'Completed',
  },
  {
    id: '6',
    title: 'Cancelled Event',
    description: 'This event was cancelled due to weather',
    date: '2024-01-15',
    time: '6:00 PM',
    location: 'Outdoor Pavilion',
    category: 'Social',
    organizer: 'Event Committee',
    attendees: 0,
    maxAttendees: 100,
    status: 'Cancelled',
  }
];

const categories = ['All', 'Worship', 'Study', 'Conference', 'Outreach', 'Social', 'Training'];
const statuses = ['All', 'Upcoming', 'Planning', 'Completed', 'Cancelled'];

const bulkActions = [
  { id: 'delete', label: 'Delete Events', icon: Trash2, destructive: true, description: 'Permanently delete selected events' },
  { id: 'archive', label: 'Archive Events', icon: Archive, destructive: false, description: 'Move events to archive' },
  { id: 'duplicate', label: 'Duplicate Events', icon: Copy, destructive: false, description: 'Create copies of selected events' },
  { id: 'update-category', label: 'Update Category', icon: Edit, destructive: false, description: 'Change category for selected events' },
  { id: 'update-status', label: 'Update Status', icon: CheckCircle, destructive: false, description: 'Change status for selected events' }
];

export default function BulkActionsPage() {
  const router = useRouter();
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedAction, setSelectedAction] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newCategory, setNewCategory] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || event.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedEvents.length === filteredEvents.length) {
      setSelectedEvents([]);
    } else {
      setSelectedEvents(filteredEvents.map(event => event.id));
    }
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleBulkAction = async () => {
    if (!selectedAction || selectedEvents.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    // Simulate bulk operation progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // In a real implementation, this would perform the actual bulk operation
    console.log(`Performing ${selectedAction} on events:`, selectedEvents);
    
    setIsProcessing(false);
    setShowConfirmDialog(false);
    setSelectedEvents([]);
    setSelectedAction('');
    setProgress(0);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming': return 'default';
      case 'planning': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const selectedAction_obj = bulkActions.find(action => action.id === selectedAction);
  const isDestructiveAction = selectedAction_obj?.destructive;

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
            <CheckSquare className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Actions</h1>
            <p className="text-muted-foreground">Perform actions on multiple events</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Event Selection</CardTitle>
          <CardDescription>Filter and select events for bulk operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="flex items-center space-x-2"
              >
                {selectedEvents.length === filteredEvents.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>
                  {selectedEvents.length === filteredEvents.length ? 'Deselect All' : 'Select All'}
                </span>
              </Button>
              
              {selectedEvents.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selectedEvents.length} of {filteredEvents.length} events selected
                </span>
              )}
            </div>
          </div>

          {/* Events List */}
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedEvents.includes(event.id)
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-border hover:border-brand-primary/50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={selectedEvents.includes(event.id)}
                    onCheckedChange={() => handleSelectEvent(event.id)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <Badge variant={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} / {event.maxAttendees}</span>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
            <CardDescription>
              Choose an action to perform on {selectedEvents.length} selected event{selectedEvents.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {bulkActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAction === action.id
                          ? 'border-brand-primary bg-brand-primary/5'
                          : 'border-border hover:border-brand-primary/50'
                      } ${action.destructive ? 'hover:border-red-300' : ''}`}
                      onClick={() => setSelectedAction(action.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          action.destructive ? 'text-red-500' : 'text-brand-primary'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            action.destructive ? 'text-red-700' : ''
                          }`}>
                            {action.label}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Options for Specific Actions */}
              {selectedAction === 'update-category' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Category</label>
                  <Select value={newCategory} onValueChange={setNewCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c !== 'All').map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedAction === 'update-status' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.filter(s => s !== 'All').map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedAction && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowConfirmDialog(true)}
                    variant={isDestructiveAction ? 'destructive' : 'default'}
                    className={!isDestructiveAction ? 'bg-brand-primary hover:bg-brand-primary/90' : ''}
                    disabled={isProcessing}
                  >
                    {isDestructiveAction && <AlertTriangle className="mr-2 h-4 w-4" />}
                    Execute Action
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing {selectedAction_obj?.label}...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {isDestructiveAction && <AlertTriangle className="h-5 w-5 text-red-500" />}
              Confirm Bulk Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedAction_obj?.label.toLowerCase()} {selectedEvents.length} selected event{selectedEvents.length > 1 ? 's' : ''}?
              {isDestructiveAction && (
                <span className="block mt-2 text-red-600 font-medium">
                  This action cannot be undone.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkAction}
              disabled={isProcessing}
              className={isDestructiveAction ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-brand-primary/90'}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}