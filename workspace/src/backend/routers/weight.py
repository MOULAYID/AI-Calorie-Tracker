import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import WeightLog, UserProfile
from ..schemas import WeightLogCreate, WeightLogResponse

router = APIRouter(prefix="/api/weight", tags=["weight"])

@router.get("", response_model=List[WeightLogResponse])
def get_weight_logs(
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    logs = db.query(WeightLog).order_by(WeightLog.log_date.asc()).limit(limit).all()
    return logs

@router.post("", response_model=WeightLogResponse)
def log_weight(item: WeightLogCreate, db: Session = Depends(get_db)):
    # Check if entry exists for date
    existing = db.query(WeightLog).filter(WeightLog.log_date == item.log_date).first()
    if existing:
        existing.weight_kg = item.weight_kg
        existing.body_fat_pct = item.body_fat_pct
        existing.notes = item.notes
        db.commit()
        db.refresh(existing)
        # Update user profile current weight
        profile = db.query(UserProfile).first()
        if profile:
            profile.weight_kg = item.weight_kg
            db.commit()
        return existing

    log = WeightLog(
        log_date=item.log_date,
        weight_kg=item.weight_kg,
        body_fat_pct=item.body_fat_pct,
        notes=item.notes
    )
    db.add(log)
    
    # Also update current profile weight
    profile = db.query(UserProfile).first()
    if profile:
        profile.weight_kg = item.weight_kg

    db.commit()
    db.refresh(log)
    return log

@router.delete("/{log_id}")
def delete_weight_log(log_id: int, db: Session = Depends(get_db)):
    log = db.query(WeightLog).filter(WeightLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Weight log entry not found")
    db.delete(log)
    db.commit()
    return {"message": "Weight log entry deleted"}
