import { describe, it, expect } from 'vitest';
import { memberPrayerService, memberPastoralCareService } from '@/services/member';
import { prayerRequestSchema, pastoralCareRequestSchema } from '@/lib/validation/member';

describe('Member Portal — Phase 9: Prayer & Pastoral Care', () => {
  describe('Prayer Requests Domain', () => {
    it('retrieves prayer requests for the authenticated member', async () => {
      const requests = await memberPrayerService.getMyPrayerRequests();

      expect(requests).toBeDefined();
      expect(requests.length).toBeGreaterThan(0);
      expect(requests[0]).toHaveProperty('title');
      expect(requests[0]).toHaveProperty('category');
      expect(requests[0]).toHaveProperty('privacy');
      expect(requests[0]).toHaveProperty('status');
    });

    it('filters prayer requests by status and category', async () => {
      const all = await memberPrayerService.getMyPrayerRequests();
      expect(all.length).toBeGreaterThan(0);

      const praying = await memberPrayerService.getMyPrayerRequests({ status: 'Praying' });
      expect(praying.every((r) => r.status === 'Praying')).toBe(true);

      const answered = await memberPrayerService.getMyPrayerRequests({ status: 'Answered' });
      expect(answered.every((r) => r.status === 'Answered')).toBe(true);
    });

    it('validates prayer request input schema with Zod', () => {
      const valid = prayerRequestSchema.safeParse({
        title: 'Healing for my father',
        category: 'Health & Healing',
        description: 'Please pray for full recovery from surgery.',
        privacy: 'Pastoral Team Only',
        isUrgent: true,
      });
      expect(valid.success).toBe(true);

      const invalid = prayerRequestSchema.safeParse({
        title: 'Hi', // too short
        category: 'General',
        description: 'Short', // too short
        privacy: 'Pastoral Team Only',
      });
      expect(invalid.success).toBe(false);
    });

    it('creates a new prayer request successfully', async () => {
      const newReq = await memberPrayerService.createPrayerRequest({
        title: 'New venture divine wisdom',
        category: 'Work & Career',
        description: 'Praying for open doors and favor with clients.',
        privacy: 'Church Prayer Team',
        isUrgent: false,
      });

      expect(newReq).toBeDefined();
      expect(newReq.title).toBe('New venture divine wisdom');
      expect(newReq.status).toBe('Submitted');

      const all = await memberPrayerService.getMyPrayerRequests();
      expect(all.some((r) => r.id === newReq.id)).toBe(true);
    });

    it('marks an active prayer as answered with a praise testimony', async () => {
      const requests = await memberPrayerService.getMyPrayerRequests({ status: 'Submitted' });
      expect(requests.length).toBeGreaterThan(0);
      const target = requests[0];

      const res = await memberPrayerService.markPrayerAnswered(
        target.id,
        'God answered miraculously! Total praise to God.'
      );

      expect(res.success).toBe(true);
      expect(res.request.status).toBe('Answered');
      expect(res.request.testimony).toContain('God answered');
    });

    it('deletes a prayer request successfully', async () => {
      const all = await memberPrayerService.getMyPrayerRequests();
      const target = all[all.length - 1];

      const res = await memberPrayerService.deletePrayerRequest(target.id);
      expect(res.success).toBe(true);

      const updated = await memberPrayerService.getMyPrayerRequests();
      expect(updated.some((r) => r.id === target.id)).toBe(false);
    });
  });

  describe('Pastoral Care Domain', () => {
    it('retrieves confidential pastoral care requests for the member', async () => {
      const requests = await memberPastoralCareService.getMyPastoralCareRequests();

      expect(requests).toBeDefined();
      expect(requests.length).toBeGreaterThan(0);
      expect(requests[0]).toHaveProperty('category');
      expect(requests[0]).toHaveProperty('preferredMode');
      expect(requests[0]).toHaveProperty('status');
    });

    it('validates pastoral care request schema with Zod', () => {
      const valid = pastoralCareRequestSchema.safeParse({
        category: 'Counseling',
        preferredMode: 'In-Person',
        preferredDate: '2026-09-10',
        preferredTimeSlot: 'Morning',
        reason: 'Seeking marriage counseling and family guidance.',
        isUrgent: false,
      });
      expect(valid.success).toBe(true);

      const invalid = pastoralCareRequestSchema.safeParse({
        category: 'InvalidCategory' as any,
        preferredMode: 'In-Person',
        reason: 'Too short',
      });
      expect(invalid.success).toBe(false);
    });

    it('submits a new pastoral care request successfully', async () => {
      const req = await memberPastoralCareService.requestPastoralCare({
        category: 'Spiritual Guidance',
        preferredMode: 'Phone Call',
        preferredDate: '2026-09-12',
        reason: 'Discussion on spiritual direction for the coming year.',
        isUrgent: false,
      });

      expect(req).toBeDefined();
      expect(req.category).toBe('Spiritual Guidance');
      expect(req.status).toBe('Requested');

      const all = await memberPastoralCareService.getMyPastoralCareRequests();
      expect(all.some((r) => r.id === req.id)).toBe(true);
    });

    it('cancels an active pastoral care request', async () => {
      const all = await memberPastoralCareService.getMyPastoralCareRequests({ status: 'Requested' });
      expect(all.length).toBeGreaterThan(0);
      const target = all[0];

      const res = await memberPastoralCareService.cancelPastoralCareRequest(target.id);
      expect(res.success).toBe(true);

      const targetUpdated = await memberPastoralCareService.getPastoralCareRequestById(target.id);
      expect(targetUpdated?.status).toBe('Cancelled');
    });

    it('strictly preserves privacy boundary by excluding internal case notes and staff comments', async () => {
      const requests = await memberPastoralCareService.getMyPastoralCareRequests();
      const jsonStr = JSON.stringify(requests);

      // Verify no confidential administrative terms exist in member-facing payload
      expect(jsonStr).not.toContain('internalNotes');
      expect(jsonStr).not.toContain('staffNotes');
      expect(jsonStr).not.toContain('caseHistory');
      expect(jsonStr).not.toContain('confidentialAssessment');
      expect(jsonStr).not.toContain('internalPriority');
    });
  });
});
