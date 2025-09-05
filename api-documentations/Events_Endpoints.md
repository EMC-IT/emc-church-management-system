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

