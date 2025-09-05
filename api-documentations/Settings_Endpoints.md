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

