# FEAT-007: Recipe Builder & Favorite Meals

## Description
Allows users to group multiple ingredient items into custom saved Recipes and mark foods as Favorites for 1-tap quick logging.

## User Stories
- **US-007-1**: As a user, I want to create a Recipe by combining multiple ingredients, defining total servings, and auto-calculating per-serving calories & macros.
- **US-007-2**: As a user, I want to log a saved recipe directly into any meal in 1 tap.
- **US-007-3**: As a user, I want to star/favorite foods I eat regularly for instant 1-tap quick logging.

## Technical Requirements
- Table `recipes`: `id`, `name`, `servings`, `total_calories`, `total_protein`, `total_carbs`, `total_fat`, `ingredients_json`.
- Table `favorite_foods`: `id`, `name`, `brand`, `calories_100g`, `protein_100g`, `carbs_100g`, `fat_100g`, `serving_size_g`.
- Endpoints `/api/recipes` and `/api/favorites`.
