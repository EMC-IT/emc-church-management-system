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

