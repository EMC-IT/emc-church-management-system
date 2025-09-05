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

