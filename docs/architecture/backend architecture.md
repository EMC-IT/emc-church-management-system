. # EMC Church Management System

## System Design Architecture

### 1. System Overview

The EMC Church Management System is a multi-tenant, multi-branch church management and ministry platform consisting of:

* A **public ministry web portal**
* An authenticated **administrative portal**
* A future **member/mobile application layer**
* A Python-based **FastAPI backend**
* A PostgreSQL transactional database
* Redis for caching, sessions, rate limiting, and asynchronous task brokering
* Celery background workers
* S3-compatible object storage
* External integrations for payments, SMS, email, maps, and third-party systems

The backend will use a **Domain-Driven Modular Monolith architecture**.

The objective is to keep the system:

* Secure
* Maintainable
* Highly testable
* Multi-tenant
* Multi-branch aware
* Financially reliable
* Extensible
* API-first
* Ready for future horizontal scaling

The frontend specification already establishes domain separation across Members, Finance, Attendance, Events, Groups, Pastoral Care, Communications, Sunday School, Assets, Analytics, Files, and Administration. The backend will mirror these boundaries. 

---

# 2. High-Level Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Next.js Admin Portal       Next.js Public Portal       Mobile Apps  │
│  React + TypeScript         Public Ministry Site       Future        │
│                                                                      │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                         HTTPS / REST / JSON
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / REVERSE PROXY                       │
├──────────────────────────────────────────────────────────────────────┤
│ TLS • Rate Limiting • Routing • Security Headers • Compression       │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                              │
│                           Python 3.13+                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Authentication          Authorization        Tenant/Branch          │
│  JWT + Refresh           RBAC + Policies      Isolation              │
│                                                                      │
│  Validation              Exception Handling   Request Context        │
│  Pydantic                Error Mapping        Request ID             │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                         DOMAIN MODULES                               │
│                                                                      │
│ Identity & Access       Churches & Branches      Members             │
│ Families                Attendance               Finance             │
│ Pastoral Care           Departments              Groups              │
│ Events                  Sunday School            Assets              │
│ Communications          Prayer Requests          Files               │
│ Analytics               Notifications             Workflows           │
│ Audit Logs              Settings                                        │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│                       APPLICATION LAYER                              │
│                                                                      │
│ Application Services • Commands • Queries • Repositories             │
│ Pydantic Schemas • Domain Rules • Background Task Dispatch            │
│                                                                      │
└───────────────┬───────────────────────────────┬──────────────────────┘
                │                               │
                ▼                               ▼
┌──────────────────────────────┐      ┌────────────────────────────────┐
│       POSTGRESQL             │      │             REDIS              │
│                              │      │                                │
│ Transactional Database       │      │ Cache                          │
│ Tenant Data                  │      │ Rate Limiting                  │
│ Financial Records            │      │ Session/Temporary Data         │
│ Audit Records                │      │ Celery Broker                  │
│ RBAC                         │      │ Job State                      │
└──────────────────────────────┘      └───────────────┬────────────────┘
                                                       │
                                                       ▼
                                        ┌──────────────────────────────┐
                                        │       CELERY WORKERS         │
                                        │                              │
                                        │ SMS • Email • Reports        │
                                        │ Imports • Notifications      │
                                        │ Scheduled Jobs • Exports     │
                                        └───────────────┬──────────────┘
                                                        │
                     ┌──────────────────────────────────┼──────────────────────┐
                     ▼                                  ▼                      ▼
              Email Providers                     SMS Providers          Payment APIs
              SES / SendGrid                      Twilio / Local         MoMo / Cards
                     │                                  │                      │
                     └──────────────────────────────────┼──────────────────────┘
                                                        ▼
                                               External Services
