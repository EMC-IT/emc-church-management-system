import {
  SundaySchoolClass,
  Teacher,
  Student,
  TeachingMaterial,
  ClassAttendance,
  SundaySchoolStats,
  AttendanceReport,
  ClassFormData,
  TeacherFormData,
  StudentFormData,
  MaterialFormData,
  AttendanceFormData,
  ClassQueryParams,
  TeacherQueryParams,
  StudentQueryParams,
  MaterialQueryParams,
  AttendanceQueryParams,
  SundaySchoolClassResponse,
  SundaySchoolClassesResponse,
  TeacherResponse,
  TeachersResponse,
  StudentResponse,
  StudentsResponse,
  MaterialResponse,
  MaterialsResponse,
  AttendanceResponse,
  SundaySchoolStatsResponse,
  AttendanceReportResponse,
  ClassStats,
  AgeGroup,
  ClassStatus,
  AttendanceStatus,
  MaterialType,
  TeacherStatus
} from '@/lib/types/sunday-school';
import { ApiResponse } from '@/lib/types/common';

// Mock Data for Development
const MOCK_TEACHERS: Teacher[] = [
  {
    id: 'teacher_001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@church.com',
    phone: '+233 24 123 4567',
    qualifications: ['Bachelor of Education', 'Children Ministry Certificate'],
    assignedClasses: ['class_001', 'class_002'],
    joinDate: '2023-01-15',
    status: TeacherStatus.ACTIVE,
    bio: 'Passionate about teaching children and helping them grow in faith.',
    experience: '5 years in children ministry',
    specializations: ['Early Childhood', 'Bible Stories'],
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20teacher%20portrait&image_size=square'
  },
  {
    id: 'teacher_002',
    name: 'Michael Davis',
    email: 'michael.davis@church.com',
    phone: '+233 24 234 5678',
    qualifications: ['Theology Degree', 'Youth Ministry Certificate'],
    assignedClasses: ['class_003'],
    joinDate: '2022-09-10',
    status: TeacherStatus.ACTIVE,
    bio: 'Dedicated to mentoring young people in their spiritual journey.',
    experience: '8 years in youth ministry',
    specializations: ['Youth Ministry', 'Biblical Studies'],
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20male%20teacher%20portrait&image_size=square'
  },
  {
    id: 'teacher_003',
    name: 'Grace Williams',
    email: 'grace.williams@church.com',
    phone: '+233 24 345 6789',
    qualifications: ['Early Childhood Education', 'Sunday School Teacher Training'],
    assignedClasses: ['class_004'],
    joinDate: '2023-03-20',
    status: TeacherStatus.ACTIVE,
    bio: 'Loves working with toddlers and creating fun learning experiences.',
    experience: '3 years in early childhood ministry',
    specializations: ['Toddler Care', 'Creative Teaching'],
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20female%20teacher%20portrait&image_size=square'
  }
];

const MOCK_CLASSES: SundaySchoolClass[] = [
  {
    id: 'class_001',
    name: 'Little Lambs',
    description: 'A nurturing class for our youngest members',
    ageGroup: AgeGroup.NURSERY,
    teacher: {
      id: 'teacher_001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@church.com',
      phone: '+233 24 123 4567'
    },
    assistantTeachers: [{
      id: 'teacher_helper_001',
      name: 'Mary Helper'
    }],
    students: 12,
    maxStudents: 15,
    schedule: {
      dayOfWeek: 'Sunday',
      startTime: '09:00',
      endTime: '10:00'
    },
    location: 'Nursery Room A',
    status: ClassStatus.ACTIVE,
    curriculum: 'Bible Stories for Toddlers',
    objectives: ['Learn about God\'s love', 'Basic Bible stories', 'Simple prayers'],
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20'
  },
  {
    id: 'class_002',
    name: 'Growing Seeds',
    description: 'Interactive learning for preschoolers',
    ageGroup: AgeGroup.TODDLERS,
    teacher: {
      id: 'teacher_001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@church.com',
      phone: '+233 24 123 4567'
    },
    students: 18,
    maxStudents: 20,
    schedule: {
      dayOfWeek: 'Sunday',
      startTime: '10:15',
      endTime: '11:15'
    },
    location: 'Preschool Room',
    status: ClassStatus.ACTIVE,
    curriculum: 'Interactive Bible Learning',
    objectives: ['Bible character stories', 'Memory verses', 'Christian values'],
    createdDate: '2024-01-10',
    lastUpdated: '2024-01-18'
  },
  {
    id: 'class_003',
    name: 'Young Disciples',
    description: 'Building strong foundations for young believers',
    ageGroup: AgeGroup.YOUTH,
    teacher: {
      id: 'teacher_002',
      name: 'Michael Davis',
      email: 'michael.davis@church.com',
      phone: '+233 24 234 5678'
    },
    students: 25,
    maxStudents: 30,
    schedule: {
      dayOfWeek: 'Sunday',
      startTime: '09:00',
      endTime: '10:30'
    },
    location: 'Youth Hall',
    status: ClassStatus.ACTIVE,
    curriculum: 'Discipleship Training',
    objectives: ['Biblical worldview', 'Leadership skills', 'Service opportunities'],
    createdDate: '2024-01-05',
    lastUpdated: '2024-01-22'
  },
  {
    id: 'class_004',
    name: 'Tiny Tots',
    description: 'Special care for our smallest members',
    ageGroup: AgeGroup.TODDLERS,
    teacher: {
      id: 'teacher_003',
      name: 'Grace Williams',
      email: 'grace.williams@church.com',
      phone: '+233 24 345 6789'
    },
    students: 8,
    maxStudents: 12,
    schedule: {
      dayOfWeek: 'Sunday',
      startTime: '09:00',
      endTime: '09:45'
    },
    location: 'Toddler Room',
    status: ClassStatus.ACTIVE,
    curriculum: 'Sensory Bible Learning',
    objectives: ['God\'s love through play', 'Simple songs', 'Gentle introduction to prayer'],
    createdDate: '2024-01-12',
    lastUpdated: '2024-01-19'
  }
];

