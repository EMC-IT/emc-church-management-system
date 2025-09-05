## 📊 Attendance Endpoints

### GET /attendance/sessions
**Description**: Get all attendance sessions

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&serviceType=Sunday Service&startDate=2024-01-01&endDate=2024-01-31&search=sunday
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "session_001",
        "title": "Sunday Service - 2024-01-21",
        "serviceType": "Sunday Service",
        "date": "2024-01-21",
        "startTime": "09:00",
        "endTime": "11:00",
        "location": "Main Auditorium",
        "expectedAttendees": 200,
        "actualAttendees": 185,
        "attendanceRate": 92.5,
        "status": "completed",
        "createdBy": "admin_001",
        "branch": "Main Campus",
        "createdAt": "2024-01-21T08:00:00Z",
        "updatedAt": "2024-01-21T11:30:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### GET /attendance/sessions/:id
**Description**: Get attendance session by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session_001",
    "title": "Sunday Service - 2024-01-21",
    "serviceType": "Sunday Service",
    "date": "2024-01-21",
    "startTime": "09:00",
    "endTime": "11:00",
    "location": "Main Auditorium",
    "expectedAttendees": 200,
    "actualAttendees": 185,
    "attendanceRate": 92.5,
    "status": "completed",
    "createdBy": "admin_001",
    "branch": "Main Campus",
    "createdAt": "2024-01-21T08:00:00Z",
    "updatedAt": "2024-01-21T11:30:00Z"
  }
}
```

### POST /attendance/sessions
**Description**: Create attendance session

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "serviceType": "Wednesday Service",
  "serviceDate": "2024-01-24",
  "startTime": "19:00",
  "endTime": "21:00",
  "location": "Main Auditorium",
  "expectedAttendees": 150,
  "departmentId": "dept_001",
  "groupId": "grp_001"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "session_005",
    "title": "Wednesday Service - 2024-01-24",
    "status": "scheduled",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Attendance session created successfully"
}
```

### GET /attendance/records
**Description**: Get attendance records

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&serviceType=Sunday Service&status=Present&memberId=mem_001&startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "att_001",
        "memberId": "mem_001",
        "member": {
          "id": "mem_001",
          "name": "John Doe",
          "email": "john@church.com",
          "phone": "+233 24 123 4567",
          "department": "Worship Team",
          "group": "Youth Ministry"
        },
        "serviceType": "Sunday Service",
        "serviceDate": "2024-01-21",
        "status": "Present",
        "checkInTime": "09:00",
        "notes": "On time",
        "recordedBy": "admin_001",
        "branch": "Main Campus",
        "createdAt": "2024-01-21T09:00:00Z"
      }
    ],
    "total": 200,
    "page": 1,
    "limit": 10,
    "totalPages": 20
  }
}
```

### POST /attendance/mark
**Description**: Mark attendance for a member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "memberId": "mem_001",
  "sessionId": "session_001",
  "status": "Present",
  "checkInTime": "09:15",
  "notes": "Arrived slightly late"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "att_005",
    "status": "Present",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Attendance marked successfully"
}
```

### POST /attendance/bulk
**Description**: Mark bulk attendance

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "sessionId": "session_001",
  "attendances": [
    {
      "memberId": "mem_001",
      "status": "Present",
      "checkInTime": "09:00"
    },
    {
      "memberId": "mem_002",
      "status": "Late",
      "checkInTime": "09:15",
      "notes": "Traffic delay"
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
  "message": "Bulk attendance processed successfully"
}
```

### GET /attendance/members/:id/profile
**Description**: Get member attendance profile

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "memberId": "mem_001",
    "memberName": "John Doe",
    "totalSessions": 48,
    "attendedSessions": 42,
    "attendanceRate": 87.5,
    "presentCount": 40,
    "lateCount": 2,
    "absentCount": 6,
    "excusedCount": 0,
    "currentStreak": 5,
    "longestStreak": 12,
    "recentAttendance": [
      {
        "date": "2024-01-21",
        "serviceType": "Sunday Service",
        "status": "Present"
      }
    ]
  }
}
```

### GET /attendance/reports
**Description**: Get attendance reports

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&groupBy=week&serviceType=Sunday Service
```

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSessions": 24,
      "totalAttendees": 1250,
      "averageAttendance": 52,
      "attendanceRate": 84
    },
    "trends": [
      {
        "period": "2024-01",
        "attendance": 387,
        "rate": 86
      }
    ],
    "byServiceType": [
      {
        "serviceType": "Sunday Service",
        "attendance": 850,
        "rate": 89
      }
    ],
    "byDepartment": [
      {
        "department": "Worship Team",
        "attendance": 95,
        "rate": 92
      }
    ]
  }
}
```

### GET /attendance/stats
**Description**: Get attendance statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalSessions": 24,
    "totalAttendees": 1250,
    "averageAttendance": 52,
    "attendanceRate": 84,
    "presentCount": 1050,
    "absentCount": 120,
    "lateCount": 65,
    "excusedCount": 15,
    "trends": [
      {
        "period": "2024-01",
        "attendance": 387,
        "rate": 86
      }
    ]
  }
}
```

---

