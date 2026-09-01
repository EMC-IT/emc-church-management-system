import { MemberEvent } from '@/lib/types/member';
import { mockMemberEvents } from '@/lib/mock/member';

export interface MemberEventsService {
  getMyEvents(): Promise<MemberEvent[]>;
  getUpcomingEvents(): Promise<MemberEvent[]>;
  getEventById(id: string): Promise<MemberEvent | null>;
  registerForEvent(eventId: string): Promise<MemberEvent>;
  cancelRegistration(eventId: string): Promise<MemberEvent>;
}

export class MockMemberEventsService implements MemberEventsService {
  private events: MemberEvent[] = [...mockMemberEvents];

  async getMyEvents(): Promise<MemberEvent[]> {
    return Promise.resolve(this.events.filter((e) => !!e.registrationStatus));
  }

  async getUpcomingEvents(): Promise<MemberEvent[]> {
    return Promise.resolve([...this.events]);
  }

  async getEventById(id: string): Promise<MemberEvent | null> {
    const event = this.events.find((e) => e.id === id);
    return Promise.resolve(event ? { ...event } : null);
  }

  async registerForEvent(eventId: string): Promise<MemberEvent> {
    const index = this.events.findIndex((e) => e.id === eventId);
    if (index === -1) {
      throw new Error('Event not found');
    }
    const updated: MemberEvent = {
      ...this.events[index],
      registrationStatus: 'Registered',
      registeredCount: this.events[index].registeredCount + 1,
      ticketReference: `TKT-${Date.now().toString().slice(-6)}`,
    };
    this.events[index] = updated;
    return Promise.resolve(updated);
  }

  async cancelRegistration(eventId: string): Promise<MemberEvent> {
    const index = this.events.findIndex((e) => e.id === eventId);
    if (index === -1) {
      throw new Error('Event not found');
    }
    const updated: MemberEvent = {
      ...this.events[index],
      registrationStatus: 'Cancelled',
      registeredCount: Math.max(0, this.events[index].registeredCount - 1),
    };
    this.events[index] = updated;
    return Promise.resolve(updated);
  }
}

export const memberEventsService = new MockMemberEventsService();
