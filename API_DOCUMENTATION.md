# Church Management System - API Documentation

This document outlines the API endpoints that the frontend expects from the backend implementation. The backend team should implement these endpoints using Python (FastAPI, Django, or Flask).

## 🔐 Authentication Endpoints

### Base URL
```
http://localhost:8000/api
```

### Authentication Flow
1. User submits login credentials
2. Backend validates credentials and returns JWT token
3. Frontend stores token in localStorage
4. Token is automatically included in subsequent requests

### Endpoints

#### POST /auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "admin@church.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "email": "admin@church.com",
      "name": "Admin User",
      "role": {
        "name": "SuperAdmin",
        "permissions": [
          "canViewMembers",
          "canEditMembers",
          "canViewFinance",
          "canManageFinance"
        ]
      },
      "avatar": null,
      "createdAt": "2024-01-21T10:30:00Z",
      "updatedAt": "2024-01-21T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### POST /auth/register
**Description**: Register new user

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@church.com",
  "password": "password123",
  "role": "Admin"
}
```

**Response**: Same as login response

#### POST /auth/logout
**Description**: Logout user and invalidate token

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /auth/me
**Description**: Get current user information

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "email": "admin@church.com",
    "name": "Admin User",
    "role": {
      "name": "SuperAdmin",
      "permissions": ["canViewMembers", "canEditMembers"]
    },
    "avatar": null,
    "createdAt": "2024-01-21T10:30:00Z",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
}
```

#### PUT /auth/profile
**Description**: Update user profile

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@church.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Updated Name",
    "email": "updated@church.com",
    "role": {
      "name": "SuperAdmin",
      "permissions": ["canViewMembers", "canEditMembers"]
    }
  },
  "message": "Profile updated successfully"
}
```

#### PUT /auth/change-password
**Description**: Change user password

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### POST /auth/forgot-password
**Description**: Send password reset email

**Request Body**:
```json
{
  "email": "admin@church.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /auth/reset-password
**Description**: Reset password with token

**Request Body**:
```json
{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 👥 Members Endpoints

### GET /members
**Description**: Get all members with pagination and filters

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&search=john&status=active&gender=male&ageGroup=adult&sortBy=name&sortOrder=asc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "dateOfBirth": "1990-01-01",
        "gender": "male",
        "maritalStatus": "married",
        "address": "123 Main St",
        "city": "Accra",
        "state": "Greater Accra",
        "country": "Ghana",
        "postalCode": "00233",
        "status": "active",
        "membershipDate": "2020-01-01",
        "photo": "https://example.com/photo.jpg",
        "familyMembers": [
          {
            "id": "2",
            "name": "Jane Doe",
            "relationship": "spouse"
          }
        ],
        "createdAt": "2024-01-21T10:30:00Z",
        "updatedAt": "2024-01-21T10:30:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### GET /members/:id
**Description**: Get member by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1990-01-01",
    "gender": "male",
    "maritalStatus": "married",
    "address": "123 Main St",
    "city": "Accra",
    "state": "Greater Accra",
    "country": "Ghana",
    "postalCode": "00233",
    "status": "active",
    "membershipDate": "2020-01-01",
    "photo": "https://example.com/photo.jpg",
    "familyMembers": [],
    "createdAt": "2024-01-21T10:30:00Z",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
}
```

### POST /members
**Description**: Create new member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "maritalStatus": "married",
  "address": "123 Main St",
  "city": "Accra",
  "state": "Greater Accra",
  "country": "Ghana",
  "postalCode": "00233",
  "membershipDate": "2024-01-21"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "active",
    "createdAt": "2024-01-21T10:30:00Z"
  },
  "message": "Member created successfully"
}
```

### PUT /members/:id
**Description**: Update member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**: Same as POST /members

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "firstName": "John",
    "lastName": "Doe",
    "updatedAt": "2024-01-21T10:30:00Z"
  },
  "message": "Member updated successfully"
}
```

### DELETE /members/:id
**Description**: Delete member

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

### POST /members/:id/photo
**Description**: Upload member photo

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**: FormData with photo file

**Response**:
```json
{
  "success": true,
  "data": {
    "photoUrl": "https://example.com/photos/member-1.jpg"
  },
  "message": "Photo uploaded successfully"
}
```

