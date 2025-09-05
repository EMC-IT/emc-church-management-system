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

