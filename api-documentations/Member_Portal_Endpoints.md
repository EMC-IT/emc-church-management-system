# Member Self-Service Portal Endpoints

These endpoints support the authenticated Member Self-Service Portal (`/portal/*`) and are consumed by `services/member/*`. All endpoints require an active member session (`Authorization: Bearer <member_jwt_token>`).

Base URL: `http://localhost:8000/api/v1/member`

---

## 1. Dashboard Overview

### GET /member/dashboard
**Description**: Get congregant dashboard summary, daily scripture verse, upcoming registered events, active group notices, and quick stats.

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "welcomeMessage": "Welcome back, Brother Emmanuel",
    "verseOfTheDay": {
      "text": "The Lord is my shepherd; I shall not want.",
      "reference": "Psalm 23:1"
    },
    "attendanceStreak": 4,
    "totalContributionsThisYear": 1850.00,
    "currency": "GHS",
    "upcomingEvents": [
      {
        "id": "evt-001",
        "title": "Annual Leadership & Vision Summit",
        "date": "2026-09-15T09:00:00Z",
        "venue": "Main Sanctuary",
        "isRegistered": true
      }
    ],
    "activeGroupsCount": 2,
    "unreadNotificationsCount": 3
  }
}
```

---

## 2. Personal Profile & Household

### GET /member/profile
**Description**: Retrieve authenticated member's personal profile information.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "mem-001",
    "firstName": "Emmanuel",
    "lastName": "Quaye",
    "email": "emmanuel.quaye@example.com",
    "phone": "+233 24 123 4567",
    "gender": "Male",
    "dateOfBirth": "1990-05-14",
    "address": "14 Independence Avenue, Accra",
    "occupation": "Software Engineer",
    "photoUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "membershipStatus": "Active",
    "branchName": "Headquarters Campus"
  }
}
```

### PUT /member/profile
**Description**: Update personal profile details.

**Request Body**:
```json
{
  "firstName": "Emmanuel",
  "lastName": "Quaye",
  "phone": "+233 24 123 4567",
  "address": "14 Independence Avenue, Accra",
  "occupation": "Senior Software Architect"
}
```

### GET /member/family
**Description**: Get list of linked household members.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "fam-01",
      "memberId": "mem-002",
      "name": "Sarah Quaye",
      "relationship": "Spouse",
      "phone": "+233 24 987 6543",
      "isHead": false
    },
    {
      "id": "fam-02",
      "memberId": "mem-003",
      "name": "Daniel Quaye",
      "relationship": "Child",
      "phone": null,
      "isHead": false
    }
  ]
}
```

### POST /member/family/link
**Description**: Request linking an existing church member as a household dependent or relative.

**Request Body**:
```json
{
  "targetMemberId": "mem-004",
  "relationship": "Parent"
}
```

---

## 3. Attendance & Touchless Check-in

### GET /member/attendance
**Description**: Retrieve personal and household attendance history.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalServicesAttended": 32,
    "currentStreak": 4,
    "history": [
      {
        "id": "att-101",
        "serviceName": "Sunday First Service",
        "date": "2026-08-30",
        "checkInTime": "2026-08-30T08:15:22Z",
        "method": "QR_Kiosk",
        "status": "Present"
      }
    ]
  }
}
```

### GET /member/attendance/qr
**Description**: Fetch dynamic personal QR code token for touchless kiosk check-in.

**Response**:
```json
{
  "success": true,
  "data": {
    "qrToken": "EMC-ATT-MEM001-20260903-TOKEN",
    "expiresAt": "2026-09-03T23:59:59Z"
  }
}
```

---

## 4. Giving & Tax Contribution Statements

### GET /member/giving
**Description**: Retrieve personal giving transactions and active pledge progress.

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalGivenYTD": 4250.00,
      "currency": "GHS",
      "tithesYTD": 3000.00,
      "offeringsYTD": 750.00,
      "pledgesYTD": 500.00
    },
    "pledges": [
      {
        "id": "plg-01",
        "campaignTitle": "Cathedral Building Project",
        "pledgedAmount": 5000.00,
        "fulfilledAmount": 2500.00,
        "currency": "GHS",
        "progressPercentage": 50.0
      }
    ],
    "transactions": [
      {
        "id": "giv-001",
        "type": "Tithe",
        "amount": 500.00,
        "currency": "GHS",
        "date": "2026-08-28",
        "paymentMethod": "Mobile Money",
        "receiptNumber": "REC-2026-0828-01"
      }
    ]
  }
}
```

### GET /member/giving/statement
**Description**: Generate and download annual donor tax contribution statement PDF.

**Query Parameters**:
* `year` (number, required): e.g. `2025`

**Response**: Binary PDF file (`Content-Type: application/pdf`).

---

## 5. Events & Registrations

### GET /member/events
**Description**: List church events with registration status for the authenticated member.

### POST /member/events/{id}/register
**Description**: RSVP / register for a specific church event.

**Request Body**:
```json
{
  "attendeeCount": 2,
  "notes": "Bringing my spouse"
}
```

### DELETE /member/events/{id}/register
**Description**: Cancel attendance registration for an event.

---

## 6. Groups & Ministries

### GET /member/groups
**Description**: List small groups and fellowships the member belongs to.

### POST /member/groups/{id}/join
**Description**: Submit request to join a fellowship group.

### GET /member/ministries
**Description**: List ministries the member serves in and open volunteer opportunities.

---

## 7. Spiritual Journey & Discipleship

### GET /member/journey
**Description**: Get spiritual progression milestones and academy certifications.

**Response**:
```json
{
  "success": true,
  "data": {
    "currentMilestone": "Foundation School Graduate",
    "milestones": [
      { "id": "m1", "title": "Salvation", "completed": true, "date": "2020-03-15" },
      { "id": "m2", "title": "Water Baptism", "completed": true, "date": "2020-06-20" },
      { "id": "m3", "title": "Foundation Class", "completed": true, "date": "2021-02-10" },
      { "id": "m4", "title": "Discipleship Academy", "completed": false, "date": null }
    ]
  }
}
```

---

## 8. Prayer Petitions & Pastoral Care

### GET /member/prayer
**Description**: Retrieve member's submitted prayer requests.

### POST /member/prayer
**Description**: Submit new prayer petition.

**Request Body**:
```json
{
  "title": "Healing for my mother",
  "description": "Please pray for complete recovery from knee surgery.",
  "category": "Health",
  "isConfidential": true
}
```

### GET /member/pastoral-care
**Description**: Get member's pastoral appointments and counseling session history.

### POST /member/pastoral-care/request
**Description**: Request counseling or home/hospital visitation.

**Request Body**:
```json
{
  "requestType": "Counseling",
  "preferredDate": "2026-09-10",
  "preferredTime": "14:00",
  "notes": "Pre-marital guidance session"
}
```

---

## 9. Resources, Notifications & Settings

### GET /member/resources
**Description**: Retrieve downloadable sermon outlines, study guides, and devotional PDFs.

### GET /member/notifications
**Description**: Retrieve personal notification messages and alerts.

### PUT /member/notifications/{id}/read
**Description**: Mark a notification message as read.

### PUT /member/settings
**Description**: Update notification preferences and communication channels.
