# 💰 Income Module API Endpoints

This document outlines all API endpoints for the Income module, including income records, categories, and reporting functionality.

## Base URL
```
https://api.emcchurch.com/v1
```

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer <your_access_token>
```

---

## 📊 Income Records Endpoints

### GET /income
**Description**: Get all income records with filtering and pagination

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31&categoryId=cat_001&status=received&search=hall rental&sortBy=date&sortOrder=desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "inc_001",
        "description": "Hall Rental - Wedding Event",
        "amount": 2500.00,
        "currency": "GHS",
        "categoryId": "cat_001",
        "categoryName": "Hall Rental",
        "source": "Johnson Family",
        "date": "2024-01-15",
        "status": "received",
        "reference": "INV-2024-001",
        "notes": "Wedding ceremony and reception. Includes tables, chairs, and sound system.",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "inc_002",
        "description": "Religious Books Sale",
        "amount": 450.00,
        "currency": "GHS",
        "categoryId": "cat_002",
        "categoryName": "Book Sales",
        "source": "Church Bookstore",
        "date": "2024-01-14",
        "status": "received",
        "reference": "INV-2024-002",
        "notes": "Monthly book sales revenue",
        "createdAt": "2024-01-14T14:20:00Z",
        "updatedAt": "2024-01-14T14:20:00Z"
      }
    ],
    "total": 156,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "summary": {
      "totalAmount": 125000.00,
      "receivedAmount": 118500.00,
      "pendingAmount": 6500.00,
      "recordCount": 156
    }
  }
}
```

### POST /income
**Description**: Create a new income record

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Corporate Event - Tech Solutions",
  "amount": 1800.00,
  "categoryId": "cat_001",
  "source": "Tech Solutions Ltd",
  "date": "2024-01-21",
  "status": "received",
  "reference": "INV-2024-003",
  "notes": "Corporate training event with catering"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "inc_157",
    "description": "Corporate Event - Tech Solutions",
    "amount": 1800.00,
    "currency": "GHS",
    "categoryId": "cat_001",
    "categoryName": "Hall Rental",
    "source": "Tech Solutions Ltd",
    "date": "2024-01-21",
    "status": "received",
    "reference": "INV-2024-003",
    "notes": "Corporate training event with catering",
    "createdAt": "2024-01-21T15:30:00Z",
    "updatedAt": "2024-01-21T15:30:00Z"
  },
  "message": "Income record created successfully"
}
```

### GET /income/{id}
**Description**: Get specific income record details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "inc_001",
    "description": "Hall Rental - Wedding Event",
    "amount": 2500.00,
    "currency": "GHS",
    "categoryId": "cat_001",
    "categoryName": "Hall Rental",
    "source": "Johnson Family",
    "date": "2024-01-15",
    "status": "received",
    "reference": "INV-2024-001",
    "notes": "Wedding ceremony and reception. Includes tables, chairs, and sound system.",
    "attachments": [
      {
        "id": "att_001",
        "filename": "invoice_001.pdf",
        "url": "https://storage.example.com/invoices/invoice_001.pdf",
        "type": "application/pdf",
        "size": 245760
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /income/{id}
**Description**: Update an income record

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Hall Rental - Wedding Event (Updated)",
  "amount": 2750.00,
  "categoryId": "cat_001",
  "source": "Johnson Family",
  "date": "2024-01-15",
  "status": "received",
  "reference": "INV-2024-001-REV",
  "notes": "Wedding ceremony and reception. Includes tables, chairs, sound system, and additional decorations."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "inc_001",
    "description": "Hall Rental - Wedding Event (Updated)",
    "amount": 2750.00,
    "currency": "GHS",
    "categoryId": "cat_001",
    "categoryName": "Hall Rental",
    "source": "Johnson Family",
    "date": "2024-01-15",
    "status": "received",
    "reference": "INV-2024-001-REV",
    "notes": "Wedding ceremony and reception. Includes tables, chairs, sound system, and additional decorations.",
    "updatedAt": "2024-01-21T16:45:00Z"
  },
  "message": "Income record updated successfully"
}
```

