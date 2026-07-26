from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import CustomFood
from ..schemas import FoodSearchResult
from ..services.open_food_facts import search_open_food_facts
from ..services.fatsecret import search_fatsecret_foods

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("", response_model=List[FoodSearchResult])
async def search_foods(
    q: str = Query(..., min_length=1, description="Food search query"),
    db: Session = Depends(get_db)
):
    results: List[FoodSearchResult] = []
    seen_names = set()

    # 1. Search FatSecret Platform API first (User API Key)
    fs_results = await search_fatsecret_foods(q)
    for item in fs_results:
        name_lower = item["name"].lower()
        if name_lower not in seen_names:
            seen_names.add(name_lower)
            results.append(FoodSearchResult(
                name=item["name"],
                brand=item.get("brand", "FatSecret"),
                calories_100g=item["calories_100g"],
                protein_100g=item["protein_100g"],
                carbs_100g=item["carbs_100g"],
                fat_100g=item["fat_100g"],
                fiber_100g=item.get("fiber_100g", 0.0),
                barcode=item.get("barcode"),
                source="fatsecret"
            ))

    # 2. Search local user custom foods database
    custom_matches = db.query(CustomFood).filter(CustomFood.name.ilike(f"%{q}%")).all()
    for item in custom_matches:
        name_lower = item.name.lower()
        if name_lower not in seen_names:
            seen_names.add(name_lower)
            results.append(FoodSearchResult(
                name=item.name,
                brand=item.brand or "Custom Recipe",
                calories_100g=item.calories_100g,
                protein_100g=item.protein_100g,
                carbs_100g=item.carbs_100g,
                fat_100g=item.fat_100g,
                fiber_100g=item.fiber_100g,
                source="custom"
            ))

    # 3. Search USDA Verified Nutrition Database & Open Food Facts
    off_results = await search_open_food_facts(q)
    for item in off_results:
        name_lower = item["name"].lower()
        if name_lower not in seen_names:
            seen_names.add(name_lower)
            results.append(FoodSearchResult(
                name=item["name"],
                brand=item.get("brand"),
                calories_100g=item["calories_100g"],
                protein_100g=item["protein_100g"],
                carbs_100g=item["carbs_100g"],
                fat_100g=item["fat_100g"],
                fiber_100g=item.get("fiber_100g", 0.0),
                barcode=item.get("barcode"),
                image_url=item.get("image_url"),
                source=item["source"]
            ))

    return results
