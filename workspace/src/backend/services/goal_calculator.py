def calculate_user_targets(
    age: int,
    gender: str,
    weight_kg: float,
    height_cm: float,
    activity_level: str,
    goal_type: str
):
    """
    Calculates Daily Calorie Target & Macro distribution using Mifflin-St Jeor Formula.
    """
    # Mifflin-St Jeor BMR Formula
    if gender.lower() == "male":
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age - 161

    # TDEE Multipliers
    activity_multipliers = {
        "sedentary": 1.2,
        "lightly_active": 1.375,
        "moderately_active": 1.55,
        "very_active": 1.725
    }
    multiplier = activity_multipliers.get(activity_level, 1.375)
    tdee = bmr * multiplier

    # Adjust for goal
    if goal_type == "lose":
        daily_calories = max(1200, int(round(tdee - 500)))
    elif goal_type == "gain":
        daily_calories = int(round(tdee + 500))
    else: # maintain
        daily_calories = int(round(tdee))

    # Default macro splits: 30% Protein, 40% Carbs, 30% Fat
    # Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
    protein_g = round((daily_calories * 0.30) / 4.0, 1)
    carbs_g = round((daily_calories * 0.40) / 4.0, 1)
    fat_g = round((daily_calories * 0.30) / 9.0, 1)

    return {
        "daily_calorie_target": daily_calories,
        "protein_target_g": protein_g,
        "carbs_target_g": carbs_g,
        "fat_target_g": fat_g
    }
