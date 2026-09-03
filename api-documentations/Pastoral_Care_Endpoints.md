# Pastoral Care & Visitation Endpoints

These endpoints manage pastoral counseling appointments, visitation cases, and pastoral session records. Consumed by `app/(admin)/dashboard/pastoral-care/*` and `services/member/pastoral-care.service.ts`.

Base URL: `http://localhost:8000/api/pastoral-care`

---

## Endpoints

### GET /pastoral-care/cases
**Description**: Retrieve filterable list of pastoral care cases (Counseling, Hospital, Bereavement, Home Visit).

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
* `status` (string, optional): `New`, `In_Progress`, `Follow_Up`, `Closed`
* `category` (string, optional): `Marriage`, `Bereavement`, `Health`, `Spiritual`, `Financial`
* `assignedPastorId` (string, optional): Filter by pastor
* `page` (number, optional, default: 1)
* `limit` (number, optional, default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "pc-001",
        "member": {
          "id": "mem-042",
          "name": "Kwame Mensah",
          "phone": "+233 24 555 1234",
          "photo": null
        },
        "category": "Marriage",
        "priority": "High",
        "status": "In_Progress",
        "assignedPastor": {
          "id": "usr-005",
          "name": "Pastor David Adjei"
        },
        "lastSessionDate": "2026-08-25T14:00:00Z",
        "nextFollowUpDate": "2026-09-08T14:00:00Z",
        "totalSessions": 3
      }
    ],
    "pagination": {
      "total": 24,
      "page": 1,
      "limit": 20
    }
  }
}
```

---

### POST /pastoral-care/cases
**Description**: Log a new pastoral care or counseling case.

**Request Body**:
```json
{
  "memberId": "mem-042",
  "category": "Marriage",
  "priority": "High",
  "assignedPastorId": "usr-005",
  "notes": "Couple requesting marriage enrichment sessions.",
  "scheduledDate": "2026-09-10T10:00:00Z"
}
```

---

### GET /pastoral-care/cases/{id}
**Description**: Retrieve complete case history, pastoral session timeline, and confidential notes.

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "pc-001",
    "memberId": "mem-042",
    "category": "Marriage",
    "priority": "High",
    "status": "In_Progress",
    "sessions": [
      {
        "id": "sess-1",
        "date": "2026-08-18T14:00:00Z",
        "pastorName": "Pastor David Adjei",
        "location": "Pastor's Office",
        "summary": "Initial assessment and communication hurdles identified.",
        "actionItems": "Assign reading chapter 3 of Marriage Covenant."
      }
    ]
  }
}
```

---

### POST /pastoral-care/cases/{id}/sessions
**Description**: Record a completed counseling session or visitation log.

**Request Body**:
```json
{
  "sessionDate": "2026-09-02T15:00:00Z",
  "location": "Ridge Hospital, Ward B",
  "confidentialNotes": "Patient responsive to prayer. Blood pressure stabilizing.",
  "nextFollowUpDate": "2026-09-05T10:00:00Z",
  "status": "In_Progress"
}
```

---

### PUT /pastoral-care/cases/{id}/status
**Description**: Update case status or close case upon successful resolution.

**Request Body**:
```json
{
  "status": "Closed",
  "closingNotes": "Marital restoration achieved. Couple actively participating in Sunday services."
}
```
