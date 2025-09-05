# 🎁 Giving Module API Endpoints

This document outlines all API endpoints for the Giving module, including donations, pledges, categories, and reporting functionality.

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

## 📂 Giving Categories Endpoints

### GET /giving/categories
**Description**: Get all giving categories

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&search=building&status=active
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "cat_001",
        "name": "Building Fund",
        "description": "Funds for church building projects and maintenance",
        "code": "BUILDING_FUND",
        "isActive": true,
        "totalReceived": 125000.00,
        "currency": "GHS",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": "cat_002",
        "name": "General Offering",
        "description": "General church operations and ministry",
        "code": "GENERAL",
        "isActive": true,
        "totalReceived": 250000.00,
        "currency": "GHS",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-10T14:20:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

### POST /giving/categories
**Description**: Create a new giving category

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Youth Ministry",
  "description": "Support for youth programs and activities",
  "code": "YOUTH",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_013",
    "name": "Youth Ministry",
    "description": "Support for youth programs and activities",
    "code": "YOUTH",
    "isActive": true,
    "totalReceived": 0.00,
    "currency": "GHS",
    "createdAt": "2024-01-21T15:30:00Z",
    "updatedAt": "2024-01-21T15:30:00Z"
  },
  "message": "Category created successfully"
}
```

### GET /giving/categories/{id}
**Description**: Get specific category details

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
    "name": "Building Fund",
    "description": "Funds for church building projects and maintenance",
    "code": "BUILDING_FUND",
    "isActive": true,
    "totalReceived": 125000.00,
    "currency": "GHS",
    "recentDonations": [
      {
        "id": "don_001",
        "amount": 5000.00,
        "donorName": "John Doe",
        "date": "2024-01-20",
        "receiptNumber": "DON-001"
      }
    ],
    "monthlyTotals": [
      {
        "month": "2024-01",
        "amount": 25000.00,
        "count": 15
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /giving/categories/{id}
**Description**: Update a giving category

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Building & Maintenance Fund",
  "description": "Funds for church building projects, maintenance, and improvements",
  "isActive": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "cat_001",
    "name": "Building & Maintenance Fund",
    "description": "Funds for church building projects, maintenance, and improvements",
    "code": "BUILDING_FUND",
    "isActive": true,
    "totalReceived": 125000.00,
    "currency": "GHS",
    "updatedAt": "2024-01-21T16:45:00Z"
  },
  "message": "Category updated successfully"
}
```

### DELETE /giving/categories/{id}
**Description**: Delete a giving category

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 💰 Donations Endpoints

### GET /giving/donations
**Description**: Get all donations with filtering options

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31&category=BUILDING_FUND&status=COMPLETED&method=Transfer&memberId=mem_001&minAmount=100&maxAmount=5000&search=john
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "don_001",
        "memberId": "mem_001",
        "memberName": "John Doe",
        "memberEmail": "john@example.com",
        "type": "DONATION",
        "amount": 5000.00,
        "currency": "GHS",
        "category": "BUILDING_FUND",
        "categoryName": "Building Fund",
        "method": "Transfer",
        "date": "2024-01-20",
        "description": "Building fund donation for new sanctuary",
        "isAnonymous": false,
        "receiptNumber": "DON-001",
        "status": "COMPLETED",
        "createdAt": "2024-01-20T10:30:00Z",
        "updatedAt": "2024-01-20T10:30:00Z"
      },
      {
        "id": "don_002",
        "memberId": "mem_002",
        "memberName": "Jane Smith",
        "memberEmail": "jane@example.com",
        "type": "DONATION",
        "amount": 2000.00,
        "currency": "GHS",
        "category": "MISSIONARY",
        "categoryName": "Missionary Support",
        "method": "Online",
        "date": "2024-01-19",
        "description": "Missions support donation",
        "isAnonymous": false,
        "receiptNumber": "DON-002",
        "status": "COMPLETED",
        "createdAt": "2024-01-19T14:20:00Z",
        "updatedAt": "2024-01-19T14:20:00Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "summary": {
      "totalAmount": 125000.00,
      "averageAmount": 833.33,
      "completedCount": 145,
      "pendingCount": 5
    }
  }
}
```

### POST /giving/donations
**Description**: Create a new donation

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "memberId": "mem_001",
  "type": "DONATION",
  "amount": 1500.00,
  "currency": "GHS",
  "category": "GENERAL",
  "method": "Cash",
  "date": "2024-01-21",
  "description": "Sunday service offering",
  "isAnonymous": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "don_151",
    "memberId": "mem_001",
    "type": "DONATION",
    "amount": 1500.00,
    "currency": "GHS",
    "category": "GENERAL",
    "method": "Cash",
    "date": "2024-01-21",
    "description": "Sunday service offering",
    "isAnonymous": false,
    "receiptNumber": "DON-151",
    "status": "COMPLETED",
    "createdAt": "2024-01-21T11:30:00Z",
    "updatedAt": "2024-01-21T11:30:00Z"
  },
  "message": "Donation recorded successfully"
}
```

