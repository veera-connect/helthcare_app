# Security Documentation

## Authentication

| Control | Implementation |
|---|---|
| Password hashing | bcrypt via passlib (cost factor 12) |
| Access token | JWT, 15-minute expiry, HS256 |
| Refresh token | JWT, 7-day expiry, rotated on each use |
| Account lockout | After 5 failed logins |
| Token storage | sessionStorage (frontend), not localStorage |

## Authorization Model

Roles: `ADMIN`, `DOCTOR`, `PATIENT`, `RECEPTIONIST`

| Action | PATIENT | DOCTOR | RECEPTIONIST | ADMIN |
|---|---|---|---|---|
| View own profile | ✅ | ✅ | — | ✅ |
| View other patient | ❌ | Own patients only | View only | ✅ |
| Create medical record | ❌ | ✅ | ❌ | ✅ |
| Book appointment | ✅ | ❌ | ✅ | ✅ |
| Cancel appointment | Own only | Own only | Own only | ✅ |
| View audit logs | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |

Authorization is enforced in the **service layer**, not the router. Routers only check authentication.

## Patient Data Protection

- Patient PII (name, DOB, diagnoses) is **never logged**
- Patient records use **soft delete** (`deleted_at`) — never hard-deleted
- All access to patient records is **audit-logged**
- Patients can only access their own records (enforced by `_authorize()` in each service)

## AI Assistant Security

- Emergency keyword detection runs **before** sending to Claude API
- Claude API responses are validated for diagnosis/prescription language
- Unsafe responses are replaced with a safe fallback
- Uploaded document content is passed as **data** (not instructions) to prevent prompt injection
- The AI assistant cannot call any write operations via MCP tools

## File Upload Security

- MIME type validated (PDF, JPEG, PNG only)
- File size limited to 10 MB
- Files stored outside the web root
- File names sanitized before storage

## Audit Logging

Every sensitive operation writes an immutable `AuditLog` record:
- Actor (user ID)
- Action (create/read/update/delete/login/etc.)
- Resource type and ID
- IP address
- Timestamp

The `audit_logs` table has no `UPDATE` or `DELETE` permissions granted in production.

## Compliance Note

This application implements security controls aligned with general healthcare data protection principles. Before deploying in a real healthcare environment:
- Assess applicable regulations (HIPAA for US, DPDP for India, GDPR for EU)
- Engage a qualified compliance consultant
- Perform a penetration test
- Implement data processing agreements with any third-party services (including Anthropic)
