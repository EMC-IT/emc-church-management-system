import apiClient from './api-client';
import { Group, GroupMember, GroupRole, GroupEvent, GroupCategory, GroupAttendance, GroupFormData, GroupMemberFormData, GroupRoleFormData, GroupEventFormData } from '@/lib/types/groups';
import { AttendanceStatus } from '@/lib/types/attendance';

export interface GroupsResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface GroupSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: 'Active' | 'Inactive' | 'Archived';
  leader?: string;
  sortBy?: 'name' | 'members' | 'engagement' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Mock data for development
const MOCK_GROUPS: Group[] = [
  {
    id: 'grp_001',
    name: 'Youth Ministry',
    description: 'Ministry focused on young people aged 13-25',
    category: 'Ministry',
    leader: {
      id: 'mem_001',
      name: 'Pastor Mike Johnson',
      email: 'mike@church.com',
      phone: '+233 24 123 4567'
    },
    members: 85,
    maxMembers: 100,
    meetingSchedule: 'Fridays 6:00 PM',
    location: 'Youth Center',
    engagement: 92,
    status: 'Active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T15:30:00Z'
  },
  {
    id: 'grp_002',
    name: 'Women\'s Fellowship',
    description: 'Fellowship and Bible study for women',
    category: 'Fellowship',
    leader: {
      id: 'mem_002',
      name: 'Sister Mary Grace',
      email: 'mary@church.com',
      phone: '+233 24 234 5678'
    },
    members: 45,
    maxMembers: 60,
    meetingSchedule: 'Saturdays 10:00 AM',
    location: 'Fellowship Hall',
    engagement: 88,
    status: 'Active',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z'
  },
  {
    id: 'grp_003',
    name: 'Men\'s Bible Study',
    description: 'Weekly Bible study and prayer for men',
    category: 'Study',
    leader: {
      id: 'mem_003',
      name: 'Deacon John Smith',
      email: 'john@church.com',
      phone: '+233 24 345 6789'
    },
    members: 32,
    maxMembers: 40,
    meetingSchedule: 'Wednesdays 7:00 PM',
    location: 'Conference Room',
    engagement: 85,
    status: 'Active',
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-16T16:45:00Z'
  },
  {
    id: 'grp_004',
    name: 'Worship Team',
    description: 'Musicians and singers for church services',
    category: 'Ministry',
    leader: {
      id: 'mem_004',
      name: 'Music Director Sarah',
      email: 'sarah@church.com',
      phone: '+233 24 456 7890'
    },
    members: 18,
    maxMembers: 25,
    meetingSchedule: 'Thursdays 7:30 PM',
    location: 'Sanctuary',
    engagement: 95,
    status: 'Active',
    createdAt: '2024-01-05T08:30:00Z',
    updatedAt: '2024-01-19T12:15:00Z'
  },
  {
    id: 'grp_005',
    name: 'Children\'s Ministry',
    description: 'Ministry for children aged 5-12',
    category: 'Ministry',
    leader: {
      id: 'mem_005',
      name: 'Teacher Grace',
      email: 'grace@church.com',
      phone: '+233 24 567 8901'
    },
    members: 65,
    maxMembers: 80,
    meetingSchedule: 'Sundays 9:00 AM',
    location: 'Children\'s Wing',
    engagement: 90,
    status: 'Active',
    createdAt: '2024-01-03T07:00:00Z',
    updatedAt: '2024-01-17T13:30:00Z'
  },
  {
    id: 'grp_006',
    name: 'Prayer Warriors',
    description: 'Dedicated prayer group for church needs',
    category: 'Prayer',
    leader: {
      id: 'mem_006',
      name: 'Elder Grace Williams',
      email: 'elder.grace@church.com',
      phone: '+233 24 678 9012'
    },
    members: 25,
    maxMembers: 30,
    meetingSchedule: 'Daily 6:00 AM',
    location: 'Prayer Room',
    engagement: 98,
    status: 'Active',
    createdAt: '2024-01-01T06:00:00Z',
    updatedAt: '2024-01-15T18:45:00Z'
  }
];

