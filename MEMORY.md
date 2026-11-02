# Project Memory — Healthcare Management Application

> This file is the persistent memory for Claude Code sessions working in this repository.
> Update it whenever significant decisions are made, phases complete, or context changes.

---

## Project Identity

| Field | Value |
|---|---|
| Project | AI Healthcare Management Application |
| Root | `C:\Users\vvard\Desktop\helthcare` |
| Started | 2026-11-02 |
| Status | All 8 phases built — ready for local dev |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript (strict), Vite, Tailwind CSS, TanStack Query v5, React Hook Form + Zod, Axios |
| Backend | Python 3.11, FastAPI (async), Pydantic v2, SQLAlchemy 2.0 async, Alembic |
| Database | PostgreSQL 15 |
| AI | Anthropic Claude API — model: `claude-sonnet-4-5` |
| Auth | JWT (access 15 min + refresh 7 days), bcrypt, role-based |
| Infrastructure | Docker, Docker Compose, GitHub Actions CI |

---

## Architecture — Key Decisions

- **Layered backend**: HTTP Router → Service (business logic + authz) → Repository (DB) → SQLAlchemy Model
- **Authorization in service layer**, not routers — routers only check authentication
- **Soft deletes** on patient data (`deleted_at`) — records are never hard-deleted
- **Append-only audit log** — no UPDATE or DELETE on `audit_logs` table
- **AI safety** enforced in code (not just prompts): emergency keyword detection, response validation blocking diagnosis/prescription language, prompt injection defense via delimited document content
- **MCP tools** are read-only for the AI — no write operations callable by the assistant

---

## What Was Built (Phase Summary)

### Phase 1 — Claude Code Configuration ✅
| File | Purpose |
|---|---|
| `.claude/agents/architect.md` | Architect agent — coordinates all other agents |
| `.claude/agents/frontend-agent.md` | React/TypeScript frontend developer |
| `.claude/agents/backend-agent.md` | FastAPI backend developer |
| `.claude/agents/database-agent.md` | PostgreSQL/SQLAlchemy specialist |
| `.claude/agents/security-agent.md` | Healthcare security reviewer (must sign off on all auth/patient-data features) |
| `.claude/agents/testing-agent.md` | QA — unit, integration, E2E |
| `.claude/agents/devops-agent.md` | Docker, CI/CD |
| `.claude/agents/healthcare-ai-agent.md` | Claude API integration and AI safety |
| `.claude/skills/healthcare-architecture/SKILL.md` | Architecture planning skill |
| `.claude/skills/api-development/SKILL.md` | FastAPI endpoint patterns |
| `.claude/skills/secure-coding/SKILL.md` | Auth, audit log, file upload patterns |
| `.claude/skills/database-design/SKILL.md` | SQLAlchemy model patterns |
| `.claude/skills/testing/SKILL.md` | Pytest + Vitest patterns |
| `.claude/hooks/pre-tool-check.sh` | Blocks dangerous commands before execution |
| `.claude/hooks/post-edit-check.sh` | Runs lint/syntax checks after file edits |
| `.claude/hooks/security-check.sh` | Flags missing auth deps, raw SQL, PII in logs |
| `.claude/hooks/format-check.sh` | Black + Ruff for Python, ESLint for TypeScript |

> ⚠️ `.claude/settings.json` could not be written (self-modification restriction). Create it manually — see **Manual Steps** section below.

### Phase 2 — Database ✅
| File | Purpose |
|---|---|
| `backend/app/models/base.py` | `Base`, `TimestampMixin`, `SoftDeleteMixin` |
| `backend/app/models/user.py` | `User` model + `Role` enum |
| `backend/app/models/patient.py` | `Patient` model + `BloodGroup`, `Gender` enums |
| `backend/app/models/doctor.py` | `Doctor`, `Specialization`, `DoctorAvailability` |
| `backend/app/models/appointment.py` | `Appointment` + `AppointmentStatus` enum |
| `backend/app/models/medical_record.py` | `MedicalRecord`, `Prescription`, `MedicalDocument` |
| `backend/app/models/audit.py` | `AuditLog` + `AuditAction` enum |
| `backend/alembic.ini` | Alembic configuration |
| `backend/migrations/env.py` | Async Alembic migration runner |
| `backend/app/db/seed.py` | Synthetic seed data (3 doctors, 2 patients, 1 admin) |

