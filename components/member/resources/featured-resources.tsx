'use client';

import { MemberResource } from '@/lib/types/member';
import { ResourceCard } from './resource-card';
import { cn } from '@/lib/utils';

export interface FeaturedResourcesProps {
  resources: MemberResource[];
  onViewDetails: (resource: MemberResource) => void;
  className?: string;
}

export function FeaturedResources({
  resources,
  onViewDetails,
  className,
}: FeaturedResourcesProps) {
  if (!resources || resources.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold font-heading text-foreground">
          Featured & Recommended Studies
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
