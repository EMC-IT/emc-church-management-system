// ============================================================================
// MEMBERS MODULE TYPES
// ============================================================================

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  membershipStatus: 'New' | 'Active' | 'Inactive' | 'Transferred' | 'Archived';
  joinDate: string;
  avatar: string | null;
  familyId?: string;
  department?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  branch?: string;
}

export interface MemberFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  membershipStatus?: 'New' | 'Active' | 'Inactive' | 'Transferred' | 'Archived';
  joinDate?: string;
  familyId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  customFields?: Record<string, any>;
}

export interface Family {
  id: string;
  name: string;
  members: Member[];
  headOfFamily: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  leader: string;
  members: string[];
  departmentType?: string; // e.g., Administrative, Functional
  status?: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

// ===== UTILITY TYPES =====

export type Gender = 'Male' | 'Female' | 'Other';

export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';