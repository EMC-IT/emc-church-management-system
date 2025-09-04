import {
  Department,
  DepartmentCategory,
  DepartmentRole,
  DepartmentMeeting,
  DepartmentEvent,
  DepartmentAttendance,
  DepartmentMember,
  DepartmentStats,
  DepartmentReport,
  DepartmentFormData,
  DepartmentRoleFormData,
  DepartmentMeetingFormData,
  DepartmentEventFormData,
  DepartmentCategoryFormData,
  DepartmentQueryParams,
  DepartmentMeetingQueryParams,
  DepartmentEventQueryParams,
  DepartmentResponse,
  DepartmentsResponse,
  DepartmentStatsResponse,
  DepartmentReportResponse,
  DepartmentRoleType,
  MeetingType,
  MeetingStatus,
  EventType,
  EventStatus
} from '@/lib/types/departments';
import { ApiResponse } from '@/lib/types/common';
import { AttendanceStatus } from '@/lib/types';

// Mock Data for Development
const MOCK_CATEGORIES: DepartmentCategory[] = [
  {
    id: 'cat_001',
    name: 'Music Ministry',
    description: 'Departments focused on worship and music',
    color: '#2E8DB0',
    icon: 'Music',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_002',
    name: 'Administration',
    description: 'Administrative and operational departments',
    color: '#C49831',
    icon: 'Settings',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_003',
    name: 'Outreach',
    description: 'Evangelism and community outreach departments',
    color: '#A5CF5D',
    icon: 'Heart',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat_004',
    name: 'Technical',
    description: 'Media, sound, and technical support departments',
    color: '#28ACD1',
    icon: 'Monitor',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept_001',
    name: 'Worship Team',
    description: 'Leading the congregation in worship through music and song',
    leader: 'Sarah Johnson',
    members: ['mem_001', 'mem_002', 'mem_003', 'mem_004', 'mem_005'],
    departmentType: 'Ministry',
    categoryId: 'cat_001',
    status: 'Active',
    budget: 50000,
    location: 'Sanctuary',
    meetingSchedule: {
      dayOfWeek: 'Wednesday',
      startTime: '19:00',
      endTime: '21:00',
      frequency: 'weekly'
    },
    stats: {
      totalMembers: 12,
      activeMembers: 10,
      averageAttendance: 85,
      upcomingMeetings: 2,
      upcomingEvents: 1
    },
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'dept_002',
    name: 'Media Ministry',
    description: 'Managing audio, video, and live streaming for church services',
    leader: 'Michael Davis',
    members: ['mem_006', 'mem_007', 'mem_008', 'mem_009'],
    departmentType: 'Technical',
    categoryId: 'cat_004',
    status: 'Active',
    budget: 75000,
    location: 'Media Room',
    meetingSchedule: {
      dayOfWeek: 'Saturday',
      startTime: '10:00',
      endTime: '12:00',
      frequency: 'weekly'
    },
    stats: {
      totalMembers: 8,
      activeMembers: 7,
      averageAttendance: 90,
      upcomingMeetings: 1,
      upcomingEvents: 2
    },
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z'
  },
  {
    id: 'dept_003',
    name: 'Ushering Department',
    description: 'Welcoming guests and maintaining order during services',
    leader: 'Grace Williams',
    members: ['mem_010', 'mem_011', 'mem_012', 'mem_013', 'mem_014', 'mem_015'],
    departmentType: 'Service',
    categoryId: 'cat_002',
    status: 'Active',
    budget: 25000,
    location: 'Main Entrance',
    meetingSchedule: {
      dayOfWeek: 'Sunday',
      startTime: '07:30',
      endTime: '08:30',
      frequency: 'weekly'
    },
    stats: {
      totalMembers: 15,
      activeMembers: 14,
      averageAttendance: 95,
      upcomingMeetings: 1,
      upcomingEvents: 0
    },
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z'
  },
  {
    id: 'dept_004',
    name: 'Evangelism Team',
    description: 'Spreading the gospel and reaching out to the community',
    leader: 'David Brown',
    members: ['mem_016', 'mem_017', 'mem_018', 'mem_019', 'mem_020'],
    departmentType: 'Outreach',
    categoryId: 'cat_003',
    status: 'Active',
    budget: 40000,
    location: 'Community Center',
    meetingSchedule: {
      dayOfWeek: 'Friday',
      startTime: '18:00',
      endTime: '20:00',
      frequency: 'weekly'
    },
    stats: {
      totalMembers: 10,
      activeMembers: 9,
      averageAttendance: 80,
      upcomingMeetings: 2,
      upcomingEvents: 3
    },
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z'
  }
];

