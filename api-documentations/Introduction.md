# EMC Church Management System — Backend API Specification & Integration Contract

## 📌 Introduction

This documentation suite specifies the REST API contract expected by the EMC Church Management System frontend.

The backend service is designed to serve a multi-tenant, multi-branch church operations system. All endpoints adhere to standard JSON REST conventions, strict input validation, consistent status codes, and deterministic domain models.

---

## 🌐 Protocol & Conventions

### Base URL
```
http://localhost:8000/api
```
*(Configurable on the frontend via `NEXT_PUBLIC_API_URL`)*

### Common Headers
| Header Name | Requirement | Description |
| :--- | :--- | :--- |
| `Content-Type` | Required | `application/json` (or `multipart/form-data` for file uploads) |
| `Authorization` | Required for Protected Routes | `Bearer <JWT_TOKEN>` |
| `X-Tenant-ID` | Optional / Resolved via JWT | Identifies active tenant organization context |
| `X-Branch-ID` | Optional | Contextual branch filter (e.g. `branch_hq`, `branch_somanya`) |

---

## 📦 Domain Endpoints Directory

The backend API is partitioned into the following functional domain modules:

1. **Authentication & Identity**: [`Auth_Authentication_Endpoints.md`](./Auth_Authentication_Endpoints.md)
2. **Membership CRM**: [`Members_Endpoints.md`](./Members_Endpoints.md)
3. **Converts & Follow-ups**: [`Convert_Management_Endpoints.md`](./Convert_Management_Endpoints.md)
4. **Attendance & Check-in**: [`Analytics_Attendance_Endpoints.md`](./Analytics_Attendance_Endpoints.md)
5. **Financial Operations (Overview)**: [`Finance_Endpoints.md`](./Finance_Endpoints.md)
6. **Giving, Donations, & Pledges**: [`Giving_Endpoints.md`](./Giving_Endpoints.md)
7. **Expenses & Vouchers**: [`Expenses_Endpoints.md`](./Expenses_Endpoints.md)
8. **Income & Revenue**: [`Income_Endpoints.md`](./Income_Endpoints.md)
9. **Sunday School & Children Ministry**: [`SundaySchool_Endpoints.md`](./SundaySchool_Endpoints.md)
10. **Departments & Teams**: [`Departments_Endpoints.md`](./Departments_Endpoints.md)
11. **Small Groups & Cells**: [`Members_Groups_Endpoints.md`](./Members_Groups_Endpoints.md)
12. **Events & Calendar**: [`Events_Endpoints.md`](./Events_Endpoints.md)
13. **Analytics & Executive KPIs**: [`Analytics_Endpoints.md`](./Analytics_Endpoints.md)
14. **Settings & System Administration**: [`Settings_Endpoints.md`](./Settings_Endpoints.md)
15. **Error Formats & Status Envelopes**: [`Errors_Responses.md`](./Errors_Responses.md)

---

## 🔒 Multi-Tenant & Branch Security Rules
1. **Server-Side Token Derivation**: The backend must decode the authenticated user identity and derive `tenantId` from the verified JWT payload rather than trusting client-supplied query params.
2. **Tenant Isolation**: Queries and mutations must strictly filter records by `tenant_id`. Attempting to access resources belonging to a different tenant must return `403 Forbidden`.
3. **Deterministic Financial Records**: Monetary values must be stored with high precision (e.g. integer minor units or `DECIMAL(14, 2)`).
