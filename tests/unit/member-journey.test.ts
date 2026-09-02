import { describe, it, expect } from 'vitest';
import { memberJourneyService } from '@/services/member';

describe('Member Portal — Phase 8: My Church Journey', () => {
  it('retrieves the member church journey with progression stages and summary', async () => {
    const journey = await memberJourneyService.getMyJourney();

    expect(journey).toBeDefined();
    expect(journey.memberId).toBe('member-001');
    expect(journey.currentStage).toBeDefined();
    expect(journey.progressionStages).toBeDefined();
    expect(journey.progressionStages?.length).toBeGreaterThan(0);
    expect(journey.milestones).toBeDefined();
    expect(journey.milestones.length).toBeGreaterThan(0);
    expect(journey.summary).toBeDefined();
    expect(journey.summary?.completedMilestonesCount).toBeGreaterThan(0);
  });

  it('contains essential spiritual and church involvement milestones in chronological timeline', async () => {
    const journey = await memberJourneyService.getMyJourney();
    const milestones = journey.milestones;

    // Check presence of salvation, baptism, class, and involvement
    const types = milestones.map((m) => m.type);
    expect(types).toContain('Salvation');
    expect(types).toContain('Baptism');
    expect(types).toContain('Foundation Class');
    expect(types).toContain('Membership');
    expect(types).toContain('Group');
    expect(types).toContain('Ministry');
  });

  it('filters milestones by category', async () => {
    const all = await memberJourneyService.getMilestones();
    expect(all.length).toBeGreaterThan(0);

    const baptismMilestones = await memberJourneyService.getMilestones({ type: 'Baptism' });
    expect(baptismMilestones.every((m) => m.type === 'Baptism')).toBe(true);

    const groupMilestones = await memberJourneyService.getMilestones({ type: 'Group' });
    expect(groupMilestones.every((m) => m.type === 'Group')).toBe(true);
  });

  it('retrieves single milestone by ID', async () => {
    const milestone = await memberJourneyService.getMilestoneById('jm-002');

    expect(milestone).toBeDefined();
    expect(milestone?.title).toBe('Water Baptism by Immersion');
    expect(milestone?.type).toBe('Baptism');
    expect(milestone?.status).toBe('completed');
  });

  it('strictly preserves privacy boundary by excluding confidential pastoral data', async () => {
    const journey = await memberJourneyService.getMyJourney();
    const jsonStr = JSON.stringify(journey);

    // Ensure no sensitive CRM/pastoral terms exist in member-facing payload
    expect(jsonStr).not.toContain('counselingCase');
    expect(jsonStr).not.toContain('pastoralNotes');
    expect(jsonStr).not.toContain('confidentialAssessment');
    expect(jsonStr).not.toContain('auditLog');
    expect(jsonStr).not.toContain('internalComment');
  });
});