### GET /giving/donations/{id}
**Description**: Get specific donation details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "don_001",
    "memberId": "mem_001",
    "member": {
      "id": "mem_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+233123456789"
    },
    "type": "DONATION",
    "amount": 5000.00,
    "currency": "GHS",
    "category": "BUILDING_FUND",
    "categoryDetails": {
      "id": "cat_001",
      "name": "Building Fund",
      "description": "Funds for church building projects"
    },
    "method": "Transfer",
    "date": "2024-01-20",
    "description": "Building fund donation for new sanctuary",
    "isAnonymous": false,
    "receiptNumber": "DON-001",
    "status": "COMPLETED",
    "metadata": {
      "transactionId": "TXN-ABC123",
      "bankReference": "REF-XYZ789"
    },
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

### PUT /giving/donations/{id}
**Description**: Update a donation

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 5500.00,
  "description": "Building fund donation for new sanctuary - Updated amount",
  "category": "BUILDING_FUND",
  "method": "Transfer"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "don_001",
    "amount": 5500.00,
    "description": "Building fund donation for new sanctuary - Updated amount",
    "category": "BUILDING_FUND",
    "method": "Transfer",
    "updatedAt": "2024-01-21T16:45:00Z"
  },
  "message": "Donation updated successfully"
}
```

### DELETE /giving/donations/{id}
**Description**: Delete a donation

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Donation deleted successfully"
}
```

### POST /giving/donations/{id}/receipt
**Description**: Generate and send receipt for donation

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "sendEmail": true,
  "emailAddress": "john@example.com",
  "format": "PDF"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "receiptUrl": "https://api.emcchurch.com/receipts/DON-001.pdf",
    "receiptNumber": "DON-001",
    "emailSent": true
  },
  "message": "Receipt generated and sent successfully"
}
```

---

## 🤝 Pledges Endpoints

### GET /giving/pledges
**Description**: Get all pledges with filtering options

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-12-31&category=BUILDING_FUND&status=PENDING&memberId=mem_001&frequency=monthly
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "plg_001",
        "memberId": "mem_001",
        "memberName": "John Doe",
        "memberEmail": "john@example.com",
        "type": "PLEDGE",
        "totalAmount": 12000.00,
        "paidAmount": 4000.00,
        "remainingAmount": 8000.00,
        "currency": "GHS",
        "category": "BUILDING_FUND",
        "categoryName": "Building Fund",
        "method": "Transfer",
        "date": "2024-01-01",
        "description": "Annual building fund pledge",
        "isAnonymous": false,
        "receiptNumber": "PLG-001",
        "status": "PENDING",
        "pledgeDetails": {
          "installments": 12,
          "frequency": "monthly",
          "installmentAmount": 1000.00,
          "startDate": "2024-01-01",
          "endDate": "2024-12-31",
          "nextDueDate": "2024-05-01",
          "completedPayments": 4
        },
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-04-01T10:30:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "totalPages": 2,
    "summary": {
      "totalPledged": 250000.00,
      "totalPaid": 150000.00,
      "totalRemaining": 100000.00,
      "completedCount": 5,
      "pendingCount": 20
    }
  }
}
```