```

---

# 3. Architectural Style

## 3.1 Modular Monolith

The backend will initially be deployed as a single FastAPI application while maintaining strict internal domain boundaries.

```text
FastAPI Application
│
├── Identity
├── Members
├── Finance
├── Attendance
├── Events
├── Groups
├── Pastoral Care
├── Communications
├── ...
└── Analytics
```

Each module owns its:

* Business rules
* Models
* Schemas
* Services
* Repositories
* Permissions
* Domain exceptions
* Tests

This provides most of the organizational benefits of microservices without introducing unnecessary operational complexity.

### Why not microservices initially?

Microservices would introduce:

* Multiple deployments
* Network communication between services
* Distributed transactions
* Service discovery
* More complicated observability
* More complicated local development
* Additional infrastructure

The current system does not require that complexity.

If the platform eventually grows sufficiently, domains such as **Communications, Analytics, Payments, or Reporting** can be extracted into independent services.

---

# 4. Backend Layer Architecture

The backend will follow four primary layers.

```text
┌───────────────────────────────┐
│       Presentation Layer      │
│          FastAPI Routers       │
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│       Application Layer       │
│ Services / Commands / Queries │
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│          Domain Layer         │
│ Rules / Policies / Workflows  │
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│      Infrastructure Layer     │
│ DB / Redis / Storage / APIs   │
└───────────────────────────────┘
```

### Presentation Layer

Responsible for:

* HTTP routing
* Request parsing
* Authentication dependencies
* Pydantic validation
* Response serialization
* HTTP status codes

Routes should remain thin.

They should **not contain business logic**.

---

# 5. Application Layer

The application layer coordinates business operations.

Example:

```text
POST /api/v1/members
        │
        ▼
CreateMemberService
        │
        ├── Validate authorization
        ├── Validate business rules
        ├── Create member
        ├── Create audit event
        └── Dispatch notification
```

An application service may coordinate multiple domain operations while remaining independent of HTTP.

Example:

```python
class CreateMemberService:
    def execute(
        self,
        command: CreateMemberCommand,
        actor: CurrentUser,
    ) -> Member:
        ...
```

This makes the business logic easy to test without starting FastAPI.

---

# 6. Domain Layer

The domain layer contains the actual rules of the church management system.

For example:

### Membership

```text
Member
Family
MembershipStatus
MembershipMilestone
MemberDepartment
MemberDocument
```

### Finance

```text
FinancialTransaction
Fund
Account
Budget
Expense
Pledge
Donation
ExchangeRate
```

### Attendance

```text
AttendanceSession
AttendanceRecord
CheckIn
AttendanceStatus
```

Domain rules should live here rather than in frontend components.

---

# 7. Infrastructure Layer

Infrastructure contains implementations for external systems.

```text
infrastructure/
│
├── database/
│   ├── session.py
│   └── models/
│
├── redis/
│
├── storage/
│   └── s3.py
│
├── email/
│
├── sms/
│
├── payments/
│
└── notifications/
```

This means the Finance domain doesn't need to know whether the payment provider is MTN MoMo, Visa, Mastercard, or another provider.

---

# 8. Domain Modules

The backend will contain the following major modules.

```text
domains/
│
├── identity/
├── churches/
├── members/
├── families/
├── attendance/
├── finance/
├── pastoral_care/
├── departments/
├── groups/
├── events/
├── sunday_school/
├── assets/
├── communications/
├── prayer_requests/
├── files/
├── analytics/
├── notifications/
├── audit/
└── settings/
```

These correspond closely with the system's existing functional architecture. 

---

# 9. Multi-Tenant Architecture

The system must treat the **church organization as the tenant boundary**.

```text
Church / Tenant
│
├── Headquarters
│
├── Branch A
│
├── Branch B
│
└── Branch C
```

Tenant-owned records should carry:

```text
church_id
```

Branch-sensitive records should also carry:

```text
branch_id
```

Example:

```text
members
────────────────────
id
church_id
branch_id
first_name
last_name
email
phone
status
created_at
updated_at
```

---

# 10. Tenant Isolation

Tenant isolation must occur at multiple levels.

```text
                    Tenant Isolation
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
     API Context      Service Layer    Database
          │               │               │
     church_id        Permission      PostgreSQL
                       checks            RLS
```

The system should never trust the frontend to provide the correct `church_id`.

The backend derives the tenant from the authenticated user's context.

```text
JWT
 │
 ├── user_id
 ├── church_id
 ├── role
 └── branch scope
```

---

# 11. Branch Isolation

A branch administrator should only see records belonging to permitted branches.

```text
Super Admin
    │
    └── All branches

Branch Pastor
    │
    └── Assigned branch

Department Lead
    │
    └── Authorized department records
```

Branch access should be enforced at the backend rather than merely hiding UI elements.

---

# 12. Authentication Architecture

The authentication system will use:

```text
JWT Access Token
+
Rotating Refresh Token
+
Server-side Session Tracking
```

Flow:

```text
User
 │
 ▼
POST /auth/login
 │
 ▼
Verify Password
 │
 ▼
Create Session
 │
 ├── Access Token
 └── Refresh Token
        │
        ▼
      Client
