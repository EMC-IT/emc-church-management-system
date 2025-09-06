# 💸 Expenses Module API Endpoints

This document outlines all API endpoints for the Expenses module, including expense records, categories, reporting, and analytics functionality.

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

## 📊 Expense Records Endpoints

### GET /expenses
**Description**: Get all expense records with filtering and pagination

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31&categoryId=cat_001&status=approved&search=office supplies&sortBy=date&sortOrder=desc&minAmount=50&maxAmount=5000
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "exp_001",
        "description": "Office Supplies - Stationery and Printing",
        "amount": 450.00,
        "currency": "GHS",
        "categoryId": "cat_001",
        "categoryName": "Office Supplies",
        "vendor": "Accra Office Mart",
        "date": "2024-01-15",
        "status": "approved",
        "reference": "EXP-2024-001",
        "receiptNumber": "REC-001-2024",
        "paymentMethod": "bank_transfer",
        "approvedBy": "John Mensah",
        "notes": "Monthly office supplies including paper, pens, and printer cartridges",
        "attachments": [
          {
            "id": "att_001",
            "filename": "receipt_001.pdf",
            "url": "https://storage.example.com/receipts/receipt_001.pdf",
            "type": "application/pdf",
            "size": 156780
          }
        ],
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T14:20:00Z"
      },
      {
        "id": "exp_002",
        "description": "Electricity Bill - January 2024",
        "amount": 1250.00,
        "currency": "GHS",
        "categoryId": "cat_002",
        "categoryName": "Utilities",
        "vendor": "ECG Ghana",
        "date": "2024-01-14",
        "status": "paid",
        "reference": "EXP-2024-002",
        "receiptNumber": "ECG-JAN-2024",
        "paymentMethod": "mobile_money",
        "approvedBy": "Sarah Asante",
        "notes": "Monthly electricity bill for church premises",
        "attachments": [],
        "createdAt": "2024-01-14T09:15:00Z",
        "updatedAt": "2024-01-14T16:45:00Z"
      }
    ],
    "total": 234,
    "page": 1,
    "limit": 20,
    "totalPages": 12,
    "summary": {
      "totalAmount": 45600.00,
      "approvedAmount": 42300.00,
      "pendingAmount": 3300.00,
      "recordCount": 234,
      "averageExpense": 194.87
    }
  }
}
```

### POST /expenses
**Description**: Create a new expense record

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Church Maintenance - Plumbing Repairs",
  "amount": 850.00,
  "categoryId": "cat_003",
  "vendor": "Kumasi Plumbing Services",
  "date": "2024-01-21",
  "paymentMethod": "cash",
  "receiptNumber": "KPS-2024-045",
  "notes": "Emergency plumbing repairs for main restroom facilities",
  "attachments": [
    {
      "filename": "plumbing_receipt.jpg",
      "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "exp_235",
    "description": "Church Maintenance - Plumbing Repairs",
    "amount": 850.00,
    "currency": "GHS",
    "categoryId": "cat_003",
    "categoryName": "Maintenance",
    "vendor": "Kumasi Plumbing Services",
    "date": "2024-01-21",
    "status": "pending",
    "reference": "EXP-2024-235",
    "receiptNumber": "KPS-2024-045",
    "paymentMethod": "cash",
    "approvedBy": null,
    "notes": "Emergency plumbing repairs for main restroom facilities",
    "attachments": [
      {
        "id": "att_235",
        "filename": "plumbing_receipt.jpg",
        "url": "https://storage.example.com/receipts/plumbing_receipt.jpg",
        "type": "image/jpeg",
        "size": 234567
      }
    ],
    "createdAt": "2024-01-21T11:30:00Z",
    "updatedAt": "2024-01-21T11:30:00Z"
  },
  "message": "Expense record created successfully"
}
```

