from fastapi import APIRouter, HTTPException, Query
from ..schemas import AiScanRequest, AiScanResponse, FoodSearchResult
from ..services.ai_scanner import analyze_food_image_ai
from ..services.open_food_facts import lookup_barcode_open_food_facts
from ..services.fatsecret import lookup_barcode_fatsecret

router = APIRouter(prefix="/api/scan", tags=["scan"])

@router.post("/ai-food", response_model=AiScanResponse)
async def scan_ai_food_image(payload: AiScanRequest):
    if not payload.image_base64:
        raise HTTPException(status_code=400, detail="Base64 image data required")
    
    result = await analyze_food_image_ai(payload.image_base64)
    return result

@router.get("/barcode", response_model=FoodSearchResult)
async def scan_barcode_lookup(code: str = Query(..., min_length=3)):
    # 1. Try FatSecret API Barcode lookup
    fs_res = await lookup_barcode_fatsecret(code)
    if fs_res:
        return FoodSearchResult(
            name=fs_res["name"],
            brand=fs_res.get("brand", "FatSecret"),
            calories_100g=fs_res["calories_100g"],
            protein_100g=fs_res["protein_100g"],
            carbs_100g=fs_res["carbs_100g"],
            fat_100g=fs_res["fat_100g"],
            fiber_100g=fs_res.get("fiber_100g", 0.0),
            barcode=code,
            source="fatsecret"
        )

    # 2. Try Open Food Facts lookup
    off_res = await lookup_barcode_open_food_facts(code)
    if off_res:
        return FoodSearchResult(
            name=off_res["name"],
            brand=off_res.get("brand"),
            calories_100g=off_res["calories_100g"],
            protein_100g=off_res["protein_100g"],
            carbs_100g=off_res["carbs_100g"],
            fat_100g=off_res["fat_100g"],
            fiber_100g=off_res.get("fiber_100g", 0.0),
            barcode=code,
            image_url=off_res.get("image_url"),
            source="openfoodfacts"
        )

    # 3. Fallback product item
    return FoodSearchResult(
        name=f"Product {code}",
        brand="Scanned Barcode",
        calories_100g=250.0,
        protein_100g=8.0,
        carbs_100g=30.0,
        fat_100g=10.0,
        fiber_100g=2.0,
        barcode=code,
        source="barcode_fallback"
    )
