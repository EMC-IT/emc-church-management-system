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
page=1&limit=10&search=john&membershipStatus=Active&gender=Male&ageGroup=adult&sortBy=name&sortOrder=asc
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
        "address": "123 Main Street, Accra",
        "dateOfBirth": "1990-01-01",
        "gender": "Male",
        "membershipStatus": "Active",
        "joinDate": "2020-01-01",
        "avatar": "https://example.com/photo.jpg",
        "familyId": "fam1",
        "department": "Youth Ministry",
        "branch": "Adenta (HQ)",
        "emergencyContact": {
          "name": "Jane Doe",
          "phone": "+1234567891",
          "relationship": "spouse"
        },
        "customFields": {
          "isConvert": false,
          "notes": "Active member"
        },
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
    "address": "123 Main Street, Accra",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "membershipStatus": "Active",
    "joinDate": "2020-01-01",
    "avatar": "https://example.com/photo.jpg",
    "familyId": "fam1",
    "department": "Youth Ministry",
    "branch": "Adenta (HQ)",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567891",
      "relationship": "spouse"
    },
    "customFields": {
      "isConvert": false,
      "notes": "Active member"
    },
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
  "address": "123 Main Street, Accra",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "membershipStatus": "Active",
  "joinDate": "2024-01-21",
  "familyId": "fam1",
  "department": "Youth Ministry",
  "branch": "Adenta (HQ)",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567891",
    "relationship": "spouse"
  },
  "customFields": {
    "notes": "New member"
  }
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
    "membershipStatus": "Active",
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

### POST /members/bulk-delete
**Description**: Bulk delete members

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "ids": ["1", "2", "3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "3 members deleted successfully"
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
    "avatar": "https://example.com/photos/member-1.jpg"
  },
  "message": "Photo uploaded successfully"
}
```

### POST /members/:id/family
**Description**: Add new family member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+1234567891",
  "address": "123 Main Street, Accra",
  "dateOfBirth": "1992-03-15",
  "gender": "Female",
  "relationship": "spouse",
  "membershipStatus": "Active",
  "joinDate": "2024-01-21"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "2",
    "firstName": "Jane",
    "lastName": "Doe",
    "relationship": "spouse",
    "familyId": "fam1"
  },
  "message": "Family member added successfully"
}
```

### POST /members/:id/family/link
**Description**: Link existing member to family

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "familyMemberId": "3",
  "relationship": "child"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Family member linked successfully"
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

## 🔄 Convert Management Endpoints

### POST /members/converts
**Description**: Create new convert

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "fullName": "Emmanuel Owusu",
  "phone": "+233 24 999 8888",
  "dateOfBirth": "2002-06-15",
  "gender": "Male",
  "branch": "Adenta (HQ)",
  "serviceType": "Empowerment",
  "location": "Accra",
  "notes": "New convert from outreach program"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "fullName": "Emmanuel Owusu",
    "membershipStatus": "New",
    "customFields": {
      "isConvert": true,
      "fullName": "Emmanuel Owusu"
    },
    "createdAt": "2024-01-21T10:30:00Z"
  },
  "message": "Convert created successfully"
}
```

### GET /members/:id/convert
**Description**: Get convert details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "fullName": "Emmanuel Owusu",
    "phone": "+233 24 999 8888",
    "dateOfBirth": "2002-06-15",
    "gender": "Male",
    "membershipStatus": "New",
    "branch": "Adenta (HQ)",
    "serviceType": "Empowerment",
    "location": "Accra",
    "customFields": {
      "isConvert": true,
      "fullName": "Emmanuel Owusu"
    },
    "createdAt": "2024-01-21T10:30:00Z",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
}
```

