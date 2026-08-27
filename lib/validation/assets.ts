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

export type AssetCreateInput = z.infer<typeof assetCreateSchema>;
export type AssetUpdateInput = z.infer<typeof assetUpdateSchema>;
