# Healthcare Architecture Skill

## Description
Guidance for planning and reviewing the architecture of the healthcare management application.

## When to Use
- Starting a new module or feature
- Reviewing an existing module for consistency
- Designing API contracts between frontend and backend
- Evaluating scalability or security of a design decision

## Instructions

### 1. Module Design
Each domain module (patients, doctors, appointments, EHR, AI) must:
- Own its own database tables
- Expose its data only through service functions
- Never allow direct cross-module DB access

### 2. API Design
- RESTful: nouns for resources, HTTP verbs for actions
- Versioned under `/api/v1/`
- All responses follow a consistent envelope: `{ data, meta, errors }`
- Pagination on all list endpoints: `{ items, total, page, page_size }`

### 3. Scalability Considerations
- Async/await throughout the backend (SQLAlchemy async + FastAPI async)
- Database connection pooling via SQLAlchemy pool settings
- File uploads stored in object storage (S3-compatible), not the filesystem
- AI calls are async and non-blocking

### 4. Security Architecture
- Authentication at the API gateway / router level
- Authorization at the service level (not router, not repository)
- Sensitive data never passes through the AI layer unfiltered
- Audit logging is a cross-cutting concern, not per-feature

## Validation
An architecture decision is valid when:
- [ ] It is consistent with the layered architecture (API → Service → Repository → Model)
- [ ] It does not create circular dependencies between modules
- [ ] It has been reviewed by the Security Agent if it touches patient data
- [ ] It is documented in `docs/architecture.md`
