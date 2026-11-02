# Secure Coding Skill

## Description
Security rules and patterns for the healthcare application, where patient data protection is paramount.

## When to Use
- Writing any code that handles patient data
- Implementing authentication or authorization
- Adding file upload or external API integration
- Before marking any feature as complete

## Instructions

### Authentication Pattern
```python
# JWT creation
def create_access_token(subject: str, role: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)  # short-lived
    payload = {"sub": subject, "role": role, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

# JWT validation dependency
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id or payload.get("type") != "access":
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await user_repo.get_by_id(UUID(user_id), db)
    if not user or not user.is_active:
        raise credentials_exception
    return user
```

### Role Check Pattern
```python
def require_role(*roles: Role):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return dependency
```

### Safe Logging
```python
# NEVER:
logger.info(f"Patient {patient.name} (DOB: {patient.date_of_birth}) accessed record")

# ALWAYS:
logger.info("Patient record accessed", extra={"patient_id": str(patient.id), "actor_id": str(actor_id)})
```

### Audit Logging
```python
await audit_repo.log(
    actor_id=current_user.id,
    action=AuditAction.READ,
    resource_type="MedicalRecord",
    resource_id=record.id,
    ip_address=request.client.host,
)
```

### File Upload Validation
```python
ALLOWED_MIME_TYPES = {"application/pdf", "image/jpeg", "image/png"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

async def validate_upload(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(400, "File type not allowed")
    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(400, "File too large")
    await file.seek(0)
```

## Validation Checklist
- [ ] No hardcoded secrets
- [ ] No PII in logs
- [ ] All endpoints authenticated
- [ ] Authorization checks in service layer
- [ ] File uploads validated for type and size
- [ ] Audit log written for sensitive operations
