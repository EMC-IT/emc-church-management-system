import { describe, it, expect } from 'vitest';
import {
  memberCreateSchema,
  titheOfferingCreateSchema,
  expenseCreateSchema,
  attendanceRecordSchema,
  loginSchema,
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
});