### DELETE /income/{id}
**Description**: Delete an income record

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Income record deleted successfully"
}
```

---

## 📂 Income Categories Endpoints

### GET /income/categories
**Description**: Get all income categories

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&search=rental&status=active&sortBy=name&sortOrder=asc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cat_001",
        "name": "Hall Rental",
        "description": "Facility rental income from events and meetings",
        "code": "HALL_RENTAL",
        "isActive": true,
        "totalReceived": 45000.00,
        "recordCount": 25,
        "currency": "GHS",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "cat_002",
        "name": "Book Sales",
        "description": "Revenue from religious books and educational materials",
        "code": "BOOK_SALES",
        "isActive": true,
        "totalReceived": 12500.00,
        "recordCount": 45,
        "currency": "GHS",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-10T14:20:00Z"
      },
      {
        "id": "cat_003",
        "name": "Grants",
        "description": "Government and foundation grants",
        "code": "GRANTS",
        "isActive": true,
        "totalReceived": 75000.00,
        "recordCount": 8,
        "currency": "GHS",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-12T09:15:00Z"
      }
    ],
    "total": 8,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### POST /income/categories
**Description**: Create a new income category

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Investment Returns",
  "description": "Returns from church investments and dividends",
  "code": "INVESTMENTS",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_009",
    "name": "Investment Returns",
    "description": "Returns from church investments and dividends",
    "code": "INVESTMENTS",
    "isActive": true,
    "totalReceived": 0.00,
    "recordCount": 0,
    "currency": "GHS",
    "createdAt": "2024-01-21T15:30:00Z",
    "updatedAt": "2024-01-21T15:30:00Z"
  },
  "message": "Income category created successfully"
}
```

### GET /income/categories/{id}
**Description**: Get specific income category details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_001",
    "name": "Hall Rental",
    "description": "Facility rental income from events and meetings",
    "code": "HALL_RENTAL",
    "isActive": true,
    "totalReceived": 45000.00,
    "recordCount": 25,
    "currency": "GHS",
    "recentRecords": [
      {
        "id": "inc_001",
        "description": "Hall Rental - Wedding Event",
        "amount": 2500.00,
        "source": "Johnson Family",
        "date": "2024-01-15",
        "status": "received"
      },
      {
        "id": "inc_003",
        "description": "Corporate Event - Tech Solutions",
        "amount": 1800.00,
        "source": "Tech Solutions Ltd",
        "date": "2024-01-12",
        "status": "received"
      }
    ],
    "monthlyTotals": [
      {
        "month": "2024-01",
        "amount": 15000.00,
        "count": 8
      },
      {
        "month": "2023-12",
        "amount": 12500.00,
        "count": 6
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /income/categories/{id}
**Description**: Update an income category

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Facility Rental",
  "description": "Income from facility rentals including hall, rooms, and equipment",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_001",
    "name": "Facility Rental",
    "description": "Income from facility rentals including hall, rooms, and equipment",
    "code": "HALL_RENTAL",
    "isActive": true,
    "totalReceived": 45000.00,
    "recordCount": 25,
    "currency": "GHS",
    "updatedAt": "2024-01-21T16:45:00Z"
  },
  "message": "Income category updated successfully"
}
```

### DELETE /income/categories/{id}
**Description**: Delete an income category

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Income category deleted successfully"
}
```

### GET /income/categories/{id}/records
**Description**: Get all income records for a specific category

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31&status=received&sortBy=date&sortOrder=desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat_001",
      "name": "Hall Rental",
      "description": "Facility rental income from events and meetings"
    },
    "records": {
      "data": [
        {
          "id": "inc_001",
          "description": "Hall Rental - Wedding Event",
          "amount": 2500.00,
          "source": "Johnson Family",
          "date": "2024-01-15",
          "status": "received",
          "reference": "INV-2024-001"
        }
      ],
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    }
  }
}
```

---

## 📈 Income Reports Endpoints

### GET /income/reports/summary
**Description**: Get income summary report with key metrics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&categoryId=cat_001&groupBy=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "days": 31
    },
    "summary": {
      "totalIncome": 125000.00,
      "receivedIncome": 118500.00,
      "pendingIncome": 6500.00,
      "totalRecords": 156,
      "averageIncome": 801.28,
      "currency": "GHS"
    },
    "trends": {
      "previousPeriod": {
        "totalIncome": 110000.00,
        "growth": 13.64,
        "growthDirection": "up"
      },
      "yearToDate": {
        "totalIncome": 125000.00,
        "target": 1500000.00,
        "progress": 8.33
      }
    },
    "topCategories": [
      {
        "categoryId": "cat_003",
        "categoryName": "Grants",
        "amount": 75000.00,
        "percentage": 60.0,
        "recordCount": 8
      },
      {
        "categoryId": "cat_001",
        "categoryName": "Hall Rental",
        "amount": 25000.00,
        "percentage": 20.0,
        "recordCount": 15
      }
    ]
  }
}
```