```

Access tokens should be short-lived.

Refresh tokens should be:

* Rotatable
* Revocable
* Expirable
* Stored securely
* Associated with a session/device

Passwords should be hashed using **Argon2id**.

---

# 13. Authorization Architecture

Authorization will use:

> **RBAC + Policy-Based Authorization**

RBAC determines broad capabilities.

Policies determine whether a user can perform the action against a specific resource.

```text
User
 │
 ▼
Role
 │
 ▼
Permissions
 │
 ▼
Resource Policy
 │
 ▼
Allow / Deny
```

Example:

```text
finance.transaction.approve
```

doesn't automatically mean the user can approve every transaction.

The policy can additionally check:

```text
User
+
Church
+
Branch
+
Role
+
Transaction
+
Approval authority
```

---

# 14. Permission Model

Permissions should use a predictable naming convention:

```text
members.view
members.create
members.update
members.delete
members.export

finance.transactions.view
finance.transactions.create
finance.transactions.approve
finance.transactions.export

attendance.view
attendance.create
attendance.update
```

The frontend permission matrix can map directly to this structure.

The existing specification already defines granular View, Create, Edit, Delete and Export permissions across modules. 

---

# 15. Finance Architecture

Finance should be treated differently from ordinary CRUD domains.

The system should prioritize:

* Accuracy
* Atomic transactions
* Traceability
* Immutability
* Reconciliation
* Auditability

Financial amounts should use PostgreSQL:

```text
NUMERIC
```

rather than floating-point types.

Example:

```text
financial_transactions
────────────────────────────
id
church_id
branch_id
fund_id
account_id
transaction_type
amount
currency
exchange_rate
reference
transaction_date
status
created_by
created_at
```

---

# 16. Financial Transaction Principle

Avoid silently modifying historical financial transactions.

Instead:

```text
Original Transaction
        │
        ▼
Correction / Reversal
        │
        ▼
New Transaction
```

This creates a reliable audit trail.

For example:

```text
Donation
₵1,000

Correction
-₵100

Corrected balance
₵900
```

rather than rewriting the original record.

This is particularly important because the frontend specification requires deterministic financial calculations and financial reporting. 

---

# 17. Pastoral Care Security Boundary

Pastoral care requires stronger authorization than ordinary member data.

```text
Member Data
     │
     ▼
Normal RBAC
```

while:

```text
Pastoral Case
     │
     ▼
RBAC
     +
Confidentiality
     +
Assignment
     +
Branch
```

Example:

```text
Pastor A
   │
   └── Assigned Case → Read/Write

Pastor B
   │
   └── Not Assigned → Denied

Finance Officer
   │
   └── Pastoral Case → Denied
```

Confidential pastoral notes should never be returned merely because a user can view the member profile.

The existing requirements explicitly identify counseling records and pastoral notes as confidential. 

---

# 18. File Architecture

Actual files should live in object storage.

```text
PostgreSQL
    │
    └── Metadata

S3 / MinIO
    │
    └── Actual File
```

Example:

```text
churches/
  {church_id}/
    members/
      {member_id}/
        documents/
        certificates/
    finance/
      receipts/
      invoices/
    communications/
      campaigns/
```

Files should be accessed using controlled signed URLs.

---

# 19. Background Processing Architecture

Long-running operations should never block the HTTP request unnecessarily.

```text
FastAPI
   │
   ▼
Redis
   │
   ▼
Celery
   │
   ├── Email
   ├── SMS
   ├── Reports
   ├── Imports
   ├── Exports
   ├── Notifications
   └── Scheduled Jobs
```

Examples include:

* Bulk SMS
* Email campaigns
* Member imports
* Excel generation
* PDF generation
* Large reports
* Scheduled reminders
* Birthday messages
* Attendance alerts

---

# 20. Integration Architecture

External providers should be accessed through abstraction interfaces.

For example:

```text
PaymentService
      │
      ├── MTN MoMo
      ├── Vodafone/Telecel
      ├── Card Gateway
      └── Bank API
```

Similarly:

```text
SmsService
      │
      ├── Provider A
      ├── Provider B
      └── Provider C
