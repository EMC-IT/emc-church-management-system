# Assets & Inventory Endpoints

These endpoints manage physical church assets, audio/visual gear, instruments, furniture, vehicles, and maintenance logs. Consumed by `app/(admin)/dashboard/assets/*` and `services/assets/*`.

Base URL: `http://localhost:8000/api/v1/assets`

---

## Endpoints

### GET /assets
**Description**: Retrieve inventory listing with search, category filtering, and valuation totals.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
* `category` (string, optional): e.g. `Audio_Visual`, `Musical_Instruments`, `Vehicles`, `Furniture`
* `status` (string, optional): `Operational`, `Under_Maintenance`, `Decommissioned`, `Disposed`
* `search` (string, optional)
* `page` (number, optional, default: 1)
* `limit` (number, optional, default: 20)

**Response**:
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "id": "ast-001",
        "name": "Behringer X32 Digital Mixing Console",
        "serialNumber": "BEH-X32-98412",
        "category": "Audio_Visual",
        "purchaseDate": "2024-03-12",
        "purchasePrice": 35000.00,
        "currentValue": 28000.00,
        "currency": "GHS",
        "location": "Main Sanctuary Sound Booth",
        "status": "Operational",
        "assignedTo": "Media Ministry"
      }
    ],
    "summary": {
      "totalAssetCount": 142,
      "totalValuation": 845000.00,
      "underMaintenanceCount": 3
    }
  }
}
```

---

### POST /assets
**Description**: Register a new physical asset or equipment piece.

**Request Body**:
```json
{
  "name": "Sony FX3 Cinema Camera",
  "serialNumber": "SNY-FX3-10293",
  "category": "Audio_Visual",
  "purchaseDate": "2026-02-10",
  "purchasePrice": 42000.00,
  "currency": "GHS",
  "location": "Media Production Studio",
  "departmentId": "dept-03"
}
```

---

### GET /assets/{id}
**Description**: Retrieve complete asset dossier, warranty information, assignment history, and maintenance log.

---

### PUT /assets/{id}
**Description**: Update asset parameters, valuation, or custodial assignment.

---

### POST /assets/{id}/maintenance
**Description**: Log scheduled or emergency maintenance/repair event.

**Request Body**:
```json
{
  "maintenanceType": "Scheduled Servicing",
  "serviceProvider": "Yamaha Sound Pro Solutions",
  "cost": 1200.00,
  "currency": "GHS",
  "scheduledDate": "2026-09-12",
  "notes": "Fader replacement and dust cleaning."
}
```

---

### GET /assets/categories
**Description**: List asset classification categories.

### POST /assets/categories
**Description**: Create a new asset classification category.
