'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MemberPastoralCareRequest } from '@/lib/types/member';
import { PastoralCareOverview } from './pastoral-care-overview';
import { PastoralCareRequestCard } from './pastoral-care-request-card';
import { PastoralCareDetailsDialog } from './pastoral-care-details-dialog';
import { PastoralCareEmptyState } from './pastoral-care-empty-state';
import { memberPastoralCareService } from '@/services/member';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface PastoralCareViewProps {
  initialRequests: MemberPastoralCareRequest[];
  className?: string;
}

export function PastoralCareView({
  initialRequests,
  className,
}: PastoralCareViewProps) {
  const [requests, setRequests] =
    useState<MemberPastoralCareRequest[]>(initialRequests);
  const [currentTab, setCurrentTab] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] =
    useState<MemberPastoralCareRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    const fresh = await memberPastoralCareService.getMyPastoralCareRequests();
    setRequests(fresh);
  };

  const handleViewDetails = (req: MemberPastoralCareRequest) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  const handleCancel = async (req: MemberPastoralCareRequest) => {
    try {
      const res = await memberPastoralCareService.cancelPastoralCareRequest(req.id);
      toast({
        title: 'Request Cancelled',
        description: res.message,
      });
      await handleRefresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to cancel pastoral care request.',
        variant: 'destructive',
      });
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (currentTab === 'active') {
      if (r.status !== 'Requested' && r.status !== 'Scheduled' && r.status !== 'In Progress') {
        return false;
      }
    } else if (currentTab === 'completed') {
      if (r.status !== 'Completed') return false;
    }

    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.category.toLowerCase().includes(q) ||
        (r.reason && r.reason.toLowerCase().includes(q)) ||
        (r.summaryNotes && r.summaryNotes.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overview Context & Scheduled Appointment Banner */}
      <PastoralCareOverview requests={requests} />

      {/* Main Filter & Tabs Section */}
      <div className="space-y-4">
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="all" className="text-xs font-medium">
                All Care Requests ({requests.length})
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs font-medium">
                Active & Scheduled ({requests.filter((r) => r.status === 'Requested' || r.status === 'Scheduled' || r.status === 'In Progress').length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs font-medium">
                Completed Sessions ({requests.filter((r) => r.status === 'Completed').length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search care topics..."
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
                <SelectItem value="Counseling">Counseling</SelectItem>
                <SelectItem value="Spiritual Guidance">Spiritual Guidance</SelectItem>
                <SelectItem value="Hospital Visit">Hospital Visit</SelectItem>
                <SelectItem value="Bereavement">Bereavement</SelectItem>
                <SelectItem value="Home Visit">Home Visit</SelectItem>
                <SelectItem value="Dedication / Blessing">Dedication / Blessing</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Grid */}
          <div className="pt-4">
            {filteredRequests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRequests.map((req) => (
                  <PastoralCareRequestCard
                    key={req.id}
                    request={req}
                    onViewDetails={handleViewDetails}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            ) : (
              <PastoralCareEmptyState />
            )}
          </div>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <PastoralCareDetailsDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        request={selectedRequest}
        onCancel={handleCancel}
      />
    </div>
  );
}