### GET /members/:id/family
**Description**: Get member's family

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
      "id": "2",
      "name": "Jane Doe",
      "relationship": "spouse",
      "photo": "https://example.com/photo.jpg"
    }
  ]
}
```

### POST /members/:id/family
**Description**: Add family member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "familyMemberId": "2",
  "relationship": "spouse"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Family member added successfully"
}
```

### DELETE /members/:id/family/:familyMemberId
**Description**: Remove family member

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Family member removed successfully"
}
```

### GET /members/:id/history
**Description**: Get member activity history

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
      "id": "1",
      "action": "attendance",
      "description": "Attended Sunday service",
      "date": "2024-01-21T10:30:00Z"
    }
  ]
}
```

### POST /members/import
**Description**: Import members from CSV/Excel

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**: FormData with file

**Response**:
```json
{
  "success": true,
  "data": {
    "success": 50,
    "errors": [
      {
        "row": 3,
        "error": "Invalid email format"
      }
    ]
  },
  "message": "Import completed"
}
```

### GET /members/export
**Description**: Export members to CSV/Excel

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**: Same as GET /members

**Response**: File download (CSV/Excel)

### GET /members/stats
**Description**: Get member statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 120,
    "inactive": 30,
    "newThisMonth": 5,
    "genderDistribution": {
      "male": 75,
      "female": 75
    },
    "ageDistribution": {
      "children": 20,
      "youth": 30,
      "adults": 80,
      "seniors": 20
    }
  }
}
```

### GET /members/search
**Description**: Search members

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
q=john
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

## 💰 Finance Endpoints

### GET /finance/donations
**Description**: Get all donations

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&startDate=2024-01-01&endDate=2024-01-31&category=tithe&donorId=1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "donorId": "1",
        "donorName": "John Doe",
        "amount": 100.00,
        "currency": "GHS",
        "category": "tithe",
        "paymentMethod": "cash",
        "date": "2024-01-21",
        "receiptNumber": "RCP-001",
        "notes": "Monthly tithe",
        "createdAt": "2024-01-21T10:30:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### POST /finance/donations
**Description**: Create new donation

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "donorId": "1",
  "amount": 100.00,
  "currency": "GHS",
  "category": "tithe",
  "paymentMethod": "cash",
  "date": "2024-01-21",
  "notes": "Monthly tithe"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "receiptNumber": "RCP-001",
    "createdAt": "2024-01-21T10:30:00Z"
  },
  "message": "Donation recorded successfully"
}
```

### GET /finance/budgets
**Description**: Get all budgets

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
      "id": "1",
      "name": "Youth Ministry Budget",
      "amount": 5000.00,
      "currency": "GHS",
      "spent": 3200.00,
      "remaining": 1800.00,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "status": "active",
      "categories": [
        {
          "name": "Events",
          "budgeted": 2000.00,
          "spent": 1500.00
        }
      ]
    }
  ]
}
```

### POST /finance/budgets
**Description**: Create new budget

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "Youth Ministry Budget",
  "amount": 5000.00,
  "currency": "GHS",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "categories": [
    {
      "name": "Events",
      "budgeted": 2000.00
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Youth Ministry Budget"
  },
  "message": "Budget created successfully"
}
```

### GET /finance/expenses
**Description**: Get all expenses

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
      "id": "1",
      "description": "Youth event supplies",
      "amount": 500.00,
      "currency": "GHS",
      "category": "Events",
      "budgetId": "1",
      "date": "2024-01-21",
      "approvedBy": "admin",
      "status": "approved",
      "receipt": "https://example.com/receipt.jpg"
    }
  ]
}
```

### POST /finance/expenses
**Description**: Create new expense

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "description": "Youth event supplies",
  "amount": 500.00,
  "currency": "GHS",
  "category": "Events",
  "budgetId": "1",
  "date": "2024-01-21",
  "receipt": "file_upload"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "status": "pending"
  },
  "message": "Expense submitted successfully"
}
```

