import { describe, it, expect } from 'vitest';
import {
  memberCreateSchema,
  memberFullFormSchema,
  newConvertSchema,
  titheOfferingCreateSchema,
  expenseCreateSchema,
  attendanceRecordSchema,
  loginSchema,
  prayerRequestCreateSchema,
  branchCreateSchema,
  churchProfileSchema,
  userAccountCreateSchema,
  roleCreateSchema,
  pledgeCreateSchema,
  fundraisingCampaignCreateSchema,
  teacherCreateSchema,
  assetMaintenanceSchema,
} from '../../lib/validation';

describe('Centralized Runtime Zod Validation', () => {
  it('loginSchema should validate valid emails and minimum passwords', () => {
    const valid = loginSchema.safeParse({ email: 'pastor@church.com', password: 'password123' });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = loginSchema.safeParse({ email: 'pastor@church.com', password: '123' });
    expect(shortPassword.success).toBe(false);
  });

  it('memberCreateSchema should enforce required fields and valid gender', () => {
    const valid = memberCreateSchema.safeParse({
      firstName: 'Emmanuel',
      lastName: 'Agyemang',
      phone: '+233241234567',
      gender: 'Male',
      membershipStatus: 'Active',
    });
    expect(valid.success).toBe(true);

    const missingName = memberCreateSchema.safeParse({
      phone: '+233241234567',
      gender: 'Male',
    });
    expect(missingName.success).toBe(false);
  });

  it('memberFullFormSchema should enforce all required fields and valid enums', () => {
    const valid = memberFullFormSchema.safeParse({
      title: 'Mr.',
      fullName: 'Kwame Mensah',
      branch: 'Adenta (HQ)',
      serviceType: 'Empowerment',
      status: 'Member',
      contact1: '+233241234567',
      gender: 'Male',
      ageGroup: 'Adult',
      location: 'East Legon, Accra',
      waterBaptism: 'Yes',
      holyGhostBaptism: 'No',
    });
    expect(valid.success).toBe(true);

    const missingRequired = memberFullFormSchema.safeParse({
      fullName: '',
      contact1: '',
      gender: 'Male',
    });
    expect(missingRequired.success).toBe(false);
  });

  it('newConvertSchema should enforce required convert fields', () => {
    const valid = newConvertSchema.safeParse({
      fullName: 'Grace Mensah',
      contact1: '+233241234567',
      gender: 'Female',
      branch: 'Adenta (HQ)',
      serviceType: 'Empowerment',
      status: 'Member',
      location: 'Accra',
    });
    expect(valid.success).toBe(true);

    const invalid = newConvertSchema.safeParse({
      fullName: 'G',
      contact1: '123',
    });
    expect(invalid.success).toBe(false);
  });

  it('expenseCreateSchema should enforce positive monetary amounts and required categories', () => {
    const valid = expenseCreateSchema.safeParse({
      title: 'Sound System Cables',
      category: 'cat_media',
      amount: 450.0,
      currency: 'GHS',
      date: '2026-08-27',
      vendor: 'Accra Sound Tech',
      paymentMethod: 'Mobile Money',
    });
    expect(valid.success).toBe(true);

    const negativeAmount = expenseCreateSchema.safeParse({
      title: 'Sound System Cables',
      category: 'cat_media',
      amount: -50,
      currency: 'GHS',
      date: '2026-08-27',
      vendor: 'Accra Sound Tech',
      paymentMethod: 'Mobile Money',
    });
    expect(negativeAmount.success).toBe(false);
  });

  it('attendanceRecordSchema should validate status enum and required identifiers', () => {
    const valid = attendanceRecordSchema.safeParse({
      memberId: 'mem_123',
      serviceType: 'Sunday Service',
      serviceDate: '2026-08-27',
      status: 'Present',
    });
    expect(valid.success).toBe(true);

    const invalidStatus = attendanceRecordSchema.safeParse({
      memberId: 'mem_123',
      serviceType: 'Sunday Service',
      serviceDate: '2026-08-27',
      status: 'UNKNOWN_STATUS',
    });
    expect(invalidStatus.success).toBe(false);
  });

  it('prayerRequestCreateSchema should validate length constraints and defaults', () => {
    const valid = prayerRequestCreateSchema.safeParse({
      title: 'Prayer for healing',
      description: 'Requesting prayers for quick recovery from malaria',
      category: 'healing',
      priority: 'High',
    });
    expect(valid.success).toBe(true);

    const shortDesc = prayerRequestCreateSchema.safeParse({
      title: 'Prayer for healing',
      description: 'Too short',
      category: 'healing',
    });
    expect(shortDesc.success).toBe(false);
  });

  it('branchCreateSchema and churchProfileSchema should validate settings fields', () => {
    const validBranch = branchCreateSchema.safeParse({
      name: 'Accra Main Campus',
      established: '2015',
      email: 'accra@emc.org',
      phone: '+233241234567',
      street: '123 Independence Ave',
      city: 'Accra',
      state: 'Greater Accra',
      postalCode: 'GA-123-4567',
      country: 'Ghana',
      pastor: 'Pastor Emmanuel',
      capacity: '1500',
    });
    expect(validBranch.success).toBe(true);

    const validChurchProfile = churchProfileSchema.safeParse({
      name: 'Emmanuel Methodist Church',
      vision: 'To be a vibrant Christ-centered church transforming nations.',
      mission: 'Preaching the gospel of Jesus Christ and discipling believers.',
      coreValues: 'Faith, Integrity, Compassion, Excellence, and Fellowship.',
      email: 'info@emc.org',
      phone: '+233302123456',
      street: 'Church Street, Adabraka',
      city: 'Accra',
      state: 'Greater Accra',
      postalCode: '00233',
      country: 'Ghana',
      seniorPastor: 'Rev. Dr. Mensah',
    });
    expect(validChurchProfile.success).toBe(true);
  });

  it('userAccountCreateSchema should enforce password matching', () => {
    const valid = userAccountCreateSchema.safeParse({
      firstName: 'Daniel',
      lastName: 'Kofi',
      email: 'daniel@emc.org',
      username: 'dkofi',
      password: 'strongPassword123',
      confirmPassword: 'strongPassword123',
      role: 'Admin',
    });
    expect(valid.success).toBe(true);

    const mismatched = userAccountCreateSchema.safeParse({
      firstName: 'Daniel',
      lastName: 'Kofi',
      email: 'daniel@emc.org',
      username: 'dkofi',
      password: 'strongPassword123',
      confirmPassword: 'differentPassword123',
      role: 'Admin',
    });
    expect(mismatched.success).toBe(false);
  });

  it('roleCreateSchema should enforce at least one permission', () => {
    const valid = roleCreateSchema.safeParse({
      name: 'Finance Auditor',
      description: 'Audit and review all financial records and ledger entries',
      permissions: ['finance.view', 'finance.reports.view'],
    });
    expect(valid.success).toBe(true);

    const emptyPerms = roleCreateSchema.safeParse({
      name: 'Finance Auditor',
      description: 'Audit and review all financial records and ledger entries',
      permissions: [],
    });
    expect(emptyPerms.success).toBe(false);
  });
});