```

This prevents provider-specific code from spreading throughout the application.

---

# 21. API Architecture

The API should be versioned:

```text
/api/v1/
```

Example:

```text
/api/v1/auth
/api/v1/churches
/api/v1/branches
/api/v1/members
/api/v1/families
/api/v1/attendance
/api/v1/finance
/api/v1/pastoral-care
/api/v1/departments
/api/v1/groups
/api/v1/events
/api/v1/sunday-school
/api/v1/assets
/api/v1/communications
/api/v1/prayer-requests
/api/v1/files
/api/v1/analytics
/api/v1/audit-logs
```

---

# 22. API Request Flow

A typical request should follow:

```text
Client
  │
  ▼
Reverse Proxy
  │
  ▼
FastAPI Router
  │
  ▼
Authentication
  │
  ▼
Tenant Resolution
  │
  ▼
Authorization
  │
  ▼
Pydantic Validation
  │
  ▼
Application Service
  │
  ▼
Domain Rules
  │
  ▼
Repository
  │
  ▼
PostgreSQL
  │
  ▼
Audit Event
  │
  ▼
Response
```

---

# 23. Database Architecture

PostgreSQL is the primary source of truth.

Core database categories:

```text
Identity
├── users
├── roles
├── permissions
└── sessions

Organization
├── churches
├── branches
├── departments
└── settings

Membership
├── members
├── families
├── relationships
└── milestones

Operations
├── attendance
├── events
├── groups
└── volunteers

Finance
├── transactions
├── funds
├── budgets
├── expenses
├── pledges
└── exchange_rates

Ministry
├── pastoral_cases
├── visits
├── prayer_requests
└── sunday_school

Infrastructure
├── files
├── notifications
├── audit_logs
└── jobs
```

---

# 24. Repository Pattern

Database access should be isolated through repositories.

Example:

```python
class MemberRepository:
    async def get_by_id(
        self,
        member_id: UUID,
        church_id: UUID,
    ) -> Member | None:
        ...
```

The service doesn't need to know how SQLAlchemy constructs the query.

```text
Application Service
        │
        ▼
MemberRepository
        │
        ▼
SQLAlchemy
        │
        ▼
PostgreSQL
```

---

# 25. Audit Architecture

Every sensitive mutation should produce an audit event.

```text
User
 │
 ▼
Action
 │
 ▼
Business Operation
 │
 ├───────────────┐
 ▼               ▼
Database       Audit Log
```

Audit record:

```text
audit_logs
────────────────────────────
id
church_id
actor_id
action
entity_type
entity_id
before_data
after_data
ip_address
user_agent
request_id
created_at
```

Sensitive actions include:

* Financial transactions
* Permission changes
* User creation
* Role changes
* Member deletion
* Pastoral record access
* Document access
* Configuration changes

The current system specification specifically requires immutable audit trails for sensitive mutations. 

---

# 26. Analytics Architecture

Analytics should initially query PostgreSQL using optimized queries and materialized views.

```text
Transactional Data
        │
        ▼
Analytics Queries
        │
        ▼
Materialized Views
        │
        ▼
Analytics API
        │
        ▼
Executive Dashboard
```

Potential materialized views:

```text
monthly_member_growth
weekly_attendance
monthly_giving
monthly_expenses
branch_statistics
department_statistics
member_retention
```

This prevents expensive analytical queries from slowing down operational workflows.

---

# 27. Caching Architecture

Redis should be used selectively.

Good candidates:

```text
Church configuration
Permission definitions
Frequently accessed dashboard summaries
Public event listings
Public ministry information
Rate limiting
Temporary verification data
```

Do **not** blindly cache sensitive or rapidly changing financial data.

---

# 28. Notification Architecture

Notifications should be channel-independent.

```text
NotificationService
       │
       ├── Email
       ├── SMS
       ├── In-App
       └── Push
```

Example:

```text
Attendance Alert
      │
      ▼
Notification Event
      │
      ├── In-App Notification
      └── SMS
```

This allows new notification channels to be added later.

---

# 29. Error Handling

The API should expose standardized errors.

Example:

```json
{
  "error": {
    "code": "MEMBER_NOT_FOUND",
    "message": "Member was not found.",
    "details": {}
  }
}
```

Internal exceptions should never leak:

* Database errors
* Stack traces
* SQL
* Secrets
* Internal service information

---

# 30. Observability

Every request should carry a request ID.

```text
Request
   │
   ├── request_id
   ├── user_id
   ├── church_id
   ├── endpoint
   ├── duration
   └── status
```

Recommended observability stack:

```text
Sentry
   +
OpenTelemetry
   +