### Phase 3 — Backend API ✅
| File | Purpose |
|---|---|
| `backend/app/core/config.py` | Pydantic settings (all env vars) |
| `backend/app/core/database.py` | Async SQLAlchemy engine + session factory |
| `backend/app/core/security.py` | bcrypt hashing, JWT create/decode |
| `backend/app/core/deps.py` | `get_current_user`, `require_role` FastAPI deps |
| `backend/app/repositories/*.py` | DB access: User, Patient, Doctor, Appointment, Audit |
| `backend/app/services/auth_service.py` | Login (with lockout), register, token refresh |
| `backend/app/services/patient_service.py` | Patient CRUD with ownership check |
| `backend/app/services/appointment_service.py` | Book, cancel, list (with double-booking check) |
| `backend/app/services/medical_record_service.py` | Create/read records (doctor-only create) |
| `backend/app/schemas/*.py` | Pydantic request/response schemas |
| `backend/app/api/v1/endpoints/*.py` | Routers: auth, patients, doctors, appointments, medical-records, ai |
| `backend/app/main.py` | FastAPI app setup, CORS, error handler |

### Phase 4 — Frontend ✅
| File | Purpose |
|---|---|
| `frontend/src/types/index.ts` | All TypeScript interfaces |
| `frontend/src/services/api.ts` | Axios client with JWT refresh interceptor |
| `frontend/src/services/*.service.ts` | Auth, patient, appointment, doctor, AI services |
| `frontend/src/hooks/useAuth.tsx` | Auth context + `AuthProvider` |
| `frontend/src/components/ui/` | Button, Input, Card, Badge components |
| `frontend/src/components/layout/` | Sidebar, AppLayout |
| `frontend/src/routes/ProtectedRoute.tsx` | Auth + role guard for routes |
| `frontend/src/pages/auth/LoginPage.tsx` | Login form (Zod validated) |
| `frontend/src/pages/auth/RegisterPage.tsx` | Patient registration |
| `frontend/src/pages/patient/PatientDashboard.tsx` | Dashboard with stats + upcoming appointments |
| `frontend/src/pages/patient/AppointmentsPage.tsx` | List + cancel appointments |
| `frontend/src/pages/patient/DoctorsPage.tsx` | Browse doctors with specialization filter |
| `frontend/src/pages/patient/AIAssistantPage.tsx` | Chat UI with emergency redirect display |
| `frontend/src/pages/doctor/DoctorDashboard.tsx` | Doctor dashboard |
| `frontend/src/pages/admin/AdminDashboard.tsx` | Admin overview |
| `frontend/src/App.tsx` | Router + role-based route guards |

### Phase 5 — AI Healthcare Assistant ✅
| File | Purpose |
|---|---|
| `backend/app/integrations/claude_client.py` | Anthropic SDK singleton client |
| `backend/app/agents/healthcare_ai.py` | `HealthcareAIOrchestrator` — chat, summarize, safety |
| `backend/app/api/v1/endpoints/ai_assistant.py` | `/ai/chat` endpoint (patient-only) |

**Safety controls in `HealthcareAIOrchestrator`:**
1. Emergency keyword list → immediate 911 redirect (no Claude call)
2. Regex validation of responses → blocks diagnosis/prescription language
3. Conversation history capped at 20 messages per session
4. Disclaimer appended to flagged responses

### Phase 6 — MCP Server ✅
| File | Purpose |
|---|---|
| `mcp/healthcare-mcp-server/src/server.py` | MCP server with 6 healthcare tools |
| `mcp/README.md` | Integration guide + security model |

