# EMC CMS Backend — AI Engineering Contract

## 1. Mission

You are implementing the production backend for the EMC Church Management System.

The existing Next.js frontend is already implemented. Your responsibility is to build the Python backend that exposes the REST API consumed by the existing frontend.

The backend must be production-grade, secure, maintainable, testable, and consistent with the existing EMC CMS architecture.

---

## 2. Technology Contract

Use:

* Python 3.13+
* FastAPI
* Pydantic v2
* SQLAlchemy 2.x
* PostgreSQL
* Alembic
* Redis
* Celery
* S3-compatible object storage
* Pytest
* Ruff
* MyPy

Do not introduce alternative frameworks or architectural technologies without first explaining why they are necessary.

---

## 3. Architectural Style

Use a Domain-Driven Modular Monolith.

The backend is one deployable FastAPI application with clearly isolated domain modules.

Do NOT implement microservices.

Do NOT create a giant global services.py, models.py, or utils.py.

Each domain owns its business logic, schemas, repositories, policies, and tests.

---

## 4. Existing Project Is the Source of Truth

Before implementing backend functionality, inspect the existing project documentation.

Important sources include:

* API_DOCUMENTATION.md
* docs/architecture/ui-pages-architecture.md
* docs/architecture/domain-map.md
* docs/architecture/dependency-map.md
* docs/architecture/security-boundary-map.md
* PROJECT_RULES.md
* AGENTS.md
* Existing frontend services
* Existing frontend validation schemas
* Existing frontend domain types
* Existing frontend authorization definitions
* Existing frontend tests

Do not invent API contracts when an existing contract is documented.

Do not silently change frontend behavior to make backend implementation easier.

If the documented contract is ambiguous or contradictory, identify the conflict before implementing it.

---

## 5. Frontend Preservation

The existing frontend is considered complete unless backend integration exposes a genuine contract issue.

Do not redesign UI pages.

Do not modify components unnecessarily.

Do not replace existing frontend architecture.

Do not duplicate backend business logic in the frontend.

Only modify frontend API integration code when necessary to connect it to the real backend.

---

## 6. Backend Authority

The backend is authoritative for:

* Business rules
* Authorization
* Tenant isolation
* Branch isolation
* Financial calculations
* Workflow transitions
* Data integrity
* Audit logging
* Security
* External integrations

Frontend validation is for user experience.

Backend validation is mandatory regardless of frontend validation.

Database constraints are the final integrity layer.

---

## 7. Multi-Tenancy

Every tenant-owned resource must be scoped to the correct church/tenant.

Never trust a client-provided church_id for authorization.

Derive tenant context from the authenticated user/session.

Branch-scoped users must never access unauthorized branches.

Tenant isolation must be enforced at:

1. API/context layer
2. Application/service layer
3. Repository/query layer
4. Database layer where appropriate

Consider PostgreSQL Row-Level Security for sensitive tenant boundaries.

---

## 8. Authorization

Use:

RBAC + Policy-Based Authorization.

Do not rely on:

```python
if user.role == "admin":
```