### PUT /members/:id/convert
**Description**: Update convert information

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "fullName": "Emmanuel Owusu",
  "phone": "+233 24 999 8888",
  "dateOfBirth": "2002-06-15",
  "gender": "Male",
  "branch": "Adenta (HQ)",
  "serviceType": "Empowerment",
  "location": "Accra",
  "notes": "Updated convert information"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "fullName": "Emmanuel Owusu",
    "updatedAt": "2024-01-21T10:30:00Z"
  },
  "message": "Convert updated successfully"
}
```

### POST /members/:id/convert/promote
**Description**: Promote convert to full member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "firstName": "Emmanuel",
  "lastName": "Owusu",
  "email": "emmanuel.owusu@email.com",
  "address": "456 Oak Street, Accra",
  "membershipStatus": "Active",
  "joinDate": "2024-01-21",
  "department": "Youth Ministry",
  "emergencyContact": {
    "name": "Mary Owusu",
    "phone": "+233 24 999 8889",
    "relationship": "mother"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "firstName": "Emmanuel",
    "lastName": "Owusu",
    "membershipStatus": "Active",
    "customFields": {
      "isConvert": false,
      "promotedFrom": "convert",
      "promotionDate": "2024-01-21"
    }
  },
  "message": "Convert promoted to member successfully"
}
```

### GET /converts
**Description**: Get all converts

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&search=emmanuel&branch=Adenta&sortBy=createdAt&sortOrder=desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "6",
        "fullName": "Emmanuel Owusu",
        "phone": "+233 24 999 8888",
        "gender": "Male",
        "membershipStatus": "New",
        "branch": "Adenta (HQ)",
        "serviceType": "Empowerment",
        "customFields": {
          "isConvert": true,
          "fullName": "Emmanuel Owusu"
        },
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

### GET /converts/stats
**Description**: Get conversion statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalConverts": 25,
    "newThisMonth": 8,
    "promotedThisMonth": 3,
    "conversionRate": 12.5,
    "byBranch": [
      {
        "branch": "Adenta (HQ)",
        "count": 15
      },
      {
        "branch": "Somanya",
        "count": 10
      }
    ],
    "byServiceType": [
      {
        "serviceType": "Empowerment",
        "count": 12
      },
      {
        "serviceType": "Sunday Service",
        "count": 13
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "newConverts": 8,
        "promoted": 3
      }
    ]
  }
}
```

### 💝 Member Giving Endpoints

### GET /members/:id/giving
**Description**: Get member's giving records

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&startDate=2024-01-01&endDate=2024-01-31&type=tithe&category=general&status=completed
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "memberId": "1",
        "amount": 500.00,
        "currency": "GHS",
        "type": "tithe",
        "category": "general",
        "paymentMethod": "cash",
        "date": "2024-01-21",
        "status": "completed",
        "receiptNumber": "RCP-001",
        "notes": "Monthly tithe",
        "campaign": null,
        "createdAt": "2024-01-21T10:30:00Z",
        "updatedAt": "2024-01-21T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

### POST /members/:id/giving
**Description**: Create giving record for member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "amount": 500.00,
  "currency": "GHS",
  "type": "tithe",
  "category": "general",
  "paymentMethod": "cash",
  "date": "2024-01-21",
  "notes": "Monthly tithe",
  "campaign": null
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
  "message": "Giving record created successfully"
}
```

### PUT /giving/:id
**Description**: Update giving record

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "amount": 600.00,
  "notes": "Updated monthly tithe",
  "status": "completed"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "updatedAt": "2024-01-21T11:30:00Z"
  },
  "message": "Giving record updated successfully"
}
```

### DELETE /giving/:id
**Description**: Delete giving record

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Giving record deleted successfully"
}
```

### POST /giving/bulk-delete
**Description**: Bulk delete giving records

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "givingIds": ["1", "2", "3"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "deleted": 3
  },
  "message": "Giving records deleted successfully"
}
```

### GET /members/:id/giving/analytics
**Description**: Get member giving analytics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-12-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalAmount": 6000.00,
    "totalCount": 12,
    "averageAmount": 500.00,
    "byType": {
      "tithe": { "amount": 5000.00, "count": 10 },
      "offering": { "amount": 1000.00, "count": 2 }
    },
    "byCategory": {
      "general": { "amount": 4000.00, "count": 8 },
      "building_fund": { "amount": 2000.00, "count": 4 }
    },
    "recentGiving": [
      {
        "id": "1",
        "amount": 500.00,
        "type": "tithe",
        "date": "2024-01-21"
      }
    ],
    "topCategories": [
      {
        "category": "general",
        "amount": 4000.00,
        "percentage": 66.7
      }
    ],
    "givingTrend": [
      {
        "period": "2024-01",
        "amount": 500.00,
        "change": 5.2
      }
    ]
  }
}
```