const MOCK_STUDENTS: Student[] = [
  {
    id: 'student_001',
    name: 'Emma Thompson',
    age: 4,
    dateOfBirth: '2020-03-15',
    gender: 'Female',
    parentContact: {
      parentName: 'John Thompson',
      relationship: 'Father',
      phone: '+233 24 111 2222',
      email: 'john.thompson@email.com',
      address: '123 Church Street, Accra'
    },
    currentClassId: 'class_002',
    classHistory: [{
      classId: 'class_001',
      className: 'Little Lambs',
      startDate: '2023-09-01',
      endDate: '2024-01-01'
    }],
    enrollmentDate: '2023-09-01',
    status: 'Active',
    medicalInfo: 'No known allergies',
    notes: 'Very enthusiastic learner, loves singing',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20little%20girl%20portrait&image_size=square'
  },
  {
    id: 'student_002',
    name: 'David Wilson',
    age: 15,
    dateOfBirth: '2009-07-22',
    gender: 'Male',
    parentContact: {
      parentName: 'Sarah Wilson',
      relationship: 'Mother',
      phone: '+233 24 222 3333',
      email: 'sarah.wilson@email.com',
      address: '456 Faith Avenue, Kumasi'
    },
    currentClassId: 'class_003',
    classHistory: [{
      classId: 'class_003',
      className: 'Young Disciples',
      startDate: '2024-01-01',
      endDate: undefined
    }],
    enrollmentDate: '2024-01-01',
    status: 'Active',
    notes: 'Natural leader, helps with younger children',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=teenage%20boy%20portrait&image_size=square'
  }
];

const MOCK_MATERIALS: TeachingMaterial[] = [
  {
    id: 'material_001',
    title: 'Noah\'s Ark Story Cards',
    description: 'Colorful story cards depicting the story of Noah\'s Ark',
    type: MaterialType.WORKSHEET,
    fileUrl: '/materials/noahs-ark-cards.pdf',
    fileName: 'noahs-ark-cards.pdf',
    fileSize: 2048000,
    ageGroup: AgeGroup.TODDLERS,
    classId: 'class_002',
    uploadDate: '2024-01-10',
    uploadedBy: {
      id: 'teacher_001',
      name: 'Sarah Johnson'
    },
    tags: ['Bible Stories', 'Noah', 'Animals'],
    isPublic: true,
    downloadCount: 45
  },
  {
    id: 'material_002',
    title: 'Youth Leadership Training Video',
    description: 'Comprehensive video series on Christian leadership for youth',
    type: MaterialType.VIDEO,
    fileUrl: '/materials/youth-leadership.mp4',
    fileName: 'youth-leadership.mp4',
    fileSize: 104857600,
    ageGroup: AgeGroup.YOUTH,
    classId: 'class_003',
    uploadDate: '2024-01-15',
    uploadedBy: {
      id: 'teacher_002',
      name: 'Michael Davis'
    },
    tags: ['Leadership', 'Youth', 'Training'],
    isPublic: true,
    downloadCount: 23
  }
];

