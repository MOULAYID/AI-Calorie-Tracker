# FEAT-001: Daily Calorie & Macro Goal Engine & Dashboard

## Description
Core feature for setting calorie/macro goals and displaying a daily dashboard with consumed vs target intake, meal item breakdowns, and water tracking.

## User Stories
- **US-001-1**: As a user, I want to view my daily calorie goal, total calories consumed, and remaining calories in an interactive progress ring.
- **US-001-2**: As a user, I want to view my macronutrient targets (Protein, Carbs, Fats) and current progress.
- **US-001-3**: As a user, I want to see my logged food items organized by meal type (Breakfast, Lunch, Dinner, Snack) with calorie and macro details.
- **US-001-4**: As a user, I want to log and track my daily water intake in ml / glasses.

## Technical Requirements
- Formula for BMR (Mifflin-St Jeor):
  - Male: `10 * weight_kg + 6.25 * height_cm - 5 * age + 5`
  - Female: `10 * weight_kg + 6.25 * height_cm - 5 * age - 161`
- TDEE Multipliers: Sedentary (1.2), Lightly Active (1.375), Moderately Active (1.55), Very Active (1.725).
- Goals: Weight Loss (-500 kcal), Maintenance (0 kcal), Weight Gain (+500 kcal).
- Macro Default Ratio: 30% Protein, 40% Carbs, 30% Fats.

## Verification Criteria
- Progress ring dynamically updates as items are logged/deleted.
- Remaining calories = Goal - Consumed + Burned.
- Daily food logs persist per date string (YYYY-MM-DD).