### GET /finance/reports
**Description**: Get financial reports

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
type=giving&startDate=2024-01-01&endDate=2024-01-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalIncome": 15000.00,
    "totalExpenses": 8000.00,
    "netIncome": 7000.00,
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
        "income": 15000.00,
        "expenses": 8000.00
      }
    ]
  }
}
```

---

## 📅 Events Endpoints

### GET /events
**Description**: Get all events

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31&category=service
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "title": "Sunday Service",
        "description": "Weekly Sunday service",
        "startDate": "2024-01-21T09:00:00Z",
        "endDate": "2024-01-21T11:00:00Z",
        "location": "Main Auditorium",
        "category": "service",
        "organizer": "Pastor John",
        "maxAttendees": 200,
        "currentAttendees": 150,
        "status": "active",
        "image": "https://example.com/event.jpg",
        "createdAt": "2024-01-21T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### POST /events
**Description**: Create new event

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Sunday Service",
  "description": "Weekly Sunday service",
  "startDate": "2024-01-21T09:00:00Z",
  "endDate": "2024-01-21T11:00:00Z",
  "location": "Main Auditorium",
  "category": "service",
  "organizer": "Pastor John",
  "maxAttendees": 200,
  "image": "file_upload"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Sunday Service"
  },
  "message": "Event created successfully"
}
```

### GET /events/:id
**Description**: Get event by ID

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Sunday Service",
    "description": "Weekly Sunday service",
    "startDate": "2024-01-21T09:00:00Z",
    "endDate": "2024-01-21T11:00:00Z",
    "location": "Main Auditorium",
    "category": "service",
    "organizer": "Pastor John",
    "maxAttendees": 200,
    "currentAttendees": 150,
    "status": "active",
    "image": "https://example.com/event.jpg",
    "attendees": [
      {
        "id": "1",
        "name": "John Doe",
        "status": "confirmed"
      }
    ]
  }
}
```

### PUT /events/:id
**Description**: Update event

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**: Same as POST /events

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Updated Event Title"
  },
  "message": "Event updated successfully"
}
```

### DELETE /events/:id
**Description**: Delete event

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### POST /events/:id/register
**Description**: Register for event

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "memberId": "1",
  "status": "confirmed"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Registration successful"
}
```

### GET /events/:id/attendance
**Description**: Get event attendance

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
      "id": "1",
      "memberId": "1",
      "memberName": "John Doe",
      "status": "present",
      "checkInTime": "2024-01-21T09:15:00Z",
      "checkOutTime": "2024-01-21T11:00:00Z"
    }
  ]
}
```

---

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

## 🔧 Settings Endpoints

### GET /settings
**Description**: Get system settings

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "church": {
      "name": "Grace Community Church",
      "address": "123 Faith Street",
      "phone": "+1234567890",
      "email": "info@gracechurch.com",
      "website": "https://gracechurch.com"
    },
    "appearance": {
      "theme": "system",
      "language": "en",
      "timezone": "UTC-5",
      "currency": "GHS"
    },
    "notifications": {
      "email": {
        "newMember": true,
        "attendance": true,
        "financial": true
      },
      "sms": {
        "emergency": false,
        "events": true
      }
    }
  }
}
```

### PUT /settings
**Description**: Update system settings

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "church": {
    "name": "Updated Church Name",
    "address": "Updated Address"
  },
  "appearance": {
    "theme": "dark",
    "currency": "USD"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

---

## 📋 Error Responses

All endpoints should return consistent error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password must be at least 8 characters"
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🔄 WebSocket Events (Future)

For real-time features, implement WebSocket connections:

### Connection
```
ws://localhost:8000/ws
```

### Events
- `attendance_update` - Real-time attendance updates
- `donation_received` - New donation notifications
- `event_reminder` - Event reminders
- `system_notification` - System-wide notifications

---

## 📝 Implementation Notes

### Authentication
- Use JWT tokens for authentication
- Implement token refresh mechanism
- Store tokens securely in localStorage
- Handle token expiration gracefully

### File Uploads
- Support multipart/form-data for file uploads
- Implement file size limits and type validation
- Store files in cloud storage (AWS S3, etc.)
- Generate secure URLs for file access

### Pagination
- Implement consistent pagination across all list endpoints
- Use page-based pagination with limit parameter
- Return total count and page information

### Search & Filtering
- Implement flexible search across text fields
- Support multiple filter parameters
- Use case-insensitive search
- Implement sorting by multiple fields

### Data Validation
- Validate all input data on the server
- Return detailed validation error messages
- Sanitize user inputs to prevent injection attacks

### Performance
- Implement database indexing for frequently queried fields
- Use pagination to limit response sizes
- Implement caching for static data
- Optimize database queries

### Security
- Implement CORS properly
- Validate JWT tokens on every request
- Sanitize all user inputs
- Implement rate limiting
- Use HTTPS in production

This API documentation provides a comprehensive guide for the backend team to implement all necessary endpoints for the Church Management System frontend. 