const MOCK_ATTENDANCE: ClassAttendance[] = [
  {
    id: 'attendance_001',
    classId: 'class_001',
    studentId: 'student_001',
    studentName: 'Emma Thompson',
    date: '2024-01-21',
    status: AttendanceStatus.PRESENT,
    notes: 'Participated actively in class',
    recordedBy: 'teacher_001',
    recordedAt: '2024-01-21T10:00:00Z'
  },
  {
    id: 'attendance_002',
    classId: 'class_003',
    studentId: 'student_002',
    studentName: 'David Wilson',
    date: '2024-01-21',
    status: AttendanceStatus.PRESENT,
    notes: 'Helped with setup and cleanup',
    recordedBy: 'teacher_002',
    recordedAt: '2024-01-21T10:30:00Z'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class SundaySchoolService {
  // Classes Management
  async getClasses(params?: ClassQueryParams): Promise<SundaySchoolClassesResponse> {
    try {
      await delay(500); // Simulate API delay
      
      let filteredClasses = [...MOCK_CLASSES];
      
      // Apply filters if provided
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredClasses = filteredClasses.filter(cls => 
          cls.name.toLowerCase().includes(searchTerm) ||
          cls.description.toLowerCase().includes(searchTerm) ||
          cls.teacher.name.toLowerCase().includes(searchTerm)
        );
      }
      
      if (params?.ageGroup) {
        filteredClasses = filteredClasses.filter(cls => cls.ageGroup === params.ageGroup);
      }
      
      if (params?.status) {
        filteredClasses = filteredClasses.filter(cls => cls.status === params.status);
      }
      
      return {
        success: true,
        data: filteredClasses,
        message: 'Classes retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch classes'
      };
    }
  }

  async getClass(classId: string): Promise<SundaySchoolClassResponse> {
    try {
      await delay(300);
      
      const foundClass = MOCK_CLASSES.find(cls => cls.id === classId);
      
      if (!foundClass) {
        return {
          success: false,
          data: undefined,
          message: 'Class not found'
        };
      }
      
      return {
        success: true,
        data: foundClass,
        message: 'Class retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch class'
      };
    }
  }

  async createClass(classData: ClassFormData): Promise<SundaySchoolClassResponse> {
    try {
      await delay(800);
      
      const teacher = MOCK_TEACHERS.find(t => t.id === classData.teacherId);
      if (!teacher) {
        return {
          success: false,
          data: undefined,
          message: 'Teacher not found'
        };
      }
      
      const newClass: SundaySchoolClass = {
        id: `class_${Date.now()}`,
        name: classData.name,
        description: classData.description,
        ageGroup: classData.ageGroup,
        teacher: {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone
        },
        assistantTeachers: classData.assistantTeacherIds?.map(id => {
          const assistantTeacher = MOCK_TEACHERS.find(t => t.id === id);
          return {
            id: assistantTeacher?.id || id,
            name: assistantTeacher?.name || 'Unknown Teacher'
          };
        }) || [],
        students: 0,
        maxStudents: classData.maxStudents,
        schedule: classData.schedule,
        location: classData.location,
        status: ClassStatus.ACTIVE,
        curriculum: classData.curriculum,
        objectives: classData.objectives,
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      MOCK_CLASSES.push(newClass);
      
      return {
        success: true,
        data: newClass,
        message: 'Class created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create class'
      };
    }
  }

  async updateClass(classId: string, classData: Partial<ClassFormData>): Promise<SundaySchoolClassResponse> {
    try {
      await delay(600);
      
      const classIndex = MOCK_CLASSES.findIndex(cls => cls.id === classId);
      if (classIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Class not found'
        };
      }
      
      const existingClass = MOCK_CLASSES[classIndex];
      const updatedClass = {
        ...existingClass,
        ...classData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      MOCK_CLASSES[classIndex] = updatedClass;
      
      return {
        success: true,
        data: updatedClass,
        message: 'Class updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update class'
      };
    }
  }

  async deleteClass(classId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const classIndex = MOCK_CLASSES.findIndex(cls => cls.id === classId);
      if (classIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Class not found'
        };
      }
      
      MOCK_CLASSES.splice(classIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Class deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to delete class'
      };
    }
  }

  async getClassStats(classId: string): Promise<ApiResponse<ClassStats>> {
    try {
      await delay(400);
      
      const foundClass = MOCK_CLASSES.find(cls => cls.id === classId);
      if (!foundClass) {
        return {
          success: false,
          data: undefined,
          message: 'Class not found'
        };
      }
      
      const classAttendance = MOCK_ATTENDANCE.filter(att => att.classId === classId);
      const totalSessions = 10; // Mock total sessions
      const averageAttendance = Math.round((classAttendance.length / totalSessions) * foundClass.students);
      
      const stats: ClassStats = {
        classId: foundClass.id,
        className: foundClass.name,
        totalStudents: foundClass.students,
        averageAttendance,
        attendanceRate: Math.round((averageAttendance / foundClass.students) * 100),
        lastClassDate: '2024-01-21',
        nextClassDate: '2024-01-28',
        teacherName: foundClass.teacher.name
      };
      
      return {
        success: true,
        data: stats,
        message: 'Class stats retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch class stats'
      };
    }
  }

  // Teachers Management
  async getTeachers(params?: TeacherQueryParams): Promise<TeachersResponse> {
    try {
      await delay(400);
      
      let filteredTeachers = [...MOCK_TEACHERS];
      
      // Apply filters if provided
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredTeachers = filteredTeachers.filter(teacher => 
          teacher.name.toLowerCase().includes(searchTerm) ||
          teacher.email.toLowerCase().includes(searchTerm) ||
          teacher.specializations?.some(spec => spec.toLowerCase().includes(searchTerm))
        );
      }
      
      if (params?.status) {
        filteredTeachers = filteredTeachers.filter(teacher => teacher.status === params.status);
      }
      
      return {
        success: true,
        data: filteredTeachers,
        message: 'Teachers retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch teachers'
      };
    }
  }

  async getTeacher(teacherId: string): Promise<TeacherResponse> {
    try {
      await delay(300);
      
      const foundTeacher = MOCK_TEACHERS.find(teacher => teacher.id === teacherId);
      
      if (!foundTeacher) {
        return {
          success: false,
          data: undefined,
          message: 'Teacher not found'
        };
      }
      
      return {
        success: true,
        data: foundTeacher,
        message: 'Teacher retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch teacher'
      };
    }
  }

  async createTeacher(teacherData: TeacherFormData): Promise<TeacherResponse> {
    try {
      await delay(700);
      
      const newTeacher: Teacher = {
        id: `teacher_${Date.now()}`,
        name: teacherData.name,
        email: teacherData.email,
        phone: teacherData.phone,
        qualifications: teacherData.qualifications,
        assignedClasses: [],
        joinDate: new Date().toISOString().split('T')[0],
        status: TeacherStatus.ACTIVE,
        bio: teacherData.bio,
        experience: teacherData.experience,
        specializations: teacherData.specializations
      };
      
      MOCK_TEACHERS.push(newTeacher);
      
      return {
        success: true,
        data: newTeacher,
        message: 'Teacher created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create teacher'
      };
    }
  }

  async updateTeacher(teacherId: string, teacherData: Partial<TeacherFormData>): Promise<TeacherResponse> {
    try {
      await delay(600);
      
      const teacherIndex = MOCK_TEACHERS.findIndex(teacher => teacher.id === teacherId);
      if (teacherIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Teacher not found'
        };
      }
      
      const existingTeacher = MOCK_TEACHERS[teacherIndex];
      const updatedTeacher = {
        ...existingTeacher,
        ...teacherData
      };
      
      MOCK_TEACHERS[teacherIndex] = updatedTeacher;
      
      return {
        success: true,
        data: updatedTeacher,
        message: 'Teacher updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update teacher'
      };
    }
  }

  async deleteTeacher(teacherId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const teacherIndex = MOCK_TEACHERS.findIndex(teacher => teacher.id === teacherId);
      if (teacherIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Teacher not found'
        };
      }
      
      MOCK_TEACHERS.splice(teacherIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Teacher deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to delete teacher'
      };
    }
  }

  async getTeacherClasses(teacherId: string): Promise<SundaySchoolClassesResponse> {
    try {
      await delay(400);
      
      const teacherClasses = MOCK_CLASSES.filter(cls => cls.teacher.id === teacherId);
      
      return {
        success: true,
        data: teacherClasses,
        message: 'Teacher classes retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch teacher classes'
      };
    }
  }

  async getTeacherReports(teacherId: string, params?: {
    startDate?: string;
    endDate?: string;
    includeStudentProgress?: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      await delay(600);
      
      const foundTeacher = MOCK_TEACHERS.find(teacher => teacher.id === teacherId);
      if (!foundTeacher) {
        return {
          success: false,
          data: null,
          message: 'Teacher not found'
        };
      }
      
      const teacherClasses = MOCK_CLASSES.filter(cls => cls.teacher.id === teacherId);
      const totalStudents = teacherClasses.reduce((sum, cls) => sum + cls.students, 0);
      
      const report = {
        teacherInfo: {
          id: foundTeacher.id,
          name: foundTeacher.name,
          email: foundTeacher.email,
          specializations: foundTeacher.specializations,
          experience: foundTeacher.experience
        },
        classes: teacherClasses.map(cls => ({
          id: cls.id,
          name: cls.name,
          students: cls.students,
          ageGroup: cls.ageGroup,
          averageAttendance: Math.round(Math.random() * 20 + 75)
        })),
        performance: {
          totalClasses: teacherClasses.length,
          totalStudents,
          averageClassSize: Math.round(totalStudents / teacherClasses.length) || 0,
          studentRetentionRate: Math.round(Math.random() * 20 + 80),
          materialsUploaded: MOCK_MATERIALS.filter(m => m.uploadedBy.name === foundTeacher.name).length
        },
        feedback: {
          averageRating: Math.round((Math.random() * 1 + 4) * 10) / 10, // Mock 4.0-5.0 rating
          totalReviews: Math.floor(Math.random() * 20 + 10),
          recentComments: [
            'Great teacher, very engaging with the children',
            'Excellent preparation and lesson delivery',
            'Students love the interactive activities'
          ]
        }
      };
      
      return {
        success: true,
        data: report,
        message: 'Teacher reports retrieved successfully'
      };
    } catch (error: any) {
      return {
          success: false,
          data: undefined,
          message: 'Failed to fetch teacher reports'
        };
    }
  }

  // Students Management
  async getStudents(params?: StudentQueryParams): Promise<StudentsResponse> {
    try {
      await delay(400);
      
      let filteredStudents = [...MOCK_STUDENTS];
      
      // Apply filters if provided
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredStudents = filteredStudents.filter(student => 
          student.name.toLowerCase().includes(searchTerm) ||
          student.parentContact.parentName.toLowerCase().includes(searchTerm) ||
          student.parentContact.email.toLowerCase().includes(searchTerm)
        );
      }
      
      if (params?.classId) {
        filteredStudents = filteredStudents.filter(student => student.currentClassId === params.classId);
      }
      
      // Note: ageGroup filtering not implemented as Student interface doesn't have ageGroup property
      
      return {
        success: true,
        data: filteredStudents,
        message: 'Students retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch students'
      };
    }
  }

  async getStudent(studentId: string): Promise<StudentResponse> {
    try {
      await delay(300);
      
      const foundStudent = MOCK_STUDENTS.find(student => student.id === studentId);
      
      if (!foundStudent) {
        return {
          success: false,
          data: undefined,
          message: 'Student not found'
        };
      }
      
      return {
        success: true,
        data: foundStudent,
        message: 'Student retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch student'
      };
    }
  }

  async createStudent(studentData: StudentFormData): Promise<StudentResponse> {
    try {
      await delay(700);
      
      const newStudent: Student = {
        id: `student_${Date.now()}`,
        name: studentData.name,
        age: studentData.age,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        parentContact: studentData.parentContact,
        currentClassId: studentData.classId,
        classHistory: [],
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        medicalInfo: studentData.medicalInfo,
        notes: studentData.notes
      };
      
      MOCK_STUDENTS.push(newStudent);
      
      return {
        success: true,
        data: newStudent,
        message: 'Student created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to create student'
      };
    }
  }

  async updateStudent(studentId: string, studentData: Partial<StudentFormData>): Promise<StudentResponse> {
    try {
      await delay(600);
      
      const studentIndex = MOCK_STUDENTS.findIndex(student => student.id === studentId);
      if (studentIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Student not found'
        };
      }
      
      const existingStudent = MOCK_STUDENTS[studentIndex];
      const updatedStudent = {
        ...existingStudent,
        ...studentData
      };
      
      MOCK_STUDENTS[studentIndex] = updatedStudent;
      
      return {
        success: true,
        data: updatedStudent,
        message: 'Student updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update student'
      };
    }
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const studentIndex = MOCK_STUDENTS.findIndex(student => student.id === studentId);
      if (studentIndex === -1) {
        return {
          success: false,
          data: null,
          message: 'Student not found'
        };
      }
      
      MOCK_STUDENTS.splice(studentIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Student deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to delete student'
      };
    }
  }

  async addStudentToClass(studentId: string, classId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      // Mock implementation - update student's currentClassId
      const studentIndex = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      if (studentIndex !== -1) {
        MOCK_STUDENTS[studentIndex].currentClassId = classId;
      }
      
      return {
        success: true,
        data: null,
        message: 'Student added to class successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to add student to class'
      };
    }
  }

  async removeStudentFromClass(studentId: string, classId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      // Mock implementation - remove student's currentClassId
      const studentIndex = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      if (studentIndex !== -1) {
        MOCK_STUDENTS[studentIndex].currentClassId = undefined;
      }
      
      return {
        success: true,
        data: null,
        message: 'Student removed from class successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to remove student from class'
      };
    }
  }

  async getClassStudents(classId: string): Promise<StudentsResponse> {
    try {
      await delay(400);
      
      const classStudents = MOCK_STUDENTS.filter(student => student.currentClassId === classId);
      
      return {
        success: true,
        data: classStudents,
        message: 'Class students retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch class students'
      };
    }
  }

  // Attendance Management
  async getAttendance(params?: AttendanceQueryParams): Promise<AttendanceResponse> {
    try {
      await delay(400);
      
      let filteredAttendance = [...MOCK_ATTENDANCE];
      
      // Apply filters if provided
      if (params?.classId) {
        filteredAttendance = filteredAttendance.filter(att => att.classId === params.classId);
      }
      
      if (params?.startDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date >= params.startDate!);
      }
      
      if (params?.endDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date <= params.endDate!);
      }
      
      if (params?.studentId) {
        filteredAttendance = filteredAttendance.filter(att => att.studentId === params.studentId);
      }
      
      return {
        success: true,
        data: filteredAttendance,
        message: 'Attendance retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch attendance'
      };
    }
  }

  async getClassAttendance(classId: string, params?: AttendanceQueryParams): Promise<AttendanceResponse> {
    try {
      await delay(400);
      
      let filteredAttendance = MOCK_ATTENDANCE.filter(att => att.classId === classId);
      
      if (params?.startDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date >= params.startDate!);
      }
      
      if (params?.endDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date <= params.endDate!);
      }
      
      if (params?.studentId) {
        filteredAttendance = filteredAttendance.filter(att => att.studentId === params.studentId);
      }
      
      return {
        success: true,
        data: filteredAttendance,
        message: 'Class attendance retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch class attendance'
      };
    }
  }

  async recordAttendance(attendanceData: AttendanceFormData): Promise<AttendanceResponse> {
    try {
      await delay(600);
      
      const newAttendanceRecords: ClassAttendance[] = attendanceData.attendanceRecords.map(record => ({
        id: `attendance_${Date.now()}_${record.studentId}`,
        classId: attendanceData.classId,
        studentId: record.studentId,
        studentName: MOCK_STUDENTS.find(s => s.id === record.studentId)?.name || 'Unknown Student',
        date: attendanceData.date,
        status: record.status,
        notes: record.notes,
        recordedBy: 'System',
        recordedAt: new Date().toISOString()
      }));
      
      MOCK_ATTENDANCE.push(...newAttendanceRecords);
      
      return {
        success: true,
        data: newAttendanceRecords,
        message: 'Attendance recorded successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to record attendance'
      };
    }
  }

  async updateAttendance(attendanceId: string, status: string, notes?: string): Promise<ApiResponse<ClassAttendance>> {
    try {
      await delay(500);
      
      const attendanceIndex = MOCK_ATTENDANCE.findIndex(att => att.id === attendanceId);
      if (attendanceIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Attendance record not found'
        };
      }
      
      const existingAttendance = MOCK_ATTENDANCE[attendanceIndex];
      const updatedAttendance = {
        ...existingAttendance,
        status: status as AttendanceStatus,
        notes,
        recordedAt: new Date().toISOString()
      };
      
      MOCK_ATTENDANCE[attendanceIndex] = updatedAttendance;
      
      return {
        success: true,
        data: updatedAttendance,
        message: 'Attendance updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update attendance'
      };
    }
  }

  // Materials Management
  async getMaterials(params?: MaterialQueryParams): Promise<MaterialsResponse> {
    try {
      await delay(400);
      
      let filteredMaterials = [...MOCK_MATERIALS];
      
      // Apply filters if provided
      if (params?.search) {
        const searchTerm = params.search.toLowerCase();
        filteredMaterials = filteredMaterials.filter(material => 
          material.title.toLowerCase().includes(searchTerm) ||
          material.description.toLowerCase().includes(searchTerm) ||
          material.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      if (params?.type) {
        filteredMaterials = filteredMaterials.filter(material => material.type === params.type);
      }
      
      if (params?.ageGroup) {
        filteredMaterials = filteredMaterials.filter(material => material.ageGroup === params.ageGroup);
      }
      
      return {
        success: true,
        data: filteredMaterials,
        message: 'Materials retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch materials'
      };
    }
  }

  async getMaterial(materialId: string): Promise<MaterialResponse> {
    try {
      await delay(300);
      
      const foundMaterial = MOCK_MATERIALS.find(material => material.id === materialId);
      
      if (!foundMaterial) {
        return {
          success: false,
          data: undefined,
          message: 'Material not found'
        };
      }
      
      return {
        success: true,
        data: foundMaterial,
        message: 'Material retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch material'
      };
    }
  }

  async uploadMaterial(materialData: MaterialFormData): Promise<MaterialResponse> {
    try {
      await delay(800);
      
      const newMaterial: TeachingMaterial = {
        id: `material_${Date.now()}`,
        title: materialData.title,
        description: materialData.description,
        type: materialData.type,
        ageGroup: materialData.ageGroup,
        fileUrl: materialData.file ? `https://example.com/materials/${Date.now()}.pdf` : undefined,
        fileName: materialData.file ? `${materialData.title}.pdf` : undefined,
        fileSize: materialData.file ? 2048000 : undefined,
        uploadedBy: {
          id: 'current_user_id',
          name: 'Current User'
        },
        uploadDate: new Date().toISOString(),
        tags: materialData.tags || [],
        isPublic: materialData.isPublic,
        downloadCount: 0,
        classId: materialData.classId
      };
      
      MOCK_MATERIALS.push(newMaterial);
      
      return {
        success: true,
        data: newMaterial,
        message: 'Material uploaded successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to upload material'
      };
    }
  }

  async updateMaterial(materialId: string, materialData: Partial<MaterialFormData>): Promise<MaterialResponse> {
    try {
      await delay(600);
      
      const materialIndex = MOCK_MATERIALS.findIndex(material => material.id === materialId);
      if (materialIndex === -1) {
        return {
          success: false,
          data: undefined,
          message: 'Material not found'
        };
      }
      
      const existingMaterial = MOCK_MATERIALS[materialIndex];
      const updatedMaterial = {
        ...existingMaterial,
        ...materialData
      };
      
      MOCK_MATERIALS[materialIndex] = updatedMaterial;
      
      return {
        success: true,
        data: updatedMaterial,
        message: 'Material updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to update material'
      };
    }
  }

  async deleteMaterial(materialId: string): Promise<ApiResponse<null>> {
    try {
      await delay(400);
      
      const materialIndex = MOCK_MATERIALS.findIndex(material => material.id === materialId);
      if (materialIndex === -1) {
        return {
          success: false,
          data: null,
          message: 'Material not found'
        };
      }
      
      MOCK_MATERIALS.splice(materialIndex, 1);
      
      return {
        success: true,
        data: null,
        message: 'Material deleted successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to delete material'
      };
    }
  }

  async downloadMaterial(materialId: string): Promise<ApiResponse<Blob>> {
    try {
      await delay(500);
      // Mock blob data for download
      const mockBlob = new Blob(['Mock file content'], { type: 'application/pdf' });
      return {
        success: true,
        data: mockBlob,
        message: 'Material downloaded successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to download material'
      };
    }
  }

  // Reports and Analytics
  async getSundaySchoolStats(): Promise<SundaySchoolStatsResponse> {
    try {
      await delay(600);
      
      const totalClasses = MOCK_CLASSES.length;
      const totalTeachers = MOCK_TEACHERS.length;
      const totalStudents = MOCK_STUDENTS.length;
      const totalMaterials = MOCK_MATERIALS.length;
      
      // Calculate attendance statistics
      const recentAttendance = MOCK_ATTENDANCE.filter(att => {
        const attendanceDate = new Date(att.date);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return attendanceDate >= oneWeekAgo;
      });
      
      const presentCount = recentAttendance.filter(att => att.status === AttendanceStatus.PRESENT).length;
      const averageAttendance = recentAttendance.length > 0 ? Math.round((presentCount / recentAttendance.length) * 100) : 0;
      
      const stats: SundaySchoolStats = {
        totalClasses,
        totalTeachers,
        totalStudents,
        averageAttendance,
        activeClasses: MOCK_CLASSES.filter(cls => cls.status === ClassStatus.ACTIVE).length,
        inactiveClasses: MOCK_CLASSES.filter(cls => cls.status === ClassStatus.INACTIVE).length,
        studentsThisWeek: Math.floor(totalStudents * 0.8), // Mock 80% attendance this week
        attendanceThisWeek: Math.floor(totalStudents * 0.8),
        growthRate: 5.2 // Mock 5.2% growth rate
      };
      
      return {
        success: true,
        data: stats,
        message: 'Sunday School stats retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch Sunday School stats'
      };
    }
  }

  async getAttendanceReport(params?: {
    startDate?: string;
    endDate?: string;
    classId?: string;
  }): Promise<AttendanceReportResponse> {
    try {
      await delay(700);
      
      let filteredAttendance = [...MOCK_ATTENDANCE];
      
      // Filter by date range
      if (params?.startDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date >= params.startDate!);
      }
      if (params?.endDate) {
        filteredAttendance = filteredAttendance.filter(att => att.date <= params.endDate!);
      }
      
      // Filter by class if specified
      if (params?.classId) {
        filteredAttendance = filteredAttendance.filter(att => att.classId === params.classId);
      }
      
      const totalSessions = 10; // Mock total sessions in period
      const presentCount = filteredAttendance.filter(att => att.status === AttendanceStatus.PRESENT).length;
    const absentCount = filteredAttendance.filter(att => att.status === AttendanceStatus.ABSENT).length;
    const lateCount = filteredAttendance.filter(att => att.status === AttendanceStatus.LATE).length;
      
      const report: AttendanceReport = {
        period: `${params?.startDate || '2024-01-01'} to ${params?.endDate || '2024-01-31'}`,
        totalClasses: MOCK_CLASSES.length,
        totalStudents: MOCK_STUDENTS.length,
        averageAttendance: Math.round((presentCount / (presentCount + absentCount + lateCount)) * 100),
        attendanceByClass: MOCK_CLASSES.map(cls => ({
          classId: cls.id,
          className: cls.name,
          attendanceRate: 85, // Mock 85% attendance rate
          totalSessions: totalSessions
        })),
        attendanceByMonth: [
          { month: 'January', attendanceRate: 82, totalStudents: MOCK_STUDENTS.length },
          { month: 'February', attendanceRate: 85, totalStudents: MOCK_STUDENTS.length },
          { month: 'March', attendanceRate: 88, totalStudents: MOCK_STUDENTS.length }
        ]
      };
      
      return {
        success: true,
        data: report,
        message: 'Attendance report retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to fetch attendance report'
      };
    }
  }

  async getClassReport(classId: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    try {
      await delay(600);
      
      const foundClass = MOCK_CLASSES.find(cls => cls.id === classId);
      if (!foundClass) {
        return {
          success: false,
          data: null,
          message: 'Class not found'
        };
      }
      
      const classStudents = MOCK_STUDENTS.filter(student => student.currentClassId === classId);
      const classAttendance = MOCK_ATTENDANCE.filter(att => att.classId === classId);
      
      const report = {
        classInfo: {
          id: foundClass.id,
          name: foundClass.name,
          teacher: foundClass.teacher.name,
          ageGroup: foundClass.ageGroup,
          totalStudents: classStudents.length
        },
        attendance: {
          totalSessions: 10,
          averageAttendance: Math.round(Math.random() * 20 + 75), // Mock 75-95%
          perfectAttendanceStudents: Math.floor(classStudents.length * 0.3),
          attendanceByMonth: [
            { month: 'January', percentage: Math.round(Math.random() * 20 + 75) },
            { month: 'February', percentage: Math.round(Math.random() * 20 + 75) },
            { month: 'March', percentage: Math.round(Math.random() * 20 + 75) }
          ]
        },
        performance: {
          activeStudents: classStudents.filter(s => s.status === 'Active').length,
          newStudents: Math.floor(classStudents.length * 0.2),
          graduatedStudents: Math.floor(classStudents.length * 0.1),
          retentionRate: Math.round(Math.random() * 20 + 80)
        },
        materials: {
          totalMaterials: MOCK_MATERIALS.filter(m => m.ageGroup === foundClass.ageGroup).length,
          recentUploads: 3,
          mostDownloaded: 'Bible Stories for Kids'
        }
      };
      
      return {
        success: true,
        data: report,
        message: 'Class report retrieved successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Failed to fetch class report'
      };
    }
  }

  async exportClassReport(classId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<ApiResponse<Blob>> {
    try {
      await delay(800);
      
      // Create mock blob data for export
      const mockContent = format === 'pdf' 
        ? 'Mock PDF content for class report'
        : 'Mock Excel content for class report';
      const mockBlob = new Blob([mockContent], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      return {
        success: true,
        data: mockBlob,
        message: 'Class report exported successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to export class report'
      };
    }
  }

  async exportAttendanceReport(params?: {
    startDate?: string;
    endDate?: string;
    classId?: string;
    format?: 'pdf' | 'excel';
  }): Promise<ApiResponse<Blob>> {
    try {
      await delay(800);
      
      const format = params?.format || 'pdf';
      
      // Create mock blob data for export
      const mockContent = format === 'pdf' 
        ? 'Mock PDF content for attendance report'
        : 'Mock Excel content for attendance report';
      const mockBlob = new Blob([mockContent], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      return {
        success: true,
        data: mockBlob,
        message: 'Attendance report exported successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        message: 'Failed to export attendance report'
      };
    }
  }
}

export const sundaySchoolService = new SundaySchoolService();
export default sundaySchoolService;