**Tools:** `get_patient_profile`, `get_patient_appointments`, `search_available_doctors`, `book_appointment`, `cancel_appointment`, `get_medical_records`

### Phase 7 — Infrastructure ✅
| File | Purpose |
|---|---|
| `infrastructure/docker/Dockerfile.backend` | Multi-stage, non-root user, health check |
| `infrastructure/docker/Dockerfile.frontend` | Multi-stage: build → Nginx serve |
| `infrastructure/docker/nginx.conf` | SPA routing + API proxy |
| `docker-compose.yml` | db + backend + frontend with health checks |
| `.github/workflows/ci.yml` | Lint → type check → tests → Docker build |

### Phase 8 — Documentation ✅
| File | Purpose |
|---|---|
| `docs/architecture.md` | System diagram, layers, auth flow, AI flow, agent coordination |
| `docs/development-plan.md` | Phase status + remaining work checklist + run instructions |
| `docs/security.md` | Auth controls, RBAC table, patient data rules, compliance note |
| `README.md` | Quick start, module overview, tech stack |

---

## Demo Accounts (after running seed)

| Role | Email | Password |
|---|---|---|
| Admin | admin@healthcare.demo | Admin@12345 |
| Doctor | dr.smith@healthcare.demo | Doctor@12345 |
| Doctor | dr.jones@healthcare.demo | Doctor@12345 |
| Doctor | dr.patel@healthcare.demo | Doctor@12345 |
| Patient | alice@patient.demo | Patient@12345 |
| Patient | bob@patient.demo | Patient@12345 |

---

## How to Run

```bash
# 1. Copy and fill env vars
cp .env.example .env
# Required: POSTGRES_PASSWORD, SECRET_KEY, ANTHROPIC_API_KEY

# 2. Start all services
docker compose up -d

# 3. (First run only) Apply migrations + seed data
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.db.seed
```

Access:
- Frontend: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Local Development

```bash
# Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Tests

```bash
cd backend && pytest -v
cd frontend && npm run test
```

---

## Remaining Work

Tracked in full in [docs/development-plan.md](docs/development-plan.md). Summary:

**Backend**
- [ ] Run initial Alembic migration (after PostgreSQL is up)
- [ ] Doctor profile update + availability management service
- [ ] File upload endpoint (MIME + size validation)
- [ ] Document summarization with Claude API (needs storage integration)
- [ ] Rate limiting middleware
- [ ] Redis for refresh token blacklisting on logout

**Frontend**
- [ ] Medical records list page (patient)
- [ ] Book appointment flow with date/time picker
- [ ] Patient profile edit page
- [ ] Admin user management pages
- [ ] Toast notifications

**Testing**
- [ ] Appointment service tests
- [ ] Medical record service tests
- [ ] IDOR tests for all patient-scoped endpoints
- [ ] Playwright E2E: login → book appointment

---

## Manual Step Required

`.claude/settings.json` could not be auto-created (self-modification restriction).  
Create it manually at project root with:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{"type": "command", "command": "bash .claude/hooks/pre-tool-check.sh"}]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [{"type": "command", "command": "bash .claude/hooks/post-edit-check.sh"}]
      }
    ],
    "Stop": [
      {
        "hooks": [{"type": "command", "command": "bash .claude/hooks/post-edit-check.sh --final"}]
      }
    ]
  },
  "mcpServers": {
    "healthcare": {
      "command": "python",
      "args": ["mcp/healthcare-mcp-server/src/server.py"],
      "env": {
        "BACKEND_URL": "http://localhost:8000"
      }
    }
  }
}
```

---

## Key Conventions (for future sessions)

- **Never log patient PII** (name, DOB, diagnosis) — use IDs only in logs
- **Authorization checks belong in services**, not routers
- **Every new endpoint needs**: auth dependency + authorization check + audit log + test
- **AI responses must pass** `_validate_response()` before returning to client
- **All schema changes** go through Alembic — never ALTER tables directly
- **Migrations must be reversible** — implement `downgrade()` in every migration file