Structured Logs
```

This makes debugging production problems substantially easier.

---

# 31. Deployment Architecture

Production can initially use:

```text
                    Cloudflare
                        │
                        ▼
                Reverse Proxy / LB
                        │
                        ▼
                 FastAPI Containers
                  ┌─────┴─────┐
                  │           │
                  ▼           ▼
             API Instance  API Instance
                  │           │
                  └─────┬─────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
        PostgreSQL              Redis
              │                   │
              │                   ▼
              │              Celery Workers
              │
              ▼
         S3 Object Storage
```

Docker should be used for consistent environments.

---

# 32. Development Architecture

Local development:

```text
Docker Compose
│
├── FastAPI
├── PostgreSQL
├── Redis
├── Celery Worker
├── Celery Beat
└── MinIO
```

The frontend runs separately:

```text
Next.js
   │
   ▼
http://localhost:8000/api/v1
   │
   ▼
FastAPI
```

This aligns with the existing frontend environment configuration, which already expects a backend API at `http://localhost:8000/api`. 

---

# 33. Proposed Backend Directory

```text
emc-church-management-backend/
│
├── app/
│   │
│   ├── main.py
│   ├── config.py
│   │
│   ├── api/
│   │   ├── router.py
│   │   └── dependencies.py
│   │
│   ├── core/
│   │   ├── database/
│   │   ├── security/
│   │   ├── cache/
│   │   ├── logging/
│   │   ├── exceptions/
│   │   └── middleware/
│   │
│   ├── domains/
│   │   │
│   │   ├── identity/
│   │   ├── churches/
│   │   ├── members/
│   │   ├── families/
│   │   ├── attendance/
│   │   ├── finance/
│   │   ├── pastoral_care/
│   │   ├── departments/
│   │   ├── groups/
│   │   ├── events/
│   │   ├── sunday_school/
│   │   ├── assets/
│   │   ├── communications/
│   │   ├── prayer_requests/
│   │   ├── files/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   ├── audit/
│   │   └── settings/
│   │
│   ├── integrations/
│   │   ├── payments/
│   │   ├── sms/
│   │   ├── email/
│   │   ├── storage/
│   │   └── maps/
│   │
│   ├── jobs/
│   │   ├── worker.py
│   │   ├── beat.py
│   │   └── tasks/
│   │
│   └── shared/
│       ├── enums/
│       ├── types/
│       ├── pagination/
│       └── utils/
│
├── migrations/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── api/
│
├── scripts/
├── docs/
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── alembic.ini
├── .env.example
└── README.md
```

---

# 34. Internal Domain Structure

Each domain should follow a consistent structure.

Example:

```text
domains/members/
│
├── router.py
├── models.py
├── schemas.py
├── repository.py
├── service.py
├── permissions.py
├── exceptions.py
│
├── commands/
│   ├── create_member.py
│   ├── update_member.py
│   ├── delete_member.py
│   └── import_members.py
│
├── queries/
│   ├── get_member.py
│   ├── list_members.py
│   └── member_history.py
│
└── tests/
```

The same structure can be applied to Finance, Attendance, Events, Groups, etc.

---

# 35. Dependency Rules

The most important architectural rule is:

> **Dependencies flow inward toward the domain.**

Good:

```text
Router
  ↓
Application Service
  ↓
Domain
  ↓
Repository Interface
  ↓
Infrastructure
```

Bad:

```text
Router
  ↓
SQLAlchemy
  ↓
Random business logic
  ↓
External API
```

Also avoid:

```text
Members → Finance → Attendance → Members
```

which creates circular domain dependencies.

Cross-domain operations should preferably use:

```text
Application Services
+
Domain Events
+
Explicit interfaces
```

---

# 36. Security Architecture

Security should operate across every layer.

```text
                    SECURITY
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
 Authentication   Authorization     Data Protection
       │               │                │
      JWT             RBAC              TLS
    Sessions         Policies         Encryption
       │               │                │
       └───────────────┼────────────────┘
                       ▼
                  Audit Logging
```

Additional protections:

* Rate limiting
* Secure headers
* Input validation
* SQL parameterization
* Password hashing
* Token rotation
* File access control
* Tenant isolation
* Branch isolation
* Database constraints
* Audit logging
* Backup and disaster recovery

---

# 37. Data Protection

Sensitive information should be classified.

```text
PUBLIC
│
├── Church information
├── Events
└── Public sermons

INTERNAL
│
├── Members
├── Departments
└── Attendance

CONFIDENTIAL
│
├── Financial records
├── Pastoral cases
├── Counseling notes
└── Child safeguarding information
```

