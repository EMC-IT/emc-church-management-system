import { z } from 'zod';

export const currencySchema = z.enum(['GHS', 'USD', 'EUR', 'GBP', 'NGN']).default('GHS');

export const titheOfferingCreateSchema = z.object({
  memberId: z.string().optional(),
  memberName: z.string().min(1, 'Member or donor name is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: currencySchema,
  titheType: z.string().min(1, 'Giving type is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  serviceDate: z.string().min(1, 'Service date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
  branch: z.string().optional(),
  branchId: z.string().optional(),
});

export const titheOfferingUpdateSchema = titheOfferingCreateSchema.partial();

export const expenseCreateSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  category: z.string().min(1, 'Category is required'),
  categoryName: z.string().optional(),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: currencySchema,
  date: z.string().min(1, 'Date is required'),
  vendor: z.string().min(1, 'Vendor is required'),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  receiptNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  department: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
  branchId: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const donationCreateSchema = z.object({
  donorName: z.string().min(1, 'Donor name is required'),
  donorEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  donorPhone: z.string().optional(),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: currencySchema,
  category: z.string().min(1, 'Category is required'),
  method: z.string().min(1, 'Method is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  receiptNumber: z.string().optional(),
  branchId: z.string().optional(),
});

export const donationUpdateSchema = donationCreateSchema.partial();

export const pledgeCreateSchema = z.object({
  memberId: z.string().optional(),
  memberName: z.string().min(1, 'Member name is required'),
  campaignId: z.string().min(1, 'Campaign or project is required'),
  campaignName: z.string().optional(),
  totalAmount: z.number().positive('Pledge amount must be positive'),
  currency: currencySchema,
  frequency: z.enum(['One-Time', 'Weekly', 'Monthly', 'Quarterly']).default('Monthly'),
  installmentAmount: z.number().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  notes: z.string().optional(),
  branchId: z.string().optional(),
});

export const pledgeUpdateSchema = pledgeCreateSchema.partial();

export const fundraisingCampaignCreateSchema = z.object({
  title: z.string().min(3, 'Campaign title is required'),
  goalAmount: z.number().positive('Goal amount must be greater than zero'),
  currency: currencySchema,
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Active', 'Upcoming', 'Completed', 'Paused']).default('Active'),
  branchId: z.string().optional(),
});

export const fundraisingCampaignUpdateSchema = fundraisingCampaignCreateSchema.partial();

export const incomeCreateSchema = z.object({
  source: z.string().min(2, 'Income source name is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  currency: currencySchema,
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  referenceNumber: z.string().optional(),
  branchId: z.string().optional(),
});

export const incomeUpdateSchema = incomeCreateSchema.partial();

export const budgetCreateSchema = z.object({
  name: z.string().min(2, 'Budget name is required'),
  period: z.string().min(1, 'Period is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  category: z.string().min(1, 'Category is required'),
  categoryName: z.string().optional(),
  department: z.string().min(1, 'Department is required'),
  amount: z.number().positive('Budget allocation amount must be positive'),
  currency: currencySchema,
  description: z.string().optional(),
  owner: z.string().optional(),
  branchId: z.string().optional(),
});

export const budgetUpdateSchema = budgetCreateSchema.partial();

export const financialCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional(),
  type: z.enum(['Income', 'Expense', 'Tithe', 'Offering', 'Donation', 'Budget']),
  isActive: z.boolean().default(true),
});

export type TitheOfferingCreateInput = z.infer<typeof titheOfferingCreateSchema>;
export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type DonationCreateInput = z.infer<typeof donationCreateSchema>;
export type PledgeCreateInput = z.infer<typeof pledgeCreateSchema>;
export type FundraisingCampaignCreateInput = z.infer<typeof fundraisingCampaignCreateSchema>;
export type IncomeCreateInput = z.infer<typeof incomeCreateSchema>;
export type BudgetCreateInput = z.infer<typeof budgetCreateSchema>;