### POST /giving/pledges
**Description**: Create a new pledge

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "memberId": "mem_002",
  "type": "PLEDGE",
  "totalAmount": 6000.00,
  "currency": "GHS",
  "category": "MISSIONARY",
  "method": "Transfer",
  "date": "2024-01-21",
  "description": "Missionary support pledge",
  "isAnonymous": false,
  "pledgeDetails": {
    "installments": 6,
    "frequency": "monthly",
    "startDate": "2024-02-01",
    "endDate": "2024-07-31"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "plg_026",
    "memberId": "mem_002",
    "type": "PLEDGE",
    "totalAmount": 6000.00,
    "paidAmount": 0.00,
    "remainingAmount": 6000.00,
    "currency": "GHS",
    "category": "MISSIONARY",
    "method": "Transfer",
    "date": "2024-01-21",
    "description": "Missionary support pledge",
    "isAnonymous": false,
    "receiptNumber": "PLG-026",
    "status": "PENDING",
    "pledgeDetails": {
      "installments": 6,
      "frequency": "monthly",
      "installmentAmount": 1000.00,
      "startDate": "2024-02-01",
      "endDate": "2024-07-31",
      "nextDueDate": "2024-02-01",
      "completedPayments": 0
    },
    "createdAt": "2024-01-21T15:30:00Z",
    "updatedAt": "2024-01-21T15:30:00Z"
  },
  "message": "Pledge created successfully"
}
```

### GET /giving/pledges/{id}
**Description**: Get specific pledge details

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "plg_001",
    "memberId": "mem_001",
    "member": {
      "id": "mem_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+233123456789"
    },
    "type": "PLEDGE",
    "totalAmount": 12000.00,
    "paidAmount": 4000.00,
    "remainingAmount": 8000.00,
    "currency": "GHS",
    "category": "BUILDING_FUND",
    "categoryDetails": {
      "id": "cat_001",
      "name": "Building Fund",
      "description": "Funds for church building projects"
    },
    "method": "Transfer",
    "date": "2024-01-01",
    "description": "Annual building fund pledge",
    "isAnonymous": false,
    "receiptNumber": "PLG-001",
    "status": "PENDING",
    "pledgeDetails": {
      "installments": 12,
      "frequency": "monthly",
      "installmentAmount": 1000.00,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "nextDueDate": "2024-05-01",
      "completedPayments": 4
    },
    "paymentHistory": [
      {
        "id": "pay_001",
        "amount": 1000.00,
        "date": "2024-01-01",
        "method": "Transfer",
        "status": "COMPLETED",
        "receiptNumber": "PAY-001"
      },
      {
        "id": "pay_002",
        "amount": 1000.00,
        "date": "2024-02-01",
        "method": "Transfer",
        "status": "COMPLETED",
        "receiptNumber": "PAY-002"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-04-01T10:30:00Z"
  }
}
```

### PUT /giving/pledges/{id}
**Description**: Update a pledge

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "totalAmount": 15000.00,
  "description": "Annual building fund pledge - Increased amount",
  "pledgeDetails": {
    "installments": 15,
    "frequency": "monthly",
    "endDate": "2025-03-31"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "plg_001",
    "totalAmount": 15000.00,
    "remainingAmount": 11000.00,
    "description": "Annual building fund pledge - Increased amount",
    "pledgeDetails": {
      "installments": 15,
      "frequency": "monthly",
      "installmentAmount": 1000.00,
      "endDate": "2025-03-31",
      "nextDueDate": "2024-05-01"
    },
    "updatedAt": "2024-01-21T16:45:00Z"
  },
  "message": "Pledge updated successfully"
}
```

### DELETE /giving/pledges/{id}
**Description**: Delete a pledge

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "message": "Pledge deleted successfully"
}
```

### POST /giving/pledges/{id}/payments
**Description**: Record a payment for a pledge

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 1000.00,
  "date": "2024-01-21",
  "method": "Transfer",
  "description": "Monthly pledge payment",
  "metadata": {
    "transactionId": "TXN-DEF456",
    "bankReference": "REF-UVW123"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "pay_005",
    "pledgeId": "plg_001",
    "amount": 1000.00,
    "date": "2024-01-21",
    "method": "Transfer",
    "description": "Monthly pledge payment",
    "status": "COMPLETED",
    "receiptNumber": "PAY-005",
    "metadata": {
      "transactionId": "TXN-DEF456",
      "bankReference": "REF-UVW123"
    },
    "pledge": {
      "id": "plg_001",
      "totalAmount": 12000.00,
      "paidAmount": 5000.00,
      "remainingAmount": 7000.00,
      "nextDueDate": "2024-06-01"
    },
    "createdAt": "2024-01-21T11:30:00Z"
  },
  "message": "Payment recorded successfully"
}
```

### GET /giving/pledges/{id}/payments
**Description**: Get payment history for a pledge

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31
```

