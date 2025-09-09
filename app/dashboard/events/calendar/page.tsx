'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'Sunday Service',
    description: 'Weekly Sunday worship service',
    date: '2025-09-07',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Main Sanctuary',
    category: 'Worship',
    organizer: 'Pastor John',
    attendees: 450,
    maxAttendees: 500,
    status: 'Upcoming',
    color: 'bg-blue-500'
  },
  {
    id: '2',
    title: 'Bible Study',
    description: 'Weekly Bible study and discussion',
    date: '2025-09-10',
    startTime: '19:00',
    endTime: '20:30',
    location: 'Fellowship Hall',
    category: 'Study',
    organizer: 'Elder Mary',
    attendees: 85,
    maxAttendees: 100,
    status: 'Upcoming',
    color: 'bg-green-500'
  },
  {
    id: '3',
    title: 'Youth Conference',
    description: 'Annual youth conference with guest speakers',
    date: '2025-09-15',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Youth Center',
    category: 'Conference',
    organizer: 'Youth Pastor',
    attendees: 0,
    maxAttendees: 200,
    status: 'Planning',
    color: 'bg-purple-500'
  },
  {
    id: '4',
    title: 'Community Outreach',
    description: 'Food distribution and community service',
    date: '2025-09-20',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Community Center',
    category: 'Outreach',
    organizer: 'Deacon Sarah',
    attendees: 25,
    maxAttendees: 50,
    status: 'Upcoming',
    color: 'bg-orange-500'
  },
  {
    id: '5',
    title: 'Prayer Meeting',
    description: 'Weekly prayer and intercession',
    date: '2025-09-12',
    startTime: '18:00',
    endTime: '19:00',
    location: 'Prayer Room',
    category: 'Prayer',
    organizer: 'Prayer Team',
    attendees: 30,
    maxAttendees: 40,
    status: 'Upcoming',
    color: 'bg-pink-500'
  },
  {
    id: '6',
    title: 'Children Ministry',
    description: 'Sunday school for children',
    date: '2025-09-14',
    startTime: '09:00',
    endTime: '10:00',
    location: 'Children Hall',
    category: 'Children',
    organizer: 'Sister Sarah',
    attendees: 60,
    maxAttendees: 80,
    status: 'Upcoming',
    color: 'bg-yellow-500'
  },
  {
    id: '7',
    title: 'Choir Practice',
    description: 'Weekly choir rehearsal',
    date: '2025-09-18',
    startTime: '19:30',
    endTime: '21:00',
    location: 'Music Room',
    category: 'Music',
    organizer: 'Music Director',
    attendees: 25,
    maxAttendees: 30,
    status: 'Upcoming',
    color: 'bg-indigo-500'
  },
  {
    id: '8',
    title: 'Board Meeting',
    description: 'Monthly church board meeting',
    date: '2025-09-25',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Conference Room',
    category: 'Meeting',
    organizer: 'Board Chairman',
    attendees: 12,
    maxAttendees: 15,
    status: 'Upcoming',
    color: 'bg-gray-500'
  },
  {
    id: '9',
    title: 'Baptism Service',
    description: 'Special baptism ceremony',
    date: '2025-09-28',
    startTime: '11:00',
    endTime: '12:30',
    location: 'Main Sanctuary',
    category: 'Worship',
    organizer: 'Pastor John',
    attendees: 200,
    maxAttendees: 300,
    status: 'Upcoming',
    color: 'bg-blue-500'
  }
];

const categories = ['All', 'Worship', 'Study', 'Conference', 'Outreach', 'Prayer', 'Children', 'Music', 'Social', 'Training'];

export default function EventsCalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [events, setEvents] = useState(mockEvents);

  const filteredEvents = events.filter(event => {
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    return matchesCategory;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Header */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-sm text-muted-foreground border-b">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-1 border border-border ${
                isCurrentMonth ? 'bg-background' : 'bg-muted/30'
              } ${isToday ? 'bg-brand-primary/5 border-brand-primary' : ''}`}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'text-brand-primary font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 text-white ${
                      event.color
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="truncate opacity-90">{event.startTime}</div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground p-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        {/* Week Header */}
        <div className="grid grid-cols-7 gap-4">
          {days.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className="text-center">
                <div className={`text-sm font-medium ${
                  isToday ? 'text-brand-primary' : 'text-muted-foreground'
                }`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-2xl font-bold ${
                  isToday ? 'text-brand-primary' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Week Events */}
        <div className="grid grid-cols-7 gap-4">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={day.toISOString()} className="space-y-2">
                {dayEvents.map(event => (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-3">
                      <div className={`w-2 h-2 rounded-full ${event.color} mb-2`} />
                      <h4 className="font-medium text-sm mb-1">{event.title}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const exportCalendar = () => {
    toast.success('Calendar exported successfully');
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
            <CalendarIcon className="h-6 w-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Events Calendar</h1>
            <p className="text-muted-foreground">View and manage church events in calendar format</p>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h2 className="text-xl font-semibold min-w-[200px] text-center">
                  {viewMode === 'month' 
                    ? format(currentDate, 'MMMM yyyy')
                    : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
                  }
                </h2>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentDate(new Date())}
              >
                Today
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
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
              
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" onClick={exportCalendar}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button asChild className="bg-brand-primary hover:bg-brand-primary/90">
                <Link href="/dashboard/events/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {viewMode === 'month' ? renderMonthView() : renderWeekView()}
        </CardContent>
      </Card>

      {/* Upcoming Events Sidebar */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Legend</CardTitle>
              <CardDescription>Event categories and their colors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { category: 'Worship', color: 'bg-blue-500' },
                  { category: 'Study', color: 'bg-green-500' },
                  { category: 'Conference', color: 'bg-purple-500' },
                  { category: 'Outreach', color: 'bg-orange-500' },
                  { category: 'Prayer', color: 'bg-pink-500' },
                  { category: 'Children', color: 'bg-yellow-500' },
                  { category: 'Music', color: 'bg-indigo-500' },
                  { category: 'Social', color: 'bg-red-500' },
                  { category: 'Training', color: 'bg-teal-500' }
                ].map(({ category, color }) => (
                  <div key={category} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-sm">{category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Next 5 events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEvents
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map(event => (
                  <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                       onClick={() => setSelectedEvent(event)}>
                    <div className={`w-2 h-2 rounded-full mt-2 ${event.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.date), 'MMM dd')} at {event.startTime}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{event.location}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedEvent.color}`} />
                    {selectedEvent.title}
                  </CardTitle>
                  <CardDescription>{selectedEvent.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/events/${selectedEvent.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/events/${selectedEvent.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Event
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{format(new Date(selectedEvent.date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedEvent.location}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{selectedEvent.attendees} / {selectedEvent.maxAttendees} attendees</span>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Badge variant={getStatusColor(selectedEvent.status)}>
                  {selectedEvent.status}
                </Badge>
                <Badge variant="outline">
                  {selectedEvent.category}
                </Badge>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button asChild className="flex-1">
                  <Link href={`/dashboard/events/${selectedEvent.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}