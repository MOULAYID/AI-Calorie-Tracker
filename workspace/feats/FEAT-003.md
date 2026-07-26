# FEAT-003: AI Meal Photo Scanner

## Description
Uses computer vision and Gemini AI to recognize food items in photos, estimate portion sizes, calculate calories and macronutrients, and allow instant meal logging.

## User Stories
- **US-003-1**: As a user, I want to take a photo of my plate or upload a meal image to instantly get a calorie estimate.
- **US-003-2**: As a user, I want to see identified food items, estimated weight (grams), calories, protein, carbs, and fats breakdown from the photo.
- **US-003-3**: As a user, I want to edit detected item quantities or names before adding them to my daily log.

## Technical Requirements
- Image Input: Base64 JPEG/PNG or HTML5 Camera stream capture.
- Vision Model: Gemini 2.5 Flash API structured prompt returning JSON:
  ```json
  {
    "dish_name": "Grilled Chicken Caesar Salad",
    "total_calories": 450,
    "total_protein": 38.0,
    "total_carbs": 14.0,
    "total_fat": 26.0,
    "confidence_score": 0.92,
    "items": [
      { "name": "Grilled Chicken Breast", "weight_g": 150, "calories": 240, "protein": 31, "carbs": 0, "fat": 5 },
      { "name": "Romaine Lettuce & Dressing", "weight_g": 120, "calories": 180, "protein": 3, "carbs": 8, "fat": 18 }
    ]
  }
  ```
- Simulated AI analysis fallback if API key is not configured, providing realistic mock vision predictions.