### GET /expenses/{id}
**Description**: Get specific expense record details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "exp_001",
    "description": "Office Supplies - Stationery and Printing",
    "amount": 450.00,
    "currency": "GHS",
    "categoryId": "cat_001",
    "categoryName": "Office Supplies",
    "vendor": "Accra Office Mart",
    "date": "2024-01-15",
    "status": "approved",
    "reference": "EXP-2024-001",
    "receiptNumber": "REC-001-2024",
    "paymentMethod": "bank_transfer",
    "approvedBy": "John Mensah",
    "approvedAt": "2024-01-15T14:20:00Z",
    "notes": "Monthly office supplies including paper, pens, and printer cartridges",
    "attachments": [
      {
        "id": "att_001",
        "filename": "receipt_001.pdf",
        "url": "https://storage.example.com/receipts/receipt_001.pdf",
        "type": "application/pdf",
        "size": 156780
      }
    ],
    "auditTrail": [
      {
        "action": "created",
        "userId": "user_123",
        "userName": "Mary Osei",
        "timestamp": "2024-01-15T10:30:00Z"
      },
      {
        "action": "approved",
        "userId": "user_456",
        "userName": "John Mensah",
        "timestamp": "2024-01-15T14:20:00Z"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T14:20:00Z"
  }
}
```

### PUT /expenses/{id}
**Description**: Update an expense record

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Office Supplies - Stationery, Printing & Binding",
  "amount": 475.00,
  "categoryId": "cat_001",
  "vendor": "Accra Office Mart",
  "date": "2024-01-15",
  "paymentMethod": "bank_transfer",
  "receiptNumber": "REC-001-2024-REV",
  "notes": "Monthly office supplies including paper, pens, printer cartridges, and binding materials"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "exp_001",
    "description": "Office Supplies - Stationery, Printing & Binding",
    "amount": 475.00,
    "currency": "GHS",
    "categoryId": "cat_001",
    "categoryName": "Office Supplies",
    "vendor": "Accra Office Mart",
    "date": "2024-01-15",
    "status": "approved",
    "reference": "EXP-2024-001",
    "receiptNumber": "REC-001-2024-REV",
    "paymentMethod": "bank_transfer",
    "approvedBy": "John Mensah",
    "notes": "Monthly office supplies including paper, pens, printer cartridges, and binding materials",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-21T09:15:00Z"
  },
  "message": "Expense record updated successfully"
}
```

### DELETE /expenses/{id}
**Description**: Delete an expense record

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Expense record deleted successfully"
}
```

### POST /expenses/bulk
**Description**: Create multiple expense records at once

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "expenses": [
    {
      "description": "Water Bill - January 2024",
      "amount": 180.00,
      "categoryId": "cat_002",
      "vendor": "Ghana Water Company",
      "date": "2024-01-20",
      "paymentMethod": "bank_transfer",
      "receiptNumber": "GWC-JAN-2024"
    },
    {
      "description": "Internet Service - January 2024",
      "amount": 320.00,
      "categoryId": "cat_002",
      "vendor": "MTN Ghana",
      "date": "2024-01-20",
      "paymentMethod": "mobile_money",
      "receiptNumber": "MTN-JAN-2024"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "created": 2,
    "failed": 0,
    "expenses": [
      {
        "id": "exp_236",
        "description": "Water Bill - January 2024",
        "amount": 180.00,
        "reference": "EXP-2024-236"
      },
      {
        "id": "exp_237",
        "description": "Internet Service - January 2024",
        "amount": 320.00,
        "reference": "EXP-2024-237"
      }
    ]
  },
  "message": "2 expense records created successfully"
}
```

