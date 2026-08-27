'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { EventCategoryBadge } from '@/components/ui/category-badges';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  MapPin,
  Clock,
  Users,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventItem {
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

const events: EventItem[] = [
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
];

const categories = ['All', 'Worship', 'Study', 'Conference', 'Outreach', 'Social', 'Training'];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    const matchesDate = !selectedDate ||
      format(new Date(event.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

    return matchesSearch && matchesCategory && matchesDate;
  });

  const upcomingEvents = events.filter(e => e.status.toLowerCase() === 'upcoming').length;
  const totalAttendees = events.reduce((sum, event) => sum + event.attendees, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Events</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/events/calendar">
              <CalendarIcon className="mr-1.5 h-4 w-4" />
              Calendar
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/events/categories">
              <Filter className="mr-1.5 h-4 w-4" />
              Categories
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/events/templates">
              <FileText className="mr-1.5 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/events/export">
              <Download className="mr-1.5 h-4 w-4" />
              Export
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/dashboard/events/add">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Events" value={events.length} icon={CalendarIcon} />
        <StatCard title="Upcoming Events" value={upcomingEvents} icon={Clock} />
        <StatCard title="Total Attendees" value={totalAttendees} icon={Users} />
        <StatCard title="This Week" value={3} icon={CalendarIcon} />
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44 h-9">
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

        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Filter date"
          clearable
          className="w-full sm:w-44 h-9"
        />
      </div>

      {/* Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="transition-colors hover:border-foreground/20">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <CardTitle className="text-base font-semibold truncate">{event.title}</CardTitle>
                  <div className="flex items-center gap-2 pt-0.5">
                    <StatusBadge status={event.status} />
                    <EventCategoryBadge category={event.category} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/dashboard/events/${event.id}`} aria-label="View event details">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <Link href={`/dashboard/events/${event.id}/edit`} aria-label="Edit event">
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{event.time}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.location}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  <span>{event.attendees} / {event.maxAttendees} attendees</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px]">
                      {event.organizer.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate">{event.organizer}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}