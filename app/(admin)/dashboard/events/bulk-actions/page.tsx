'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { EventCategoryBadge } from '@/components/ui/category-badges';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
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
  CheckCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  status: string;
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

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowConfirmDialog(false);
          setSelectedEvents([]);
          setSelectedAction('');
          toast.success(`Successfully processed ${selectedEvents.length} events`);
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const selectedActionObj = bulkActions.find(action => action.id === selectedAction);
  const isDestructiveAction = selectedActionObj?.destructive;

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
            <Link href="/dashboard/events" aria-label="Back to Events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Bulk Actions</h1>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Select Events</CardTitle>
              <CardDescription className="text-xs">
                Select one or more events to perform bulk operations
              </CardDescription>
            </div>
            
            {filteredEvents.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedEvents.length === filteredEvents.length ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedEvents.length > 0 && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {selectedEvents.length} selected
                  </span>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40 h-9">
                <SelectValue placeholder="Category" />
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
              <SelectTrigger className="w-full sm:w-40 h-9">
                <SelectValue placeholder="Status" />
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

          {/* Events List */}
          <div className="space-y-2">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3.5 border rounded-lg transition-colors flex items-start gap-3 ${
                  selectedEvents.includes(event.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-foreground/20'
                }`}
              >
                <Checkbox
                  checked={selectedEvents.includes(event.id)}
                  onCheckedChange={() => handleSelectEvent(event.id)}
                  className="mt-1"
                />
                
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-sm text-foreground truncate">{event.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={event.status} />
                      <EventCategoryBadge category={event.category} />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{event.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{event.attendees} / {event.maxAttendees}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No events found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Controls */}
      {selectedEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Execute Action</CardTitle>
            <CardDescription className="text-xs">
              Choose an operation to apply to the {selectedEvents.length} selected item{selectedEvents.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bulkActions.map((action) => {
                const Icon = action.icon;
                return (
                  <div
                    key={action.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedAction === action.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-foreground/20'
                    }`}
                    onClick={() => setSelectedAction(action.id)}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${
                        action.destructive ? 'text-destructive' : 'text-primary'
                      }`} />
                      <div>
                        <div className="font-medium text-sm text-foreground">
                          {action.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedAction === 'update-category' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-foreground">New Category</label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="w-48 h-9">
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
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-foreground">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-48 h-9">
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
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  variant={isDestructiveAction ? 'destructive' : 'default'}
                  size="sm"
                  disabled={isProcessing}
                >
                  {isDestructiveAction && <AlertTriangle className="mr-1.5 h-4 w-4" />}
                  Execute Action
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  Processing {selectedActionObj?.label}...
                </span>
                <span className="font-semibold">{progress}%</span>
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
            <AlertDialogTitle>
              Confirm Bulk Action
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedActionObj?.label.toLowerCase()} {selectedEvents.length} selected event{selectedEvents.length > 1 ? 's' : ''}?
              {isDestructiveAction && (
                <span className="block mt-2 text-destructive font-medium">
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
              className={isDestructiveAction ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
            >
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}