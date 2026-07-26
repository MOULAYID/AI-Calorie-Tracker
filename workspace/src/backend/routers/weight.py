import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import WeightLog, UserProfile, User
from ..schemas import WeightLogCreate, WeightLogResponse
from ..services.auth import get_current_user_optional

router = APIRouter(prefix="/api/weight", tags=["weight"])

@router.get("", response_model=List[WeightLogResponse])
def get_weight_logs(
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    logs = db.query(WeightLog).filter(WeightLog.user_id == uid).order_by(WeightLog.log_date.asc()).limit(limit).all()
    return logs

@router.post("", response_model=WeightLogResponse)
def log_weight(
    item: WeightLogCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    existing = db.query(WeightLog).filter(WeightLog.user_id == uid, WeightLog.log_date == item.log_date).first()
    if existing:
        existing.weight_kg = item.weight_kg
        existing.body_fat_pct = item.body_fat_pct
        existing.notes = item.notes
        db.commit()
        db.refresh(existing)
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == uid).first()
        if profile:
            profile.weight_kg = item.weight_kg
            db.commit()
        return existing

    log = WeightLog(
        user_id=uid,
        log_date=item.log_date,
        weight_kg=item.weight_kg,
        body_fat_pct=item.body_fat_pct,
        notes=item.notes
    )
    db.add(log)
    
    profile = db.query(UserProfile).filter(UserProfile.user_id == uid).first()
    if profile:
        profile.weight_kg = item.weight_kg

    db.commit()
    db.refresh(log)
    return log

@router.delete("/{log_id}")
def delete_weight_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    log = db.query(WeightLog).filter(WeightLog.id == log_id, WeightLog.user_id == uid).first()
    if not log:
        raise HTTPException(status_code=404, detail="Weight log entry not found")
    db.delete(log)
    db.commit()
    return {"message": "Weight log entry deleted"}
