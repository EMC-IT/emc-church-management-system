'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GroupCard } from './group-card';
import { GroupDetailsDialog } from './group-details-dialog';
import { GroupMeetingsCard } from './group-meetings-card';
import { GroupDiscovery } from './group-discovery';
import { GroupsEmptyState } from './groups-empty-state';
import { MemberGroup, DiscoverableGroup } from '@/lib/types/member';

export interface GroupsViewProps {
  initialMyGroups: MemberGroup[];
  initialAvailableGroups: DiscoverableGroup[];
  activeTab?: string;
}

export function GroupsView({
  initialMyGroups,
  initialAvailableGroups,
  activeTab: defaultTab = 'my-groups',
}: GroupsViewProps) {
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [selectedGroup, setSelectedGroup] = useState<MemberGroup | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (group: MemberGroup) => {
    setSelectedGroup(group);
    setIsDetailsOpen(true);
  };

  const hasJoinedGroups = initialMyGroups.length > 0;

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="my-groups" className="text-xs font-medium">
              My Groups ({initialMyGroups.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="text-xs font-medium">
              Find a Group ({initialAvailableGroups.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: My Groups */}
        <TabsContent value="my-groups" className="space-y-6 pt-4 mt-0">
          {hasJoinedGroups ? (
            <>
              {/* Groups Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {initialMyGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>

              {/* Upcoming Meetings Card */}
              <GroupMeetingsCard groups={initialMyGroups} />
            </>
          ) : (
            <GroupsEmptyState onFindGroupClick={() => setCurrentTab('discover')} />
          )}
        </TabsContent>

        {/* Tab 2: Discover / Find Groups */}
        <TabsContent value="discover" className="pt-4 mt-0">
          <GroupDiscovery availableGroups={initialAvailableGroups} />
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <GroupDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        group={selectedGroup}
      />
    </div>
  );
}