const MOCK_GROUP_MEMBERS: GroupMember[] = [
  {
    id: 'gm_001',
    groupId: 'grp_001',
    memberId: 'mem_007',
    memberName: 'David Johnson',
    memberEmail: 'david@church.com',
    memberPhone: '+233 24 789 0123',
    role: 'Member',
    joinedAt: '2024-01-15T10:00:00Z',
    status: 'Active'
  },
  {
    id: 'gm_002',
    groupId: 'grp_001',
    memberId: 'mem_008',
    memberName: 'Sarah Wilson',
    memberEmail: 'sarah.w@church.com',
    memberPhone: '+233 24 890 1234',
    role: 'Assistant Leader',
    joinedAt: '2024-01-16T11:00:00Z',
    status: 'Active'
  }
];

const MOCK_GROUP_ROLES: GroupRole[] = [
  {
    id: 'gr_001',
    groupId: 'grp_001',
    name: 'Leader',
    description: 'Group leader with full administrative privileges',
    permissions: ['manage_group', 'manage_members', 'manage_events', 'view_reports'],
    isDefault: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'gr_002',
    groupId: 'grp_001',
    name: 'Assistant Leader',
    description: 'Assists the group leader with administrative tasks',
    permissions: ['manage_members', 'manage_events', 'view_reports'],
    isDefault: false,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'gr_003',
    groupId: 'grp_001',
    name: 'Member',
    description: 'Regular group member',
    permissions: ['view_events', 'view_members'],
    isDefault: true,
    createdAt: '2024-01-15T10:00:00Z'
  }
];

const MOCK_GROUP_EVENTS: GroupEvent[] = [
  {
    id: 'ge_001',
    groupId: 'grp_001',
    title: 'Youth Camp 2024',
    description: 'Annual youth camp for spiritual growth and fellowship',
    startDate: '2024-03-15T09:00:00Z',
    endDate: '2024-03-17T18:00:00Z',
    location: 'Camp Grounds',
    maxAttendees: 50,
    registeredAttendees: 35,
    status: 'Upcoming',
    createdBy: 'mem_001',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: 'ge_002',
    groupId: 'grp_002',
    title: 'Women\'s Conference',
    description: 'Annual women\'s conference with guest speakers',
    startDate: '2024-02-28T10:00:00Z',
    endDate: '2024-02-28T16:00:00Z',
    location: 'Main Sanctuary',
    maxAttendees: 100,
    registeredAttendees: 78,
    status: 'Upcoming',
    createdBy: 'mem_002',
    createdAt: '2024-01-18T14:00:00Z'
  }
];

const MOCK_GROUP_CATEGORIES: GroupCategory[] = [
  { id: 'cat_001', name: 'Ministry', description: 'Church ministry groups', color: '#2E8DB0' },
  { id: 'cat_002', name: 'Fellowship', description: 'Fellowship and social groups', color: '#28ACD1' },
  { id: 'cat_003', name: 'Study', description: 'Bible study and learning groups', color: '#C49831' },
  { id: 'cat_004', name: 'Prayer', description: 'Prayer and intercession groups', color: '#A5CF5D' },
  { id: 'cat_005', name: 'Outreach', description: 'Evangelism and outreach groups', color: '#E74C3C' },
  { id: 'cat_006', name: 'Service', description: 'Service and volunteer groups', color: '#9B59B6' }
];

