import { z } from 'zod';
import { AssetCategory, AssetStatus, AssetCondition, AssetPriority } from '../types/assets';

export const assetCreateSchema = z.object({
  name: z.string().min(2, 'Asset name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.nativeEnum(AssetCategory),
  status: z.nativeEnum(AssetStatus).default(AssetStatus.ACTIVE),
  condition: z.nativeEnum(AssetCondition).default(AssetCondition.GOOD),
  priority: z.nativeEnum(AssetPriority).default(AssetPriority.MEDIUM),
  purchasePrice: z.number().nonnegative('Purchase price must be non-negative'),
  currentValue: z.number().nonnegative('Current value must be non-negative'),
  depreciationRate: z.number().min(0).max(100).optional(),
  currency: z.string().default('GHS'),
  location: z.string().min(1, 'Location is required'),
  assignedDepartment: z.string().optional(),
  assignedTo: z.string().optional(),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  warrantyExpiry: z.string().optional(),
  serialNumber: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
});

export const assetUpdateSchema = assetCreateSchema.partial();

export const assetMaintenanceSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  maintenanceType: z.enum(['Preventive', 'Corrective', 'Inspection', 'Emergency']).default('Preventive'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  performedDate: z.string().optional(),
  cost: z.number().nonnegative().optional(),
  currency: z.string().default('GHS'),
  serviceProvider: z.string().min(2, 'Service provider name is required'),
  description: z.string().min(5, 'Maintenance description is required'),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).default('Scheduled'),
});

export const assetAssignmentSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  assignedTo: z.string().min(1, 'Assignee is required'),
  assignedDepartment: z.string().optional(),
  assignmentDate: z.string().min(1, 'Assignment date is required'),
  expectedReturnDate: z.string().optional(),
  conditionOnAssignment: z.nativeEnum(AssetCondition).default(AssetCondition.GOOD),
  notes: z.string().optional(),
});

export const assetCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  code: z.string().min(1, 'Category code is required'),
  description: z.string().optional(),
  defaultDepreciationRate: z.number().min(0).max(100).optional(),
});

export type AssetCreateInput = z.infer<typeof assetCreateSchema>;
export type AssetUpdateInput = z.infer<typeof assetUpdateSchema>;
export type AssetMaintenanceInput = z.infer<typeof assetMaintenanceSchema>;
export type AssetAssignmentInput = z.infer<typeof assetAssignmentSchema>;
