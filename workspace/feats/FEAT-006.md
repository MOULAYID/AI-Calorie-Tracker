# FEAT-006: Weight & Body Progress Tracker

## Description
Enables users to log their daily weight, body fat %, and view progress trend charts over time against their goal weight.

## User Stories
- **US-006-1**: As a user, I want to log my daily body weight (kg) and optional body fat %.
- **US-006-2**: As a user, I want to view a weight progress line chart over 7, 30, or 90 days.
- **US-006-3**: As a user, I want to see my total weight change (e.g., -2.5 kg lost) and average weekly weight loss rate.

## Technical Requirements
- Table `weight_logs`: `id`, `log_date` (YYYY-MM-DD), `weight_kg`, `body_fat_pct`, `notes`, `created_at`.
- Endpoint `/api/weight`: GET (history & summary), POST (add log), DELETE (remove log).
- Front-end line chart (Recharts) with target goal weight reference line.
