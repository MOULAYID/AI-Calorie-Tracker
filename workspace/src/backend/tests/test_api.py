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
        "activity_level": "moderately_active",
        "goal_type": "lose",
        "water_target_ml": 2600
    }
    resp2 = client.put("/api/goals", json=update_data)
    assert resp2.status_code == 200
    assert resp2.json()["name"] == "Jane Doe"

def test_weight_tracker_crud():
    # Add weight entry
    entry = {
        "log_date": "2026-07-26",
        "weight_kg": 67.5,
        "body_fat_pct": 22.0,
        "notes": "Morning weigh-in"
    }
    resp = client.post("/api/weight", json=entry)
    assert resp.status_code == 200
    w_id = resp.json()["id"]
    assert resp.json()["weight_kg"] == 67.5

    # Get weight history
    resp_get = client.get("/api/weight")
    assert resp_get.status_code == 200
    assert len(resp_get.json()) > 0

    # Delete entry
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
    assert data["name"] == "Protein Oatmeal"
    assert data["servings"] == 2
    assert data["calories_per_serving"] > 0

    # Get recipes
    resp_get = client.get("/api/recipes")
    assert resp_get.status_code == 200
    assert len(resp_get.json()) > 0

    # Delete recipe
    resp_del = client.delete(f"/api/recipes/{data['id']}")
    assert resp_del.status_code == 200

def test_search_foods():
    resp = client.get("/api/search?q=apple")
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) > 0

def test_weekly_analytics():
    resp = client.get("/api/analytics/weekly?date=2026-07-26")
    assert resp.status_code == 200
    data = resp.json()
    assert "daily_stats" in data