### GET /members/:id/giving/stats
**Description**: Get member giving statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalAmount": 6000.00,
    "totalCount": 12,
    "averageAmount": 500.00,
    "lastGiving": "2024-01-21",
    "byType": {
      "tithe": { "amount": 5000.00, "count": 10 },
      "offering": { "amount": 1000.00, "count": 2 }
    },
    "byCategory": {
      "general": { "amount": 4000.00, "count": 8 },
      "building_fund": { "amount": 2000.00, "count": 4 }
    },
    "byStatus": {
      "completed": { "amount": 5500.00, "count": 11 },
      "pending": { "amount": 500.00, "count": 1 }
    },
    "recentActivity": [
      {
        "id": "1",
        "amount": 500.00,
        "type": "tithe",
        "date": "2024-01-21"
      }
    ]
  }
}
```

### POST /giving/:id/receipt
**Description**: Generate receipt for giving

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "receiptUrl": "https://example.com/receipts/RCP-001.pdf",
    "receiptNumber": "RCP-001"
  },
  "message": "Receipt generated successfully"
}
```

### POST /giving/:id/receipt/send
**Description**: Send receipt via email

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Receipt sent successfully"
}
```

### GET /members/:id/giving/trends
**Description**: Get giving trends for member

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
period=month&startDate=2024-01-01&endDate=2024-12-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "period": "2024-01",
        "amount": 500.00,
        "count": 1,
        "change": 5.2
      }
    ],
    "summary": {
      "totalAmount": 6000.00,
      "averageAmount": 500.00,
      "growth": 12.5
    }
  }
}
```

### GET /members/:id/giving/goals
**Description**: Get giving goals and progress

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "currentGoal": {
      "amount": 6000.00,
      "deadline": "2024-12-31",
      "progress": 4500.00,
      "percentage": 75.0
    },
    "history": [
      {
        "year": 2023,
        "goal": 5000.00,
        "achieved": 5200.00,
        "percentage": 104.0
      }
    ]
  }
}
```

### POST /members/:id/giving/goals
**Description**: Set giving goal for member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "goal": 6000.00,
  "deadline": "2024-12-31"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Giving goal set successfully"
}
```

### GET /giving/types
**Description**: Get available giving types

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    "tithe",
    "offering",
    "donation",
    "fundraising",
    "pledge",
    "special",
    "missionary",
    "building",
    "other"
  ]
}
```

### GET /giving/categories
**Description**: Get available giving categories

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    "general",
    "building_fund",
    "missionary",
    "youth",
    "children",
    "music",
    "outreach",
    "charity",
    "education",
    "medical",
    "disaster_relief",
    "other"
  ]
}
```

### GET /giving/campaigns
**Description**: Get available giving campaigns

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    "Building Fund 2024",
    "Mission Trip",
    "Youth Camp",
    "Christmas Outreach"
  ]
}
```

### 📄 Member Documents Endpoints

### GET /members/:id/documents
**Description**: Get member's documents

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&category=identification&search=passport&tags=required
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "memberId": "1",
        "title": "National ID Card",
        "description": "Government issued identification card",
        "category": "identification",
        "fileName": "national_id_card.pdf",
        "fileSize": 2048576,
        "fileType": "application/pdf",
        "fileUrl": "/documents/national_id_card.pdf",
        "uploadedBy": "John Smith",
        "uploadedAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "isPublic": false,
        "tags": ["identification", "government", "required"],
        "metadata": {
          "expiryDate": "2029-12-31",
          "documentNumber": "GH-123456789-0"
        }
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### POST /members/:id/documents
**Description**: Upload document for member

**Headers**:
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body**: FormData with:
```
file: [File]
title: "Birth Certificate"
description: "Official birth certificate"
category: "identification"
isPublic: false
tags: ["birth", "certificate", "official"]
metadata: {"issueDate": "1990-01-01", "issuer": "Civil Registry"}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "fileName": "birth_certificate.pdf",
    "fileUrl": "/documents/birth_certificate.pdf",
    "uploadedAt": "2024-01-21T10:30:00Z"
  },
  "message": "Document uploaded successfully"
}
```

### GET /documents/:id
**Description**: Get document by ID

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
    "memberId": "1",
    "title": "National ID Card",
    "description": "Government issued identification card",
    "category": "identification",
    "fileName": "national_id_card.pdf",
    "fileSize": 2048576,
    "fileType": "application/pdf",
    "fileUrl": "/documents/national_id_card.pdf",
    "uploadedBy": "John Smith",
    "uploadedAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "isPublic": false,
    "tags": ["identification", "government", "required"],
    "metadata": {
      "expiryDate": "2029-12-31",
      "documentNumber": "GH-123456789-0"
    }
  }
}
```

