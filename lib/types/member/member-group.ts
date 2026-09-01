export type GroupType = 'Cell Group' | 'Ministry' | 'Fellowship' | 'Department' | 'Committee';
export type GroupMemberRole = 'Leader' | 'Assistant Leader' | 'Member' | 'Volunteer';

export interface MemberGroup {
  id: string;
  name: string;
  type: GroupType;
  description: string;
  leaderName: string;
  leaderPhone?: string;
  meetingSchedule: string;
  meetingLocation: string;
  role: GroupMemberRole;
  joinedDate: string;
  membersCount: number;
}

export interface MemberMinistry {
  id: string;
  name: string;
  category: string;
  description: string;
  leadPastorOrLeader: string;
  myRole: GroupMemberRole;
  meetingTime?: string;
  joinedDate: string;
  status: 'Active' | 'On Leave';
}
