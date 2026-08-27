import { z } from 'zod';

// Branch Validation Schemas
export const branchCreateSchema = z.object({
  name: z.string().min(3, 'Branch name must be at least 3 characters'),
  type: z.enum(['Headquarters', 'Branch', 'Mission', 'Outreach Center']).default('Branch'),
  established: z.string().min(4, 'Year is required'),
  
  // Contact Information
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  alternativePhone: z.string().optional(),
  
  // Address
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  
  // Leadership
  pastor: z.string().min(3, 'Pastor name is required'),
  assistantPastor: z.string().optional(),
  secretary: z.string().optional(),
  
  // Capacity
  capacity: z.string().min(1, 'Seating capacity is required'),
  currentMembers: z.string().optional(),
  
  // Additional Details
  serviceSchedule: z.string().optional(),
  facilities: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'under-construction']).default('active'),
});

export const branchUpdateSchema = branchCreateSchema.partial();

// Church Profile Validation Schema
export const churchProfileSchema = z.object({
  name: z.string().min(3, 'Church name must be at least 3 characters'),
  motto: z.string().optional(),
  vision: z.string().min(20, 'Vision statement must be at least 20 characters'),
  mission: z.string().min(20, 'Mission statement must be at least 20 characters'),
  coreValues: z.string().min(20, 'Core values must be at least 20 characters'),
  history: z.string().optional(),
  founded: z.string().optional(),
  denomination: z.string().optional(),
  
  // Contact Information
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  alternativePhone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  
  // Physical Address
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State/Province is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
  
  // Social Media
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  youtube: z.string().optional(),
  
  // Leadership
  seniorPastor: z.string().min(3, 'Senior pastor name is required'),
  assistantPastor: z.string().optional(),
  secretary: z.string().optional(),
  treasurer: z.string().optional(),
});

// User Account Validation Schemas
export const userAccountCreateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.string().min(1, 'Please select a role'),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  sendWelcomeEmail: z.boolean().default(true),
  requirePasswordChange: z.boolean().default(true),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const userAccountUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  role: z.string().min(1, 'Please select a role').optional(),
  department: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  notes: z.string().optional(),
});

// Role Validation Schemas
export const roleCreateSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  permissions: z.array(z.string()).min(1, 'Please select at least one permission'),
});

export const roleUpdateSchema = roleCreateSchema.partial();
