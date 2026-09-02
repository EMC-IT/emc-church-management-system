'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { JoinGroupDialog } from './join-group-dialog';
import { DiscoverableGroup, GroupType, MemberGroupFilter } from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface GroupDiscoveryProps {
  availableGroups: DiscoverableGroup[];
  className?: string;
}

export function GroupDiscovery({ availableGroups, className }: GroupDiscoveryProps) {
  const [filter, setFilter] = useState<MemberGroupFilter>({
    type: 'all',
    branch: 'all',
    campus: 'all',
    meetingDay: 'all',
    search: '',
  });

  const [selectedGroupToJoin, setSelectedGroupToJoin] = useState<DiscoverableGroup | null>(null);
  const [isJoinOpen, setIsJoinOpen] = useState(false);

  const filteredGroups = availableGroups.filter((g) => {
    if (filter.type && filter.type !== 'all' && g.type !== filter.type) return false;
    const branchFilter = filter.branch || filter.campus;
    if (branchFilter && branchFilter !== 'all' && (g.branch || g.campus) !== branchFilter) return false;
    if (
      filter.meetingDay &&
      filter.meetingDay !== 'all' &&
      !g.meetingDay.toLowerCase().includes(filter.meetingDay.toLowerCase())
    )
      return false;

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const match =
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.leaderName.toLowerCase().includes(q) ||
        g.venue.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleJoinClick = (g: DiscoverableGroup) => {
    setSelectedGroupToJoin(g);
    setIsJoinOpen(true);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/40 space-y-3">
        <CardTitle className="text-base font-semibold text-foreground font-heading">
          Find a Group & Fellowship
        </CardTitle>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, area, or leader..."
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-8 h-9 text-xs"
            />
          </div>

          {/* Group Type */}
          <Select
            value={filter.type || 'all'}
            onValueChange={(val) => setFilter({ ...filter, type: val as GroupType | 'all' })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Group Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Group Types</SelectItem>
              <SelectItem value="Cell Group">Cell Group</SelectItem>
              <SelectItem value="Small Group">Small Group</SelectItem>
              <SelectItem value="Fellowship">Fellowship</SelectItem>
              <SelectItem value="Youth Fellowship">Youth Fellowship</SelectItem>
            </SelectContent>
          </Select>

          {/* Meeting Day */}
          <Select
            value={filter.meetingDay || 'all'}
            onValueChange={(val) => setFilter({ ...filter, meetingDay: val })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Meeting Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              <SelectItem value="Wednesday">Wednesday</SelectItem>
              <SelectItem value="Thursday">Thursday</SelectItem>
              <SelectItem value="Friday">Friday</SelectItem>
              <SelectItem value="Saturday">Saturday</SelectItem>
              <SelectItem value="Sunday">Sunday</SelectItem>
            </SelectContent>
          </Select>

          {/* Branch */}
          <Select
            value={filter.branch || filter.campus || 'all'}
            onValueChange={(val) => setFilter({ ...filter, branch: val, campus: val })}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              <SelectItem value="Main Branch">Main Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-border/40">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((g) => (
            <div
              key={g.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-muted/10 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground font-heading">{g.name}</h4>
                  <Badge variant="neutral" size="sm">
                    {g.type}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {g.description}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                  <span>
                    <strong className="text-foreground font-medium">{g.meetingDay}s @ {g.meetingTime}</strong>
                  </span>
                  <span>•</span>
                  <span>{g.venue}</span>
                  <span>•</span>
                  <span>Leader: {g.leaderName}</span>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleJoinClick(g)}
                  className="h-8 text-xs font-medium"
                >
                  Request to Join
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No groups match your current search and filter criteria.
          </div>
        )}
      </CardContent>

      <JoinGroupDialog
        open={isJoinOpen}
        onOpenChange={setIsJoinOpen}
        group={selectedGroupToJoin}
      />
    </Card>
  );
}
