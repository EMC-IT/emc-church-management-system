import {
  MemberEvent,
  MemberEventRegistration,
  MemberEventFilter,
} from '@/lib/types/member';
import { mockMemberEventsList, mockMemberRegistrations, mockCurrentMember } from '@/lib/mock/member';
import { EventRegistrationFormData } from '@/lib/validation/member';

export interface RegisterEventResult {
  success: boolean;
  message: string;
  registration: MemberEventRegistration;
  registrationStatus: 'Registered' | 'registered';
}

export interface MemberEventsService {
  getEvents(filter?: MemberEventFilter): Promise<MemberEvent[]>;
  getUpcomingEvents(): Promise<MemberEvent[]>;
  getFeaturedEvents(): Promise<MemberEvent[]>;
  getEventById(id: string): Promise<MemberEvent | null>;
  getMyRegistrations(): Promise<MemberEventRegistration[]>;
  getMyRegistrationForEvent(eventId: string): Promise<MemberEventRegistration | null>;
  registerForEvent(
    dataOrId: EventRegistrationFormData | string
  ): Promise<RegisterEventResult>;
  cancelRegistration(
    registrationId: string
  ): Promise<{ success: boolean; message: string }>;
}

export class MockMemberEventsService implements MemberEventsService {
  private events: MemberEvent[] = [...mockMemberEventsList];
  private registrations: MemberEventRegistration[] = [...mockMemberRegistrations];

  async getEvents(filter?: MemberEventFilter): Promise<MemberEvent[]> {
    let filtered = [...this.events];

    if (!filter) {
      return Promise.resolve(filtered);
    }

    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter((e) => e.category === filter.category);
    }

    const branchFilter = filter.branch;
    if (branchFilter && branchFilter !== 'all') {
      filtered = filtered.filter((e) => (e.branch || e.campus) === branchFilter);
    }

    if (filter.registrationStatus && filter.registrationStatus !== 'all') {
      if (filter.registrationStatus === 'registered') {
        const registeredEventIds = new Set(
          this.registrations.filter((r) => r.status === 'confirmed').map((r) => r.eventId)
        );
        filtered = filtered.filter((e) => registeredEventIds.has(e.id));
      } else {
        filtered = filtered.filter((e) => e.registrationStatus === filter.registrationStatus);
      }
    }

