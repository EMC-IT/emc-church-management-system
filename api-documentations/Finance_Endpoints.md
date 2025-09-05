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

