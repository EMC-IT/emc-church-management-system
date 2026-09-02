'use client';

import { useState } from 'react';
import { parseISO, format } from 'date-fns';
import { MemberJourneyMilestone, JourneyMilestoneType } from '@/lib/types/member';
import { MilestoneCard } from './milestone-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface JourneyTimelineProps {
  milestones: MemberJourneyMilestone[];
  onViewMilestoneDetails: (milestone: MemberJourneyMilestone) => void;
  className?: string;
}

const CATEGORY_FILTERS: Array<{ label: string; value: JourneyMilestoneType | 'all' }> = [
  { label: 'All Milestones', value: 'all' },
  { label: 'Spiritual & Faith', value: 'Salvation' },
  { label: 'Baptism', value: 'Baptism' },
  { label: 'Foundation Class', value: 'Foundation Class' },
  { label: 'Membership', value: 'Membership' },
  { label: 'Cell Groups', value: 'Group' },
  { label: 'Ministries', value: 'Ministry' },
  { label: 'Leadership', value: 'Leadership' },
];

export function JourneyTimeline({
  milestones,
  onViewMilestoneDetails,
  className,
}: JourneyTimelineProps) {
  const [selectedCategory, setSelectedCategory] = useState<JourneyMilestoneType | 'all'>('all');

  const filteredMilestones = milestones.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.type === selectedCategory;
  });

  // Group milestones by Year
  const groupedByYear = filteredMilestones.reduce((acc, milestone) => {
    const rawDate = milestone.date || milestone.completedDate || 'Ongoing';
    let year = 'Ongoing';
    if (rawDate !== 'Ongoing') {
      try {
        year = format(parseISO(rawDate), 'yyyy');
      } catch {
        year = 'Ongoing';
      }
    }

    if (!acc[year]) acc[year] = [];
    acc[year].push(milestone);
    return acc;
  }, {} as Record<string, MemberJourneyMilestone[]>);

  // Sort years chronologically (ascending)
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => {
    if (a === 'Ongoing') return 1;
    if (b === 'Ongoing') return -1;
    return parseInt(a, 10) - parseInt(b, 10);
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = selectedCategory === cat.value;
          return (
            <Button
              key={cat.value}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'h-8 text-xs font-medium shrink-0 rounded-full px-3.5',
                !isActive && 'text-muted-foreground hover:text-foreground'
              )}
            >
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Timeline Section */}
      {sortedYears.length > 0 ? (
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60 before:hidden sm:before:block">
          {sortedYears.map((year) => (
            <div key={year} className="space-y-3 relative">
              {/* Year Header Marker */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs shrink-0 z-10">
                  ●
                </div>
                <h3 className="font-heading font-bold text-base text-foreground">
                  {year}
                </h3>
              </div>

              {/* Milestones in this year */}
              <div className="sm:pl-10 space-y-3">
                {groupedByYear[year].map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    onViewDetails={onViewMilestoneDetails}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-muted-foreground border rounded-lg border-dashed">
          No recorded milestones found for the selected category.
        </div>
      )}
    </div>
  );
}
