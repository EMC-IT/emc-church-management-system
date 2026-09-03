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


## Code Comments & Documentation Contract

### Core Principle

Write self-explanatory code first.

Comments are not a substitute for clear naming, clean architecture, or well-structured code.

The default should be:

> **No comment unless the comment adds information that cannot be reasonably understood from the code itself.**

Prefer improving the code over explaining confusing code with comments.

---

### 1. Do Not Comment Obvious Code

Never add comments that simply describe what the next line does.

Bad:

```python
# Get the member
member = await member_repository.get_by_id(member_id)
```

Bad:

```python
# Check if user exists
if user:
```

Bad:

```python
# Return the response
return response
```

The code already communicates this information.

---

### 2. Comments Should Explain WHY, Not WHAT

Prefer comments that explain:

* Why a decision was made.
* Why a seemingly unusual implementation is necessary.
* Why a business rule exists.
* Why a security restriction exists.
* Why an external API is handled in a particular way.
* Why a performance optimization exists.
* Why a workaround is necessary.
* Why a seemingly redundant operation must remain.

Good:

```python
# Branch scope must come from the authenticated user's context.
# Never trust branch_id supplied by the client.
branch_id = current_user.branch_id
```

The code shows WHAT happens.

The comment explains WHY.

---

### 3. Do Not Narrate Control Flow

Do not write comments such as:

```python
# Loop through members
for member in members:
```

```python
# Check if transaction is valid
if transaction.is_valid:
```

```python
# Return if not found
if not member:
    return None
```

The control flow is already visible.

---

### 4. Avoid Comment Spam

Do not place comments throughout a function simply to make the code appear documented.

Bad:

```python
# Get member
member = await get_member(member_id)

# Check member
if not member:
    raise MemberNotFoundError()

# Update member
member.name = data.name

# Save member
await repository.save(member)
```

Prefer:

```python
member = await get_member(member_id)

if not member:
    raise MemberNotFoundError()

member.name = data.name
await repository.save(member)
```

If the logic needs explanation, add one meaningful comment at the relevant decision point.

---

### 5. Never Use Decorative Comment Sections

Do not use large decorative separators such as:

```python
# ============================================================
# MEMBER MANAGEMENT
# ============================================================
```

Do not use:

```python
# -------------------------------
# Helper Functions
# -------------------------------
```

Do not use comments as visual decoration.

Use proper module structure, classes, functions, and file organization instead.

---

### 6. Do Not Add AI-Generated Commentary

Do not generate comments merely because comments are expected.

Do not add generic statements such as:

```python
# This function handles the process of...
```

```python
# This method is responsible for...
```

```python
# Here we...
```

```python
# First, we...
```

```python
# Finally, we...
```

Avoid verbose AI-style explanations inside production code.

Production comments must be concise and intentional.

---

### 7. Prefer Better Naming Over Comments

If a comment is needed to explain what a poorly named variable or function means, first improve the name.

Bad:

```python
# Check whether the member is allowed to access this branch
if check_permission(member, branch):
```

Prefer:

```python
if can_access_branch(member, branch):
```

Do not use comments to compensate for unclear naming.

---

### 8. Use Docstrings for Public APIs

Use docstrings where they provide genuine value, particularly for:

* Public service interfaces
* Complex business functions
* Reusable utilities
* External integration interfaces
* Public classes
* Important domain operations

Example:

```python
def calculate_budget_variance(
    budget: Decimal,
    actual: Decimal,
) -> Decimal:
    """
    Calculate the remaining budget after actual expenditure.

    Positive values indicate remaining budget.
    Negative values indicate overspending.
    """
    return budget - actual
```

Do not create verbose docstrings for trivial private functions.

---

### 9. Document Business Rules

Important business rules should be documented when they are not self-evident.

Example:

```python
# Reconciled transactions are immutable.
# Corrections must be represented as reversal transactions.
if transaction.is_reconciled:
    raise TransactionAlreadyReconciledError()
```

Business rules should primarily be enforced by code and tests. Comments should explain the reasoning behind the rule when useful.

---

### 10. Document Security Decisions

Security-related decisions deserve concise comments when the reasoning is not obvious.

Example:

```python
# Tenant identity is derived from the authenticated session,
# not from request input, to prevent cross-tenant access.
church_id = current_user.church_id
```

Never include secrets, credentials, tokens, passwords, personal data, or sensitive production information in comments.

---

### 11. Document Non-Obvious External Integrations

When an external service has behavior that affects implementation, document it briefly.

Example:

```python
# Payment authorization is asynchronous.
# Final status is confirmed through the provider webhook.
```

Do not document obvious HTTP calls.

---

### 12. Comments Must Remain Accurate

Never add a comment unless it can be maintained alongside the code.

If implementation changes, update or remove the related comment.

An outdated comment is worse than no comment.

During refactoring, actively remove comments that are no longer true.

---

### 13. TODO Comments

Use TODO comments sparingly.

Every TODO must describe a real, actionable piece of work.

Good:

```python
# TODO: Replace temporary provider fallback once the production
# payment gateway webhook is enabled.
```

Bad:

```python
# TODO: Improve this
```

Bad:

```python
# TODO: Fix later
```

Do not create TODO comments for speculative future improvements.

---

### 14. Do Not Comment Around Poor Code

If code is difficult to understand, first consider:

1. Better naming.
2. Smaller functions.
3. Clearer abstractions.
4. Better domain separation.
5. Removing unnecessary complexity.

Only then add a concise comment if the underlying reason still cannot be expressed through the code.

---

### 15. Comment Density Rule

As a default:

* Simple CRUD code → little or no comments.
* Business logic → comments only for non-obvious rules.
* Security logic → concise rationale where useful.
* Financial logic → document important calculation assumptions and rules.
* Complex algorithms → explain the approach and important constraints.
* Public interfaces → useful docstrings.
* Infrastructure workarounds → explain why the workaround exists.

Do not target a percentage of commented lines.

There is no requirement that every function, class, or file contain comments.

---

### 16. Final Comment Review

Before completing a task, review every new comment and ask:

> "If I delete this comment, does the code become harder to correctly understand?"

If the answer is NO, delete the comment.

Also ask:

> "Does this comment explain WHY rather than WHAT?"

If it only explains WHAT, delete it.

> "Would better naming or structure eliminate the need for this comment?"

If yes, improve the code instead.

The goal is not heavily commented code.

The goal is:

> **Clear code + meaningful documentation + minimal noise.**
