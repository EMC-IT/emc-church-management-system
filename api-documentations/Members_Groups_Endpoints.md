## 👥 Groups Endpoints

### GET /groups
**Description**: Get all groups with pagination and filters

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&search=youth&category=Ministry&status=Active&leader=Pastor&sortBy=name&sortOrder=asc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "grp_001",
        "name": "Youth Ministry",
        "description": "Ministry focused on young people aged 13-25",
        "category": "Ministry",
        "leader": {
          "id": "mem_001",
          "name": "Pastor Mike Johnson",
          "email": "mike@church.com",
          "phone": "+233 24 123 4567"
        },
        "members": 85,
        "maxMembers": 100,
        "meetingSchedule": "Fridays 6:00 PM",
        "location": "Youth Center",
        "engagement": 92,
        "status": "Active",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-20T15:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### GET /groups/:id
**Description**: Get group by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "grp_001",
    "name": "Youth Ministry",
    "description": "Ministry focused on young people aged 13-25",
    "category": "Ministry",
    "leader": {
      "id": "mem_001",
      "name": "Pastor Mike Johnson",
      "email": "mike@church.com",
      "phone": "+233 24 123 4567"
    },
    "members": 85,
    "maxMembers": 100,
    "meetingSchedule": "Fridays 6:00 PM",
    "location": "Youth Center",
    "engagement": 92,
    "status": "Active",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

### POST /groups
**Description**: Create new group

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Senior Fellowship",
  "description": "Fellowship for senior members",
  "category": "Fellowship",
  "leaderId": "mem_005",
  "maxMembers": 50,
  "meetingSchedule": "Thursdays 2:00 PM",
  "location": "Fellowship Hall"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "grp_007",
    "name": "Senior Fellowship",
    "status": "Active",
    "createdAt": "2024-01-25T10:30:00Z"
  },
  "message": "Group created successfully"
}
```

### PUT /groups/:id
**Description**: Update group

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**: Same as POST /groups

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "grp_001",
    "name": "Updated Group Name",
    "updatedAt": "2024-01-25T10:30:00Z"
  },
  "message": "Group updated successfully"
}
```

### DELETE /groups/:id
**Description**: Delete group

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Group deleted successfully"
}
```

### GET /groups/:id/members
**Description**: Get group members

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
      "id": "gm_001",
      "groupId": "grp_001",
      "memberId": "mem_007",
      "memberName": "David Johnson",
      "memberEmail": "david@church.com",
      "memberPhone": "+233 24 789 0123",
      "role": "Member",
      "joinedAt": "2024-01-15T10:00:00Z",
      "status": "Active"
    }
  ]
}
```

### POST /groups/:id/members
**Description**: Add member to group

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "memberId": "mem_008",
  "role": "Member"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member added to group successfully"
}
```

### GET /groups/:id/events
**Description**: Get group events

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
      "id": "ge_001",
      "groupId": "grp_001",
      "title": "Youth Retreat",
      "description": "Annual youth retreat",
      "date": "2024-03-15",
      "startTime": "09:00",
      "endTime": "17:00",
      "location": "Camp Grounds",
      "expectedAttendees": 50,
      "actualAttendees": 0,
      "status": "PLANNED",
      "createdAt": "2024-01-20T00:00:00Z"
    }
  ]
}
```

### GET /groups/categories
**Description**: Get group categories

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
      "id": "gc_001",
      "name": "Ministry",
      "description": "Ministry-focused groups",
      "color": "#2E8DB0",
      "isActive": true
    }
  ]
}
```

### GET /groups/stats
**Description**: Get group statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalGroups": 20,
    "activeGroups": 18,
    "totalMembers": 450,
    "averageEngagement": 88,
    "groupsByCategory": [
      {
        "category": "Ministry",
        "count": 8
      }
    ],
    "topEngagementGroups": [
      {
        "name": "Prayer Warriors",
        "engagement": 98
      }
    ]
  }
}
```

---

