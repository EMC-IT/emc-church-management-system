import { z } from 'zod';

export const givingCategoryEnum = z.enum([
  'Tithe',
  'Offering',
  'Building Fund',
  'Missions',
  'Welfare',
  'Thanksgiving',
  'Special Seed',
  'Other',
]);

export const givingPaymentMethodEnum = z.enum([
  'Mobile Money',
  'Card',
  'Bank Transfer',
]);

export const giveNowSchema = z.object({
  amount: z
    .coerce
    .number({
      required_error: 'Please enter a giving amount',
      invalid_type_error: 'Amount must be a valid number',
    })
    .positive('Amount must be greater than 0')
    .min(1, 'Minimum giving amount is GH₵ 1.00')
    .max(100000, 'Amount exceeds single transaction limit'),
  category: givingCategoryEnum,
  paymentMethod: givingPaymentMethodEnum,
  note: z.string().max(200, 'Note cannot exceed 200 characters').optional(),
  phone: z.string().optional(),
});

export type GiveNowFormData = z.infer<typeof giveNowSchema>;
