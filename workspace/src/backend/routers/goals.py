from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import UserProfile, User
from ..schemas import UserProfileResponse, UserProfileCreate
from ..services.goal_calculator import calculate_user_targets
from ..services.auth import get_current_user_optional

router = APIRouter(prefix="/api/goals", tags=["goals"])

@router.get("", response_model=UserProfileResponse)
def get_user_profile(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    profile = db.query(UserProfile).filter(UserProfile.user_id == uid).first()
    if not profile:
        targets = calculate_user_targets(28, "female", 68.0, 168.0, "lightly_active", "lose")
        profile = UserProfile(
            user_id=uid,
            name=current_user.name if current_user else "User",
            age=28,
            gender="female",
            weight_kg=68.0,
            height_cm=168.0,
            target_weight_kg=62.0,
            target_body_fat_pct=18.0,
            activity_level="lightly_active",
            goal_type="lose",
            daily_calorie_target=targets["daily_calorie_target"],
            protein_target_g=targets["protein_target_g"],
            carbs_target_g=targets["carbs_target_g"],
            fat_target_g=targets["fat_target_g"],
            water_target_ml=2500
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("", response_model=UserProfileResponse)
def update_user_profile(
    data: UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    profile = db.query(UserProfile).filter(UserProfile.user_id == uid).first()
    targets = calculate_user_targets(
        data.age, data.gender, data.weight_kg, data.height_cm, data.activity_level, data.goal_type
    )
    
    if not profile:
        profile = UserProfile(user_id=uid)
        db.add(profile)

    profile.name = data.name
    profile.age = data.age
    profile.gender = data.gender
    profile.weight_kg = data.weight_kg
    profile.height_cm = data.height_cm
    profile.target_weight_kg = data.target_weight_kg
    profile.target_body_fat_pct = data.target_body_fat_pct
    profile.activity_level = data.activity_level
    profile.goal_type = data.goal_type
    profile.daily_calorie_target = targets["daily_calorie_target"]
    profile.protein_target_g = targets["protein_target_g"]
    profile.carbs_target_g = targets["carbs_target_g"]
    profile.fat_target_g = targets["fat_target_g"]
    profile.water_target_ml = data.water_target_ml

    db.commit()
    db.refresh(profile)
    return profile