    if (filter.dateRange && filter.dateRange !== 'all') {
      const now = new Date('2026-09-01T00:00:00Z');
      if (filter.dateRange === 'upcoming') {
        filtered = filtered.filter((e) => new Date(e.startDate) >= now);
      } else if (filter.dateRange === 'past') {
        filtered = filtered.filter((e) => new Date(e.endDate) < now);
      } else if (filter.dateRange === 'this-month') {
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        filtered = filtered.filter((e) => {
          const d = new Date(e.startDate);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
      } else if (filter.dateRange === 'next-month') {
        const nextMonth = (now.getMonth() + 1) % 12;
        filtered = filtered.filter((e) => {
          const d = new Date(e.startDate);
          return d.getMonth() === nextMonth;
        });
      }
    }

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.venue && e.venue.toLowerCase().includes(q)) ||
          (e.location && e.location.toLowerCase().includes(q)) ||
          e.category.toLowerCase().includes(q) ||
          (e.host?.name && e.host.name.toLowerCase().includes(q))
      );
    }

    return Promise.resolve(filtered);
  }

  async getUpcomingEvents(): Promise<MemberEvent[]> {
    return this.getEvents({ dateRange: 'upcoming' });
  }

  async getFeaturedEvents(): Promise<MemberEvent[]> {
    const featured = this.events.filter((e) => e.isFeatured);
    return Promise.resolve(featured.length > 0 ? featured : this.events.slice(0, 3));
  }

  async getEventById(id: string): Promise<MemberEvent | null> {
    const event = this.events.find((e) => e.id === id);
    if (!event) return Promise.resolve(null);

    // Check if user is registered
    const isRegistered = this.registrations.some(
      (r) => r.eventId === id && r.status === 'confirmed'
    );

    return Promise.resolve({
      ...event,
      registrationStatus: isRegistered ? 'registered' : event.registrationStatus,
    });
  }

  async getMyRegistrations(): Promise<MemberEventRegistration[]> {
    return Promise.resolve([...this.registrations]);
  }

  async getMyRegistrationForEvent(eventId: string): Promise<MemberEventRegistration | null> {
    const reg = this.registrations.find(
      (r) => r.eventId === eventId && r.status === 'confirmed'
    );
    return Promise.resolve(reg ? { ...reg } : null);
  }

  async registerForEvent(
    dataOrId: EventRegistrationFormData | string
  ): Promise<RegisterEventResult> {
    const eventId = typeof dataOrId === 'string' ? dataOrId : dataOrId.eventId;
    const targetEvent = this.events.find((e) => e.id === eventId);
    if (!targetEvent) {
      throw new Error('Event not found');
    }

    const ticketCode = `REG-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

    const attendeeName =
      (typeof dataOrId === 'object'
        ? dataOrId.fullName || dataOrId.attendeeName
        : undefined) ||
      mockCurrentMember.displayName ||
      `${mockCurrentMember.firstName} ${mockCurrentMember.lastName}`;

    const attendeeEmail =
      (typeof dataOrId === 'object'
        ? dataOrId.email || dataOrId.attendeeEmail
        : undefined) || mockCurrentMember.email;

    const attendeePhone =
      (typeof dataOrId === 'object'
        ? dataOrId.phone || dataOrId.attendeePhone
        : undefined) || mockCurrentMember.phone;

    const attendanceType =
      (typeof dataOrId === 'object'
        ? dataOrId.attendanceType
        : undefined) || 'In-Person';

    const newRegistration: MemberEventRegistration = {
      id: `reg-${Date.now()}`,
      eventId: targetEvent.id,
      eventTitle: targetEvent.title,
      eventCategory: targetEvent.category,
      eventStartDate: targetEvent.startDate,
      eventEndDate: targetEvent.endDate,
      venue: targetEvent.venue || targetEvent.location || 'Main Auditorium',
      branch: targetEvent.branch || targetEvent.campus || 'Main Branch',
      registeredAt: new Date().toISOString(),
      status: 'confirmed',
      ticketReference: ticketCode,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      attendanceType,
      answers:
        typeof dataOrId === 'object'
          ? (dataOrId.answers as Record<string, string | string[]> | undefined)
          : undefined,
      notes:
        typeof dataOrId === 'object' ? dataOrId.specialRequirements : undefined,
    };

    // Update state
    this.registrations = [newRegistration, ...this.registrations];

    const eventIndex = this.events.findIndex((e) => e.id === eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        registeredCount: this.events[eventIndex].registeredCount + 1,
        registrationStatus: 'registered',
      };
    }

    return Promise.resolve({
      success: true,
      message: `You have successfully registered for ${targetEvent.title}. Your ticket reference is ${ticketCode}.`,
      registration: newRegistration,
      registrationStatus: 'Registered',
    });
  }

  async cancelRegistration(
    registrationId: string
  ): Promise<{ success: boolean; message: string }> {
    const targetReg = this.registrations.find((r) => r.id === registrationId);
    if (!targetReg) {
      throw new Error('Registration not found');
    }

    // Mark registration as cancelled
    this.registrations = this.registrations.map((r) =>
      r.id === registrationId ? { ...r, status: 'cancelled' as const } : r
    );

    // Update event registration status back to open
    const eventIndex = this.events.findIndex((e) => e.id === targetReg.eventId);
    if (eventIndex !== -1) {
      this.events[eventIndex] = {
        ...this.events[eventIndex],
        registeredCount: Math.max(0, this.events[eventIndex].registeredCount - 1),
        registrationStatus: 'open',
      };
    }

    return Promise.resolve({
      success: true,
      message: `Your registration for ${targetReg.eventTitle} has been cancelled.`,
    });
  }
}

export const memberEventsService = new MockMemberEventsService();
