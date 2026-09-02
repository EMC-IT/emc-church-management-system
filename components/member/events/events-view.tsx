'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FeaturedEvents } from './featured-events';
import { EventCard } from './event-card';
import { EventsCalendarView } from './events-calendar-view';
import { MyRegistrationsView } from './my-registrations-view';
import { EventRegistrationDialog } from './event-registration-dialog';
import { EventsEmptyState } from './events-empty-state';
import {
  MemberEvent,
  MemberEventRegistration,
  MemberEventFilter,
  EventCategory,
} from '@/lib/types/member';
import { memberEventsService } from '@/services/member';
import { cn } from '@/lib/utils';

export interface EventsViewProps {
  initialEvents: MemberEvent[];
  initialFeaturedEvents: MemberEvent[];
  initialRegistrations: MemberEventRegistration[];
  className?: string;
}

export function EventsView({
  initialEvents,
  initialFeaturedEvents,
  initialRegistrations,
  className,
}: EventsViewProps) {
  const [currentTab, setCurrentTab] = useState('discover');
  const [events, setEvents] = useState<MemberEvent[]>(initialEvents);
  const [registrations, setRegistrations] =
    useState<MemberEventRegistration[]>(initialRegistrations);
  const [selectedEventForReg, setSelectedEventForReg] = useState<MemberEvent | null>(null);
  const [isRegOpen, setIsRegOpen] = useState(false);

  const [filter, setFilter] = useState<MemberEventFilter>({
    category: 'all',
    branch: 'all',
    dateRange: 'all',
    registrationStatus: 'all',
    search: '',
  });

  const refreshData = async () => {
    const [freshEvents, freshRegs] = await Promise.all([
      memberEventsService.getEvents(),
      memberEventsService.getMyRegistrations(),
    ]);
    setEvents(freshEvents);
    setRegistrations(freshRegs);
  };

  const filteredEvents = events.filter((e) => {
    if (filter.category && filter.category !== 'all' && e.category !== filter.category) return false;
    if (filter.branch && filter.branch !== 'all' && e.branch !== filter.branch) return false;

    if (filter.registrationStatus && filter.registrationStatus !== 'all') {
      if (filter.registrationStatus === 'registered') {
        const isUserReg = registrations.some(
          (r) => r.eventId === e.id && r.status === 'confirmed'
        );
        if (!isUserReg) return false;
      } else if (e.registrationStatus !== filter.registrationStatus) {
        return false;
      }
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.venue && e.venue.toLowerCase().includes(q)) ||
        (e.location && e.location.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q) ||
        (e.host?.name && e.host.name.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleRegisterClick = (event: MemberEvent) => {
    setSelectedEventForReg(event);
    setIsRegOpen(true);
  };

  const handleResetFilters = () => {
    setFilter({
      category: 'all',
      branch: 'all',
      dateRange: 'all',
      registrationStatus: 'all',
      search: '',
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Featured Events Section */}
      <FeaturedEvents
        events={initialFeaturedEvents}
        onRegisterClick={handleRegisterClick}
      />

      {/* Main Tabs Navigation */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="discover" className="text-xs font-medium">
              Upcoming Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs font-medium">
              Church Calendar
            </TabsTrigger>
            <TabsTrigger value="my-registrations" className="text-xs font-medium">
              My Registrations ({registrations.filter((r) => r.status === 'confirmed').length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Discover Events */}
        <TabsContent value="discover" className="space-y-6 pt-4 mt-0">
          {/* Filter Controls Card */}
          <Card className="p-3 sm:p-4">
            <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search title, venue, or speaker..."
                  value={filter.search || ''}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  className="pl-8 h-9 text-xs"
                />
              </div>

              {/* Category */}
              <Select
                value={filter.category || 'all'}
                onValueChange={(val) =>
                  setFilter({ ...filter, category: val as EventCategory | 'all' })
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Conference">Conferences</SelectItem>
                  <SelectItem value="Worship Night">Worship Nights</SelectItem>
                  <SelectItem value="Service">Services</SelectItem>
                  <SelectItem value="Youth">Youth Gatherings</SelectItem>
                  <SelectItem value="Children">Children</SelectItem>
                  <SelectItem value="Fellowship">Fellowship</SelectItem>
                  <SelectItem value="Outreach">Outreach & Missions</SelectItem>
                  <SelectItem value="Training">Training & Seminars</SelectItem>
                  <SelectItem value="Prayer">Prayer Meetings</SelectItem>
                  <SelectItem value="Retreat">Retreats & Banquets</SelectItem>
                </SelectContent>
              </Select>

              {/* Branch */}
              <Select
                value={filter.branch || 'all'}
                onValueChange={(val) => setFilter({ ...filter, branch: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="Main Branch">Main Branch</SelectItem>
                  <SelectItem value="Youth Center Branch">Youth Center Branch</SelectItem>
                  <SelectItem value="Spintex Branch">Spintex Branch</SelectItem>
                </SelectContent>
              </Select>

              {/* Registration Status */}
              <Select
                value={filter.registrationStatus || 'all'}
                onValueChange={(val) =>
                  setFilter({ ...filter, registrationStatus: val as any })
                }
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Registration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Registration Open</SelectItem>
                  <SelectItem value="registered">My Registered Events</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Events Grid */}
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegisterClick={handleRegisterClick}
                />
              ))}
            </div>
          ) : (
            <EventsEmptyState onResetFilters={handleResetFilters} />
          )}
        </TabsContent>

        {/* Tab 2: Calendar View */}
        <TabsContent value="calendar" className="pt-4 mt-0">
          <EventsCalendarView
            events={events}
            onRegisterClick={handleRegisterClick}
          />
        </TabsContent>

        {/* Tab 3: My Registrations */}
        <TabsContent value="my-registrations" className="pt-4 mt-0">
          <MyRegistrationsView
            registrations={registrations}
            onRegistrationCancelled={refreshData}
          />
        </TabsContent>
      </Tabs>

      {/* Registration Dialog */}
      <EventRegistrationDialog
        open={isRegOpen}
        onOpenChange={setIsRegOpen}
        event={selectedEventForReg}
        onSuccess={refreshData}
      />
    </div>
  );
}
