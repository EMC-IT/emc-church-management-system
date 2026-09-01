import { MemberProfile } from './member-profile';
import { MemberAttendanceSummary } from './member-attendance';
import { MemberGivingSummary } from './member-giving';
import { MemberEvent } from './member-event';
import { MemberPrayerRequest } from './member-prayer';
import { MemberSpiritualJourney, MemberJourneyMilestone } from './member-journey';
import { MemberNotification } from './member-notification';
import { MemberGroup, MemberMinistry } from './member-group';

export type AttentionItemType = 'event' | 'care' | 'group' | 'announcement' | 'giving';
export type AttentionUrgency = 'high' | 'medium' | 'low';

export interface DashboardAttentionItem {
  id: string;
  title: string;
  description: string;
  type: AttentionItemType;
  urgency: AttentionUrgency;
  actionLabel?: string;
  actionHref?: string;
  date?: string;
}

export interface DashboardQuickAction {
  id: string;
  label: string;
  href: string;
  iconName: 'giving' | 'events' | 'prayer' | 'care' | 'group' | 'profile' | 'resources';
  description?: string;
}

export type ActivityCategory = 'attendance' | 'event' | 'giving' | 'prayer' | 'journey' | 'group' | 'care';

export interface MemberActivityItem {
  id: string;
  title: string;
  category: ActivityCategory;
  timestamp: string;
  relativeTime: string;
  details?: string;
  actionHref?: string;
}

export interface DailyVerse {
  verse: string;
  citation: string;
  devotionalHref?: string;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'class' | 'fellowship' | 'project' | 'general';
}

export interface DashboardGivingSummaryWidget {
  totalYtd: number;
  currency: string;
  yearComparisonPercent: number;
  goalProgressPercent: number;
  recentTransactions: {
    id: string;
    date: string;
    type: string;
    amount: number;
    status: string;
  }[];
}

export interface DashboardStatCards {
  membership: {
    status: string;
    since: string;
  };
  ministry: {
    name: string;
    subtitle: string;
  };
  events: {
    count: number;
    subtitle: string;
  };
  giving: {
    amount: string;
    subtitle: string;
  };
}

export interface MemberDashboardData {
  profile: MemberProfile;
  attentionItems: DashboardAttentionItem[];
  quickActions: DashboardQuickAction[];
  upcomingEvents: MemberEvent[];
  primaryGroup?: MemberGroup | null;
  primaryMinistry?: MemberMinistry | null;
  ministries: MemberMinistry[];
  journey: MemberSpiritualJourney;
  recentNotifications: MemberNotification[];
  recentActivity: MemberActivityItem[];
  attendanceSummary: MemberAttendanceSummary;
  givingSummary: MemberGivingSummary;
  dailyVerse: DailyVerse;
  announcements: DashboardAnnouncement[];
  givingWidget: DashboardGivingSummaryWidget;
  statCards: DashboardStatCards;
  quickStats: {
    attendanceStreakWeeks: number;
    activeGroupsCount: number;
    activeMinistriesCount: number;
    unansweredPrayerCount: number;
  };
}

export interface MemberDashboardSummary {
  profile: MemberProfile;
  attendanceSummary: MemberAttendanceSummary;
  givingSummary: MemberGivingSummary;
  upcomingEvents: MemberEvent[];
  activePrayerRequests: MemberPrayerRequest[];
  nextJourneyMilestone?: MemberJourneyMilestone;
  recentNotifications: MemberNotification[];
  quickStats: {
    attendanceStreakWeeks: number;
    activeGroupsCount: number;
    unansweredPrayerCount: number;
    upcomingRegistrationsCount: number;
  };
}
