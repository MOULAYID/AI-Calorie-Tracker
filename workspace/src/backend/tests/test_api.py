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

def test_user_registration_and_login():
    email = f"user_{os.urandom(4).hex()}@example.com"
    # Register User
    reg_resp = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "secretpassword123"
    })
    assert reg_resp.status_code == 200
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == email

    # Login User
    login_resp = client.post("/api/auth/login", json={
        "email": email,
        "password": "secretpassword123"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Access protected route
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email

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
    assert "daily_active_users" in stats
    assert "monthly_active_users" in stats

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

def test_recipe_builder_crud():
    recipe_data = {
        "name": "Protein Oatmeal",
        "servings": 2,
        "ingredients": [
            {"name": "Rolled Oats", "amount_g": 100, "calories": 389, "protein": 16.9, "carbs": 66.3, "fat": 6.9},
            {"name": "Whey Protein", "amount_g": 30, "calories": 120, "protein": 24.0, "carbs": 2.0, "fat": 1.0}
        ]
    }
    resp = client.post("/api/recipes", json=recipe_data)
    assert resp.status_code == 200
    data = resp.json()

    resp_del = client.delete(f"/api/recipes/{data['id']}")
    assert resp_del.status_code == 200
