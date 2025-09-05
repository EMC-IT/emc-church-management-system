## 🏢 Departments Endpoints

### GET /departments
**Description**: Get all departments with pagination and filters

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&search=worship&category=cat_001&status=Active&leader=Sarah&sortBy=name&sortOrder=asc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "dept_001",
        "name": "Worship Team",
        "description": "Leading the congregation in worship through music and song",
        "leader": "Sarah Johnson",
        "members": ["mem_001", "mem_002", "mem_003"],
        "departmentType": "Ministry",
        "categoryId": "cat_001",
        "status": "Active",
        "budget": 50000,
        "location": "Sanctuary",
        "meetingSchedule": {
          "dayOfWeek": "Wednesday",
          "startTime": "19:00",
          "endTime": "21:00",
          "frequency": "weekly"
        },
        "stats": {
          "totalMembers": 12,
          "activeMembers": 10,
          "averageAttendance": 85,
          "upcomingMeetings": 2,
          "upcomingEvents": 1
        },
        "createdAt": "2024-01-15T00:00:00Z",
        "updatedAt": "2024-01-20T00:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### GET /departments/:id
**Description**: Get department by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "dept_001",
    "name": "Worship Team",
    "description": "Leading the congregation in worship through music and song",
    "leader": "Sarah Johnson",
    "members": ["mem_001", "mem_002", "mem_003"],
    "departmentType": "Ministry",
    "categoryId": "cat_001",
    "status": "Active",
    "budget": 50000,
    "location": "Sanctuary",
    "meetingSchedule": {
      "dayOfWeek": "Wednesday",
      "startTime": "19:00",
      "endTime": "21:00",
      "frequency": "weekly"
    },
    "stats": {
      "totalMembers": 12,
      "activeMembers": 10,
      "averageAttendance": 85,
      "upcomingMeetings": 2,
      "upcomingEvents": 1
    },
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  }
}
```

### POST /departments
**Description**: Create new department

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Youth Ministry",
  "description": "Ministry focused on young people",
  "leader": "Pastor Mike",
  "departmentType": "Ministry",
  "categoryId": "cat_001",
  "budget": 30000,
  "location": "Youth Center",
  "meetingSchedule": {
    "dayOfWeek": "Friday",
    "startTime": "18:00",
    "endTime": "20:00",
    "frequency": "weekly"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "dept_005",
    "name": "Youth Ministry",
    "status": "Active",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Department created successfully"
}
```

### PUT /departments/:id
**Description**: Update department

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**: Same as POST /departments

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "dept_001",
    "name": "Updated Department Name",
    "updatedAt": "2024-01-25T10:30:00Z"
  },
  "message": "Department updated successfully"
}
```

### DELETE /departments/:id
**Description**: Delete department

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Department deleted successfully"
}
```

### GET /departments/categories
**Description**: Get all department categories

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_001",
      "name": "Music Ministry",
      "description": "Departments focused on worship and music",
      "color": "#2E8DB0",
      "icon": "Music",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /departments/categories
**Description**: Create department category

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Children Ministry",
  "description": "Departments focused on children",
  "color": "#A5CF5D",
  "icon": "Baby"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_005",
    "name": "Children Ministry",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Category created successfully"
}
```

### GET /departments/:id/members
**Description**: Get department members

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "dm_001",
      "departmentId": "dept_001",
      "memberId": "mem_001",
      "memberName": "John Doe",
      "memberEmail": "john@church.com",
      "memberPhone": "+233 24 123 4567",
      "role": "Member",
      "joinedAt": "2024-01-15T00:00:00Z",
      "status": "Active"
    }
  ]
}
```

### POST /departments/:id/members
**Description**: Add member to department

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "memberId": "mem_005",
  "role": "Member"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member added to department successfully"
}
```

### GET /departments/:id/roles
**Description**: Get department roles

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "role_001",
      "departmentId": "dept_001",
      "memberId": "mem_001",
      "memberName": "Sarah Johnson",
      "roleType": "HEAD",
      "title": "Worship Leader",
      "description": "Lead worship sessions and coordinate music ministry",
      "responsibilities": [
        "Plan weekly worship sessions",
        "Coordinate with musicians"
      ],
      "startDate": "2024-01-15",
      "isActive": true,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### POST /departments/:id/roles
**Description**: Create department role

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "roleData": {
    "memberId": "mem_002",
    "roleType": "ASSISTANT",
    "title": "Assistant Worship Leader",
    "description": "Assist in worship coordination",
    "responsibilities": ["Support worship leader", "Manage equipment"],
    "startDate": "2024-01-25"
  },
  "departmentId": "dept_001"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "role_005",
    "title": "Assistant Worship Leader",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Department role created successfully"
}
```

### GET /departments/:id/meetings
**Description**: Get department meetings

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&status=scheduled
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "meet_001",
      "departmentId": "dept_001",
      "title": "Weekly Worship Planning",
      "description": "Plan upcoming worship sessions",
      "type": "PLANNING",
      "date": "2024-01-24",
      "startTime": "19:00",
      "endTime": "21:00",
      "location": "Sanctuary",
      "agenda": ["Song selection", "Rehearsal schedule"],
      "attendees": ["mem_001", "mem_002"],
      "status": "SCHEDULED",
      "createdAt": "2024-01-20T00:00:00Z"
    }
  ]
}
```

### POST /departments/:id/meetings
**Description**: Create department meeting

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Monthly Review Meeting",
  "description": "Review department performance",
  "type": "REVIEW",
  "date": "2024-02-01",
  "startTime": "19:00",
  "endTime": "21:00",
  "location": "Conference Room",
  "agenda": ["Performance review", "Budget discussion"],
  "attendees": ["mem_001", "mem_002", "mem_003"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "meet_005",
    "title": "Monthly Review Meeting",
    "status": "SCHEDULED",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Meeting created successfully"
}
```

### GET /departments/:id/events
**Description**: Get department events

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "event_001",
      "departmentId": "dept_001",
      "title": "Worship Concert",
      "description": "Special worship concert event",
      "type": "SOCIAL",
      "date": "2024-02-15",
      "startTime": "18:00",
      "endTime": "21:00",
      "location": "Main Auditorium",
      "expectedAttendees": 200,
      "budget": 5000,
      "status": "PLANNED",
      "createdAt": "2024-01-20T00:00:00Z"
    }
  ]
}
```

### GET /departments/stats
**Description**: Get department statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalDepartments": 15,
    "activeDepartments": 12,
    "totalMembers": 150,
    "averageAttendance": 85,
    "upcomingMeetings": 8,
    "upcomingEvents": 3,
    "departmentsByCategory": [
      {
        "category": "Music Ministry",
        "count": 4
      }
    ],
    "topPerformingDepartments": [
      {
        "name": "Worship Team",
        "attendance": 95
      }
    ]
  }
}
```

---

