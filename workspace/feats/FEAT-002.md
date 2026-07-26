# FEAT-002: Food Logging via Typing & Online Food Database Search

## Description
Allows users to search for food items by name, view nutrition facts from Open Food Facts API, customize serving sizes, create custom food items, and log them into meals.

## User Stories
- **US-002-1**: As a user, I want to type a food name and receive live search suggestions from the Open Food Facts online database.
- **US-002-2**: As a user, I want to adjust the portion size (e.g. grams, servings) and see live nutrition scaling before logging.
- **US-002-3**: As a user, I want to create and save custom food items with custom calories and macros.

## Technical Requirements
- Open Food Facts Search API: `https://world.openfoodfacts.org/cgi/search.pl?search_terms={query}&search_simple=1&action=process&json=1&page_size=20`
- Response parser for product_name, nutriments (energy-kcal_100g, proteins_100g, carbohydrates_100g, fat_100g, fiber_100g), image_small_url.
- Local fallback food database for common foods (Apple, Chicken Breast, Rice, Eggs, Milk, Salmon, Oats, Banana, Protein Powder, etc.).
