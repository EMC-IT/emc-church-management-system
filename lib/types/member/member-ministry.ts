export type MinistryCategory =
  | 'Worship & Creative Arts'
  | 'Media & Tech'
  | 'Ushering & Protocol'
  | 'Children Ministry'
  | 'Youth & Campus'
  | 'Evangelism & Missions'
  | 'Prayer & Intercession'
  | 'Hospitality & Welfare'
  | 'Music & Liturgy'
  | 'Technical & Media'
  | string;

export type MinistryMembershipStatus = 'Active' | 'On Leave' | 'Pending';

export interface MinistryLeader {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  contactEmail?: string;
}

export interface MinistryServiceSchedule {
  serviceName: string;
  dayOfWeek: string;
  serviceTime: string;
  callTime?: string; // Report time
  venue: string;
  frequency: string;
}

export interface MinistryAssignment {
  id: string;
  serviceDate: string;
  serviceName: string;
  role: string;
  callTime: string;
  venue: string;
  notes?: string;
}

export interface MemberMinistry {
  id: string;
  name: string;
  category: MinistryCategory;
  description: string;
  branch: string;
  campus?: string;
  leader: MinistryLeader;
  schedule: MinistryServiceSchedule;
  myRoles: string[];
  status: MinistryMembershipStatus;
  joinedDate: string;
  upcomingAssignments?: MinistryAssignment[];

  // Backwards compatibility aliases
  myRole?: string;
  leadPastorOrLeader?: string;
  meetingTime?: string;
}

export interface DiscoverableMinistry {
  id: string;
  name: string;
  category: MinistryCategory;
  description: string;
  branch: string;
  campus?: string;
  leaderName: string;
  leaderTitle: string;
  serviceTime: string;
  openRoles: string[];
  isRecruiting: boolean;
}

export interface MemberMinistryFilter {
  category?: MinistryCategory | 'all';
  branch?: string;
  campus?: string;
  search?: string;
}