Use canonical permissions such as:

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
```

Resource policies must additionally evaluate:

* Tenant
* Branch
* Role
* Permission
* Resource ownership
* Assignment
* Confidentiality
* Approval authority

---

## 9. Pastoral Care

Pastoral care and counseling information is confidential.

Do not expose pastoral records merely because a user can access a member profile.

Pastoral authorization must consider:

* Role
* Permission
* Branch
* Case assignment
* Confidentiality

Confidential pastoral information must be explicitly authorized.

---

## 10. Finance

Financial data is mission-critical.

Use PostgreSQL NUMERIC/Decimal for financial amounts.

Never use floating-point arithmetic for financial values.

Financial operations must be transactional.

Historical financial records should not be silently overwritten when correction/reversal workflows are more appropriate.

Financial mutations must produce audit records.

---

## 11. Audit

Sensitive mutations must generate structured audit records.

Audit records should capture, where applicable:

* Actor
* Tenant
* Branch
* Action
* Entity type
* Entity ID
* Timestamp
* IP address
* User agent
* Request ID
* Before state
* After state

Audit history must be treated as immutable.

---

## 12. API Design

Use:

```text
/api/v1/
```

REST/JSON APIs.

Keep FastAPI route handlers thin.

Preferred flow:

Router
→ Authentication
→ Tenant Resolution
→ Authorization
→ Validation
→ Application Service
→ Domain Logic
→ Repository
→ Database
→ Audit
→ Response

Do not place complex business logic inside routers.

---

## 13. Database

Use SQLAlchemy 2.x.

Use Alembic for every schema change.

Never manually modify production schema outside migrations.

Every migration must be reviewed for:

* Data loss
* Indexing
* Foreign keys
* Nullability
* Unique constraints
* Tenant isolation
* Performance

---

## 14. Background Processing

Use Celery + Redis for operations such as:

* Bulk SMS
* Email campaigns
* Report generation
* Large exports
* Member imports
* Notifications
* Scheduled jobs
* PDF generation

HTTP requests should not block on long-running operations.

---

## 15. External Integrations

External providers must be hidden behind application interfaces.

Examples:

```text
PaymentGateway
EmailProvider
SmsProvider
FileStorageProvider
MapsProvider
```

Do not scatter provider-specific code throughout domain modules.

Providers must be replaceable.

---

## 16. Testing

Every feature must include appropriate tests.

At minimum:

* Unit tests for business rules
* Integration tests for database behavior
* API tests for endpoints
* Authorization tests
* Tenant isolation tests

Mission-critical domains require stronger coverage, especially:

* Finance
* Authentication
* Authorization
* Tenant isolation
* Pastoral confidentiality
* Audit logging

---

## 17. Migration Rules

Before creating tables:

1. Understand the domain.
2. Identify relationships.
3. Identify ownership.
4. Identify tenant scope.
5. Identify branch scope.
6. Identify indexes.
7. Identify uniqueness constraints.
8. Identify audit requirements.

Then create the migration.

Never create database tables merely because they appear convenient for the current screen.

---

## 18. Implementation Discipline

Implement one phase/domain at a time.

For every phase:

1. Inspect existing frontend contract.
2. Inspect related backend architecture.
3. Design models.
4. Implement migration.
5. Implement domain logic.
6. Implement repositories.
7. Implement services.
8. Implement authorization.
9. Implement API routes.
10. Write tests.
11. Run lint/type checks.
12. Run migrations.
13. Run integration tests.
14. Verify API responses against frontend expectations.
15. Update documentation.

Do not move to the next phase while the current phase is broken.

---

## 19. No Vibe Coding

Do not:

* Invent fields without justification.
* Create duplicate models.
* Create duplicate permission systems.
* Create duplicate validation systems.
* Add unnecessary abstractions.
* Create generic repositories that hide important business behavior.
* Over-engineer simple operations.
* Rewrite working code without a reason.
* Ignore failing tests.
* Disable type checking.
* Disable lint rules to make code pass.
* Hardcode secrets.
* Hardcode tenant IDs.
* Hardcode user IDs.
* Bypass authorization for convenience.

---

## 20. Definition of Done

A backend feature is complete only when:

* Database schema exists
* Migration exists
* Models exist
* Pydantic schemas exist
* Business logic exists
* Authorization exists
* Tenant/branch scope is enforced
* API endpoint exists
* Error handling exists
* Audit requirements are implemented
* Tests pass
* Ruff passes
* MyPy passes
* Migration works from a clean database
* API response matches the frontend contract
* Documentation is updated

Never declare a feature complete because the endpoint merely returns HTTP 200.

---

## 21. Agent Behavior

Before writing code, inspect the repository.

When uncertain, investigate the existing code and documentation before making assumptions.

Prefer existing project conventions.

Make small, reviewable changes.

After every meaningful implementation:

* Run tests.
* Run lint.
* Run type checks.
* Inspect migration.
* Verify API behavior.

Report:

1. What was implemented.
2. Files changed.
3. Database changes.
4. API endpoints added.
5. Tests added.
6. Validation performed.
7. Remaining issues.

Never claim something was tested if it was not actually tested.
