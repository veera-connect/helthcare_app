# Testing Skill

## Description
Testing patterns for the healthcare application backend (Pytest) and frontend (Vitest + React Testing Library).

## When to Use
- Writing tests for a new service or endpoint
- Reviewing test coverage after a module is implemented
- Setting up test fixtures and factories

## Instructions

### Backend Test Setup (conftest.py)
```python
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.main import app
from app.core.deps import get_db

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

@pytest.fixture
async def db_session():
    engine = create_async_engine(TEST_DB_URL)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(engine) as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest.fixture
async def client(db_session):
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
```

### Auth Helper
```python
async def get_auth_headers(client, role="patient"):
    response = await client.post("/api/v1/auth/login", json={
        "email": f"test_{role}@example.com",
        "password": "TestPassword123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

### IDOR Test Pattern
```python
async def test_patient_cannot_access_other_patient_records(client):
    headers_a = await get_auth_headers(client, role="patient_a")
    headers_b = await get_auth_headers(client, role="patient_b")
    # Patient B's record ID
    record_id = "some-uuid-for-b"
    response = await client.get(f"/api/v1/medical-records/{record_id}", headers=headers_a)
    assert response.status_code == 403
```

### Frontend Component Test
```tsx
import { render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PatientDashboard } from "../pages/patient/PatientDashboard"

const wrapper = ({ children }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

test("shows upcoming appointments section", async () => {
  render(<PatientDashboard />, { wrapper })
  await waitFor(() => screen.getByText("Upcoming Appointments"))
})
```

## Validation
A module's tests are complete when:
- [ ] Happy path tested
- [ ] Unauthorized access returns 401
- [ ] Forbidden access returns 403
- [ ] IDOR test passes (cannot access other user's data)
- [ ] Validation errors return 422
- [ ] Coverage ≥ 80% for services
