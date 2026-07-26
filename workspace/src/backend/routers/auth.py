import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserProfile
from ..schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from ..services.auth import hash_password, verify_password, create_access_token, get_current_user
from ..services.goal_calculator import calculate_user_targets

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register_user(data: UserRegister, db: Session = Depends(get_db)):
    # Check if email already registered
    existing = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists"
        )

    # Create User
    pwd_hash = hash_password(data.password)
    user = User(
        email=data.email.lower().strip(),
        password_hash=pwd_hash,
        name=data.name,
        is_admin=False,
        is_premium=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create Default User Profile
    targets = calculate_user_targets(28, "female", 68.0, 168.0, "lightly_active", "lose")
    profile = UserProfile(
        user_id=user.id,
        name=user.name,
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

    token = create_access_token(user.id, user.email, user.is_admin)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.post("/login", response_model=TokenResponse)
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower().strip()).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    user.last_login_at = datetime.datetime.utcnow()
    db.commit()

    token = create_access_token(user.id, user.email, user.is_admin)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
