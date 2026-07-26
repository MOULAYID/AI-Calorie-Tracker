import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, FoodLog, WeightLog
from ..schemas import AdminStatsResponse, AdminUserItem
from ..services.auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()
    one_day_ago = now - datetime.timedelta(days=1)
    thirty_days_ago = now - datetime.timedelta(days=30)

    total_users = db.query(User).count()
    dau = db.query(User).filter(User.last_login_at >= one_day_ago).count()
    mau = db.query(User).filter(User.last_login_at >= thirty_days_ago).count()

    total_food_scans = db.query(FoodLog).count()
    total_barcode_scans = db.query(FoodLog).filter(FoodLog.source == "barcode").count()
    total_weight_logs = db.query(WeightLog).count()

    recent = db.query(User).order_by(User.created_at.desc()).limit(20).all()
    recent_items = [
        AdminUserItem(
            id=u.id,
            name=u.name,
            email=u.email,
            is_admin=u.is_admin,
            created_at=u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else "",
            last_login_at=u.last_login_at.strftime("%Y-%m-%d %H:%M") if u.last_login_at else ""
        ) for u in recent
    ]

    return AdminStatsResponse(
        total_users=total_users,
        daily_active_users=max(1, dau),
        monthly_active_users=max(1, mau),
        total_food_scans=total_food_scans,
        total_barcode_scans=total_barcode_scans,
        total_weight_logs=total_weight_logs,
        recent_signups=recent_items
    )

@router.get("/users", response_model=List[AdminUserItem])
def get_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        AdminUserItem(
            id=u.id,
            name=u.name,
            email=u.email,
            is_admin=u.is_admin,
            created_at=u.created_at.strftime("%Y-%m-%d %H:%M") if u.created_at else "",
            last_login_at=u.last_login_at.strftime("%Y-%m-%d %H:%M") if u.last_login_at else ""
        ) for u in users
    ]
