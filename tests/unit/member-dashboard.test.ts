import { describe, it, expect } from 'vitest';
import { memberDashboardService } from '@/services/member';
import { getTimeGreeting } from '@/components/member/dashboard/welcome-section';

describe('Member Portal — Phase 2: Member Dashboard', () => {
  it('fetches full member dashboard data matching exact UI specifications', async () => {
    const data = await memberDashboardService.getDashboardData();

    expect(data).toBeDefined();
    expect(data.profile).toBeDefined();
    expect(data.profile.firstName).toBe('Bismark');
    expect(data.profile.lastName).toBe('Asiedu');

    // 4 Stat Cards
    expect(data.statCards).toBeDefined();
    expect(data.statCards.membership.status).toBe('Active Member');
    expect(data.statCards.ministry.name).toBe('Worship Team');
    expect(data.statCards.events.count).toBe(2);
    expect(data.statCards.giving.amount).toBe('GHS 1,250.00');

    // Today's Verse
    expect(data.dailyVerse).toBeDefined();
    expect(data.dailyVerse.citation).toBe('Psalm 118:24');

    // Giving Widget
    expect(data.givingWidget).toBeDefined();
    expect(data.givingWidget.totalYtd).toBe(1250);
    expect(data.givingWidget.goalProgressPercent).toBe(75);
    expect(data.givingWidget.yearComparisonPercent).toBe(18);
    expect(data.givingWidget.recentTransactions.length).toBe(3);

    // Announcements
    expect(data.announcements).toBeDefined();
    expect(data.announcements.length).toBe(3);
    expect(data.announcements[0].title).toBe("New Members' Class");

    // Upcoming Events
    expect(data.upcomingEvents.length).toBe(3);
    expect(data.upcomingEvents[0].title).toBe('Sunday Service');

    // Quick Actions
    expect(data.quickActions.length).toBe(6);
    const actionLabels = data.quickActions.map((a) => a.label);
    expect(actionLabels).toContain('Update Profile');
    expect(actionLabels).toContain('My Giving');
    expect(actionLabels).toContain('Register for Event');
    expect(actionLabels).toContain('Join a Ministry');
    expect(actionLabels).toContain('Pastoral Care Request');
    expect(actionLabels).toContain('View Resources');
  });

  it('correctly formats time-aware greetings', () => {
    const morningDate = new Date('2026-09-01T08:30:00');
    expect(getTimeGreeting(morningDate)).toBe('Good morning');

    const afternoonDate = new Date('2026-09-01T14:15:00');
    expect(getTimeGreeting(afternoonDate)).toBe('Good afternoon');

    const eveningDate = new Date('2026-09-01T19:45:00');
    expect(getTimeGreeting(eveningDate)).toBe('Good evening');

    const lateNightDate = new Date('2026-09-01T23:30:00');
    expect(getTimeGreeting(lateNightDate)).toBe('Good evening');

    const earlyMorningDate = new Date('2026-09-01T04:00:00');
    expect(getTimeGreeting(earlyMorningDate)).toBe('Good evening');
  });

  it('ensures dashboard clone prevents mock state pollution across calls', async () => {
    const data1 = await memberDashboardService.getDashboardData();
    const data2 = await memberDashboardService.getDashboardData();

    expect(data1).toEqual(data2);
    expect(data1).not.toBe(data2); // Should be distinct cloned instances
  });
});
