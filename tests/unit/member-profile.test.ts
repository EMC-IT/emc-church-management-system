import { describe, it, expect } from 'vitest';
import { memberProfileService } from '@/services/member';
import { memberProfileSchema } from '@/lib/validation/member';

describe('Member Portal — Phase 3: My Profile', () => {
  it('fetches current member profile from service', async () => {
    const profile = await memberProfileService.getCurrentProfile();

    expect(profile).toBeDefined();
    expect(profile.id).toBe('member-001');
    expect(profile.firstName).toBe('Bismark');
    expect(profile.lastName).toBe('Asiedu');
    expect(profile.membershipStatus).toBe('Active');
    expect(profile.campus).toContain('Main Campus');
  });

  it('updates member profile and persists changes in mock state', async () => {
    const updated = await memberProfileService.updateProfile({
      phone: '+233 24 000 1111',
      address: {
        city: 'Tema',
        region: 'Greater Accra',
        country: 'Ghana',
      },
    });

    expect(updated.phone).toBe('+233 24 000 1111');
    expect(updated.address.city).toBe('Tema');

    const refetched = await memberProfileService.getCurrentProfile();
    expect(refetched.phone).toBe('+233 24 000 1111');
    expect(refetched.address.city).toBe('Tema');
  });

  it('validates profile data with Zod schema correctly', () => {
    const validData = {
      firstName: 'Bismark',
      lastName: 'Asiedu',
      displayName: 'Bismark Asiedu',
      email: 'bismark@example.com',
      phone: '+233 24 123 4567',
    };

    const parseResult = memberProfileSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);

    const invalidEmail = {
      ...validData,
      email: 'invalid-email-address',
    };
    const invalidEmailResult = memberProfileSchema.safeParse(invalidEmail);
    expect(invalidEmailResult.success).toBe(false);

    const shortName = {
      ...validData,
      firstName: 'B',
    };
    const shortNameResult = memberProfileSchema.safeParse(shortName);
    expect(shortNameResult.success).toBe(false);
  });
});
