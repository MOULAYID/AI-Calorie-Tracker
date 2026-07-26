import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import FoodLog, UserProfile

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/weekly")
def get_weekly_analytics(
    date: str = Query(..., description="End date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    try:
        end_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        end_date = datetime.date.today()

    profile = db.query(UserProfile).first()
    target_cal = profile.daily_calorie_target if profile else 2000

    daily_stats: List[Dict[str, Any]] = []
    total_weekly_calories = 0
    total_weekly_protein = 0.0
    total_weekly_carbs = 0.0
    total_weekly_fat = 0.0

    # Calculate last 7 days ending at `end_date`
    for i in range(6, -1, -1):
        cur_date = end_date - datetime.timedelta(days=i)
        cur_date_str = cur_date.strftime("%Y-%m-%d")
        day_name = cur_date.strftime("%a") # Mon, Tue, etc.

        logs = db.query(FoodLog).filter(FoodLog.log_date == cur_date_str).all()
        cals = sum(item.calories for item in logs)
        prot = sum(item.protein for item in logs)
        carbs = sum(item.carbs for item in logs)
        fat = sum(item.fat for item in logs)

        total_weekly_calories += cals
        total_weekly_protein += prot
        total_weekly_carbs += carbs
        total_weekly_fat += fat

        daily_stats.append({
            "date": cur_date_str,
            "day": day_name,
            "calories": round(cals, 1),
            "target": target_cal,
            "protein": round(prot, 1),
            "carbs": round(carbs, 1),
            "fat": round(fat, 1)
        })

    avg_calories = round(total_weekly_calories / 7.0, 1)
    
    # Calculate adherence (days within +-15% of target)
    days_on_target = sum(1 for d in daily_stats if abs(d["calories"] - target_cal) <= (target_cal * 0.15))
    adherence_score = round((days_on_target / 7.0) * 100, 1)

    macro_total = (total_weekly_protein * 4) + (total_weekly_carbs * 4) + (total_weekly_fat * 9)
    if macro_total > 0:
        protein_pct = round(((total_weekly_protein * 4) / macro_total) * 100, 1)
        carbs_pct = round(((total_weekly_carbs * 4) / macro_total) * 100, 1)
        fat_pct = round(((total_weekly_fat * 9) / macro_total) * 100, 1)
    else:
        protein_pct, carbs_pct, fat_pct = 30.0, 40.0, 30.0

    return {
        "end_date": date,
        "daily_stats": daily_stats,
        "average_calories": avg_calories,
        "target_calories": target_cal,
        "adherence_score": adherence_score,
        "weekly_macros": {
            "total_protein_g": round(total_weekly_protein, 1),
            "total_carbs_g": round(total_weekly_carbs, 1),
            "total_fat_g": round(total_weekly_fat, 1),
            "protein_percentage": protein_pct,
            "carbs_percentage": carbs_pct,
            "fat_percentage": fat_pct
        }
    }
