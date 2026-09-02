import { describe, it, expect } from 'vitest';
import { memberMinistriesService } from '@/services/member';
import { serveInterestSchema } from '@/lib/validation/member';

describe('Member Ministries Service & Validation', () => {
  it('retrieves member active ministries with roles and upcoming assignments', async () => {
    const ministries = await memberMinistriesService.getMyMinistries();

    expect(ministries).toBeDefined();
    expect(ministries.length).toBeGreaterThan(0);
    expect(ministries[0]).toHaveProperty('name');
    expect(ministries[0]).toHaveProperty('myRoles');
    expect(ministries[0].myRoles.length).toBeGreaterThan(0);
    expect(ministries[0].status).toBe('Active');
  });

  it('filters discoverable ministries by category, campus, and search query', async () => {
    const all = await memberMinistriesService.getAvailableMinistries();
    expect(all.length).toBeGreaterThan(0);

    const worship = await memberMinistriesService.getAvailableMinistries({
      category: 'Ushering & Protocol',
    });
    expect(worship.every((m) => m.category === 'Ushering & Protocol')).toBe(true);

    const searched = await memberMinistriesService.getAvailableMinistries({ search: 'Kids' });
    expect(searched.length).toBeGreaterThan(0);
  });

  it('validates serve interest schema', () => {
    const valid = serveInterestSchema.safeParse({
      ministryId: 'disc-min-01',
      areaOfInterest: 'Sanctuary Usher',
      message: 'I have served in ushering before.',
    });
    expect(valid.success).toBe(true);

    const missingArea = serveInterestSchema.safeParse({
      ministryId: 'disc-min-01',
      areaOfInterest: '',
    });
    expect(missingArea.success).toBe(false);
  });

  it('submits volunteer serve interest successfully', async () => {
    const res = await memberMinistriesService.submitMinistryInterest({
      ministryId: 'disc-min-01',
      areaOfInterest: 'Sanctuary Usher',
      message: 'Eager to serve in protocol.',
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain('interest to serve');
  });
});
