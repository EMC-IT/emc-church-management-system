## 🎓 Sunday School Endpoints

### GET /sunday-school/classes
**Description**: Get all Sunday school classes

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
search=children&ageGroup=Children&status=Active&teacherId=teacher_001
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "class_001",
      "name": "Little Lambs",
      "description": "Sunday school class for young children",
      "ageGroup": "Children",
      "teacher": {
        "id": "teacher_001",
        "name": "Sister Mary",
        "email": "mary@church.com",
        "phone": "+233 24 123 4567"
      },
      "assistantTeachers": [
        {
          "id": "teacher_002",
          "name": "Sister Grace"
        }
      ],
      "students": 15,
      "maxStudents": 20,
      "schedule": "Sundays 9:00 AM - 10:00 AM",
      "location": "Children's Wing Room 1",
      "status": "Active",
      "curriculum": "Bible Stories for Kids",
      "objectives": ["Learn basic Bible stories", "Develop Christian values"],
      "createdDate": "2024-01-01",
      "lastUpdated": "2024-01-20"
    }
  ]
}
```

### GET /sunday-school/classes/:id
**Description**: Get Sunday school class by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "class_001",
    "name": "Little Lambs",
    "description": "Sunday school class for young children",
    "ageGroup": "Children",
    "teacher": {
      "id": "teacher_001",
      "name": "Sister Mary",
      "email": "mary@church.com",
      "phone": "+233 24 123 4567"
    },
    "assistantTeachers": [
      {
        "id": "teacher_002",
        "name": "Sister Grace"
      }
    ],
    "students": 15,
    "maxStudents": 20,
    "schedule": "Sundays 9:00 AM - 10:00 AM",
    "location": "Children's Wing Room 1",
    "status": "Active",
    "curriculum": "Bible Stories for Kids",
    "objectives": ["Learn basic Bible stories", "Develop Christian values"],
    "createdDate": "2024-01-01",
    "lastUpdated": "2024-01-20"
  }
}
```

### POST /sunday-school/classes
**Description**: Create new Sunday school class

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Teen Disciples",
  "description": "Sunday school for teenagers",
  "ageGroup": "Youth",
  "teacherId": "teacher_003",
  "assistantTeacherIds": ["teacher_004"],
  "maxStudents": 25,
  "schedule": "Sundays 10:30 AM - 11:30 AM",
  "location": "Youth Center",
  "curriculum": "Teen Bible Study",
  "objectives": ["Understand Christian principles", "Build leadership skills"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "class_005",
    "name": "Teen Disciples",
    "status": "Active",
    "createdDate": "2024-01-25"
  },
  "message": "Class created successfully"
}
```

### PUT /sunday-school/classes/:id
**Description**: Update Sunday school class

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**: Same as POST /sunday-school/classes

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "class_001",
    "name": "Updated Class Name",
    "lastUpdated": "2024-01-25"
  },
  "message": "Class updated successfully"
}
```

### DELETE /sunday-school/classes/:id
**Description**: Delete Sunday school class

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

### GET /sunday-school/teachers
**Description**: Get all Sunday school teachers

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
search=mary&status=Active&hasClasses=true
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "teacher_001",
      "name": "Sister Mary Grace",
      "email": "mary@church.com",
      "phone": "+233 24 123 4567",
      "specialization": "Children Ministry",
      "experience": "5 years",
      "qualifications": ["Sunday School Certificate", "Child Psychology"],
      "assignedClasses": [
        {
          "id": "class_001",
          "name": "Little Lambs",
          "role": "Primary Teacher"
        }
      ],
      "status": "Active",
      "joinedDate": "2019-01-15",
      "lastUpdated": "2024-01-20"
    }
  ]
}
```

### POST /sunday-school/teachers
**Description**: Create new Sunday school teacher

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Brother John Smith",
  "email": "john@church.com",
  "phone": "+233 24 234 5678",
  "specialization": "Youth Ministry",
  "experience": "3 years",
  "qualifications": ["Youth Leadership Certificate"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "teacher_005",
    "name": "Brother John Smith",
    "status": "Active",
    "joinedDate": "2024-01-25"
  },
  "message": "Teacher created successfully"
}
```

