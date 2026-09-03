# Communications & Broadcast Endpoints

These endpoints power multi-channel mass communications including bulk SMS broadcasts, email campaigns, scheduled newsletters, and in-app bulletin announcements. Consumed by `app/(admin)/dashboard/communications/*` and `services/communications/*`.

Base URL: `http://localhost:8000/api/communications`

---

## Endpoints

### GET /communications/overview
**Description**: Get communications metrics, SMS balance, delivery rate, and recent campaign performance.

**Headers**:
```
Authorization: Bearer <token>
```

**Response**:
```json
{
  "success": true,
  "data": {
    "smsCreditsRemaining": 14250,
    "totalSentThisMonth": 28400,
    "averageDeliveryRate": 98.6,
    "activeCampaignsCount": 2
  }
}
```

---

### POST /communications/messages
**Description**: Dispatch a direct or targeted SMS / Email message.

**Request Body**:
```json
{
  "channel": "SMS",
  "recipients": {
    "type": "Group",
    "targetIds": ["grp-001", "grp-004"]
  },
  "message": "Reminder: Special Prayer & Fasting Service tomorrow at 6:30 PM. Come with expectancy!",
  "senderId": "EMC CHURCH",
  "scheduledAt": null
}
```

---

### GET /communications/campaigns
**Description**: List multi-channel broadcast campaigns with status and delivery telemetry.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cmp-001",
      "title": "Annual Convention 2026 Registration Blast",
      "channel": "SMS_AND_EMAIL",
      "totalAudience": 3500,
      "deliveredCount": 3462,
      "failedCount": 38,
      "status": "Completed",
      "dispatchedAt": "2026-08-20T10:00:00Z"
    }
  ]
}
```

---

### POST /communications/campaigns
**Description**: Create and schedule a bulk broadcast campaign.

---

### GET /communications/announcements
**Description**: Retrieve published announcements and digital church bulletins.

### POST /communications/announcements
**Description**: Publish a new bulletin announcement.

**Request Body**:
```json
{
  "title": "Children's Ministry Graduation Service",
  "content": "All parents are invited to celebrate our Sunday School graduates this Sunday during Second Service.",
  "targetAudience": "All_Members",
  "priority": "High",
  "publishDate": "2026-09-01",
  "expireDate": "2026-09-08"
}
```

---

### GET /communications/newsletters
**Description**: List drafted and dispatched HTML email newsletters.

### POST /communications/newsletters
**Description**: Create or schedule an email newsletter with rich content templates.
