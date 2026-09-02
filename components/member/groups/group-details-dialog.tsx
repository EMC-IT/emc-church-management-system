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
import { MemberGroup } from '@/lib/types/member';
import { useToast } from '@/hooks/use-toast';

export interface GroupDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: MemberGroup | null;
}

export function GroupDetailsDialog({
  open,
  onOpenChange,
  group,
}: GroupDetailsDialogProps) {
  const { toast } = useToast();
  if (!group) return null;

  const initials = group.leader.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleContactLeader = () => {
    toast({
      title: 'Message Sent to Leader',
      description: `A contact notification has been forwarded to ${group.leader.name}.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border/40 pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" size="sm">
              {group.type}
            </Badge>
            <StatusBadge status={group.membershipStatus} size="sm" />
          </div>
          <DialogTitle className="text-lg font-bold">{group.name}</DialogTitle>
          <DialogDescription className="text-xs">
            {group.branch || group.campus} • Joined on {new Date(group.joinedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* About Section */}
          <div className="space-y-1">
            <span className="font-semibold text-foreground uppercase tracking-wider text-[11px] block">
              About
            </span>
            <p className="text-muted-foreground leading-relaxed">{group.description}</p>
          </div>

          {/* Meeting Schedule & Venue */}
          <div className="p-3.5 rounded-lg border border-border/40 space-y-2 bg-muted/20">
            <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
              Meeting Schedule & Venue
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
              <div>
                <span className="text-muted-foreground block text-[11px]">Time</span>
                <span className="font-medium text-foreground">
                  {group.schedule.dayOfWeek} @ {group.schedule.time}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Frequency</span>
                <span className="font-medium text-foreground">{group.schedule.frequency}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground block text-[11px]">Venue</span>
                <span className="font-medium text-foreground">
                  {group.schedule.venue}
                  {group.schedule.address && ` (${group.schedule.address})`}
                </span>
              </div>
            </div>
          </div>

          {/* Leadership & Contact */}
          <div className="p-3.5 rounded-lg border border-border/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {group.leader.avatarUrl && <AvatarImage src={group.leader.avatarUrl} alt={group.leader.name} />}
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <span className="text-[10px] text-muted-foreground block">{group.leader.role}</span>
                <h4 className="font-semibold text-foreground text-sm">{group.leader.name}</h4>
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

          {/* Membership Info */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 text-xs">
            <span className="text-muted-foreground">
              Your Role: <strong className="text-foreground font-medium">{group.myRole}</strong>
            </span>
            <span className="text-muted-foreground">
              Members: <strong className="text-foreground font-medium">{group.membersCount}</strong>
            </span>
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
