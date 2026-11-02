import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_patient_success(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "newpatient@test.com",
        "password": "Password@123",
        "first_name": "John",
        "last_name": "Doe",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, patient_user):
    response = await client.post("/api/v1/auth/register", json={
        "email": "patient@test.com",
        "password": "Password@123",
        "first_name": "Jane",
        "last_name": "Doe",
    })
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, patient_user):
    response = await client.post("/api/v1/auth/login", json={
        "email": "patient@test.com",
        "password": "Test@1234",
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, patient_user):
    response = await client.post("/api/v1/auth/login", json={
        "email": "patient@test.com",
        "password": "WrongPassword!",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_without_token(client: AsyncClient):
    response = await client.get("/api/v1/patients/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
