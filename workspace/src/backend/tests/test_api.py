import os
import sys
import pytest

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from backend.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_user_registration_and_email_verification():
    email = f"verify_{os.urandom(4).hex()}@example.com"
    # Register User
    reg_resp = client.post("/api/auth/register", json={
        "name": "Verify User",
        "email": email,
        "password": "secretpassword123"
    })
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["is_verified"] is False
    code = reg_data["verification_code_preview"]
    assert code is not None

    # Verify Email Code
    verify_resp = client.post("/api/auth/verify-email", json={
        "email": email,
        "code": code
    })
    assert verify_resp.status_code == 200
    assert verify_resp.json()["is_verified"] is True

def test_forgot_and_reset_password_flow():
    email = f"reset_{os.urandom(4).hex()}@example.com"
    # Register User
    client.post("/api/auth/register", json={
        "name": "Reset User",
        "email": email,
        "password": "oldpassword123"
    })

    # Forgot Password Request
    forgot_resp = client.post("/api/auth/forgot-password", json={"email": email})
    assert forgot_resp.status_code == 200
    reset_token = forgot_resp.json()["reset_token_preview"]
    assert reset_token is not None

    # Reset Password with Token
    reset_resp = client.post("/api/auth/reset-password", json={
        "token": reset_token,
        "new_password": "newsuperpassword456"
    })
    assert reset_resp.status_code == 200

    # Login with new password
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "newsuperpassword456"
    })
    assert login_resp.status_code == 200

def test_owner_admin_analytics_dashboard():
    # Login as default Master Admin (admin@nutriscan.app / admin123)
    login_resp = client.post("/api/auth/login", json={
        "email": "admin@nutriscan.app",
        "password": "admin123"
    })
    assert login_resp.status_code == 200
    admin_token = login_resp.json()["access_token"]

    # Fetch Admin Stats Cockpit
    stats_resp = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert stats_resp.status_code == 200
    stats = stats_resp.json()
    assert "total_users" in stats
    assert stats["total_users"] >= 1

def test_get_and_update_goals():
    resp = client.get("/api/goals")
    assert resp.status_code == 200
    data = resp.json()
    assert "daily_calorie_target" in data

    update_data = {
        "name": "Jane Doe",
        "age": 30,
        "gender": "female",
        "weight_kg": 65.0,
        "height_cm": 165.0,
        "target_weight_kg": 60.0,
        "target_body_fat_pct": 18.0,
        "activity_level": "moderately_active",
        "goal_type": "lose",
        "water_target_ml": 2600
    }
    resp2 = client.put("/api/goals", json=update_data)
    assert resp2.status_code == 200
    assert resp2.json()["name"] == "Jane Doe"

def test_weight_tracker_crud():
    entry = {
        "log_date": "2026-07-26",
        "weight_kg": 67.5,
        "body_fat_pct": 22.0,
        "notes": "Morning weigh-in"
    }
    resp = client.post("/api/weight", json=entry)
    assert resp.status_code == 200
    w_id = resp.json()["id"]

    resp_get = client.get("/api/weight")
    assert resp_get.status_code == 200

    resp_del = client.delete(f"/api/weight/{w_id}")
    assert resp_del.status_code == 200