### GET /expenses/export
**Description**: Export expense records to various formats

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
format=csv&startDate=2024-01-01&endDate=2024-01-31&categoryId=cat_001&status=approved
```

**Response**:
```json
{
  "success": true,
  "data": {
    "downloadUrl": "https://api.emcchurch.com/v1/exports/expenses_2024-01.csv",
    "filename": "expenses_2024-01.csv",
    "format": "csv",
    "recordCount": 45,
    "expiresAt": "2024-01-22T10:30:00Z"
  },
  "message": "Export file generated successfully"
}
```

---

## 🏷️ Expense Categories Endpoints

### GET /expenses/categories
**Description**: Get all expense categories

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
active=true&search=office&sortBy=name&sortOrder=asc
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_001",
      "name": "Office Supplies",
      "description": "Stationery, printing materials, and office equipment",
      "color": "#3B82F6",
      "icon": "clipboard-list",
      "isActive": true,
      "budget": {
        "monthly": 1000.00,
        "yearly": 12000.00
      },
      "totalExpenses": 4500.00,
      "expenseCount": 15,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    },
    {
      "id": "cat_002",
      "name": "Utilities",
      "description": "Electricity, water, internet, and other utility bills",
      "color": "#10B981",
      "icon": "zap",
      "isActive": true,
      "budget": {
        "monthly": 2500.00,
        "yearly": 30000.00
      },
      "totalExpenses": 7800.00,
      "expenseCount": 8,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-20T14:20:00Z"
    }
  ]
}
```

### POST /expenses/categories
**Description**: Create a new expense category

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Transportation",
  "description": "Vehicle fuel, maintenance, and transportation costs",
  "color": "#F59E0B",
  "icon": "car",
  "budget": {
    "monthly": 800.00,
    "yearly": 9600.00
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_008",
    "name": "Transportation",
    "description": "Vehicle fuel, maintenance, and transportation costs",
    "color": "#F59E0B",
    "icon": "car",
    "isActive": true,
    "budget": {
      "monthly": 800.00,
      "yearly": 9600.00
    },
    "totalExpenses": 0.00,
    "expenseCount": 0,
    "createdAt": "2024-01-21T15:30:00Z",
    "updatedAt": "2024-01-21T15:30:00Z"
  },
  "message": "Expense category created successfully"
}
```

### GET /expenses/categories/{id}
**Description**: Get specific expense category details

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
    "name": "Office Supplies",
    "description": "Stationery, printing materials, and office equipment",
    "color": "#3B82F6",
    "icon": "clipboard-list",
    "isActive": true,
    "budget": {
      "monthly": 1000.00,
      "yearly": 12000.00
    },
    "statistics": {
      "totalExpenses": 4500.00,
      "expenseCount": 15,
      "averageExpense": 300.00,
      "monthlySpending": {
        "current": 450.00,
        "previous": 380.00,
        "change": 18.42
      },
      "budgetUtilization": {
        "monthly": 45.0,
        "yearly": 37.5
      }
    },
    "recentExpenses": [
      {
        "id": "exp_001",
        "description": "Office Supplies - Stationery and Printing",
        "amount": 450.00,
        "date": "2024-01-15",
        "vendor": "Accra Office Mart"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /expenses/categories/{id}
**Description**: Update an expense category

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Office Supplies & Equipment",
  "description": "Stationery, printing materials, office equipment, and software licenses",
  "color": "#3B82F6",
  "icon": "clipboard-list",
  "budget": {
    "monthly": 1200.00,
    "yearly": 14400.00
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_001",
    "name": "Office Supplies & Equipment",
    "description": "Stationery, printing materials, office equipment, and software licenses",
    "color": "#3B82F6",
    "icon": "clipboard-list",
    "isActive": true,
    "budget": {
      "monthly": 1200.00,
      "yearly": 14400.00
    },
    "totalExpenses": 4500.00,
    "expenseCount": 15,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-21T16:45:00Z"
  },
  "message": "Expense category updated successfully"
}
```

