'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberPrayerRequest, PrayerRequestStatus } from '@/lib/types/member';
import { PrayerOverview } from './prayer-overview';
import { PrayerRequestCard } from './prayer-request-card';
import { PrayerDetailsDialog } from './prayer-details-dialog';
import { PrayerEmptyState } from './prayer-empty-state';
import { memberPrayerService } from '@/services/member';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface PrayerViewProps {
  initialRequests: MemberPrayerRequest[];
  className?: string;
}

export function PrayerView({ initialRequests, className }: PrayerViewProps) {
  const [requests, setRequests] = useState<MemberPrayerRequest[]>(initialRequests);
  const [currentTab, setCurrentTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<MemberPrayerRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    const fresh = await memberPrayerService.getMyPrayerRequests();
    setRequests(fresh);
  };

  const handleViewDetails = (req: MemberPrayerRequest) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  const handleMarkAnswered = async (req: MemberPrayerRequest, testimony?: string) => {
    try {
      const res = await memberPrayerService.markPrayerAnswered(req.id, testimony);
      toast({
        title: 'Prayer Answered',
        description: res.message,
      });
      await handleRefresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update prayer request status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (req: MemberPrayerRequest) => {
    try {
      const res = await memberPrayerService.deletePrayerRequest(req.id);
      toast({
        title: 'Request Removed',
        description: res.message,
      });
      await handleRefresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete prayer request.',
        variant: 'destructive',
      });
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (currentTab === 'praying') {
      if (r.status !== 'Praying' && r.status !== 'Submitted') return false;
    } else if (currentTab === 'answered') {
      if (r.status !== 'Answered') return false;
    }

    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Context Cards */}
      <PrayerOverview requests={requests} />

      {/* Main Filter & Tabs Section */}
      <div className="space-y-4">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs font-medium">
                All Requests ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="praying" className="text-xs font-medium">
                Active Intercession ({requests.filter((r) => r.status === 'Praying' || r.status === 'Submitted').length})
              </TabsTrigger>
              <TabsTrigger value="answered" className="text-xs font-medium">
                Answered Praises ({requests.filter((r) => r.status === 'Answered').length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search prayer title or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Health & Healing">Health & Healing</SelectItem>
                <SelectItem value="Family">Family</SelectItem>
                <SelectItem value="Work & Career">Work & Career</SelectItem>
                <SelectItem value="Finances">Finances</SelectItem>
                <SelectItem value="Thanksgiving">Thanksgiving</SelectItem>
                <SelectItem value="Spiritual Growth">Spiritual Growth</SelectItem>
                <SelectItem value="Guidance">Guidance</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Grid */}
          <div className="pt-4">
            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => (
                  <PrayerRequestCard
                    key={req.id}
                    request={req}
                    onViewDetails={handleViewDetails}
                    onMarkAnswered={(r) => handleMarkAnswered(r)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <PrayerEmptyState />
            )}
          </div>
        </Tabs>
      </div>

      {/* Details / Mark Answered Dialog */}
      <PrayerDetailsDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        request={selectedRequest}
        onMarkAnswered={handleMarkAnswered}
      />
    </div>
  );
}
