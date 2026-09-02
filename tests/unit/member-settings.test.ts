import { describe, it, expect, beforeEach } from 'vitest';
import { MockMemberSettingsService } from '@/services/member';
import { memberSettingsSchema } from '@/lib/validation/member/settings.schema';

describe('Member Portal — Phase 12: Settings & Member Preferences', () => {
  let settingsService: MockMemberSettingsService;

  beforeEach(() => {
    settingsService = new MockMemberSettingsService();
  });

  it('retrieves default member settings', async () => {
    const settings = await settingsService.getSettings();

    expect(settings).toBeDefined();
    expect(settings.profile.displayName).toBe('Redeem');
    expect(settings.profile.language).toBe('en');
    expect(settings.communication.email).toBe(true);
    expect(settings.notifications.events).toBe(true);
    expect(settings.privacy.directoryVisibility).toBe(true);
    expect(settings.appearance.theme).toBe('system');
  });

  it('updates profile preferences', async () => {
    const updated = await settingsService.updateSettings({
      profile: {
        displayName: 'Emmanuel R.',
        language: 'en',
      },
    });

    expect(updated.profile.displayName).toBe('Emmanuel R.');
    const fresh = await settingsService.getSettings();
    expect(fresh.profile.displayName).toBe('Emmanuel R.');
  });

  it('updates communication and notification toggles', async () => {
    const updated = await settingsService.updateSettings({
      communication: {
        email: true,
        sms: false,
        push: false,
        inApp: true,
      },
      notifications: {
        events: true,
        groups: false,
        ministries: true,
        prayer: true,
        pastoralCare: true,
        resources: true,
        announcements: true,
      },
    });

    expect(updated.communication.sms).toBe(false);
    expect(updated.notifications.groups).toBe(false);
    expect(updated.notifications.resources).toBe(true);
  });

  it('updates privacy and appearance settings', async () => {
    const updated = await settingsService.updateSettings({
      privacy: {
        directoryVisibility: false,
        profilePhotoVisibility: true,
      },
      appearance: {
        theme: 'dark',
      },
    });

    expect(updated.privacy.directoryVisibility).toBe(false);
    expect(updated.appearance.theme).toBe('dark');
  });

  it('validates settings schema correctly', () => {
    const validData = {
      profile: {
        displayName: 'Redeem Abban',
        language: 'en',
        preferredBranch: 'Main Branch',
      },
      communication: {
        email: true,
        sms: true,
        push: false,
        inApp: true,
      },
      notifications: {
        events: true,
        groups: true,
        ministries: true,
        prayer: true,
        pastoralCare: true,
        resources: false,
        announcements: true,
      },
      privacy: {
        directoryVisibility: true,
        profilePhotoVisibility: true,
      },
      appearance: {
        theme: 'system' as const,
      },
    };

    const parseResult = memberSettingsSchema.safeParse(validData);
    expect(parseResult.success).toBe(true);

    const invalidData = {
      ...validData,
      profile: {
        displayName: 'R', // Too short (min 2)
        language: 'en',
      },
    };

    const invalidResult = memberSettingsSchema.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);
  });
});