### DELETE /expenses/categories/{id}
**Description**: Delete an expense category

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Expense category deleted successfully"
}
```

### GET /expenses/categories/{id}/expenses
**Description**: Get all expenses for a specific category

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31&status=approved&sortBy=date&sortOrder=desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "category": {
      "id": "cat_001",
      "name": "Office Supplies",
      "totalAmount": 4500.00,
      "budgetRemaining": 7500.00
    },
    "expenses": [
      {
        "id": "exp_001",
        "description": "Office Supplies - Stationery and Printing",
        "amount": 450.00,
        "vendor": "Accra Office Mart",
        "date": "2024-01-15",
        "status": "approved",
        "reference": "EXP-2024-001"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 📈 Expense Reports Endpoints

### GET /expenses/reports/summary
**Description**: Get expense summary reports

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
period=monthly&year=2024&month=1&categoryId=cat_001&groupBy=category
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "type": "monthly",
      "year": 2024,
      "month": 1,
      "startDate": "2024-01-01",
      "endDate": "2024-01-31"
    },
    "summary": {
      "totalExpenses": 15750.00,
      "totalBudget": 20000.00,
      "budgetUtilization": 78.75,
      "expenseCount": 45,
      "averageExpense": 350.00,
      "topCategory": {
        "id": "cat_002",
        "name": "Utilities",
        "amount": 7800.00,
        "percentage": 49.52
      }
    },
    "categoryBreakdown": [
      {
        "categoryId": "cat_002",
        "categoryName": "Utilities",
        "amount": 7800.00,
        "budget": 2500.00,
        "utilization": 312.0,
        "count": 8,
        "percentage": 49.52
      },
      {
        "categoryId": "cat_001",
        "categoryName": "Office Supplies",
        "amount": 4500.00,
        "budget": 1000.00,
        "utilization": 450.0,
        "count": 15,
        "percentage": 28.57
      },
      {
        "categoryId": "cat_003",
        "categoryName": "Maintenance",
        "amount": 3450.00,
        "budget": 1500.00,
        "utilization": 230.0,
        "count": 22,
        "percentage": 21.91
      }
    ],
    "trends": {
      "previousPeriod": {
        "amount": 14200.00,
        "change": 10.92,
        "changeType": "increase"
      },
      "yearToDate": {
        "amount": 15750.00,
        "budget": 240000.00,
        "utilization": 6.56
      }
    }
  }
}
```

### GET /expenses/reports/trends
**Description**: Get expense trend analysis

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
period=last_12_months&categoryId=cat_001&groupBy=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": "last_12_months",
    "trends": [
      {
        "period": "2023-02",
        "amount": 12500.00,
        "count": 38,
        "average": 328.95
      },
      {
        "period": "2023-03",
        "amount": 14200.00,
        "count": 42,
        "average": 338.10
      },
      {
        "period": "2024-01",
        "amount": 15750.00,
        "count": 45,
        "average": 350.00
      }
    ],
    "analysis": {
      "totalAmount": 168750.00,
      "averageMonthly": 14062.50,
      "highestMonth": {
        "period": "2024-01",
        "amount": 15750.00
      },
      "lowestMonth": {
        "period": "2023-02",
        "amount": 12500.00
      },
      "trend": "increasing",
      "growthRate": 12.5
    },
    "categoryTrends": [
      {
        "categoryId": "cat_002",
        "categoryName": "Utilities",
        "trend": "stable",
        "averageMonthly": 2600.00,
        "variance": 8.5
      },
      {
        "categoryId": "cat_001",
        "categoryName": "Office Supplies",
        "trend": "increasing",
        "averageMonthly": 375.00,
        "variance": 15.2
      }
    ]
  }
}
```

---

## 🔍 Search & Analytics Endpoints

### GET /expenses/analytics
**Description**: Get comprehensive expense analytics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&metrics=all&groupBy=category,vendor
```

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalExpenses": 15750.00,
      "expenseCount": 45,
      "uniqueVendors": 12,
      "averageExpense": 350.00,
      "medianExpense": 280.00,
      "largestExpense": {
        "id": "exp_045",
        "description": "Generator Maintenance",
        "amount": 2500.00,
        "vendor": "Power Solutions Ltd"
      }
    },
    "categoryAnalytics": [
      {
        "categoryId": "cat_002",
        "categoryName": "Utilities",
        "totalAmount": 7800.00,
        "percentage": 49.52,
        "expenseCount": 8,
        "averageAmount": 975.00,
        "budgetUtilization": 312.0,
        "status": "over_budget"
      }
    ],
    "vendorAnalytics": [
      {
        "vendor": "ECG Ghana",
        "totalAmount": 3750.00,
        "expenseCount": 3,
        "averageAmount": 1250.00,
        "categories": ["Utilities"]
      }
    ],
    "paymentMethodAnalytics": [
      {
        "method": "bank_transfer",
        "totalAmount": 8900.00,
        "percentage": 56.51,
        "count": 20
      },
      {
        "method": "mobile_money",
        "totalAmount": 4200.00,
        "percentage": 26.67,
        "count": 15
      },
      {
        "method": "cash",
        "totalAmount": 2650.00,
        "percentage": 16.83,
        "count": 10
      }
    ],
    "timeAnalytics": {
      "dailyAverage": 508.06,
      "weeklyPattern": [
        {"day": "Monday", "amount": 2100.00, "count": 8},
        {"day": "Tuesday", "amount": 1850.00, "count": 6},
        {"day": "Wednesday", "amount": 2300.00, "count": 9},
        {"day": "Thursday", "amount": 1950.00, "count": 7},
        {"day": "Friday", "amount": 2200.00, "count": 8},
        {"day": "Saturday", "amount": 1100.00, "count": 4},
        {"day": "Sunday", "amount": 4250.00, "count": 3}
      ]
    },
    "budgetAnalytics": {
      "totalBudget": 20000.00,
      "totalSpent": 15750.00,
      "remaining": 4250.00,
      "utilizationRate": 78.75,
      "projectedOverrun": false,
      "categoriesOverBudget": [
        {
          "categoryId": "cat_002",
          "categoryName": "Utilities",
          "budget": 2500.00,
          "spent": 7800.00,
          "overrun": 5300.00
        }
      ]
    }
  }
}
```

### GET /expenses/search
**Description**: Advanced search for expenses

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
q=office supplies&categories=cat_001,cat_002&vendors=Accra Office Mart&minAmount=100&maxAmount=1000&startDate=2024-01-01&endDate=2024-01-31&status=approved&paymentMethod=bank_transfer&hasAttachments=true&sortBy=relevance&page=1&limit=20
```