### GET /sunday-school/students
**Description**: Get all Sunday school students

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
search=david&classId=class_001&ageGroup=Children&status=Active
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "student_001",
      "name": "David Johnson",
      "dateOfBirth": "2015-05-15",
      "age": 8,
      "gender": "Male",
      "parentGuardian": {
        "name": "Michael Johnson",
        "relationship": "Father",
        "phone": "+233 24 345 6789",
        "email": "michael@church.com",
        "address": "123 Main Street, Accra"
      },
      "classId": "class_001",
      "className": "Little Lambs",
      "enrollmentDate": "2024-01-01",
      "status": "Active",
      "medicalInfo": "No known allergies",
      "notes": "Very active and enthusiastic"
    }
  ]
}
```

### POST /sunday-school/students
**Description**: Enroll new Sunday school student

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Sarah Wilson",
  "dateOfBirth": "2016-03-20",
  "gender": "Female",
  "parentGuardian": {
    "name": "Grace Wilson",
    "relationship": "Mother",
    "phone": "+233 24 456 7890",
    "email": "grace@church.com",
    "address": "456 Oak Street, Accra"
  },
  "classId": "class_001",
  "medicalInfo": "Asthma - has inhaler",
  "notes": "Shy but eager to learn"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "student_005",
    "name": "Sarah Wilson",
    "classId": "class_001",
    "enrollmentDate": "2024-01-25",
    "status": "Active"
  },
  "message": "Student enrolled successfully"
}
```

### GET /sunday-school/materials
**Description**: Get teaching materials

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
search=bible&type=Lesson Plan&ageGroup=Children&classId=class_001
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "material_001",
      "title": "Noah's Ark Lesson Plan",
      "description": "Complete lesson plan about Noah's Ark story",
      "type": "Lesson Plan",
      "ageGroup": "Children",
      "classId": "class_001",
      "tags": ["Bible Stories", "Old Testament", "Animals"],
      "isPublic": true,
      "fileUrl": "https://example.com/materials/noahs-ark.pdf",
      "uploadedBy": "teacher_001",
      "uploadedDate": "2024-01-15",
      "lastUpdated": "2024-01-20"
    }
  ]
}
```

### POST /sunday-school/materials
**Description**: Upload teaching material

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**: FormData with material file and metadata

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "material_005",
    "title": "David and Goliath Activity",
    "fileUrl": "https://example.com/materials/david-goliath.pdf",
    "uploadedDate": "2024-01-25"
  },
  "message": "Material uploaded successfully"
}
```

### GET /sunday-school/attendance
**Description**: Get Sunday school attendance

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
classId=class_001&startDate=2024-01-01&endDate=2024-01-31&studentId=student_001
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "attendance_001",
      "classId": "class_001",
      "studentId": "student_001",
      "studentName": "David Johnson",
      "date": "2024-01-21",
      "status": "Present",
      "notes": "Participated actively in discussions",
      "recordedBy": "teacher_001",
      "recordedAt": "2024-01-21T10:30:00Z"
    }
  ]
}
```

### POST /sunday-school/attendance
**Description**: Record Sunday school attendance

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "classId": "class_001",
  "date": "2024-01-28",
  "attendances": [
    {
      "studentId": "student_001",
      "status": "Present",
      "notes": "Great participation"
    },
    {
      "studentId": "student_002",
      "status": "Absent",
      "notes": "Family trip"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "processed": 2,
    "successful": 2,
    "failed": 0
  },
  "message": "Attendance recorded successfully"
}
```

### GET /sunday-school/stats
**Description**: Get Sunday school statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalClasses": 8,
    "activeClasses": 7,
    "totalStudents": 120,
    "totalTeachers": 15,
    "averageAttendance": 85,
    "studentsThisWeek": 102,
    "classesByAgeGroup": [
      {
        "ageGroup": "Children",
        "count": 4
      }
    ],
    "attendanceTrends": [
      {
        "week": "2024-W03",
        "attendance": 102,
        "rate": 85
      }
    ]
  }
}
```

### GET /sunday-school/reports
**Description**: Get Sunday school reports

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&classId=class_001&reportType=attendance
```

**Response**:
```json
{
  "success": true,
  "data": {
    "reportType": "attendance",
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "summary": {
      "totalSessions": 4,
      "averageAttendance": 85,
      "totalStudents": 15,
      "attendanceRate": 85
    },
    "classBreakdown": [
      {
        "classId": "class_001",
        "className": "Little Lambs",
        "sessions": 4,
        "averageAttendance": 13,
        "attendanceRate": 87
      }
    ],
    "studentAttendance": [
      {
        "studentId": "student_001",
        "studentName": "David Johnson",
        "sessionsAttended": 4,
        "attendanceRate": 100
      }
    ]
  }
}
```

---