const MOCK_GROUP_ATTENDANCE: GroupAttendance[] = [
  {
    id: 'ga_001',
    groupId: 'grp_001',
    eventId: 'ge_001',
    memberId: 'mem_007',
    memberName: 'David Johnson',
    date: '2024-01-20T00:00:00Z',
    status: AttendanceStatus.PRESENT,
    checkInTime: '2024-01-20T18:00:00Z',
    notes: '',
    recordedBy: 'mem_001',
    createdAt: '2024-01-20T18:00:00Z'
  },
  {
    id: 'ga_002',
    groupId: 'grp_001',
    eventId: 'ge_001',
    memberId: 'mem_008',
    memberName: 'Sarah Wilson',
    date: '2024-01-20T00:00:00Z',
    status: AttendanceStatus.PRESENT,
    checkInTime: '2024-01-20T18:05:00Z',
    notes: '',
    recordedBy: 'mem_001',
    createdAt: '2024-01-20T18:05:00Z'
  },
  {
    id: 'ga_003',
    groupId: 'grp_002',
    eventId: 'ge_002',
    memberId: 'mem_009',
    memberName: 'Grace Williams',
    date: '2024-01-21T00:00:00Z',
    status: AttendanceStatus.ABSENT,
    notes: 'Family emergency',
    recordedBy: 'mem_002',
    createdAt: '2024-01-21T10:00:00Z'
  },
  {
    id: 'ga_004',
    groupId: 'grp_001',
    memberId: 'mem_007',
    memberName: 'David Johnson',
    date: '2024-01-27T00:00:00Z',
    status: AttendanceStatus.PRESENT,
    checkInTime: '2024-01-27T18:00:00Z',
    notes: '',
    recordedBy: 'mem_001',
    createdAt: '2024-01-27T18:00:00Z'
  },
  {
    id: 'ga_005',
    groupId: 'grp_001',
    memberId: 'mem_008',
    memberName: 'Sarah Wilson',
    date: '2024-01-27T00:00:00Z',
    status: AttendanceStatus.EXCUSED,
    notes: 'Work commitment',
    recordedBy: 'mem_001',
    createdAt: '2024-01-27T18:00:00Z'
  }
];

class GroupsService {
  // ===== GROUPS CRUD =====

  // Get all groups with filtering and pagination
  async getGroups(params: GroupSearchParams = {}): Promise<GroupsResponse<Group[]>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredGroups = [...MOCK_GROUPS];
      
      // Apply filters
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredGroups = filteredGroups.filter(group => 
          group.name.toLowerCase().includes(searchLower) ||
          group.description.toLowerCase().includes(searchLower) ||
          group.leader.name.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.category) {
        filteredGroups = filteredGroups.filter(group => group.category === params.category);
      }
      
      if (params.status) {
        filteredGroups = filteredGroups.filter(group => group.status === params.status);
      }
      
