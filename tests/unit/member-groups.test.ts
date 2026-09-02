import { describe, it, expect } from 'vitest';
import { memberGroupsService } from '@/services/member';
import { joinGroupSchema } from '@/lib/validation/member';

describe('Member Groups Service & Validation', () => {
  it('retrieves member joined groups with leader and schedule details', async () => {
    const groups = await memberGroupsService.getMyGroups();

    expect(groups).toBeDefined();
    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0]).toHaveProperty('name');
    expect(groups[0]).toHaveProperty('leader');
    expect(groups[0]).toHaveProperty('schedule');
    expect(groups[0].membershipStatus).toBe('Active');
  });

  it('filters discoverable groups by type, campus, meeting day, and search query', async () => {
    const all = await memberGroupsService.getAvailableGroups();
    expect(all.length).toBeGreaterThan(0);

    const cells = await memberGroupsService.getAvailableGroups({ type: 'Cell Group' });
    expect(cells.every((g) => g.type === 'Cell Group')).toBe(true);

    const thursdays = await memberGroupsService.getAvailableGroups({ meetingDay: 'Thursday' });
    expect(thursdays.every((g) => g.meetingDay.includes('Thursday'))).toBe(true);

    const searched = await memberGroupsService.getAvailableGroups({ search: 'Airport' });
    expect(searched.length).toBeGreaterThan(0);
  });

  it('validates join group form schema', () => {
    const valid = joinGroupSchema.safeParse({
      groupId: 'disc-01',
      message: 'Looking forward to joining this fellowship.',
    });
    expect(valid.success).toBe(true);

    const empty = joinGroupSchema.safeParse({
      groupId: '',
    });
    expect(empty.success).toBe(false);
  });

  it('submits a join request successfully', async () => {
    const res = await memberGroupsService.requestToJoinGroup({
      groupId: 'disc-01',
      message: 'Hello leader, I would love to join.',
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('request to join');
  });
});
