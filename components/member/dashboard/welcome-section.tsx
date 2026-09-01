'use client';

import { useMemo } from 'react';
import { MemberProfile } from '@/lib/types/member';
import { MemberAvatar } from '@/components/member/shared/member-avatar';
import { MemberStatus } from '@/components/member/shared/member-status';
import { Calendar, Church } from 'lucide-react';

export interface WelcomeSectionProps {
  profile: MemberProfile;
}

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function WelcomeSection({ profile }: WelcomeSectionProps) {
  const greeting = useMemo(() => getTimeGreeting(), []);
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div className="flex items-center gap-3.5 min-w-0">
        <MemberAvatar
          name={profile.displayName}
          avatarUrl={profile.avatarUrl}
          size="lg"
          className="shrink-0 ring-2 ring-primary/20"
        />
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
              {greeting}, {profile.firstName} 👋
            </h1>
            <MemberStatus status={profile.membershipStatus} />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">
            Welcome back to your church home. Here&apos;s what&apos;s happening this week.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground self-start sm:self-center shrink-0">
        <div className="flex items-center gap-1.5 bg-card text-card-foreground border border-border shadow-xs px-3 py-1.5 rounded-lg">
          <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          <span className="font-medium text-foreground">{todayFormatted}</span>
        </div>
      </div>
    </div>
  );
}
