import { describe, it, expect } from 'vitest';
import { memberEventsService } from '@/services/member';
import { eventRegistrationSchema } from '@/lib/validation/member';

describe('Member Portal — Phase 7: Events & Church Calendar', () => {
  it('retrieves upcoming church events with complete metadata', async () => {
    const events = await memberEventsService.getEvents();

    expect(events).toBeDefined();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]).toHaveProperty('title');
    expect(events[0]).toHaveProperty('category');
    expect(events[0]).toHaveProperty('startDate');
    expect(events[0]).toHaveProperty('venue');
    expect(events[0]).toHaveProperty('branch');
  });

  it('retrieves featured church events', async () => {
    const featured = await memberEventsService.getFeaturedEvents();

    expect(featured).toBeDefined();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((e) => e.isFeatured)).toBe(true);
  });

  it('filters events by category, branch, and search query', async () => {
    const all = await memberEventsService.getEvents();
    expect(all.length).toBeGreaterThan(0);

    const conferences = await memberEventsService.getEvents({ category: 'Conference' });
    expect(conferences.every((e) => e.category === 'Conference')).toBe(true);

    const mainBranchEvents = await memberEventsService.getEvents({ branch: 'Main Branch' });
    expect(mainBranchEvents.every((e) => e.branch === 'Main Branch')).toBe(true);

    const searched = await memberEventsService.getEvents({ search: 'Worship' });
    expect(searched.length).toBeGreaterThan(0);
  });

  it('retrieves single event by ID with host and multi-session schedule', async () => {
    const event = await memberEventsService.getEventById('evt-001');

    expect(event).toBeDefined();
    expect(event?.title).toContain('Annual Believers Convention');
    expect(event?.host?.name).toBe('Rev. Dr. Emmanuel Mensah');
    expect(event?.schedule).toBeDefined();
    expect(event?.schedule?.length).toBeGreaterThan(0);
  });

  it('validates event registration schema with Zod', () => {
    const valid = eventRegistrationSchema.safeParse({
      eventId: 'evt-002',
      fullName: 'Bismark Asiedu',
      email: 'bismark.asiedu@example.com',
      phone: '+233 24 123 4567',
      attendanceType: 'In-Person',
      answers: {
        track: 'Ministry Track',
      },
    });
    expect(valid.success).toBe(true);

    const invalidEmail = eventRegistrationSchema.safeParse({
      eventId: 'evt-002',
      fullName: 'Bismark Asiedu',
      email: 'not-an-email',
      phone: '+233 24 123 4567',
      attendanceType: 'In-Person',
    });
    expect(invalidEmail.success).toBe(false);
  });

  it('registers a member for an event and generates a ticket reference', async () => {
    const result = await memberEventsService.registerForEvent({
      eventId: 'evt-002',
      fullName: 'Bismark Asiedu',
      email: 'bismark.asiedu@example.com',
      phone: '+233 24 123 4567',
      attendanceType: 'In-Person',
    });

    expect(result.success).toBe(true);
    expect(result.registration.ticketReference).toMatch(/^REG-\d{4}-\d{4}$/);
    expect(result.registration.status).toBe('confirmed');

    const myRegs = await memberEventsService.getMyRegistrations();
    expect(myRegs.some((r) => r.id === result.registration.id)).toBe(true);
  });

  it('cancels an active registration successfully', async () => {
    const myRegs = await memberEventsService.getMyRegistrations();
    const activeReg = myRegs.find((r) => r.status === 'confirmed');
    expect(activeReg).toBeDefined();

    const cancelRes = await memberEventsService.cancelRegistration(activeReg!.id);
    expect(cancelRes.success).toBe(true);

    const updatedRegs = await memberEventsService.getMyRegistrations();
    const found = updatedRegs.find((r) => r.id === activeReg!.id);
    expect(found?.status).toBe('cancelled');
  });
});
