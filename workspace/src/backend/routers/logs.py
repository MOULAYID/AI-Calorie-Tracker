from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import FoodLog, WaterLog
from ..schemas import FoodLogCreate, FoodLogResponse, WaterLogCreate, WaterLogResponse

router = APIRouter(prefix="/api/logs", tags=["logs"])

@router.get("", response_model=List[FoodLogResponse])
def get_food_logs(
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db)
):
    logs = db.query(FoodLog).filter(FoodLog.log_date == date).all()
    return logs

@router.post("", response_model=FoodLogResponse)
def add_food_log(item: FoodLogCreate, db: Session = Depends(get_db)):
    log = FoodLog(
        log_date=item.log_date,
        meal_type=item.meal_type.lower(),
        name=item.name,
        brand=item.brand,
        calories=item.calories,
        protein=item.protein,
        carbs=item.carbs,
        fat=item.fat,
        fiber=item.fiber,
        amount=item.amount,
        unit=item.unit,
        barcode=item.barcode,
        source=item.source,
        image_url=item.image_url
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.delete("/{log_id}")
def delete_food_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(FoodLog).filter(FoodLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Food log item not found")
    db.delete(log)
    db.commit()
    return {"message": "Food log item deleted"}

@router.get("/water", response_model=int)
def get_daily_water(date: str = Query(...), db: Session = Depends(get_db)):
    water_entries = db.query(WaterLog).filter(WaterLog.log_date == date).all()
    total_ml = sum(w.amount_ml for w in water_entries)
    return total_ml

@router.post("/water", response_model=WaterLogResponse)
def log_water(item: WaterLogCreate, db: Session = Depends(get_db)):
    log = WaterLog(log_date=item.log_date, amount_ml=item.amount_ml)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
