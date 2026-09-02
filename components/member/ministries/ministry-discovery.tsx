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
import { ServeInterestDialog } from './serve-interest-dialog';
import {
  DiscoverableMinistry,
  MinistryCategory,
  MemberMinistryFilter,
} from '@/lib/types/member';
import { cn } from '@/lib/utils';

export interface MinistryDiscoveryProps {
  availableMinistries: DiscoverableMinistry[];
  className?: string;
}

export function MinistryDiscovery({ availableMinistries, className }: MinistryDiscoveryProps) {
  const [filter, setFilter] = useState<MemberMinistryFilter>({
    category: 'all',
    branch: 'all',
    campus: 'all',
    search: '',
  });

  const [selectedMinistry, setSelectedMinistry] = useState<DiscoverableMinistry | null>(null);
  const [isServeOpen, setIsServeOpen] = useState(false);

  const filteredMinistries = availableMinistries.filter((m) => {
    if (filter.category && filter.category !== 'all' && m.category !== filter.category) return false;
    const branchFilter = filter.branch || filter.campus;
    if (branchFilter && branchFilter !== 'all' && (m.branch || m.campus) !== branchFilter) return false;

    if (filter.search && filter.search.trim()) {
      const q = filter.search.toLowerCase();
      const match =
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.leaderName.toLowerCase().includes(q) ||
        m.openRoles.some((r) => r.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleServeClick = (m: DiscoverableMinistry) => {
    setSelectedMinistry(m);
    setIsServeOpen(true);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="p-4 sm:p-5 border-b border-border/40 space-y-3">
        <CardTitle className="text-base font-semibold text-foreground font-heading">
          Explore Ministry Opportunities
        </CardTitle>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search ministry or role..."
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-8 h-9 text-xs"
            />
          </div>

          {/* Category */}
          <Select
            value={filter.category || 'all'}
            onValueChange={(val) =>
              setFilter({ ...filter, category: val as MinistryCategory | 'all' })
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Ministry Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ministry Areas</SelectItem>
              <SelectItem value="Worship & Creative Arts">Worship & Creative Arts</SelectItem>
              <SelectItem value="Media & Tech">Media & Tech</SelectItem>
              <SelectItem value="Ushering & Protocol">Ushering & Protocol</SelectItem>
              <SelectItem value="Children Ministry">Children Ministry</SelectItem>
              <SelectItem value="Youth & Campus">Youth & Campus</SelectItem>
              <SelectItem value="Evangelism & Missions">Evangelism & Missions</SelectItem>
              <SelectItem value="Prayer & Intercession">Prayer & Intercession</SelectItem>
              <SelectItem value="Hospitality & Welfare">Hospitality & Welfare</SelectItem>
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
        {filteredMinistries.length > 0 ? (
          filteredMinistries.map((m) => (
            <div
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-muted/10 transition-colors"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-foreground font-heading">{m.name}</h4>
                  <Badge variant="neutral" size="sm">
                    {m.category}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {m.description}
                </p>

                {/* Open Roles & Schedule */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                  <span>
                    Open Roles: <strong className="text-foreground font-medium">{m.openRoles.join(', ')}</strong>
                  </span>
                  <span>•</span>
                  <span>{m.serviceTime}</span>
                  <span>•</span>
                  <span>Lead: {m.leaderName} ({m.leaderTitle})</span>
                </div>
              </div>

              <div className="shrink-0 self-start sm:self-center">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleServeClick(m)}
                  className="h-8 text-xs font-medium"
                >
                  Express Interest
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No ministries match your current search and filter criteria.
          </div>
        )}
      </CardContent>

      <ServeInterestDialog
        open={isServeOpen}
        onOpenChange={setIsServeOpen}
        ministry={selectedMinistry}
      />
    </Card>
  );
}
