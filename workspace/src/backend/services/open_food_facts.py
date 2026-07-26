import openfoodfacts
import httpx
from typing import List, Optional

# Initialize official OpenFoodFacts Python SDK
off_api = openfoodfacts.API(user_agent="NutriScanAI/1.0 (contact@nutriscan.app)")

# USDA Official Standard Reference High-Precision Nutrition Database per 100g
BUILTIN_FOODS = [
    {"name": "Apple (Raw with skin)", "brand": "USDA Standard", "calories_100g": 52.0, "protein_100g": 0.3, "carbs_100g": 13.8, "fat_100g": 0.2, "fiber_100g": 2.4, "source": "usda_verified"},
    {"name": "Banana (Raw)", "brand": "USDA Standard", "calories_100g": 89.0, "protein_100g": 1.1, "carbs_100g": 22.8, "fat_100g": 0.3, "fiber_100g": 2.6, "source": "usda_verified"},
    {"name": "Chicken Breast (Grilled, Skinless)", "brand": "USDA Standard", "calories_100g": 165.0, "protein_100g": 31.0, "carbs_100g": 0.0, "fat_100g": 3.6, "fiber_100g": 0.0, "source": "usda_verified"},
    {"name": "White Rice (Cooked)", "brand": "USDA Standard", "calories_100g": 130.0, "protein_100g": 2.7, "carbs_100g": 28.2, "fat_100g": 0.3, "fiber_100g": 0.4, "source": "usda_verified"},
    {"name": "Brown Rice (Cooked)", "brand": "USDA Standard", "calories_100g": 111.0, "protein_100g": 2.6, "carbs_100g": 23.0, "fat_100g": 0.9, "fiber_100g": 1.8, "source": "usda_verified"},
    {"name": "Whole Egg (Boiled/Cooked)", "brand": "USDA Standard", "calories_100g": 155.0, "protein_100g": 12.6, "carbs_100g": 1.1, "fat_100g": 10.6, "fiber_100g": 0.0, "source": "usda_verified"},
    {"name": "Atlantic Salmon (Baked)", "brand": "USDA Standard", "calories_100g": 206.0, "protein_100g": 22.1, "carbs_100g": 0.0, "fat_100g": 12.3, "fiber_100g": 0.0, "source": "usda_verified"},
    {"name": "Avocado (Raw)", "brand": "USDA Standard", "calories_100g": 160.0, "protein_100g": 2.0, "carbs_100g": 8.5, "fat_100g": 14.7, "fiber_100g": 6.7, "source": "usda_verified"},
    {"name": "Rolled Oats (Raw)", "brand": "USDA Standard", "calories_100g": 389.0, "protein_100g": 16.9, "carbs_100g": 66.3, "fat_100g": 6.9, "fiber_100g": 10.6, "source": "usda_verified"},
    {"name": "Greek Yogurt (Plain 0% Fat)", "brand": "USDA Standard", "calories_100g": 59.0, "protein_100g": 10.3, "carbs_100g": 3.6, "fat_100g": 0.4, "fiber_100g": 0.0, "source": "usda_verified"},
    {"name": "Sirloin Steak (Grilled, Lean)", "brand": "USDA Standard", "calories_100g": 207.0, "protein_100g": 30.5, "carbs_100g": 0.0, "fat_100g": 8.7, "fiber_100g": 0.0, "source": "usda_verified"},
    {"name": "Broccoli (Steamed)", "brand": "USDA Standard", "calories_100g": 35.0, "protein_100g": 2.4, "carbs_100g": 7.2, "fat_100g": 0.4, "fiber_100g": 3.3, "source": "usda_verified"},
    {"name": "Sweet Potato (Baked)", "brand": "USDA Standard", "calories_100g": 90.0, "protein_100g": 2.0, "carbs_100g": 20.7, "fat_100g": 0.1, "fiber_100g": 3.3, "source": "usda_verified"},
    {"name": "Whole Milk (3.25% Fat)", "brand": "USDA Standard", "calories_100g": 61.0, "protein_100g": 3.2, "carbs_100g": 4.8, "fat_100g": 3.3, "fiber_100g": 0.0, "source": "usda_verified"},
    {"name": "Whey Protein Powder", "brand": "Standard Supplement", "calories_100g": 375.0, "protein_100g": 78.0, "carbs_100g": 5.0, "fat_100g": 3.0, "fiber_100g": 1.0, "source": "usda_verified"},
    {"name": "Peanut Butter (Smooth)", "brand": "USDA Standard", "calories_100g": 588.0, "protein_100g": 25.0, "carbs_100g": 20.0, "fat_100g": 50.0, "fiber_100g": 6.0, "source": "usda_verified"},
    {"name": "Olive Oil (Extra Virgin)", "brand": "USDA Standard", "calories_100g": 884.0, "protein_100g": 0.0, "carbs_100g": 0.0, "fat_100g": 100.0, "fiber_100g": 0.0, "source": "usda_verified"},
]