### PUT /documents/:id
**Description**: Update document

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Updated National ID Card",
  "description": "Updated government issued identification card",
  "isPublic": true,
  "tags": ["identification", "government", "required", "updated"],
  "metadata": {
    "expiryDate": "2030-12-31",
    "documentNumber": "GH-123456789-1"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "updatedAt": "2024-01-21T11:30:00Z"
  },
  "message": "Document updated successfully"
}
```

### DELETE /documents/:id
**Description**: Delete document

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

### POST /documents/bulk-delete
**Description**: Bulk delete documents

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "documentIds": ["1", "2", "3"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "deleted": 3
  },
  "message": "Documents deleted successfully"
}
```

### GET /documents/:id/download
**Description**: Download document

**Headers**:
```
Authorization: Bearer <token>
```

**Response**: File download (binary)

### GET /documents/:id/preview
**Description**: Preview document

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "previewUrl": "https://example.com/preview/document-1.pdf",
    "thumbnailUrl": "https://example.com/thumbnails/document-1.jpg"
  }
}
```

### POST /documents/:id/share
**Description**: Share document

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "shareWith": ["user1", "user2"],
  "permissions": "read",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "shareUrl": "https://example.com/shared/abc123",
    "expiresAt": "2024-12-31T23:59:59Z"
  },
  "message": "Document shared successfully"
}
```

### GET /documents/shared
**Description**: Get shared documents

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
      "title": "Shared Document",
      "sharedBy": "John Smith",
      "sharedAt": "2024-01-21T10:30:00Z",
      "permissions": "read",
      "expiresAt": "2024-12-31T23:59:59Z"
    }
  ]
}
```

### PATCH /documents/:id/tags
**Description**: Update document tags

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "tags": ["identification", "government", "required", "verified"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Document tags updated successfully"
}
```

### GET /documents/tags
**Description**: Get available document tags

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    "identification",
    "government",
    "required",
    "verified",
    "medical",
    "education",
    "employment",
    "church",
    "personal"
  ]
}
```

### GET /documents/categories
**Description**: Get document categories

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": [
    "identification",
    "baptism",
    "marriage",
    "medical",
    "employment",
    "education",
    "legal",
    "financial",
    "other"
  ]
}
```

### GET /documents/stats
**Description**: Get document statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
memberId=1
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalDocuments": 25,
    "totalSize": 52428800,
    "byCategory": {
      "identification": 5,
      "medical": 3,
      "employment": 2
    },
    "byType": {
      "pdf": 15,
      "image": 8,
      "document": 2
    },
    "recentUploads": [
      {
        "id": "1",
        "title": "National ID Card",
        "uploadedAt": "2024-01-21T10:30:00Z"
      }
    ]
  }
}
```

### GET /members/:id/documents/export
**Description**: Export member documents

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
format=zip&category=identification
```

**Response**: File download (ZIP archive)

### 🔄 Member Conversion Endpoints

### POST /members/converts
**Description**: Create new convert

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "fullName": "Emmanuel Owusu",
  "contact1": "+233 24 999 8888",
  "gender": "Male",
  "dateOfBirth": "2002-06-15",
  "branch": "Adenta (HQ)",
  "serviceType": "Empowerment",
  "location": "Accra",
  "notes": "Interested in joining youth ministry"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "fullName": "Emmanuel Owusu",
    "status": "New",
    "createdAt": "2024-01-21T10:30:00Z"
  },
  "message": "Convert registered successfully"
}
```

### GET /members/:id/convert
**Description**: Get convert details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "fullName": "Emmanuel Owusu",
    "contact1": "+233 24 999 8888",
    "gender": "Male",
    "dateOfBirth": "2002-06-15",
    "branch": "Adenta (HQ)",
    "serviceType": "Empowerment",
    "status": "New",
    "location": "Accra",
    "notes": "Interested in joining youth ministry",
    "activities": [
      {
        "id": "1",
        "title": "Attended Sunday Service",
        "date": "2024-05-12"
      },
      {
        "id": "2",
        "title": "Joined Empowerment Group",
        "date": "2024-04-28"
      }
    ],
    "createdAt": "2024-01-21T10:30:00Z",
    "updatedAt": "2024-01-21T10:30:00Z"
  }
}
```

