'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EventCategoryBadge } from '@/components/ui/category-badges';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Clock,
  MapPin,
  Users,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Category color token mapping
const CATEGORY_STYLES: Record<string, string> = {
  worship: 'bg-primary/15 text-primary border-primary/30',
  study: 'bg-brand-success/15 text-brand-success border-brand-success/30',
  conference: 'bg-secondary/15 text-secondary border-secondary/30',
  outreach: 'bg-accent/15 text-accent border-accent/30',
  prayer: 'bg-primary/15 text-primary border-primary/30',
  children: 'bg-accent/15 text-accent border-accent/30',
  music: 'bg-secondary/15 text-secondary border-secondary/30',
  social: 'bg-secondary/15 text-secondary border-secondary/30',
  training: 'bg-muted text-foreground border-border',
};

const getCategoryStyle = (category: string) => {
  return CATEGORY_STYLES[category.toLowerCase()] || 'bg-primary/15 text-primary border-primary/30';
};

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
  },
  {
    id: '8',
    title: 'Board Meeting',
    description: 'Monthly church board meeting',
    date: '2025-09-25',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Conference Room',
    category: 'Training',
    organizer: 'Church Board',
    attendees: 12,
    maxAttendees: 15,
    status: 'Upcoming',
  }
];

const categories = ['All', 'Worship', 'Study', 'Conference', 'Outreach', 'Prayer', 'Children', 'Music', 'Training'];

export default function EventsCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-09-01'));
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const filteredEvents = mockEvents.filter(event => {
    return categoryFilter === 'All' || event.category === categoryFilter;
  });

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
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
          <div key={day} className="p-2 text-center font-medium text-xs text-muted-foreground border-b">
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
              className={`min-h-[110px] p-1.5 border border-border/60 rounded-md transition-colors ${
                isCurrentMonth ? 'bg-card' : 'bg-muted/30 opacity-60'
              } ${isToday ? 'border-primary/60 bg-primary/5' : ''}`}
            >
              <div className={`text-xs font-semibold mb-1 ${
                isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              } ${isToday ? 'text-primary' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`text-[11px] px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-90 font-medium truncate ${getCategoryStyle(event.category)}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="truncate">{event.title}</div>
                  </div>
                ))}
                
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">
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
        <div className="grid grid-cols-7 gap-3">
          {days.map(day => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className="text-center p-2 rounded-lg border border-border/50">
                <div className={`text-xs font-medium ${
                  isToday ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {format(day, 'EEE')}
                </div>
                <div className={`text-xl font-bold ${
                  isToday ? 'text-primary' : 'text-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Week Events */}
        <div className="grid grid-cols-7 gap-3">
          {days.map(day => {
            const dayEvents = getEventsForDate(day);
            
            return (
              <div key={day.toISOString()} className="space-y-2 min-h-[200px]">
                {dayEvents.map(event => (
                  <Card
                    key={event.id}
                    className="cursor-pointer hover:border-foreground/20 transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <CardContent className="p-2.5 space-y-1">
                      <EventCategoryBadge category={event.category} />
                      <h4 className="font-medium text-xs truncate pt-1">{event.title}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
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
          <h1 className="font-heading text-2xl font-bold tracking-tight">Events Calendar</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCalendar}>
            <Download className="mr-1.5 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/events/add">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <h2 className="text-base font-semibold min-w-[160px] text-center">
                  {viewMode === 'month' 
                    ? format(currentDate, 'MMMM yyyy')
                    : `Week of ${format(startOfWeek(currentDate), 'MMM d, yyyy')}`
                  }
                </h2>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentDate(new Date('2025-09-01'))}
              >
                Today
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
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
                <TabsList className="h-8">
                  <TabsTrigger value="month" className="text-xs h-7">Month</TabsTrigger>
                  <TabsTrigger value="week" className="text-xs h-7">Week</TabsTrigger>
                </TabsList>
              </Tabs>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Event Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.filter(c => c !== 'All').map((category) => (
                  <div key={category} className={`px-2.5 py-1 rounded border text-xs font-medium ${getCategoryStyle(category)}`}>
                    {category}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Events</CardTitle>
            <CardDescription className="text-xs">Next scheduled activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {filteredEvents
                .slice(0, 5)
                .map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs truncate">{event.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {format(new Date(event.date), 'MMM dd')} at {event.startTime}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEvent(null)}>
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{selectedEvent.title}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">{selectedEvent.description}</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{format(new Date(selectedEvent.date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{selectedEvent.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>{selectedEvent.attendees} / {selectedEvent.maxAttendees} attendees</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <StatusBadge status={selectedEvent.status} />
                <EventCategoryBadge category={selectedEvent.category} />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button size="sm" asChild className="flex-1">
                  <Link href={`/dashboard/events/${selectedEvent.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedEvent(null)}>
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