import { describe, it, expect } from 'vitest';
import {
  memberProfileSchema,
  familyMemberSchema,
  prayerRequestSchema,
  pastoralCareRequestSchema,
  eventRegistrationSchema,
  notificationPreferencesSchema,
  memberPasswordChangeSchema,
} from '@/lib/validation/member';
import {
  MEMBER_PERMISSIONS,
  hasMemberPermission,
  assertMemberPermission,
} from '@/lib/authorization';
import {
  memberProfileService,
  memberFamilyService,
  memberAttendanceService,
  memberGivingService,
  memberGroupsService,
  memberMinistriesService,
  memberEventsService,
  memberJourneyService,
  memberPrayerService,
  memberPastoralCareService,
  memberResourcesService,
  memberNotificationsService,
} from '@/services/member';

describe('Member Portal Foundation — Validation Schemas', () => {
  it('validates a correct member profile schema', () => {
    const validProfile = {
      firstName: 'Redeem',
      lastName: 'Abban',
      displayName: 'Redeem Abban',
      email: 'redeem.abban@example.com',
      phone: '+233 24 123 4567',
    };
    const result = memberProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid member profile with bad email', () => {
    const invalidProfile = {
      firstName: 'Redeem',
      lastName: 'Abban',
      displayName: 'Redeem Abban',
      email: 'invalid-email',
      phone: '123',
    };
    const result = memberProfileSchema.safeParse(invalidProfile);
    expect(result.success).toBe(false);
  });

  it('validates a family member entry', () => {
    const validFamily = {
      firstName: 'Joy',
      lastName: 'Abban',
      relationship: 'Spouse',
      isRegisteredMember: true,
      canManagePermissions: true,
    };
    const result = familyMemberSchema.safeParse(validFamily);
    expect(result.success).toBe(true);
  });

  it('validates a prayer request', () => {
    const validPrayer = {
      title: 'Family health and restoration',
      category: 'Health & Healing',
      description: 'Kindly uphold my family in prayers this week.',
      privacy: 'Pastoral Team Only',
      isUrgent: false,
    };
    const result = prayerRequestSchema.safeParse(validPrayer);
    expect(result.success).toBe(true);
  });

  it('validates a pastoral care request', () => {
    const validCare = {
      category: 'Counseling',
      preferredMode: 'In-Person',
      reason: 'Need spiritual guidance regarding a major life transition.',
      isUrgent: false,
    };
    const result = pastoralCareRequestSchema.safeParse(validCare);
    expect(result.success).toBe(true);
  });

  it('validates event registration and requires terms agreement', () => {
    const validRegistration = {
      eventId: 'evt-001',
      attendeeName: 'Redeem Abban',
      attendeeEmail: 'redeem@example.com',
      attendeePhone: '+233241234567',
      numberOfTickets: 2,
      agreeToTerms: true,
    };
    const result = eventRegistrationSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);

    const invalidRegistration = {
      ...validRegistration,
      agreeToTerms: false,
    };
    const invalidResult = eventRegistrationSchema.safeParse(invalidRegistration);
    expect(invalidResult.success).toBe(false);
  });

  it('validates password change confirmation match', () => {
    const validPasswordChange = {
      currentPassword: 'oldPassword123',
      newPassword: 'StrongPassword1',
      confirmPassword: 'StrongPassword1',
    };
    expect(memberPasswordChangeSchema.safeParse(validPasswordChange).success).toBe(true);

    const mismatchedPasswordChange = {
      currentPassword: 'oldPassword123',
      newPassword: 'StrongPassword1',
      confirmPassword: 'DifferentPassword1',
    };
    expect(memberPasswordChangeSchema.safeParse(mismatchedPasswordChange).success).toBe(false);
  });
});

describe('Member Portal Foundation — Authorization & Permissions', () => {
  it('correctly verifies member self permissions', () => {
    const permissions = [
      MEMBER_PERMISSIONS.PROFILE_READ_SELF,
      MEMBER_PERMISSIONS.GIVING_READ_SELF,
      MEMBER_PERMISSIONS.PRAYER_CREATE,
    ];

    expect(hasMemberPermission(permissions, MEMBER_PERMISSIONS.PROFILE_READ_SELF)).toBe(true);
    expect(hasMemberPermission(permissions, MEMBER_PERMISSIONS.EVENTS_REGISTER)).toBe(false);
  });

  it('asserts member permission without throwing when granted', () => {
    const permissions = [MEMBER_PERMISSIONS.JOURNEY_READ_SELF];
    expect(() =>
      assertMemberPermission(permissions, MEMBER_PERMISSIONS.JOURNEY_READ_SELF)
    ).not.toThrow();
  });

  it('throws authorization error when required member permission is missing', () => {
    const permissions = [MEMBER_PERMISSIONS.PROFILE_READ_SELF];
    expect(() =>
      assertMemberPermission(permissions, MEMBER_PERMISSIONS.GIVING_READ_SELF)
    ).toThrow();
  });
});

describe('Member Portal Foundation — Service Abstractions', () => {
  it('returns current member profile and updates successfully', async () => {
    const profile = await memberProfileService.getCurrentProfile();
    expect(profile).toBeDefined();
    expect(profile.firstName).toBe('Bismark');

    const updated = await memberProfileService.updateProfile({ alternatePhone: '+233 50 111 2222' });
    expect(updated.alternatePhone).toBe('+233 50 111 2222');
  });

  it('returns family details and attendance summary', async () => {
    const family = await memberFamilyService.getFamily();
    expect(family.members.length).toBeGreaterThanOrEqual(1);

    const attendance = await memberAttendanceService.getAttendanceSummary();
    expect(attendance.attendanceRatePercentage).toBeGreaterThan(0);
    expect(attendance.recentRecords.length).toBeGreaterThan(0);
  });

  it('returns giving summary and tax statements', async () => {
    const giving = await memberGivingService.getGivingSummary();
    expect(giving.yearToDateTotal).toBeGreaterThan(0);

    const statements = await memberGivingService.getTaxStatements();
    expect(statements.length).toBeGreaterThan(0);
  });

  it('handles event registration and cancellations', async () => {
    const events = await memberEventsService.getUpcomingEvents();
    expect(events.length).toBeGreaterThan(0);

    const registered = await memberEventsService.registerForEvent('evt-003');
    expect(registered.registrationStatus).toBe('Registered');
  });

  it('handles prayer requests and notifications', async () => {
    const newPrayer = await memberPrayerService.createPrayerRequest({
      title: 'Guidance for new business venture',
      category: 'Career & Business',
      description: 'Praying for open doors and divine direction.',
      privacy: 'Pastoral Team Only',
      isUrgent: false,
    });
    expect(newPrayer.id).toBeDefined();
    expect(newPrayer.status).toBe('Submitted');

    const notifs = await memberNotificationsService.getNotifications();
    expect(notifs.length).toBeGreaterThan(0);
  });
});
