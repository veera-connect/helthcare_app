# Architecture — Healthcare Management Application

## System Overview

```
Browser (React SPA)
    │
    ▼ HTTPS
Nginx (reverse proxy)
    │
    ├── /api/v1/* → FastAPI Backend (port 8000)
    │               │
    │               ├── app/api/v1/        ← HTTP layer
    │               ├── app/services/      ← Business logic
    │               ├── app/repositories/  ← DB access
    │               ├── app/models/        ← SQLAlchemy ORM
    │               ├── app/agents/        ← AI orchestration
    │               └── app/integrations/  ← Claude API client
    │
    └── /* → React Static Files (served by Nginx)

PostgreSQL 15
    └── healthcare_db
            ├── users
            ├── patients
            ├── doctors
            ├── specializations
            ├── doctor_specializations
            ├── doctor_availabilities
            ├── appointments
            ├── medical_records
            ├── prescriptions
            ├── medical_documents
            └── audit_logs
```

## Layered Architecture (Backend)

```
HTTP Request
    ↓
Router (app/api/v1/endpoints/*.py)
  - Parse request, validate with Pydantic
  - Inject dependencies (auth, services)
  - Return HTTP response
    ↓
Service (app/services/*.py)
  - Business logic
  - Authorization checks
  - Audit logging
    ↓
Repository (app/repositories/*.py)
  - SQLAlchemy queries
  - Returns domain objects
    ↓
Model (app/models/*.py)
  - SQLAlchemy ORM declarations
    ↓
PostgreSQL
```

## Domain Modules

| Module | Models | Service | Router |
|---|---|---|---|
| Auth | User | AuthService | /auth |
| Patients | Patient | PatientService | /patients |
| Doctors | Doctor, Specialization | — | /doctors |
| Appointments | Appointment | AppointmentService | /appointments |
| Medical Records | MedicalRecord, Prescription | MedicalRecordService | /medical-records |
| AI Assistant | — | HealthcareAIOrchestrator | /ai |
| Audit | AuditLog | AuditRepository | — |

## Authentication Flow

```
Client → POST /auth/login (email + password)
            ↓
        Validate credentials
            ↓
        Issue: access_token (15 min) + refresh_token (7 days)
            ↓
Client stores tokens in sessionStorage (not localStorage)
            ↓
Client → API request with Authorization: Bearer <access_token>
            ↓
        Backend validates JWT → extracts user_id + role
            ↓
        Service checks authorization (ownership/role)
```

## AI Assistant Flow

```
Patient message
    ↓
POST /api/v1/ai/chat
    ↓
Auth check (patient only)
    ↓
HealthcareAIOrchestrator
    ├── Emergency keyword check → if yes, return emergency redirect
    ├── Build conversation history
    ├── Call Claude API (claude-sonnet-4-5)
    ├── Validate response (check for diagnosis/prescription language)
    └── Return safe response with disclaimer
```

## Agent Coordination

The Architect Agent coordinates work across specialized agents:
1. Architect defines task → assigns to agent
2. Agent implements → reports output
3. Security Agent reviews sensitive features
4. Testing Agent validates each module
5. Architect marks complete

Agents never edit the same file concurrently.

## Data Security

- All API traffic over HTTPS in production
- JWT tokens short-lived (15 min access)
- Patient data never logged
- Audit trail on all sensitive operations
- Soft deletes (deleted_at) — patient records never hard-deleted
- File uploads: MIME type validated, stored outside web root
