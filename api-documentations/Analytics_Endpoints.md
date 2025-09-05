## 📊 Analytics Endpoints

### GET /analytics/overview
**Description**: Get analytics overview

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalMembers": 150,
    "activeMembers": 120,
    "newMembersThisMonth": 5,
    "totalGiving": 15000.00,
    "averageAttendance": 85,
    "upcomingEvents": 3,
    "growthRate": 12.5,
    "topGivers": [
      {
        "name": "John Doe",
        "amount": 2000.00
      }
    ],
    "attendanceTrends": [
      {
        "month": "January",
        "attendance": 85
      }
    ]
  }
}
```

### GET /analytics/attendance
**Description**: Get attendance analytics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&groupBy=week
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalAttendance": 340,
    "averageAttendance": 85,
    "attendanceRate": 85.5,
    "trends": [
      {
        "period": "Week 1",
        "attendance": 90,
        "target": 100
      }
    ],
    "byAgeGroup": [
      {
        "group": "Adults",
        "attendance": 60
      }
    ]
  }
}
```

### GET /analytics/giving
**Description**: Get giving analytics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalGiving": 15000.00,
    "averageGiving": 100.00,
    "givingByCategory": [
      {
        "category": "tithe",
        "amount": 10000.00,
        "percentage": 66.67
      }
    ],
    "monthlyTrends": [
      {
        "month": "January",
        "amount": 15000.00
      }
    ],
    "topGivers": [
      {
        "name": "John Doe",
        "amount": 2000.00
      }
    ]
  }
}
```

---