The system should apply progressively stronger access controls as data sensitivity increases.

---

# 38. Scalability Strategy

The initial architecture should support horizontal scaling.

```text
                Load Balancer
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      API 1        API 2        API 3
        │            │            │
        └────────────┼────────────┘
                     ▼
                PostgreSQL
```

API instances remain stateless except for server-side infrastructure such as the database and Redis.

This makes adding additional application instances straightforward.

---

# 39. Future Service Extraction

If the system becomes sufficiently large, the modular architecture allows:

```text
Current

FastAPI
├── Finance
├── Members
├── Communications
├── Analytics
└── ...
```

to eventually become:

```text
API Gateway
│
├── Core CMS Service
├── Finance Service
├── Communications Service
├── Analytics Service
└── Reporting Service
```

without having to completely rewrite the application.

That is one of the major reasons I recommend the modular-monolith approach.

---

# 40. Core Architectural Principles

The backend should follow these principles:

### 1. API-first

The frontend never directly accesses the database.

### 2. Backend-authoritative

The backend is the source of truth for business rules.

### 3. Secure by default

Authorization is enforced server-side.

### 4. Tenant-aware by design

Every relevant query is tenant-scoped.

### 5. Branch-aware

Branch permissions are enforced independently from UI visibility.

### 6. Financially deterministic

Financial calculations use precise decimal arithmetic.

### 7. Auditable

Sensitive operations create immutable audit records.

### 8. Asynchronous where appropriate

Long-running tasks are delegated to Celery.

### 9. Domain-oriented

Business capabilities remain separated into explicit modules.

### 10. Simple before distributed

Do not introduce microservices, Kafka, Kubernetes, or other infrastructure until the system genuinely requires them.

---

# 41. Final Architecture

The final system can therefore be summarized as:

```text
                         EMC CHURCH PLATFORM
                                  │
       ┌──────────────────────────┼───────────────────────────┐
       │                          │                           │
       ▼                          ▼                           ▼
 Next.js Admin              Next.js Public              Mobile Apps
       │                          │                           │
       └──────────────────────────┼───────────────────────────┘
                                  │
                             HTTPS / REST
                                  │
                                  ▼
                        Reverse Proxy / Gateway
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │      FASTAPI BACKEND    │
                    │       Python 3.13+      │
                    ├─────────────────────────┤
                    │ Authentication           │
                    │ Authorization            │
                    │ Tenant Isolation         │
                    │ Branch Isolation         │
                    │ Validation               │
                    │ Error Handling           │
                    ├─────────────────────────┤
                    │       DOMAIN LAYER      │
                    │                         │
                    │ Members                  │
                    │ Families                 │
                    │ Finance                  │
                    │ Attendance               │
                    │ Pastoral Care            │
                    │ Departments              │
                    │ Groups                   │
                    │ Events                   │
                    │ Sunday School            │
                    │ Assets                   │
                    │ Communications           │
                    │ Prayer Requests          │
                    │ Files                    │
                    │ Analytics                │
                    │ Audit                    │
                    │ Settings                 │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
           PostgreSQL                         Redis
           Source of Truth                Cache / Broker
                  │                             │
                  │                             ▼
                  │                         Celery
                  │                         Workers
                  │                             │
                  │                ┌────────────┼────────────┐
                  │                ▼            ▼            ▼
                  │              Email         SMS       Reports
                  │
                  ▼
             S3 Storage
       Documents / Certificates
       Receipts / Media / Files

                  ┌───────────────────────────────┐
                  │       CROSS-CUTTING           │
                  ├───────────────────────────────┤
                  │ Multi-Tenancy                 │
                  │ Branch Isolation              │
                  │ RBAC + Policies               │
                  │ Encryption                    │
                  │ Audit Trail                   │
                  │ Observability                 │
                  │ Rate Limiting                 │
                  │ Backups                       │
                  │ Disaster Recovery             │
                  └───────────────────────────────┘
```

## The key architectural decision

I would make this the **official backend architecture**:

> **Next.js → REST API → FastAPI Modular Monolith → SQLAlchemy → PostgreSQL**, with **Redis + Celery** for asynchronous workloads and **S3-compatible storage** for files, surrounded by **tenant isolation, branch isolation, RBAC/policy authorization, financial integrity, audit logging, and observability**.

This gives EMC CMS a strong production foundation without over-engineering the first version. It also preserves a clean path to extracting individual domains into services later if actual scale requires it. 
