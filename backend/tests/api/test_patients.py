import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_my_profile(client: AsyncClient, patient_headers):
    response = await client.get("/api/v1/patients/me", headers=patient_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["first_name"] == "Test"
    assert data["last_name"] == "Patient"


@pytest.mark.asyncio
async def test_get_my_profile_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/patients/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_patients_requires_admin(client: AsyncClient, patient_headers):
    response = await client.get("/api/v1/patients/", headers=patient_headers)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_list_patients_admin_ok(client: AsyncClient, admin_headers):
    response = await client.get("/api/v1/patients/", headers=admin_headers)
    assert response.status_code == 200
    assert "items" in response.json()


@pytest.mark.asyncio
async def test_patient_cannot_access_other_patient(client: AsyncClient, patient_headers, admin_user):
    import uuid
    fake_id = str(uuid.uuid4())
    response = await client.get(f"/api/v1/patients/{fake_id}", headers=patient_headers)
    assert response.status_code in (403, 404)
