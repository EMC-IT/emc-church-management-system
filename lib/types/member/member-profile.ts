export interface MemberProfile {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  anniversaryDate?: string;
  address: {
    street?: string;
    city?: string;
    region?: string;
    country?: string;
    postalCode?: string;
  };
  branch: string;
  campus?: string;
  primaryDepartment?: string;
  cellGroup?: string;
  membershipStatus: 'Active' | 'New' | 'Associate' | 'Pending';
  joinDate: string;
  waterBaptism?: 'Yes' | 'No' | boolean;
  baptismDate?: string;
  holyGhostBaptism?: 'Yes' | 'No' | boolean;
  avatarUrl: string | null;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    prayerAlerts: boolean;
    eventReminders: boolean;
    directoryVisibility: 'public' | 'members_only' | 'private';
  };
}

export type UpdateMemberProfileInput = Partial<Omit<MemberProfile, 'id' | 'membershipStatus' | 'joinDate'>>;
