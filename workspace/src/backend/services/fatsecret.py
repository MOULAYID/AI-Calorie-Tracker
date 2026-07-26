import os
import time
import httpx
from typing import List, Optional

FATSECRET_CLIENT_ID = os.environ.get("FATSECRET_CLIENT_ID", "f1e724daaac440e8aca2de243e60529a")
FATSECRET_CLIENT_SECRET = os.environ.get("FATSECRET_CLIENT_SECRET", "4ffd46a34f744c0db81b19e31afdd7d5")

TOKEN_URL = "https://oauth.fatsecret.com/connect/token"
API_URL = "https://platform.fatsecret.com/rest/server.api"

async def get_fatsecret_token() -> Optional[str]:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                TOKEN_URL,
                data={"grant_type": "client_credentials", "scope": "basic"},
                auth=(FATSECRET_CLIENT_ID, FATSECRET_CLIENT_SECRET)
            )
            if resp.status_code == 200:
                data = resp.json()
                return data.get("access_token")
    except Exception as e:
        print(f"FatSecret OAuth token exception: {e}")

    return None

async def search_fatsecret_foods(query: str) -> List[dict]:
    token = await get_fatsecret_token()
    if not token:
        return []

    results = []
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            params = {
                "method": "foods.search",
                "search_expression": query,
                "format": "json",
                "max_results": 15
            }
            headers = {"Authorization": f"Bearer {token}"}
            resp = await client.get(API_URL, params=params, headers=headers)
            
            if resp.status_code == 200:
                data = resp.json()
                if "error" in data:
                    err = data["error"]
                    print(f"FatSecret API Notice: Code {err.get('code')} - {err.get('message')}")
                    return []

                foods = data.get("foods", {}).get("food", [])
                if isinstance(foods, dict):
                    foods = [foods]

                for f in foods:
                    name = f.get("food_name")
                    brand = f.get("brand_name") or f.get("food_type", "FatSecret")
                    food_id = f.get("food_id")
                    desc = f.get("food_description", "")
                    
                    cal, prot, carbs, fat = 0.0, 0.0, 0.0, 0.0
                    if "Calories:" in desc:
                        try:
                            parts = desc.split("|")
                            for part in parts:
                                p_str = part.strip()
                                if "Calories:" in p_str:
                                    cal = float(p_str.split("Calories:")[1].replace("kcal", "").strip())
                                elif "Fat:" in p_str:
                                    fat = float(p_str.split("Fat:")[1].replace("g", "").strip())
                                elif "Carbs:" in p_str:
                                    carbs = float(p_str.split("Carbs:")[1].replace("g", "").strip())
                                elif "Protein:" in p_str:
                                    prot = float(p_str.split("Protein:")[1].replace("g", "").strip())
                        except Exception:
                            pass

                    results.append({
                        "name": str(name).strip(),
                        "brand": str(brand).strip(),
                        "calories_100g": round(cal, 1),
                        "protein_100g": round(prot, 1),
                        "carbs_100g": round(carbs, 1),
                        "fat_100g": round(fat, 1),
                        "fiber_100g": 0.0,
                        "barcode": None,
                        "source": "fatsecret"
                    })
    except Exception as e:
        print(f"FatSecret search error: {e}")

    return results

async def lookup_barcode_fatsecret(barcode: str) -> Optional[dict]:
    token = await get_fatsecret_token()
    if not token:
        return None

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            headers = {"Authorization": f"Bearer {token}"}
            params_bc = {
                "method": "food.find_id_for_barcode",
                "barcode": barcode,
                "format": "json"
            }
            resp_bc = await client.get(API_URL, params=params_bc, headers=headers)
            if resp_bc.status_code == 200:
                data_bc = resp_bc.json()
                food_id = data_bc.get("food_id", {}).get("value")
                if food_id:
                    params_get = {
                        "method": "food.get.v4",
                        "food_id": food_id,
                        "format": "json"
                    }
                    resp_get = await client.get(API_URL, params=params_get, headers=headers)
                    if resp_get.status_code == 200:
                        f_data = resp_get.json().get("food", {})
                        name = f_data.get("food_name")
                        brand = f_data.get("brand_name", "FatSecret")
                        
                        servings = f_data.get("servings", {}).get("serving", [])
                        if isinstance(servings, dict):
                            servings = [servings]
                        
                        serving = servings[0] if servings else {}
                        cal = float(serving.get("calories", 0) or 0)
                        prot = float(serving.get("protein", 0) or 0)
                        carbs = float(serving.get("carbohydrate", 0) or 0)
                        fat = float(serving.get("fat", 0) or 0)
                        metric_amt = float(serving.get("metric_serving_amount", 100) or 100)
                        
                        if metric_amt > 0 and metric_amt != 100:
                            factor = 100.0 / metric_amt
                            cal *= factor
                            prot *= factor
                            carbs *= factor
                            fat *= factor

                        return {
                            "name": str(name).strip(),
                            "brand": str(brand).strip(),
                            "calories_100g": round(cal, 1),
                            "protein_100g": round(prot, 1),
                            "carbs_100g": round(carbs, 1),
                            "fat_100g": round(fat, 1),
                            "fiber_100g": 0.0,
                            "barcode": barcode,
                            "source": "fatsecret"
                        }
    except Exception as e:
        print(f"FatSecret barcode error: {e}")

    return None