      // Apply sorting
      if (params.sortBy) {
        filteredGroups.sort((a, b) => {
          let aValue: any, bValue: any;
          
          switch (params.sortBy) {
            case 'name':
              aValue = a.name;
              bValue = b.name;
              break;
            case 'members':
              aValue = a.members;
              bValue = b.members;
              break;
            case 'engagement':
              aValue = a.engagement;
              bValue = b.engagement;
              break;
            case 'createdAt':
              aValue = new Date(a.createdAt);
              bValue = new Date(b.createdAt);
              break;
            default:
              return 0;
          }
          
          if (params.sortOrder === 'desc') {
            return aValue < bValue ? 1 : -1;
          }
          return aValue > bValue ? 1 : -1;
        });
      }
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGroups = filteredGroups.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedGroups,
        total: filteredGroups.length,
        page,
        limit,
        totalPages: Math.ceil(filteredGroups.length / limit)
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch groups'
      };
    }
  }

  // Get single group
  async getGroup(id: string): Promise<GroupsResponse<Group>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const group = MOCK_GROUPS.find(g => g.id === id);
      if (!group) {
        return {
          success: false,
          message: 'Group not found'
        };
      }
      
      return {
        success: true,
        data: group
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group'
      };
    }
  }

  // Create new group
  async createGroup(groupData: GroupFormData): Promise<GroupsResponse<Group>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newGroup: Group = {
           id: `grp_${Date.now()}`,
           ...groupData,
           members: 0,
           engagement: 0,
           createdAt: new Date().toISOString(),
           updatedAt: new Date().toISOString()
         };
      
      MOCK_GROUPS.push(newGroup);
      
      return {
        success: true,
        data: newGroup,
        message: 'Group created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create group'
      };
    }
  }

  // Update group
  async updateGroup(id: string, groupData: Partial<GroupFormData>): Promise<GroupsResponse<Group>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const groupIndex = MOCK_GROUPS.findIndex(g => g.id === id);
      if (groupIndex === -1) {
        return {
          success: false,
          message: 'Group not found'
        };
      }
      
      MOCK_GROUPS[groupIndex] = {
        ...MOCK_GROUPS[groupIndex],
        ...groupData,
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: MOCK_GROUPS[groupIndex],
        message: 'Group updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update group'
      };
    }
  }

  // Delete group
  async deleteGroup(id: string): Promise<GroupsResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const groupIndex = MOCK_GROUPS.findIndex(g => g.id === id);
      if (groupIndex === -1) {
        return {
          success: false,
          message: 'Group not found'
        };
      }
      
      MOCK_GROUPS.splice(groupIndex, 1);
      
      return {
        success: true,
        message: 'Group deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete group'
      };
    }
  }

  // ===== GROUP MEMBERS =====

  // Get group members
  async getGroupMembers(groupId: string): Promise<GroupsResponse<GroupMember[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const members = MOCK_GROUP_MEMBERS.filter(m => m.groupId === groupId);
      
      return {
        success: true,
        data: members
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group members'
      };
    }
  }

  // Add member to group
  async addGroupMember(groupId: string, memberData: GroupMemberFormData): Promise<GroupsResponse<GroupMember>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newMember: GroupMember = {
        id: `gm_${Date.now()}`,
        groupId,
        ...memberData,
        joinedAt: new Date().toISOString(),
        status: 'Active'
      };
      
      MOCK_GROUP_MEMBERS.push(newMember);
      
      return {
        success: true,
        data: newMember,
        message: 'Member added to group successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add member to group'
      };
    }
  }

  // Remove member from group
  async removeGroupMember(groupId: string, memberId: string): Promise<GroupsResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const memberIndex = MOCK_GROUP_MEMBERS.findIndex(m => m.groupId === groupId && m.memberId === memberId);
      if (memberIndex === -1) {
        return {
          success: false,
          message: 'Member not found in group'
        };
      }
      
      MOCK_GROUP_MEMBERS.splice(memberIndex, 1);
      
      return {
        success: true,
        message: 'Member removed from group successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove member from group'
      };
    }
  }

  // Update group member role
  async updateGroupMemberRole(groupId: string, memberId: string, role: string): Promise<GroupsResponse<GroupMember>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const memberIndex = MOCK_GROUP_MEMBERS.findIndex(m => m.groupId === groupId && m.memberId === memberId);
      if (memberIndex === -1) {
        return {
          success: false,
          message: 'Member not found in group'
        };
      }
      
      MOCK_GROUP_MEMBERS[memberIndex].role = role;
      
      return {
        success: true,
        data: MOCK_GROUP_MEMBERS[memberIndex],
        message: 'Member role updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update member role'
      };
    }
  }

  // ===== GROUP ROLES =====

  // Get group roles
  async getGroupRoles(groupId: string): Promise<GroupsResponse<GroupRole[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const roles = MOCK_GROUP_ROLES.filter(r => r.groupId === groupId);
      
      return {
        success: true,
        data: roles
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group roles'
      };
    }
  }

  // Create group role
  async createGroupRole(groupId: string, roleData: GroupRoleFormData): Promise<GroupsResponse<GroupRole>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const newRole: GroupRole = {
        id: `gr_${Date.now()}`,
        groupId,
        ...roleData,
        createdAt: new Date().toISOString()
      };
      
      MOCK_GROUP_ROLES.push(newRole);
      
      return {
        success: true,
        data: newRole,
        message: 'Group role created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create group role'
      };
    }
  }

  // Update group role
  async updateGroupRole(roleId: string, roleData: Partial<GroupRoleFormData>): Promise<GroupsResponse<GroupRole>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const roleIndex = MOCK_GROUP_ROLES.findIndex(r => r.id === roleId);
      if (roleIndex === -1) {
        return {
          success: false,
          message: 'Role not found'
        };
      }
      
      MOCK_GROUP_ROLES[roleIndex] = {
        ...MOCK_GROUP_ROLES[roleIndex],
        ...roleData
      };
      
      return {
        success: true,
        data: MOCK_GROUP_ROLES[roleIndex],
        message: 'Group role updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update group role'
      };
    }
  }

  // Delete group role
  async deleteGroupRole(roleId: string): Promise<GroupsResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const roleIndex = MOCK_GROUP_ROLES.findIndex(r => r.id === roleId);
      if (roleIndex === -1) {
        return {
          success: false,
          message: 'Role not found'
        };
      }
      
      MOCK_GROUP_ROLES.splice(roleIndex, 1);
      
      return {
        success: true,
        message: 'Group role deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete group role'
      };
    }
  }

  // ===== GROUP EVENTS =====

  // Get group events
  async getGroupEvents(groupId: string): Promise<GroupsResponse<GroupEvent[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const events = MOCK_GROUP_EVENTS.filter(e => e.groupId === groupId);
      
      return {
        success: true,
        data: events
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group events'
      };
    }
  }

  // Get single group event
  async getGroupEvent(eventId: string): Promise<GroupsResponse<GroupEvent>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const event = MOCK_GROUP_EVENTS.find(e => e.id === eventId);
      
      if (!event) {
        return {
          success: false,
          message: 'Event not found'
        };
      }
      
      return {
        success: true,
        data: event
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group event'
      };
    }
  }

  // Create group event
  async createGroupEvent(groupId: string, eventData: GroupEventFormData): Promise<GroupsResponse<GroupEvent>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const newEvent: GroupEvent = {
        id: `ge_${Date.now()}`,
        groupId,
        ...eventData,
        registeredAttendees: 0,
        status: 'Upcoming',
        createdBy: 'current_user_id', // This would come from auth context
        createdAt: new Date().toISOString()
      };
      
      MOCK_GROUP_EVENTS.push(newEvent);
      
      return {
        success: true,
        data: newEvent,
        message: 'Group event created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create group event'
      };
    }
  }

  // Update group event
  async updateGroupEvent(eventId: string, eventData: Partial<GroupEventFormData>): Promise<GroupsResponse<GroupEvent>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const eventIndex = MOCK_GROUP_EVENTS.findIndex(e => e.id === eventId);
      if (eventIndex === -1) {
        return {
          success: false,
          message: 'Event not found'
        };
      }
      
      MOCK_GROUP_EVENTS[eventIndex] = {
        ...MOCK_GROUP_EVENTS[eventIndex],
        ...eventData
      };
      
      return {
        success: true,
        data: MOCK_GROUP_EVENTS[eventIndex],
        message: 'Group event updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update group event'
      };
    }
  }

  // Delete group event
  async deleteGroupEvent(eventId: string): Promise<GroupsResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const eventIndex = MOCK_GROUP_EVENTS.findIndex(e => e.id === eventId);
      if (eventIndex === -1) {
        return {
          success: false,
          message: 'Event not found'
        };
      }
      
      MOCK_GROUP_EVENTS.splice(eventIndex, 1);
      
      return {
        success: true,
        message: 'Group event deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete group event'
      };
    }
  }

  // ===== GROUP CATEGORIES =====

  // Get all group categories
  async getGroupCategories(): Promise<GroupsResponse<GroupCategory[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        data: MOCK_GROUP_CATEGORIES
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group categories'
      };
    }
  }

  // Create group category
  async createGroupCategory(categoryData: Omit<GroupCategory, 'id'>): Promise<GroupsResponse<GroupCategory>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newCategory: GroupCategory = {
        id: `gc_${Date.now()}`,
        ...categoryData
      };
      
      MOCK_GROUP_CATEGORIES.push(newCategory);
      
      return {
        success: true,
        data: newCategory,
        message: 'Group category created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create group category'
      };
    }
  }

  // Update group category
  async updateGroupCategory(categoryId: string, categoryData: Partial<GroupCategory>): Promise<GroupsResponse<GroupCategory>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const categoryIndex = MOCK_GROUP_CATEGORIES.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) {
        return {
          success: false,
          message: 'Category not found'
        };
      }
      
      MOCK_GROUP_CATEGORIES[categoryIndex] = {
        ...MOCK_GROUP_CATEGORIES[categoryIndex],
        ...categoryData
      };
      
      return {
        success: true,
        data: MOCK_GROUP_CATEGORIES[categoryIndex],
        message: 'Group category updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update group category'
      };
    }
  }

  // Delete group category
  async deleteGroupCategory(categoryId: string): Promise<GroupsResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const categoryIndex = MOCK_GROUP_CATEGORIES.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) {
        return {
          success: false,
          message: 'Category not found'
        };
      }
      
      MOCK_GROUP_CATEGORIES.splice(categoryIndex, 1);
      
      return {
        success: true,
        message: 'Group category deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete group category'
      };
    }
  }

  // ===== GROUP ATTENDANCE =====

  // Get group attendance records
  async getGroupAttendance(groupId: string): Promise<GroupsResponse<GroupAttendance[]>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const attendanceRecords = MOCK_GROUP_ATTENDANCE.filter(a => a.groupId === groupId);
      
      return {
        success: true,
        data: attendanceRecords
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group attendance'
      };
    }
  }

  // Save group attendance records
  async saveGroupAttendance(groupId: string, attendanceRecords: any[]): Promise<GroupsResponse<void>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Remove existing attendance records for the same event/date
      const eventId = attendanceRecords[0]?.eventId;
      const date = attendanceRecords[0]?.recordedAt ? new Date(attendanceRecords[0].recordedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      
      // Filter out existing records for the same group, event, and date
      const filteredAttendance = MOCK_GROUP_ATTENDANCE.filter(a => {
        if (a.groupId !== groupId) return true;
        if (eventId && a.eventId !== eventId) return true;
        if (!eventId && a.eventId) return true;
        
        const recordDate = new Date(a.date).toISOString().split('T')[0];
        return recordDate !== date;
      });
      
      // Add new attendance records
      const newRecords: GroupAttendance[] = attendanceRecords.map(record => ({
        id: `ga_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        groupId,
        eventId: record.eventId,
        memberId: record.memberId,
        memberName: MOCK_GROUP_MEMBERS.find(m => m.memberId === record.memberId)?.memberName || 'Unknown Member',
        date: record.recordedAt ? new Date(record.recordedAt).toISOString() : new Date().toISOString(),
        status: record.status as AttendanceStatus,
        checkInTime: record.status === 'Present' ? (record.recordedAt || new Date().toISOString()) : undefined,
        notes: record.notes || '',
        recordedBy: record.recordedBy || 'current_user',
        createdAt: new Date().toISOString()
      }));
      
      // Update the mock data
      MOCK_GROUP_ATTENDANCE.length = 0;
      MOCK_GROUP_ATTENDANCE.push(...filteredAttendance, ...newRecords);
      
      return {
        success: true,
        message: 'Attendance saved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save group attendance'
      };
    }
  }

  // Export group report
  async exportGroupReport(groupId: string, reportType: string, timeRange: string): Promise<GroupsResponse<any>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock export functionality
      const group = MOCK_GROUPS.find(g => g.id === groupId);
      if (!group) {
        return {
          success: false,
          message: 'Group not found'
        };
      }
      
      const reportData = {
        groupName: group.name,
        reportType,
        timeRange,
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/reports/groups/${groupId}/${reportType}.pdf`
      };
      
      return {
        success: true,
        data: reportData,
        message: 'Report generated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to export group report'
      };
    }
  }

  // ===== STATISTICS =====

  // Get group statistics
  async getGroupStats(): Promise<GroupsResponse<any>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const totalGroups = MOCK_GROUPS.length;
      const activeGroups = MOCK_GROUPS.filter(g => g.status === 'Active').length;
      const totalMembers = MOCK_GROUPS.reduce((sum, group) => sum + group.members, 0);
      const averageEngagement = Math.round(MOCK_GROUPS.reduce((sum, group) => sum + group.engagement, 0) / totalGroups);
      
      const categoryStats = MOCK_GROUP_CATEGORIES.map(category => ({
        category: category.name,
        count: MOCK_GROUPS.filter(g => g.category === category.name).length,
        members: MOCK_GROUPS.filter(g => g.category === category.name).reduce((sum, g) => sum + g.members, 0)
      }));
      
      return {
        success: true,
        data: {
          totalGroups,
          activeGroups,
          totalMembers,
          averageEngagement,
          categoryStats,
          engagementTrend: [
            { month: 'Jan', engagement: 85 },
            { month: 'Feb', engagement: 88 },
            { month: 'Mar', engagement: 92 },
            { month: 'Apr', engagement: 89 },
            { month: 'May', engagement: 94 },
            { month: 'Jun', engagement: 91 }
          ]
        }
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch group statistics'
      };
    }
  }
}

const groupsService = new GroupsService();
export default groupsService;