const MOCK_ROLES: DepartmentRole[] = [
  {
    id: 'role_001',
    departmentId: 'dept_001',
    memberId: 'mem_001',
    memberName: 'Sarah Johnson',
    memberEmail: 'sarah.johnson@church.com',
    memberPhone: '+233 24 123 4567',
    roleType: DepartmentRoleType.HEAD,
    title: 'Worship Leader',
    description: 'Lead worship sessions and coordinate music ministry',
    responsibilities: [
      'Plan weekly worship sessions',
      'Coordinate with musicians',
      'Select appropriate songs',
      'Train new worship team members'
    ],
    startDate: '2024-01-15',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'role_002',
    departmentId: 'dept_001',
    memberId: 'mem_002',
    memberName: 'John Smith',
    memberEmail: 'john.smith@church.com',
    memberPhone: '+233 24 234 5678',
    roleType: DepartmentRoleType.ASSISTANT_HEAD,
    title: 'Assistant Worship Leader',
    description: 'Support worship leader and backup when needed',
    responsibilities: [
      'Assist in worship planning',
      'Lead backup vocals',
      'Coordinate instrument setup',
      'Mentor junior members'
    ],
    startDate: '2024-01-15',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

const MOCK_MEETINGS: DepartmentMeeting[] = [
  {
    id: 'meet_001',
    departmentId: 'dept_001',
    title: 'Weekly Worship Planning',
    description: 'Plan songs and flow for upcoming Sunday service',
    type: MeetingType.REGULAR,
    date: '2024-02-07',
    startTime: '19:00',
    endTime: '21:00',
    location: 'Sanctuary',
    agenda: [
      'Review last Sunday\'s service',
      'Select songs for next Sunday',
      'Assign roles and responsibilities',
      'Practice new songs'
    ],
    attendees: ['mem_001', 'mem_002', 'mem_003', 'mem_004'],
    expectedAttendees: 8,
    actualAttendees: 6,
    status: MeetingStatus.COMPLETED,
    minutes: 'Discussed song selection and practiced new worship songs.',
    decisions: [
      'Selected 4 songs for next Sunday',
      'John to lead opening song',
      'Practice new song on Friday'
    ],
    actionItems: [
      {
        id: 'action_001',
        description: 'Prepare chord charts for new song',
        assignedTo: 'mem_002',
        dueDate: '2024-02-09',
        status: 'completed'
      }
    ],
    createdBy: 'mem_001',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-07T21:00:00Z'
  },
  {
    id: 'meet_002',
    departmentId: 'dept_002',
    title: 'Media Equipment Training',
    description: 'Training session for new media team members',
    type: MeetingType.TRAINING,
    date: '2024-02-10',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Media Room',
    agenda: [
      'Introduction to sound board',
      'Camera operation basics',
      'Live streaming setup',
      'Troubleshooting common issues'
    ],
    attendees: ['mem_006', 'mem_007', 'mem_008'],
    expectedAttendees: 5,
    actualAttendees: 3,
    status: MeetingStatus.SCHEDULED,
    decisions: [],
    actionItems: [],
    createdBy: 'mem_006',
    createdAt: '2024-02-03T00:00:00Z',
    updatedAt: '2024-02-03T00:00:00Z'
  }
];

const MOCK_EVENTS: DepartmentEvent[] = [
  {
    id: 'event_001',
    departmentId: 'dept_001',
    title: 'Worship Night',
    description: 'Special evening of worship and praise',
    type: EventType.SOCIAL,
    date: '2024-02-14',
    startTime: '19:00',
    endTime: '21:30',
    location: 'Main Sanctuary',
    budget: 15000,
    actualCost: 12000,
    expectedAttendees: 200,
    actualAttendees: 180,
    status: EventStatus.COMPLETED,
    organizers: ['mem_001', 'mem_002'],
    volunteers: ['mem_003', 'mem_004', 'mem_005'],
    requirements: [
      'Sound system setup',
      'Lighting arrangement',
      'Seating arrangement',
      'Refreshments'
    ],
    outcomes: [
      'Successful worship experience',
      'High attendance',
      'Positive feedback from congregation'
    ],
    feedback: {
      rating: 4.8,
      comments: [
        'Amazing worship experience',
        'Great song selection',
        'Powerful atmosphere'
      ]
    },
    createdBy: 'mem_001',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'event_002',
    departmentId: 'dept_004',
    title: 'Community Outreach',
    description: 'Evangelism event in the local community',
    type: EventType.OUTREACH,
    date: '2024-02-17',
    startTime: '09:00',
    endTime: '15:00',
    location: 'Community Park',
    budget: 20000,
    expectedAttendees: 100,
    status: EventStatus.SCHEDULED,
    organizers: ['mem_016', 'mem_017'],
    volunteers: ['mem_018', 'mem_019', 'mem_020'],
    requirements: [
      'Portable sound system',
      'Banners and displays',
      'Gospel tracts',
      'Refreshments for team'
    ],
    createdBy: 'mem_016',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z'
  }
];

const MOCK_ATTENDANCE: DepartmentAttendance[] = [
  {
    id: 'att_001',
    departmentId: 'dept_001',
    meetingId: 'meet_001',
    memberId: 'mem_001',
    memberName: 'Sarah Johnson',
    date: '2024-02-07',
    status: AttendanceStatus.PRESENT,
    checkInTime: '19:00',
    checkOutTime: '21:00',
    recordedBy: 'system',
    recordedAt: '2024-02-07T19:00:00Z'
  },
  {
    id: 'att_002',
    departmentId: 'dept_001',
    meetingId: 'meet_001',
    memberId: 'mem_002',
    memberName: 'John Smith',
    date: '2024-02-07',
    status: AttendanceStatus.PRESENT,
    checkInTime: '19:05',
    checkOutTime: '21:00',
    recordedBy: 'system',
    recordedAt: '2024-02-07T19:05:00Z'
  },
  {
    id: 'att_003',
    departmentId: 'dept_001',
    meetingId: 'meet_001',
    memberId: 'mem_003',
    memberName: 'Mary Wilson',
    date: '2024-02-07',
    status: AttendanceStatus.LATE,
    checkInTime: '19:15',
    checkOutTime: '21:00',
    notes: 'Traffic delay',
    recordedBy: 'system',
    recordedAt: '2024-02-07T19:15:00Z'
  }
];

const MOCK_MEMBERS: DepartmentMember[] = [
  {
    id: 'dmem_001',
    departmentId: 'dept_001',
    memberId: 'mem_001',
    memberName: 'Sarah Johnson',
    memberEmail: 'sarah.johnson@church.com',
    memberPhone: '+233 24 123 4567',
    memberAvatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20worship%20leader&image_size=square',
    joinDate: '2024-01-15',
    isActive: true,
    roles: [],
    skills: ['Vocals', 'Piano', 'Worship Leading', 'Song Writing'],
    availability: [
      {
        dayOfWeek: 'Wednesday',
        startTime: '19:00',
        endTime: '21:00'
      },
      {
        dayOfWeek: 'Sunday',
        startTime: '08:00',
        endTime: '12:00'
      }
    ],
    emergencyContact: {
      name: 'Michael Johnson',
      phone: '+233 24 123 4568',
      relationship: 'Spouse'
    },
    notes: 'Experienced worship leader with strong musical background',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DepartmentsService {
  // Department CRUD Operations
  async getDepartments(params?: DepartmentQueryParams): Promise<DepartmentsResponse> {
    try {
      await delay(500);
      
      let filteredDepartments = [...MOCK_DEPARTMENTS];
      
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredDepartments = filteredDepartments.filter(dept => 
          dept.name.toLowerCase().includes(searchTerm) ||
          dept.description.toLowerCase().includes(searchTerm) ||
          dept.leader.toLowerCase().includes(searchTerm)
        );
      }
      
      if (params?.categoryId) {
        filteredDepartments = filteredDepartments.filter(dept => dept.categoryId === params.categoryId);
      }
      
      if (params?.status) {
        filteredDepartments = filteredDepartments.filter(dept => dept.status === params.status);
      }
      
      if (params?.departmentType) {
        filteredDepartments = filteredDepartments.filter(dept => dept.departmentType === params.departmentType);
      }
      
      // Add category information
      const departmentsWithCategories = filteredDepartments.map(dept => ({
        ...dept,
        category: MOCK_CATEGORIES.find(cat => cat.id === dept.categoryId)
      }));
      
      return {
        success: true,
        data: departmentsWithCategories,
        message: 'Departments retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch departments'
      };
    }
  }

  async getDepartment(departmentId: string): Promise<DepartmentResponse> {
    try {
      await delay(300);
      
      const department = MOCK_DEPARTMENTS.find(dept => dept.id === departmentId);
      
      if (!department) {
        return {
          success: false,
          data: undefined,
          message: 'Department not found'
        };
      }
      
      const departmentWithCategory = {
        ...department,
        category: MOCK_CATEGORIES.find(cat => cat.id === department.categoryId)
      };
      
      return {
        success: true,
        data: departmentWithCategory,
        message: 'Department retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department'
      };
    }
  }

  async createDepartment(departmentData: DepartmentFormData): Promise<DepartmentResponse> {
    try {
      await delay(800);
      
      const newDepartment: Department = {
        id: `dept_${Date.now()}`,
        name: departmentData.name,
        description: departmentData.description,
        leader: departmentData.leader,
        members: [],
        departmentType: departmentData.departmentType,
        categoryId: departmentData.categoryId,
        status: departmentData.status || 'Active',
        budget: departmentData.budget,
        location: departmentData.location,
        meetingSchedule: departmentData.meetingSchedule,
        stats: {
          totalMembers: 0,
          activeMembers: 0,
          averageAttendance: 0,
          upcomingMeetings: 0,
          upcomingEvents: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_DEPARTMENTS.push(newDepartment);
      
      return {
        success: true,
        data: newDepartment,
        message: 'Department created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create department'
      };
    }
  }

  async updateDepartment(departmentId: string, departmentData: Partial<DepartmentFormData>): Promise<DepartmentResponse> {
    try {
      await delay(600);
      
      const departmentIndex = MOCK_DEPARTMENTS.findIndex(dept => dept.id === departmentId);
      if (departmentIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Department not found'
        };
      }
      
      const existingDepartment = MOCK_DEPARTMENTS[departmentIndex];
      const updatedDepartment = {
        ...existingDepartment,
        ...departmentData,
        updatedAt: new Date().toISOString()
      };
      
      MOCK_DEPARTMENTS[departmentIndex] = updatedDepartment;
      
      return {
        success: true,
        data: updatedDepartment,
        message: 'Department updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update department'
      };
    }
  }

  async deleteDepartment(departmentId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const departmentIndex = MOCK_DEPARTMENTS.findIndex(dept => dept.id === departmentId);
      if (departmentIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Department not found'
        };
      }
      
      MOCK_DEPARTMENTS.splice(departmentIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Department deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to delete department'
      };
    }
  }

  // Department Categories
  async getCategories(): Promise<ApiResponse<DepartmentCategory[]>> {
    try {
      await delay(300);
      
      return {
        success: true,
        data: MOCK_CATEGORIES.filter(cat => cat.isActive),
        message: 'Categories retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch categories'
      };
    }
  }

  async createCategory(categoryData: DepartmentCategoryFormData): Promise<ApiResponse<DepartmentCategory>> {
    try {
      await delay(500);
      
      const newCategory: DepartmentCategory = {
        id: `cat_${Date.now()}`,
        name: categoryData.name,
        description: categoryData.description,
        color: categoryData.color,
        icon: categoryData.icon,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_CATEGORIES.push(newCategory);
      
      return {
        success: true,
        data: newCategory,
        message: 'Category created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create category'
      };
    }
  }

  // Department Members
  async getDepartmentMembers(departmentId: string): Promise<ApiResponse<DepartmentMember[]>> {
    try {
      await delay(400);
      
      const members = MOCK_MEMBERS.filter(member => member.departmentId === departmentId);
      
      return {
        success: true,
        data: members,
        message: 'Department members retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department members'
      };
    }
  }

  // Department Roles
  async getDepartmentRoles(departmentId: string): Promise<ApiResponse<DepartmentRole[]>> {
    try {
      await delay(400);
      
      const roles = MOCK_ROLES.filter(role => role.departmentId === departmentId);
      
      return {
        success: true,
        data: roles,
        message: 'Department roles retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department roles'
      };
    }
  }

  async createDepartmentRole(roleData: DepartmentRoleFormData & { departmentId: string }): Promise<ApiResponse<DepartmentRole>> {
    try {
      await delay(600);
      
      const newRole: DepartmentRole = {
        id: `role_${Date.now()}`,
        departmentId: roleData.departmentId,
        memberId: roleData.memberId,
        memberName: 'Member Name', // In real app, fetch from member service
        memberEmail: 'member@church.com',
        memberPhone: '+233 24 000 0000',
        roleType: roleData.roleType,
        title: roleData.title,
        description: roleData.description,
        responsibilities: roleData.responsibilities,
        startDate: roleData.startDate,
        endDate: roleData.endDate,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_ROLES.push(newRole);
      
      return {
        success: true,
        data: newRole,
        message: 'Department role created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create department role'
      };
    }
  }

  // Department Meetings
  async getDepartmentMeetings(departmentId: string, params?: DepartmentMeetingQueryParams): Promise<ApiResponse<DepartmentMeeting[]>> {
    try {
      await delay(400);
      
      let meetings = MOCK_MEETINGS.filter(meeting => meeting.departmentId === departmentId);
      
      if (params?.type) {
        meetings = meetings.filter(meeting => meeting.type === params.type);
      }
      
      if (params?.status) {
        meetings = meetings.filter(meeting => meeting.status === params.status);
      }
      
      if (params?.startDate) {
        meetings = meetings.filter(meeting => meeting.date >= params.startDate!);
      }
      
      if (params?.endDate) {
        meetings = meetings.filter(meeting => meeting.date <= params.endDate!);
      }
      
      return {
        success: true,
        data: meetings,
        message: 'Department meetings retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department meetings'
      };
    }
  }

  async createDepartmentMeeting(meetingData: DepartmentMeetingFormData & { departmentId: string }): Promise<ApiResponse<DepartmentMeeting>> {
    try {
      await delay(700);
      
      const newMeeting: DepartmentMeeting = {
        id: `meet_${Date.now()}`,
        departmentId: meetingData.departmentId,
        title: meetingData.title,
        description: meetingData.description,
        type: meetingData.type,
        date: meetingData.date,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        location: meetingData.location,
        agenda: meetingData.agenda,
        attendees: meetingData.attendees,
        expectedAttendees: meetingData.attendees.length,
        actualAttendees: 0,
        status: MeetingStatus.SCHEDULED,
        decisions: [],
        actionItems: [],
        createdBy: 'current_user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_MEETINGS.push(newMeeting);
      
      return {
        success: true,
        data: newMeeting,
        message: 'Department meeting created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create department meeting'
      };
    }
  }

  // Department Events
  async getDepartmentEvents(departmentId: string, params?: DepartmentEventQueryParams): Promise<ApiResponse<DepartmentEvent[]>> {
    try {
      await delay(400);
      
      let events = MOCK_EVENTS.filter(event => event.departmentId === departmentId);
      
      if (params?.type) {
        events = events.filter(event => event.type === params.type);
      }
      
      if (params?.status) {
        events = events.filter(event => event.status === params.status);
      }
      
      if (params?.startDate) {
        events = events.filter(event => event.date >= params.startDate!);
      }
      
      if (params?.endDate) {
        events = events.filter(event => event.date <= params.endDate!);
      }
      
      return {
        success: true,
        data: events,
        message: 'Department events retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department events'
      };
    }
  }

  async createDepartmentEvent(eventData: DepartmentEventFormData & { departmentId: string }): Promise<ApiResponse<DepartmentEvent>> {
    try {
      await delay(700);
      
      const newEvent: DepartmentEvent = {
        id: `event_${Date.now()}`,
        departmentId: eventData.departmentId,
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        date: eventData.date,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        budget: eventData.budget,
        expectedAttendees: eventData.expectedAttendees,
        status: EventStatus.PLANNING,
        organizers: eventData.organizers,
        volunteers: [],
        requirements: eventData.requirements,
        createdBy: 'current_user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      MOCK_EVENTS.push(newEvent);
      
      return {
        success: true,
        data: newEvent,
        message: 'Department event created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create department event'
      };
    }
  }

  // Department Attendance
  async getDepartmentAttendance(departmentId: string, params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<DepartmentAttendance[]>> {
    try {
      await delay(400);
      
      let attendance = MOCK_ATTENDANCE.filter(att => att.departmentId === departmentId);
      
      if (params?.startDate) {
        attendance = attendance.filter(att => att.date >= params.startDate!);
      }
      
      if (params?.endDate) {
        attendance = attendance.filter(att => att.date <= params.endDate!);
      }
      
      return {
        success: true,
        data: attendance,
        message: 'Department attendance retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department attendance'
      };
    }
  }

  // Department Statistics
  async getDepartmentStats(departmentId: string): Promise<DepartmentStatsResponse> {
    try {
      await delay(600);
      
      const department = MOCK_DEPARTMENTS.find(dept => dept.id === departmentId);
      if (!department) {
        return {
          success: false,
          data: undefined,
          message: 'Department not found'
        };
      }
      
      const stats: DepartmentStats = {
        departmentId: department.id,
        departmentName: department.name,
        totalMembers: department.stats?.totalMembers || 0,
        activeMembers: department.stats?.activeMembers || 0,
        totalMeetings: MOCK_MEETINGS.filter(m => m.departmentId === departmentId).length,
        averageAttendance: department.stats?.averageAttendance || 0,
        attendanceRate: 85,
        totalEvents: MOCK_EVENTS.filter(e => e.departmentId === departmentId).length,
        completedEvents: MOCK_EVENTS.filter(e => e.departmentId === departmentId && e.status === EventStatus.COMPLETED).length,
        totalBudget: department.budget || 0,
        spentBudget: Math.round((department.budget || 0) * 0.7),
        monthlyStats: [
          { month: 'January', meetings: 4, events: 1, attendance: 85, budget: 15000 },
          { month: 'February', meetings: 4, events: 2, attendance: 88, budget: 18000 },
          { month: 'March', meetings: 5, events: 1, attendance: 82, budget: 12000 }
        ],
        topPerformers: [
          { memberId: 'mem_001', memberName: 'Sarah Johnson', attendanceRate: 95, eventsOrganized: 3 },
          { memberId: 'mem_002', memberName: 'John Smith', attendanceRate: 90, eventsOrganized: 2 }
        ]
      };
      
      return {
        success: true,
        data: stats,
        message: 'Department statistics retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch department statistics'
      };
    }
  }

  // Department Reports
  async getDepartmentReport(departmentId: string, params?: { startDate?: string; endDate?: string }): Promise<DepartmentReportResponse> {
    try {
      await delay(800);
      
      const department = MOCK_DEPARTMENTS.find(dept => dept.id === departmentId);
      if (!department) {
        return {
          success: false,
          data: undefined,
          message: 'Department not found'
        };
      }
      
      const report: DepartmentReport = {
        departmentId: department.id,
        departmentName: department.name,
        period: {
          start: params?.startDate || '2024-01-01',
          end: params?.endDate || '2024-12-31'
        },
        summary: {
          totalMembers: department.stats?.totalMembers || 0,
          totalMeetings: MOCK_MEETINGS.filter(m => m.departmentId === departmentId).length,
          totalEvents: MOCK_EVENTS.filter(e => e.departmentId === departmentId).length,
          averageAttendance: department.stats?.averageAttendance || 0,
          budgetUtilization: 70
        },
        activities: {
          meetings: MOCK_MEETINGS.filter(m => m.departmentId === departmentId),
          events: MOCK_EVENTS.filter(e => e.departmentId === departmentId)
        },
        attendance: {
          byMember: [
            { memberId: 'mem_001', memberName: 'Sarah Johnson', attendanceRate: 95, meetingsAttended: 8, eventsAttended: 3 },
            { memberId: 'mem_002', memberName: 'John Smith', attendanceRate: 90, meetingsAttended: 7, eventsAttended: 2 }
          ],
          byMonth: [
            { month: 'January', meetingAttendance: 85, eventAttendance: 90 },
            { month: 'February', meetingAttendance: 88, eventAttendance: 85 }
          ]
        },
        financial: {
          totalBudget: department.budget || 0,
          totalSpent: Math.round((department.budget || 0) * 0.7),
          byCategory: [
            { category: 'Equipment', budgeted: 20000, spent: 15000 },
            { category: 'Events', budgeted: 15000, spent: 12000 },
            { category: 'Training', budgeted: 10000, spent: 8000 }
          ]
        },
        achievements: [
          'Successfully organized worship night with 180 attendees',
          'Maintained 85% average attendance rate',
          'Trained 3 new worship team members'
        ],
        challenges: [
          'Need more volunteers for events',
          'Equipment maintenance costs increasing',
          'Scheduling conflicts with other departments'
        ],
        recommendations: [
          'Recruit more volunteers from congregation',
          'Establish equipment maintenance fund',
          'Implement better scheduling coordination system'
        ]
      };
      
      return {
        success: true,
        data: report,
        message: 'Department report generated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to generate department report'
      };
    }
  }

  // Update Department Meeting
  async updateDepartmentMeeting(departmentId: string, meetingId: string, meetingData: Partial<DepartmentMeetingFormData>): Promise<ApiResponse<DepartmentMeeting>> {
    try {
      await delay(600);
      
      const meetingIndex = MOCK_MEETINGS.findIndex(meeting => meeting.id === meetingId && meeting.departmentId === departmentId);
      if (meetingIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Meeting not found'
        };
      }
      
      const existingMeeting = MOCK_MEETINGS[meetingIndex];
      const updatedMeeting = {
        ...existingMeeting,
        ...meetingData,
        updatedAt: new Date().toISOString()
      };
      
      MOCK_MEETINGS[meetingIndex] = updatedMeeting;
      
      return {
        success: true,
        data: updatedMeeting,
        message: 'Meeting updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update meeting'
      };
    }
  }

  // Delete Department Meeting
  async deleteDepartmentMeeting(departmentId: string, meetingId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const meetingIndex = MOCK_MEETINGS.findIndex(meeting => meeting.id === meetingId && meeting.departmentId === departmentId);
      if (meetingIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Meeting not found'
        };
      }
      
      MOCK_MEETINGS.splice(meetingIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Meeting deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to delete meeting'
      };
    }
  }

  // Update Meeting Status
  async updateMeetingStatus(departmentId: string, meetingId: string, status: MeetingStatus): Promise<ApiResponse<DepartmentMeeting>> {
    try {
      await delay(300);
      
      const meetingIndex = MOCK_MEETINGS.findIndex(meeting => meeting.id === meetingId && meeting.departmentId === departmentId);
      if (meetingIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Meeting not found'
        };
      }
      
      MOCK_MEETINGS[meetingIndex].status = status;
      MOCK_MEETINGS[meetingIndex].updatedAt = new Date().toISOString();
      
      return {
        success: true,
        data: MOCK_MEETINGS[meetingIndex],
        message: 'Meeting status updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update meeting status'
      };
    }
  }

  // Get All Members (for adding to departments)
  async getAllMembers(): Promise<ApiResponse<any[]>> {
    try {
      await delay(300);
      
      // Mock members data
      const mockMembers = [
        { id: 'mem_001', firstName: 'John', lastName: 'Doe', email: 'john.doe@church.com', avatar: '' },
        { id: 'mem_002', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@church.com', avatar: '' },
        { id: 'mem_003', firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@church.com', avatar: '' },
        { id: 'mem_004', firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@church.com', avatar: '' },
        { id: 'mem_005', firstName: 'David', lastName: 'Brown', email: 'david.brown@church.com', avatar: '' }
      ];
      
      return {
        success: true,
        data: mockMembers,
        message: 'Members retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch members'
      };
    }
  }

  // Add Members to Role
  async addMembersToRole(departmentId: string, memberIds: string[], role: string): Promise<ApiResponse<null>> {
    try {
      await delay(500);
      
      // Mock implementation - in real app, this would add members to the department with specified role
      return {
        success: true,
        data: null,
        message: `Added ${memberIds.length} members to department with role: ${role}`
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to add members to department'
      };
    }
  }

  // Remove Member from Department
  async removeMemberFromDepartment(departmentId: string, memberId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      // Mock implementation
      return {
        success: true,
        data: null,
        message: 'Member removed from department successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to remove member from department'
      };
    }
  }

  // Update Member Role
  async updateMemberRole(departmentId: string, memberId: string, newRole: string): Promise<ApiResponse<null>> {
    try {
      await delay(300);
      
      // Mock implementation
      return {
        success: true,
        data: null,
        message: 'Member role updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update member role'
      };
    }
  }



  // Update Department Role
  async updateDepartmentRole(departmentId: string, roleId: string, roleData: Partial<DepartmentRoleFormData>): Promise<ApiResponse<DepartmentRole>> {
    try {
      await delay(500);
      
      const roleIndex = MOCK_ROLES.findIndex(role => role.id === roleId && role.departmentId === departmentId);
      if (roleIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Role not found'
        };
      }
      
      const existingRole = MOCK_ROLES[roleIndex];
      const updatedRole = {
        ...existingRole,
        ...roleData,
        responsibilities: roleData.responsibilities || existingRole.responsibilities,
        updatedAt: new Date().toISOString()
      };
      
      MOCK_ROLES[roleIndex] = updatedRole;
      
      return {
        success: true,
        data: updatedRole,
        message: 'Role updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update role'
      };
    }
  }

  // Delete Department Role
  async deleteDepartmentRole(departmentId: string, roleId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const roleIndex = MOCK_ROLES.findIndex(role => role.id === roleId && role.departmentId === departmentId);
      if (roleIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Role not found'
        };
      }
      
      MOCK_ROLES.splice(roleIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Role deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to delete role'
      };
    }
  }

  // Export Reports
  async exportDepartmentReport(departmentId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<Blob>> {
    try {
      await delay(800);
      
      const mockContent = format === 'pdf' 
        ? 'Mock PDF content for department report'
        : 'Mock Excel content for department report';
      const mockBlob = new Blob([mockContent], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      return {
        success: true,
        data: mockBlob,
        message: 'Department report exported successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to export department report'
      };
    }
  }
}

export const departmentsService = new DepartmentsService();
export default departmentsService;