**Response**:
```json
{
  "success": true,
  "data": {
    "query": "office supplies",
    "filters": {
      "categories": ["cat_001", "cat_002"],
      "vendors": ["Accra Office Mart"],
      "amountRange": {"min": 100, "max": 1000},
      "dateRange": {"start": "2024-01-01", "end": "2024-01-31"},
      "status": "approved",
      "paymentMethod": "bank_transfer",
      "hasAttachments": true
    },
    "results": [
      {
        "id": "exp_001",
        "description": "Office Supplies - Stationery and Printing",
        "amount": 450.00,
        "categoryName": "Office Supplies",
        "vendor": "Accra Office Mart",
        "date": "2024-01-15",
        "status": "approved",
        "relevanceScore": 0.95,
        "matchedFields": ["description", "vendor"]
      }
    ],
    "total": 3,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "aggregations": {
      "totalAmount": 1250.00,
      "averageAmount": 416.67,
      "categoryBreakdown": [
        {"categoryId": "cat_001", "categoryName": "Office Supplies", "count": 3, "amount": 1250.00}
      ]
    }
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
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
    "message": "Authentication required"
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
    "message": "Expense record not found"
  }
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Cannot delete category with existing expenses",
    "details": {
      "expenseCount": 15,
      "suggestion": "Move expenses to another category first"
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
    "requestId": "req_123456789"
  }
}
```

---

## 📝 Notes

### Status Values
- `pending`: Expense submitted but not yet approved
- `approved`: Expense approved but not yet paid
- `paid`: Expense has been paid
- `rejected`: Expense was rejected
- `cancelled`: Expense was cancelled

### Payment Methods
- `cash`: Cash payment
- `bank_transfer`: Bank transfer
- `mobile_money`: Mobile money payment
- `check`: Check payment
- `card`: Credit/debit card payment

### Currency
All monetary values are in Ghana Cedi (GHS) unless otherwise specified.

### Rate Limiting
API requests are limited to 1000 requests per hour per authenticated user.

### Pagination
Default page size is 20 items. Maximum page size is 100 items.

### File Uploads
Attachments must be base64 encoded and included in the request body. Supported formats: PDF, JPG, PNG, GIF. Maximum file size: 5MB per file.