**Response**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "pay_001",
        "amount": 1000.00,
        "date": "2024-01-01",
        "method": "Transfer",
        "description": "Monthly pledge payment",
        "status": "COMPLETED",
        "receiptNumber": "PAY-001",
        "createdAt": "2024-01-01T10:30:00Z"
      },
      {
        "id": "pay_002",
        "amount": 1000.00,
        "date": "2024-02-01",
        "method": "Transfer",
        "description": "Monthly pledge payment",
        "status": "COMPLETED",
        "receiptNumber": "PAY-002",
        "createdAt": "2024-02-01T09:15:00Z"
      }
    ],
    "total": 4,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "summary": {
      "totalPaid": 4000.00,
      "averagePayment": 1000.00,
      "onTimePayments": 4,
      "latePayments": 0
    }
  }
}
```

---

## 📊 Giving Reports Endpoints

### GET /giving/reports/summary
**Description**: Get overall giving summary and statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&groupBy=month
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "label": "January 2024"
    },
    "totals": {
      "donations": {
        "amount": 125000.00,
        "count": 150,
        "average": 833.33
      },
      "pledges": {
        "amount": 250000.00,
        "paidAmount": 150000.00,
        "remainingAmount": 100000.00,
        "count": 25,
        "completedCount": 5
      },
      "overall": {
        "totalReceived": 275000.00,
        "totalPledged": 250000.00,
        "totalOutstanding": 100000.00
      }
    },
    "trends": [
      {
        "period": "2024-01-01",
        "donations": 25000.00,
        "pledgePayments": 30000.00,
        "total": 55000.00
      },
      {
        "period": "2024-01-08",
        "donations": 30000.00,
        "pledgePayments": 25000.00,
        "total": 55000.00
      }
    ],
    "topCategories": [
      {
        "category": "BUILDING_FUND",
        "categoryName": "Building Fund",
        "amount": 75000.00,
        "percentage": 27.27,
        "count": 45
      },
      {
        "category": "GENERAL",
        "categoryName": "General Offering",
        "amount": 100000.00,
        "percentage": 36.36,
        "count": 80
      }
    ],
    "paymentMethods": [
      {
        "method": "Transfer",
        "amount": 150000.00,
        "percentage": 54.55,
        "count": 75
      },
      {
        "method": "Cash",
        "amount": 75000.00,
        "percentage": 27.27,
        "count": 60
      }
    ]
  }
}
```

