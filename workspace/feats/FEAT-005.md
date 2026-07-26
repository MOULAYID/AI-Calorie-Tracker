# FEAT-005: Weekly Analytics & Historical Reports

## Description
Aggregates daily calorie and macronutrient logs into weekly trend reports, performance summaries, and goal adherence ratings.

## User Stories
- **US-005-1**: As a user, I want to see a 7-day bar/area chart showing my daily calorie intake compared to my daily goal.
- **US-005-2**: As a user, I want to view my weekly average calorie intake and macro distribution percentage.
- **US-005-3**: As a user, I want a calendar selector to view and edit logs from previous days.

## Technical Requirements
- Analytics Aggregation Endpoint: `/api/analytics/weekly?date=YYYY-MM-DD`.
- Calculates: 7-day array of daily totals, 7-day average calories, macro distribution (% Protein, % Carbs, % Fat), goal adherence percentage.
