# EMC Church Management System — Standard API Errors & Response Envelopes

All backend API endpoints must return standard, predictable JSON envelopes for both successful operations and failure conditions.

---

## 🟢 Success Response Envelopes

### Single Item Response
```json
{
  "success": true,
  "data": {
    "id": "mem_001",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "Member created successfully"
}
```

### Paginated List Response
```json
{
  "success": true,
  "data": [
    { "id": "exp_001", "title": "Sound Cable", "amount": 450.0 }
  ],
  "total": 120,
  "page": 1,
  "limit": 20,
  "totalPages": 6
}
```

---

## 🔴 Standard Error Responses

### 1. `400 Bad Request` / `422 Unprocessable Entity` (Validation Error)
Returned when client-submitted data fails schema validation.

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed for submitted data",
  "errors": [
    { "field": "amount", "message": "Amount must be greater than zero" },
    { "field": "email", "message": "Invalid email address format" }
  ]
}
```

### 2. `401 Unauthorized` (Authentication Error)
Returned when request lacks a valid JWT bearer token or session is expired.

```json
{
  "success": false,
  "code": "UNAUTHENTICATED",
  "message": "Authentication required. Bearer token is missing or expired."
}
```

### 3. `403 Forbidden` (Authorization & Tenant Isolation Error)
Returned when the user lacks required RBAC permissions or attempts cross-tenant/cross-branch access.

```json
{
  "success": false,
  "code": "FORBIDDEN",
  "message": "Access denied: User lacks required permission 'finance.expenses.approve' or branch scope access.",
  "details": {
    "requiredPermission": "finance.expenses.approve",
    "tenantId": "tenant_emc"
  }
}
```

### 4. `404 Not Found`
Returned when the specified entity identifier does not exist within the active tenant scope.

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Member with identifier 'mem_999' was not found",
  "details": {
    "resource": "Member",
    "id": "mem_999"
  }
}
```

### 5. `409 Conflict` (Duplicate Key / State Conflict)
Returned on email uniqueness collision, duplicate attendance check-in on the same date, etc.

```json
{
  "success": false,
  "code": "CONFLICT",
  "message": "A member with this phone number or email already exists."
}
```

### 6. `500 Internal Server Error`
Returned on unhandled server or database exceptions. Internal stack traces or database connection strings must **never** be exposed in the response body.

```json
{
  "success": false,
  "code": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred while processing your request. Please contact support."
}
```