### GET /giving/reports/by-category
**Description**: Get giving breakdown by category

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&includeSubcategories=true
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
        "category": "BUILDING_FUND",
        "categoryName": "Building Fund",
        "donations": {
          "amount": 50000.00,
          "count": 30,
          "average": 1666.67
        },
        "pledges": {
          "amount": 25000.00,
          "count": 15,
          "average": 1666.67
        },
        "total": {
          "amount": 75000.00,
          "count": 45,
          "percentage": 27.27
        },
        "monthlyTrend": [
          {
            "month": "2024-01",
            "amount": 75000.00
          }
        ]
      },
      {
        "category": "GENERAL",
        "categoryName": "General Offering",
        "donations": {
          "amount": 75000.00,
          "count": 60,
          "average": 1250.00
        },
        "pledges": {
          "amount": 25000.00,
          "count": 20,
          "average": 1250.00
        },
        "total": {
          "amount": 100000.00,
          "count": 80,
          "percentage": 36.36
        },
        "monthlyTrend": [
          {
            "month": "2024-01",
            "amount": 100000.00
          }
        ]
      }
    ],
    "summary": {
      "totalAmount": 275000.00,
      "totalCount": 175,
      "categoriesCount": 8
    }
  }
}
```

### GET /giving/reports/by-member
**Description**: Get giving breakdown by member

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-01-31&limit=50&includeAnonymous=false&minAmount=100
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
    "members": [
      {
        "memberId": "mem_001",
        "memberName": "John Doe",
        "memberEmail": "john@example.com",
        "donations": {
          "amount": 15000.00,
          "count": 8,
          "average": 1875.00
        },
        "pledges": {
          "totalPledged": 12000.00,
          "paidAmount": 4000.00,
          "remainingAmount": 8000.00,
          "count": 1
        },
        "total": {
          "amount": 19000.00,
          "count": 9,
          "rank": 1
        },
        "categories": [
          {
            "category": "BUILDING_FUND",
            "amount": 10000.00,
            "count": 5
          },
          {
            "category": "GENERAL",
            "amount": 9000.00,
            "count": 4
          }
        ]
      },
      {
        "memberId": "mem_002",
        "memberName": "Jane Smith",
        "memberEmail": "jane@example.com",
        "donations": {
          "amount": 8000.00,
          "count": 6,
          "average": 1333.33
        },
        "pledges": {
          "totalPledged": 6000.00,
          "paidAmount": 2000.00,
          "remainingAmount": 4000.00,
          "count": 1
        },
        "total": {
          "amount": 10000.00,
          "count": 7,
          "rank": 2
        },
        "categories": [
          {
            "category": "MISSIONARY",
            "amount": 6000.00,
            "count": 4
          },
          {
            "category": "GENERAL",
            "amount": 4000.00,
            "count": 3
          }
        ]
      }
    ],
    "summary": {
      "totalMembers": 125,
      "activeGivers": 85,
      "averagePerMember": 2200.00,
      "topGiversCount": 10
    }
  }
}
```

### GET /giving/reports/trends
**Description**: Get giving trends over time

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2023-01-01&endDate=2024-01-31&groupBy=month&includeProjections=true
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
        "periodLabel": "January 2023",
        "donations": {
          "amount": 95000.00,
          "count": 120,
          "average": 791.67
        },
        "pledges": {
          "amount": 180000.00,
          "paidAmount": 120000.00,
          "count": 20
        },
        "total": {
          "amount": 215000.00,
          "count": 140,
          "growthRate": 0.0
        }
      },
      {
        "period": "2024-01",
        "periodLabel": "January 2024",
        "donations": {
          "amount": 125000.00,
          "count": 150,
          "average": 833.33
        },
        "pledges": {
          "amount": 250000.00,
          "paidAmount": 150000.00,
          "count": 25
        },
        "total": {
          "amount": 275000.00,
          "count": 175,
          "growthRate": 27.91
        }
      }
    ],
    "analytics": {
      "yearOverYear": {
        "growthRate": 27.91,
        "amountIncrease": 60000.00,
        "countIncrease": 35
      },
      "seasonality": {
        "peakMonth": "December",
        "lowestMonth": "February",
        "averageMonthly": 220000.00
      },
      "projections": {
        "nextMonth": {
          "estimated": 285000.00,
          "confidence": 85
        },
        "yearEnd": {
          "estimated": 3300000.00,
          "confidence": 75
        }
      }
    }
  }
}
```

### GET /giving/reports/pledges
**Description**: Get detailed pledge reports

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
startDate=2024-01-01&endDate=2024-12-31&status=PENDING&includePaymentSchedule=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "summary": {
      "totalPledges": {
        "amount": 500000.00,
        "count": 50
      },
      "paidAmount": 300000.00,
      "remainingAmount": 200000.00,
      "completionRate": 60.0,
      "onTrackPledges": 35,
      "behindSchedule": 10,
      "completed": 5
    },
    "byStatus": [
      {
        "status": "PENDING",
        "count": 45,
        "amount": 450000.00,
        "paidAmount": 270000.00,
        "percentage": 90.0
      },
      {
        "status": "COMPLETED",
        "count": 5,
        "amount": 50000.00,
        "paidAmount": 50000.00,
        "percentage": 10.0
      }
    ],
    "byCategory": [
      {
        "category": "BUILDING_FUND",
        "categoryName": "Building Fund",
        "count": 20,
        "amount": 250000.00,
        "paidAmount": 150000.00,
        "percentage": 50.0
      },
      {
        "category": "MISSIONARY",
        "categoryName": "Missionary Support",
        "count": 15,
        "amount": 150000.00,
        "paidAmount": 90000.00,
        "percentage": 30.0
      }
    ],
    "upcomingPayments": [
      {
        "pledgeId": "plg_001",
        "memberName": "John Doe",
        "amount": 1000.00,
        "dueDate": "2024-02-01",
        "category": "BUILDING_FUND",
        "daysUntilDue": 10
      },
      {
        "pledgeId": "plg_002",
        "memberName": "Jane Smith",
        "amount": 500.00,
        "dueDate": "2024-02-01",
        "category": "MISSIONARY",
        "daysUntilDue": 10
      }
    ],
    "overduePayments": [
      {
        "pledgeId": "plg_015",
        "memberName": "Bob Johnson",
        "amount": 750.00,
        "dueDate": "2024-01-15",
        "category": "GENERAL",
        "daysOverdue": 6
      }
    ]
  }
}
```

