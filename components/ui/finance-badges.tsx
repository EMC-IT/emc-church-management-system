import * as React from 'react';

import { Badge, type BadgeVariant } from '@/components/ui/badge';
import { GivingCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const givingTypeVariants: Record<string, BadgeVariant> = {
  Tithe: 'primary',
  Offering: 'info',
  'First Fruits': 'warning',
  'Special Offering': 'success',
};

const givingTypeLabels: Record<string, string> = {
  'Special Offering': 'Special',
};

export function GivingTypeBadge({ type }: { type: string }) {
  return (
    <Badge variant={givingTypeVariants[type] ?? 'neutral'}>
      {givingTypeLabels[type] ?? type}
    </Badge>
  );
}

const givingCategoryVariants: Partial<Record<GivingCategory, BadgeVariant>> = {
  [GivingCategory.BUILDING_FUND]: 'warning',
  [GivingCategory.MISSIONARY]: 'info',
  [GivingCategory.YOUTH]: 'info',
  [GivingCategory.CHILDREN]: 'primary',
  [GivingCategory.MUSIC]: 'success',
  [GivingCategory.OUTREACH]: 'primary',
  [GivingCategory.CHARITY]: 'danger',
  [GivingCategory.EDUCATION]: 'warning',
  [GivingCategory.MEDICAL]: 'success',
  [GivingCategory.DISASTER_RELIEF]: 'danger',
};

export function GivingCategoryBadge({ category }: { category: GivingCategory }) {
  return (
    <Badge variant={givingCategoryVariants[category] ?? 'neutral'} className="capitalize">
      {String(category).replace(/_/g, ' ').toLowerCase()}
    </Badge>
  );
}

const givingFrequencyVariants: Record<string, BadgeVariant> = {
  weekly: 'success',
  monthly: 'primary',
  quarterly: 'warning',
  annual: 'info',
};

export function GivingFrequencyBadge({ frequency }: { frequency: string }) {
  return (
    <Badge
      variant={givingFrequencyVariants[frequency.toLowerCase()] ?? 'neutral'}
      className="capitalize"
    >
      {frequency}
    </Badge>
  );
}

export function PaymentMethodBadge({
  method,
  className,
}: {
  method: string;
  className?: string;
}) {
  return (
    <Badge variant="neutral" className={cn('capitalize', className)}>
      {method.replace(/_/g, ' ')}
    </Badge>
  );
}