### PUT /members/:id/convert
**Description**: Update convert information

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "fullName": "Emmanuel Owusu",
  "contact1": "+233 24 999 8888",
  "serviceType": "Youth Ministry",
  "status": "Active",
  "notes": "Actively participating in youth activities"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "6",
    "updatedAt": "2024-01-21T11:30:00Z"
  },
  "message": "Convert information updated successfully"
}
```

### POST /members/:id/convert/promote
**Description**: Promote convert to full member

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "firstName": "Emmanuel",
  "lastName": "Owusu",
  "email": "emmanuel.owusu@email.com",
  "phone": "+233 24 999 8888",
  "address": "123 Main Street, Accra, Ghana",
  "membershipDate": "2024-01-21"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "memberId": "150",
    "firstName": "Emmanuel",
    "lastName": "Owusu",
    "membershipStatus": "Active",
    "promotedAt": "2024-01-21T10:30:00Z"
  },
  "message": "Convert promoted to full member successfully"
}
```

### GET /converts
**Description**: Get all converts

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&status=New&serviceType=Empowerment&search=emmanuel
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "6",
        "fullName": "Emmanuel Owusu",
        "contact1": "+233 24 999 8888",
        "gender": "Male",
        "serviceType": "Empowerment",
        "status": "New",
        "location": "Accra",
        "createdAt": "2024-01-21T10:30:00Z"
      },
      {
        "id": "7",
        "fullName": "Akosua Mensimah",
        "contact1": "+233 24 888 7777",
        "gender": "Female",
        "serviceType": "Youth Ministry",
        "status": "Active",
        "location": "Kumasi",
        "createdAt": "2024-01-20T14:20:00Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### GET /converts/stats
**Description**: Get conversion statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalConverts": 25,
    "newConverts": 8,
    "activeConverts": 15,
    "promotedThisMonth": 3,
    "byServiceType": {
      "Empowerment": 10,
      "Youth Ministry": 8,
      "Children Ministry": 5,
      "Other": 2
    },
    "byStatus": {
      "New": 8,
      "Active": 15,
      "Inactive": 2
    },
    "byLocation": {
      "Accra": 15,
      "Kumasi": 6,
      "Tamale": 4
    },
    "conversionTrends": [
      {
        "month": "2024-01",
        "newConverts": 5,
        "promoted": 3
      },
      {
        "month": "2023-12",
        "newConverts": 8,
        "promoted": 2
      }
    ],
    "recentActivity": [
      {
        "id": "6",
        "fullName": "Emmanuel Owusu",
        "action": "registered",
        "date": "2024-01-21T10:30:00Z"
      }
    ]
  }
}
```

### DELETE /converts/:id
**Description**: Delete convert record

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Convert record deleted successfully"
}
```

### POST /converts/bulk-delete
**Description**: Bulk delete convert records

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "convertIds": ["6", "7", "8"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "deleted": 3
  },
  "message": "Convert records deleted successfully"
}
```

### GET /converts/search
**Description**: Search converts

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
q=emmanuel&serviceType=Empowerment&status=New
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "6",
      "fullName": "Emmanuel Owusu",
      "contact1": "+233 24 999 8888",
      "serviceType": "Empowerment",
      "status": "New"
    }
  ]
}
```

### POST /converts/:id/activity
**Description**: Add activity for convert

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "Attended Bible Study",
  "description": "Participated in weekly Bible study session",
  "date": "2024-01-21",
  "type": "attendance"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "3",
    "title": "Attended Bible Study",
    "date": "2024-01-21"
  },
  "message": "Activity added successfully"
}
```

### GET /converts/:id/activities
**Description**: Get convert activities

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
      "title": "Attended Sunday Service",
      "description": "Regular Sunday worship service",
      "date": "2024-05-12",
      "type": "attendance"
    },
    {
      "id": "2",
      "title": "Joined Empowerment Group",
      "description": "Became member of empowerment ministry",
      "date": "2024-04-28",
      "type": "ministry"
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