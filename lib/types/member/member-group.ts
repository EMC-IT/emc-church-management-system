export type GroupType =
  | 'Cell Group'
  | 'Fellowship'
  | 'Small Group'
  | 'Bible Study'
  | 'Youth Fellowship'
  | 'Men Fellowship'
  | 'Women Fellowship'
  | 'Ministry'
  | 'Department'
  | 'Committee';

export type GroupMemberRole =
  | 'Leader'
  | 'Assistant Leader'
  | 'Host'
  | 'Member'
  | 'Volunteer';

export type GroupMembershipStatus = 'Active' | 'Pending' | 'Inactive';

export interface GroupLeader {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  contactEmail?: string;
}

export interface GroupMeetingSchedule {
  dayOfWeek: string;
  time: string;
  frequency: string;
  venue: string;
  address?: string;
  branch: string;
  campus?: string;
}

export interface GroupUpcomingMeeting {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  topic?: string;
}

export interface MemberGroup {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  branch: string;
  campus?: string;
  leader: GroupLeader;
  schedule: GroupMeetingSchedule;
  myRole: GroupMemberRole;
  membershipStatus: GroupMembershipStatus;
  joinedDate: string;
  membersCount: number;
  upcomingMeetings?: GroupUpcomingMeeting[];

  // Backwards compatibility aliases
  role?: GroupMemberRole;
  leaderName?: string;
  leaderPhone?: string;
  meetingSchedule?: string;
  meetingLocation?: string;
}

export interface DiscoverableGroup {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  branch: string;
  campus?: string;
  leaderName: string;
  leaderRole: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  membersCount: number;
  isAcceptingMembers: boolean;
}

export interface MemberGroupFilter {
  branch?: string;
  campus?: string;
  type?: GroupType | 'all';
  meetingDay?: string;
  search?: string;
}

export * from './member-ministry';
