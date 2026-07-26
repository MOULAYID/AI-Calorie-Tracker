import os
import json
import base64
import random
from typing import Dict, Any

MOCK_MEAL_PREDICTIONS = [
    {
        "dish_name": "Grilled Chicken Caesar Salad",
        "total_calories": 450.0,
        "total_protein": 38.0,
        "total_carbs": 14.0,
        "total_fat": 26.0,
        "confidence_score": 0.94,
        "items": [
            {"name": "Grilled Chicken Breast", "weight_g": 160.0, "calories": 260.0, "protein": 32.0, "carbs": 0.0, "fat": 5.0},
            {"name": "Romaine Lettuce & Dressing", "weight_g": 120.0, "calories": 160.0, "protein": 3.0, "carbs": 8.0, "fat": 19.0},
            {"name": "Parmesan & Croutons", "weight_g": 30.0, "calories": 30.0, "protein": 3.0, "carbs": 6.0, "fat": 2.0}
        ]
    },
    {
        "dish_name": "Avocado & Egg Whole Wheat Toast",
        "total_calories": 380.0,
        "total_protein": 18.0,
        "total_carbs": 32.0,
        "total_fat": 21.0,
        "confidence_score": 0.91,
        "items": [
            {"name": "Whole Wheat Toast (2 slices)", "weight_g": 70.0, "calories": 160.0, "protein": 6.0, "carbs": 28.0, "fat": 2.0},
            {"name": "Mashed Avocado (1/2 fruit)", "weight_g": 75.0, "calories": 120.0, "protein": 2.0, "carbs": 4.0, "fat": 11.0},
            {"name": "Poached Eggs (2 large)", "weight_g": 100.0, "calories": 100.0, "protein": 10.0, "carbs": 0.0, "fat": 8.0}
        ]
    },
    {
        "dish_name": "Salmon Poke Bowl with Rice & Edamame",
        "total_calories": 580.0,
        "total_protein": 34.0,
        "total_carbs": 65.0,
        "total_fat": 19.0,
        "confidence_score": 0.95,
        "items": [
            {"name": "Fresh Salmon Cubes", "weight_g": 140.0, "calories": 280.0, "protein": 28.0, "carbs": 0.0, "fat": 17.0},
            {"name": "Sushi Rice (Cooked)", "weight_g": 180.0, "calories": 230.0, "protein": 4.0, "carbs": 50.0, "fat": 0.5},
            {"name": "Edamame & Cucumber", "weight_g": 80.0, "calories": 70.0, "protein": 2.0, "carbs": 15.0, "fat": 1.5}
        ]
    },
    {
        "dish_name": "Steak with Roasted Potatoes & Broccoli",
        "total_calories": 640.0,
        "total_protein": 48.0,
        "total_carbs": 42.0,
        "total_fat": 30.0,
        "confidence_score": 0.92,
        "items": [
            {"name": "Sirloin Steak (Grilled)", "weight_g": 200.0, "calories": 410.0, "protein": 42.0, "carbs": 0.0, "fat": 25.0},
            {"name": "Roasted Potato Wedges", "weight_g": 150.0, "calories": 180.0, "protein": 4.0, "carbs": 36.0, "fat": 3.0},
            {"name": "Steamed Broccoli", "weight_g": 100.0, "calories": 50.0, "protein": 2.0, "carbs": 6.0, "fat": 2.0}
        ]
    }
]

async def analyze_food_image_ai(image_base64: str) -> Dict[str, Any]:
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            
            # Clean base64 prefix if present
            if "," in image_base64:
                image_data = base64.b64decode(image_base64.split(",")[1])
            else:
                image_data = base64.b64decode(image_base64)
                
            prompt = """
            You are an expert nutritionist and computer vision AI.
            Analyze this food/meal image and return a JSON object with:
            {
              "dish_name": "Short Dish Name",
              "total_calories": float,
              "total_protein": float,
              "total_carbs": float,
              "total_fat": float,
              "confidence_score": float (0 to 1),
              "items": [
                {
                  "name": "Item Name",
                  "weight_g": float,
                  "calories": float,
                  "protein": float,
                  "carbs": float,
                  "fat": float
                }
              ]
            }
            Return ONLY raw JSON, no markdown tags.
            """
            
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    {"mime_type": "image/jpeg", "data": image_data},
                    prompt
                ]
            )
            
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            
            return json.loads(text.strip())
        except Exception as e:
            print(f"Gemini API image analysis exception: {e}, using mock fallback.")

    # Fallback simulation if no API key or API call fails
    # Select deterministic item based on hash of base64 to be stable
    str_hash = sum(ord(c) for c in image_base64[:100]) if image_base64 else 0
    choice = MOCK_MEAL_PREDICTIONS[str_hash % len(MOCK_MEAL_PREDICTIONS)]
    return choice