### POST /giving/reports/export
**Description**: Export giving data in various formats

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "reportType": "donations",
  "format": "CSV",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "filters": {
    "categories": ["BUILDING_FUND", "GENERAL"],
    "status": ["COMPLETED"],
    "includeAnonymous": false
  },
  "columns": [
    "date",
    "memberName",
    "amount",
    "category",
    "method",
    "receiptNumber"
  ],
  "emailTo": "admin@emcchurch.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "exportId": "exp_001",
    "downloadUrl": "https://api.emcchurch.com/exports/giving-donations-2024-01.csv",
    "format": "CSV",
    "recordCount": 150,
    "fileSize": "25.6 KB",
    "expiresAt": "2024-01-28T23:59:59Z",
    "emailSent": true
  },
  "message": "Export generated successfully"
}
```

---

## 👤 Member Giving Endpoints

### GET /members/{id}/giving
**Description**: Get a member's complete giving history

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
page=1&limit=20&startDate=2024-01-01&endDate=2024-01-31&type=DONATION&category=BUILDING_FUND
```

**Response**:
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "mem_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+233123456789"
    },
    "giving": {
      "data": [
        {
          "id": "don_001",
          "type": "DONATION",
          "amount": 5000.00,
          "currency": "GHS",
          "category": "BUILDING_FUND",
          "categoryName": "Building Fund",
          "method": "Transfer",
          "date": "2024-01-20",
          "description": "Building fund donation",
          "receiptNumber": "DON-001",
          "status": "COMPLETED",
          "createdAt": "2024-01-20T10:30:00Z"
        },
        {
          "id": "plg_001",
          "type": "PLEDGE",
          "totalAmount": 12000.00,
          "paidAmount": 4000.00,
          "remainingAmount": 8000.00,
          "currency": "GHS",
          "category": "BUILDING_FUND",
          "categoryName": "Building Fund",
          "method": "Transfer",
          "date": "2024-01-01",
          "description": "Annual building fund pledge",
          "receiptNumber": "PLG-001",
          "status": "PENDING",
          "pledgeDetails": {
            "installments": 12,
            "frequency": "monthly",
            "nextDueDate": "2024-05-01"
          },
          "createdAt": "2024-01-01T00:00:00Z"
        }
      ],
      "total": 25,
      "page": 1,
      "limit": 20,
      "totalPages": 2
    },
    "summary": {
      "totalGiven": 45000.00,
      "totalPledged": 12000.00,
      "totalOutstanding": 8000.00,
      "givingCount": 25,
      "firstGiving": "2023-01-15",
      "lastGiving": "2024-01-20",
      "averageGiving": 1800.00,
      "yearToDateGiving": 19000.00
    }
  }
}
```

### GET /members/{id}/giving/summary
**Description**: Get a member's giving summary and statistics

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
year=2024&includeProjections=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "member": {
      "id": "mem_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "period": {
      "year": 2024,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31"
    },
    "totals": {
      "donations": {
        "amount": 15000.00,
        "count": 8,
        "average": 1875.00
      },
      "pledges": {
        "totalPledged": 12000.00,
        "paidAmount": 4000.00,
        "remainingAmount": 8000.00,
        "count": 1
      },
      "overall": {
        "totalGiven": 19000.00,
        "totalCommitted": 31000.00,
        "fulfillmentRate": 61.29
      }
    },
    "byCategory": [
      {
        "category": "BUILDING_FUND",
        "categoryName": "Building Fund",
        "amount": 10000.00,
        "count": 5,
        "percentage": 52.63
      },
      {
        "category": "GENERAL",
        "categoryName": "General Offering",
        "amount": 9000.00,
        "count": 4,
        "percentage": 47.37
      }
    ],
    "byMethod": [
      {
        "method": "Transfer",
        "amount": 12000.00,
        "count": 6,
        "percentage": 63.16
      },
      {
        "method": "Cash",
        "amount": 7000.00,
        "count": 3,
        "percentage": 36.84
      }
    ],
    "monthlyTrend": [
      {
        "month": "2024-01",
        "amount": 19000.00,
        "count": 9
      }
    ],
    "comparison": {
      "previousYear": {
        "amount": 16000.00,
        "growthRate": 18.75
      },
      "churchAverage": {
        "amount": 12000.00,
        "percentileRank": 75
      }
    },
    "projections": {
      "yearEnd": {
        "estimated": 228000.00,
        "confidence": 80
      }
    }
  }
}
```

