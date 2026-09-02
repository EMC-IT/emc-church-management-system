'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberMinistry } from '@/lib/types/member';
import { useToast } from '@/hooks/use-toast';

export interface MinistryDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministry: MemberMinistry | null;
}

export function MinistryDetailsDialog({
  open,
  onOpenChange,
  ministry,
}: MinistryDetailsDialogProps) {
  const { toast } = useToast();
  if (!ministry) return null;

  const initials = ministry.leader.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleContactLeader = () => {
    toast({
      title: 'Message Sent to Ministry Lead',
      description: `A contact notification has been forwarded to ${ministry.leader.name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              {ministry.category}
            </Badge>
            <StatusBadge status={ministry.status} size="sm" />
          </div>
          <DialogTitle className="text-lg font-bold">{ministry.name}</DialogTitle>
          <DialogDescription className="text-xs">
            {ministry.branch || ministry.campus} • Serving since {new Date(ministry.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* About Ministry */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              About
            </span>
            <p className="text-muted-foreground leading-relaxed">{ministry.description}</p>
          </div>

          {/* Assigned Roles */}
          <div className="space-y-1.5 pt-1">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
              Your Active Roles
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ministry.myRoles.map((role) => (
                <Badge key={role} variant="neutral" size="sm">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Service Schedule & Reporting */}
          <div className="p-3.5 rounded-lg border border-border/40 space-y-2 bg-muted/20">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
              Service & Rehearsal Schedule
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              <div className="sm:col-span-2">
                <span className="text-muted-foreground block text-[11px]">Service</span>
                <span className="font-medium text-foreground">
                  {ministry.schedule.serviceName} ({ministry.schedule.serviceTime})
                </span>
              </div>
              {ministry.schedule.callTime && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Call / Report Time</span>
                  <span className="font-medium text-foreground">{ministry.schedule.callTime}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block text-[11px]">Venue</span>
                <span className="font-medium text-foreground">{ministry.schedule.venue}</span>
              </div>
            </div>
          </div>

          {/* Leadership Contact Card */}
          <div className="p-3.5 rounded-lg border border-border/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {ministry.leader.avatarUrl && (
                  <AvatarImage src={ministry.leader.avatarUrl} alt={ministry.leader.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-[10px] text-muted-foreground block">{ministry.leader.title}</span>
                <h4 className="font-semibold text-foreground text-sm">{ministry.leader.name}</h4>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleContactLeader}
              className="h-8 text-xs font-medium"
            >
              Contact Leader
            </Button>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border/40">
          <Button type="button" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
