export type FamilyRole = 'Head' | 'Spouse' | 'Child' | 'Dependent' | 'Other';

export interface MemberFamilyMember {
  id: string;
  memberId?: string;
  firstName: string;
  lastName: string;
  relationship: FamilyRole;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  email?: string;
  avatarUrl?: string | null;
  isRegisteredMember: boolean;
  canManagePermissions: boolean;
}

export interface MemberFamilyUnit {
  id: string;
  familyName: string;
  address?: string;
  primaryContactPhone?: string;
  members: MemberFamilyMember[];
}
