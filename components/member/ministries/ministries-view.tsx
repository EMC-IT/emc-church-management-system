'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MinistryCard } from './ministry-card';
import { MinistryDetailsDialog } from './ministry-details-dialog';
import { MinistryAssignmentsCard } from './ministry-assignments-card';
import { MinistryDiscovery } from './ministry-discovery';
import { MinistriesEmptyState } from './ministries-empty-state';
import { MemberMinistry, DiscoverableMinistry } from '@/lib/types/member';

export interface MinistriesViewProps {
  initialMyMinistries: MemberMinistry[];
  initialAvailableMinistries: DiscoverableMinistry[];
  activeTab?: string;
}

export function MinistriesView({
  initialMyMinistries,
  initialAvailableMinistries,
  activeTab: defaultTab = 'my-ministries',
}: MinistriesViewProps) {
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [selectedMinistry, setSelectedMinistry] = useState<MemberMinistry | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (ministry: MemberMinistry) => {
    setSelectedMinistry(ministry);
    setIsDetailsOpen(true);
  };

  const hasJoinedMinistries = initialMyMinistries.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="my-ministries" className="text-xs font-medium">
              My Ministries ({initialMyMinistries.length})
            </TabsTrigger>
            <TabsTrigger value="explore" className="text-xs font-medium">
              Explore Opportunities ({initialAvailableMinistries.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: My Ministries */}
        <TabsContent value="my-ministries" className="space-y-6 pt-4 mt-0">
          {hasJoinedMinistries ? (
            <>
              {/* Ministries Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                {initialMyMinistries.map((ministry) => (
                  <MinistryCard
                    key={ministry.id}
                    ministry={ministry}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Service Assignments */}
              <MinistryAssignmentsCard ministries={initialMyMinistries} />
            </>
          ) : (
            <MinistriesEmptyState onExploreClick={() => setCurrentTab('explore')} />
          )}
        </TabsContent>

        {/* Tab 2: Explore / Volunteer Opportunities */}
        <TabsContent value="explore" className="pt-4 mt-0">
          <MinistryDiscovery availableMinistries={initialAvailableMinistries} />
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <MinistryDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        ministry={selectedMinistry}
      />
    </div>
  );
}
