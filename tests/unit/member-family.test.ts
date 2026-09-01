import { describe, it, expect } from 'vitest';
import { memberFamilyService } from '@/services/member';
import { familyMemberSchema } from '@/lib/validation/member';

describe('Member Portal — Phase 3: My Family', () => {
  it('fetches member family unit from service', async () => {
    const family = await memberFamilyService.getFamily();

    expect(family).toBeDefined();
    expect(family.familyName).toContain('Asiedu');
    expect(family.members.length).toBeGreaterThanOrEqual(2);

    const head = family.members.find((m) => m.relationship === 'Head');
    expect(head).toBeDefined();
    expect(head?.firstName).toBe('Bismark');
  });

  it('adds a new family member to household', async () => {
    const newMember = await memberFamilyService.addFamilyMember({
      firstName: 'Sarah',
      lastName: 'Asiedu',
      relationship: 'Child',
      gender: 'Female',
      dateOfBirth: '2024-05-10',
      isRegisteredMember: false,
      canManagePermissions: false,
      avatarUrl: null,
    });

    expect(newMember.id).toBeDefined();
    expect(newMember.firstName).toBe('Sarah');

    const updatedFamily = await memberFamilyService.getFamily();
    expect(updatedFamily.members.some((m) => m.firstName === 'Sarah')).toBe(true);
  });

  it('validates family member data with Zod schema correctly', () => {
    const validData = {
      firstName: 'Sarah',
      lastName: 'Asiedu',
      relationship: 'Child',
      gender: 'Female',
      isRegisteredMember: false,
      canManagePermissions: false,
    };

    const parseResult = familyMemberSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);

    const invalidRelationship = {
      ...validData,
      relationship: 'Neighbor',
    };
    const invalidRelResult = familyMemberSchema.safeParse(invalidRelationship);
    expect(invalidRelResult.success).toBe(false);
  });
});