### GET /income/reports/by-category
**Description**: Get income breakdown by category

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&includeInactive=false&sortBy=amount&sortOrder=desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "categories": [
      {
        "categoryId": "cat_003",
        "categoryName": "Grants",
        "categoryCode": "GRANTS",
        "totalAmount": 75000.00,
        "recordCount": 8,
        "percentage": 60.0,
        "averageAmount": 9375.00,
        "currency": "GHS",
        "monthlyBreakdown": [
          {
            "month": "2024-01",
            "amount": 75000.00,
            "count": 8
          }
        ]
      },
      {
        "categoryId": "cat_001",
        "categoryName": "Hall Rental",
        "categoryCode": "HALL_RENTAL",
        "totalAmount": 25000.00,
        "recordCount": 15,
        "percentage": 20.0,
        "averageAmount": 1666.67,
        "currency": "GHS",
        "monthlyBreakdown": [
          {
            "month": "2024-01",
            "amount": 25000.00,
            "count": 15
          }
        ]
      }
    ],
    "totals": {
      "totalAmount": 125000.00,
      "totalRecords": 156,
      "categoriesCount": 8,
      "currency": "GHS"
    }
  }
}
```

### GET /income/reports/trends
**Description**: Get income trends and analytics over time

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2023-01-01&endDate=2024-01-31&groupBy=month&categoryId=cat_001&includeProjections=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2023-01-01",
      "endDate": "2024-01-31",
      "groupBy": "month"
    },
    "trends": [
      {
        "period": "2023-01",
        "amount": 95000.00,
        "recordCount": 120,
        "averageAmount": 791.67
      },
      {
        "period": "2023-02",
        "amount": 102000.00,
        "recordCount": 135,
        "averageAmount": 755.56
      },
      {
        "period": "2024-01",
        "amount": 125000.00,
        "recordCount": 156,
        "averageAmount": 801.28
      }
    ],
    "analytics": {
      "totalGrowth": 31.58,
      "averageMonthlyGrowth": 2.63,
      "bestMonth": {
        "period": "2024-01",
        "amount": 125000.00
      },
      "worstMonth": {
        "period": "2023-01",
        "amount": 95000.00
      },
      "seasonality": {
        "q1": 22.5,
        "q2": 25.8,
        "q3": 24.2,
        "q4": 27.5
      }
    },
    "projections": {
      "nextMonth": {
        "period": "2024-02",
        "projectedAmount": 130000.00,
        "confidence": 85.2
      },
      "nextQuarter": {
        "period": "Q2-2024",
        "projectedAmount": 385000.00,
        "confidence": 78.9
      }
    }
  }
}
```

### GET /income/reports/export
**Description**: Export income data in various formats

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
format=csv&startDate=2024-01-01&endDate=2024-01-31&categoryId=cat_001&includeCategories=true&includeNotes=false
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "exp_001",
    "format": "csv",
    "filename": "income_export_2024-01-01_to_2024-01-31.csv",
    "downloadUrl": "https://api.emcchurch.com/v1/exports/exp_001/download",
    "expiresAt": "2024-01-22T15:30:00Z",
    "recordCount": 156,
    "fileSize": 45678,
    "status": "ready"
  },
  "message": "Export generated successfully"
}
```

---

## 🔍 Search and Filter Endpoints

### GET /income/search
**Description**: Advanced search across income records

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
q=wedding&fields=description,source,notes&categoryId=cat_001&minAmount=1000&maxAmount=5000&status=received&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "wedding",
    "results": [
      {
        "id": "inc_001",
        "description": "Hall Rental - Wedding Event",
        "amount": 2500.00,
        "categoryName": "Hall Rental",
        "source": "Johnson Family",
        "date": "2024-01-15",
        "status": "received",
        "relevanceScore": 0.95,
        "matchedFields": ["description"]
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      },
      {
        "field": "categoryId",
        "message": "Category ID is required"
      }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to access this resource"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Income record not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_REFERENCE",
    "message": "An income record with this reference number already exists"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot delete category with existing income records",
    "details": {
      "categoryId": "cat_001",
      "recordCount": 25
    }
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "requestId": "req_12345"
  }
}
```

---

## 📝 Notes

### Status Values
- `received`: Income has been received and confirmed
- `pending`: Income is expected but not yet received
- `cancelled`: Income record has been cancelled

### Currency
- All amounts are in Ghana Cedis (GHS) unless otherwise specified
- Amounts are stored and returned as decimal numbers with 2 decimal places

### Date Formats
- All dates use ISO 8601 format: `YYYY-MM-DD`
- All timestamps use ISO 8601 format with timezone: `YYYY-MM-DDTHH:mm:ssZ`

### Pagination
- Default page size is 20 items
- Maximum page size is 100 items
- Page numbers start from 1

### Rate Limiting
- API requests are limited to 1000 requests per hour per user
- Rate limit headers are included in all responses:
  - `X-RateLimit-Limit`: Maximum requests per hour
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

### Validation Rules
- Amount must be greater than 0 and less than 1,000,000
- Description must be between 1 and 255 characters
- Source must be between 1 and 100 characters
- Reference numbers must be unique within the system
- Category must exist and be active when creating income records
- Date cannot be more than 1 year in the future

### Permissions
- `income:read` - View income records and reports
- `income:write` - Create and update income records
- `income:delete` - Delete income records
- `income:categories:read` - View income categories
- `income:categories:write` - Create and update income categories
- `income:categories:delete` - Delete income categories
- `income:reports:read` - Access income reports and analytics
- `income:export` - Export income data