### POST /members/{id}/giving
**Description**: Record giving for a specific member

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "type": "DONATION",
  "amount": 2500.00,
  "currency": "GHS",
  "category": "MISSIONARY",
  "method": "Cash",
  "date": "2024-01-21",
  "description": "Missionary support offering",
  "isAnonymous": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "don_152",
    "memberId": "mem_001",
    "type": "DONATION",
    "amount": 2500.00,
    "currency": "GHS",
    "category": "MISSIONARY",
    "method": "Cash",
    "date": "2024-01-21",
    "description": "Missionary support offering",
    "isAnonymous": false,
    "receiptNumber": "DON-152",
    "status": "COMPLETED",
    "createdAt": "2024-01-21T11:30:00Z",
    "updatedAt": "2024-01-21T11:30:00Z"
  },
  "message": "Giving recorded successfully for member"
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
    "message": "Validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be greater than 0"
      },
      {
        "field": "category",
        "message": "Invalid category provided"
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
    "message": "Donation not found"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot delete donation with associated pledge payments",
    "details": {
      "donationId": "don_001",
      "associatedPayments": 3
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
    "requestId": "req_abc123"
  }
}
```

---

## 📝 Data Models

### Giving Categories
- `GENERAL` - General church operations
- `BUILDING_FUND` - Building projects and maintenance
- `MISSIONARY` - Missionary support and missions
- `YOUTH` - Youth ministry programs
- `CHILDREN` - Children's ministry programs
- `MUSIC` - Music ministry and equipment
- `OUTREACH` - Community outreach programs
- `CHARITY` - Charitable giving and welfare
- `EDUCATION` - Educational programs and scholarships
- `MEDICAL` - Medical missions and health programs
- `DISASTER_RELIEF` - Emergency and disaster response
- `OTHER` - Other designated purposes

### Giving Types
- `DONATION` - One-time donation
- `PLEDGE` - Commitment to give over time
- `TITHE` - Regular tithe offering
- `OFFERING` - Special offering

### Giving Status
- `COMPLETED` - Successfully processed
- `PENDING` - Awaiting processing
- `FAILED` - Processing failed
- `REFUNDED` - Amount refunded
- `CANCELLED` - Transaction cancelled

### Payment Methods
- `Cash` - Cash payment
- `Transfer` - Bank transfer
- `Online` - Online payment
- `Check` - Check payment
- `Card` - Credit/debit card
- `Mobile Money` - Mobile money transfer

---

## 🔐 Authentication & Permissions

### Required Permissions
- `giving:read` - View giving data
- `giving:write` - Create and update giving records
- `giving:delete` - Delete giving records
- `giving:reports` - Access giving reports
- `giving:export` - Export giving data
- `members:giving:read` - View member giving data
- `members:giving:write` - Record giving for members

### Rate Limiting
- Standard endpoints: 100 requests per minute
- Report endpoints: 20 requests per minute
- Export endpoints: 5 requests per minute

---

*This documentation covers all giving module endpoints. For additional information or support, please contact the development team.*