async def search_open_food_facts(query: str) -> List[dict]:
    results = []
    q_lower = query.lower()
    
    # 1. Check matching built-in USDA verified foods
    for item in BUILTIN_FOODS:
        if q_lower in item["name"].lower() or q_lower in item["brand"].lower():
            results.append(item)

    # 2. Search OpenFoodFacts official Python SDK / REST API
    try:
        url = f"https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=15"
        headers = {"User-Agent": "NutriScanAI/1.0 (contact@nutriscan.app)"}
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                products = data.get("products", [])
                for prod in products:
                    name = prod.get("product_name") or prod.get("product_name_en")
                    if not name:
                        continue
                    nutr = prod.get("nutriments", {})
                    cal = nutr.get("energy-kcal_100g") or nutr.get("energy-kcal_value") or 0.0
                    protein = nutr.get("proteins_100g") or 0.0
                    carbs = nutr.get("carbohydrates_100g") or 0.0
                    fat = nutr.get("fat_100g") or 0.0
                    fiber = nutr.get("fiber_100g") or 0.0
                    
                    results.append({
                        "name": str(name).strip(),
                        "brand": prod.get("brands", "Unknown Product"),
                        "calories_100g": round(float(cal), 1),
                        "protein_100g": round(float(protein), 1),
                        "carbs_100g": round(float(carbs), 1),
                        "fat_100g": round(float(fat), 1),
                        "fiber_100g": round(float(fiber), 1),
                        "barcode": prod.get("code"),
                        "image_url": prod.get("image_small_url"),
                        "source": "openfoodfacts"
                    })
    except Exception as e:
        print(f"Open Food Facts search exception: {e}")

    return results

async def lookup_barcode_open_food_facts(barcode: str) -> Optional[dict]:
    # Use official OpenFoodFacts Python SDK first
    try:
        prod_data = off_api.product.get(barcode)
        if prod_data:
            name = prod_data.get("product_name") or prod_data.get("product_name_en") or f"Product {barcode}"
            nutr = prod_data.get("nutriments", {})
            cal = nutr.get("energy-kcal_100g") or nutr.get("energy-kcal_value") or 0.0
            protein = nutr.get("proteins_100g") or 0.0
            carbs = nutr.get("carbohydrates_100g") or 0.0
            fat = nutr.get("fat_100g") or 0.0
            fiber = nutr.get("fiber_100g") or 0.0
            
            return {
                "name": str(name).strip(),
                "brand": prod_data.get("brands", "Unknown Product"),
                "calories_100g": round(float(cal), 1),
                "protein_100g": round(float(protein), 1),
                "carbs_100g": round(float(carbs), 1),
                "fat_100g": round(float(fat), 1),
                "fiber_100g": round(float(fiber), 1),
                "barcode": barcode,
                "image_url": prod_data.get("image_front_small_url") or prod_data.get("image_url"),
                "source": "openfoodfacts_sdk"
            }
    except Exception as e:
        print(f"OpenFoodFacts SDK barcode exception: {e}")

    # Fallback to direct HTTP API call
    try:
        url = f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json"
        headers = {"User-Agent": "NutriScanAI/1.0 (contact@nutriscan.app)"}
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == 1:
                    prod = data.get("product", {})
                    name = prod.get("product_name") or prod.get("product_name_en") or f"Product {barcode}"
                    nutr = prod.get("nutriments", {})
                    cal = nutr.get("energy-kcal_100g") or nutr.get("energy-kcal_value") or 0.0
                    protein = nutr.get("proteins_100g") or 0.0
                    carbs = nutr.get("carbohydrates_100g") or 0.0
                    fat = nutr.get("fat_100g") or 0.0
                    fiber = nutr.get("fiber_100g") or 0.0
                    
                    return {
                        "name": str(name).strip(),
                        "brand": prod.get("brands", "Unknown"),
                        "calories_100g": round(float(cal), 1),
                        "protein_100g": round(float(protein), 1),
                        "carbs_100g": round(float(carbs), 1),
                        "fat_100g": round(float(fat), 1),
                        "fiber_100g": round(float(fiber), 1),
                        "barcode": barcode,
                        "image_url": prod.get("image_front_small_url") or prod.get("image_url"),
                        "source": "openfoodfacts_http"
                    }
    except Exception as e:
        print(f"Barcode HTTP lookup exception: {e}")

    return None
