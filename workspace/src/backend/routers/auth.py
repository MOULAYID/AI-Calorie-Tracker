import secrets
import random
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserProfile
from ..schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    VerifyEmailRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from ..services.auth import hash_password, verify_password, create_access_token, get_current_user
from ..services.goal_calculator import calculate_user_targets
from ..services.email_service import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=TokenResponse)
def register_user(data: UserRegister, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists"
        )

    pwd_hash = hash_password(data.password)
    code = f"{random.randint(100000, 999999)}"

    user = User(
        email=email_clean,
        password_hash=pwd_hash,
        name=data.name,
        is_admin=False,
        is_premium=False,
        is_verified=False,
        verification_code=code
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

    # Dispatch verification email
    send_verification_email(user.email, code)

    token = create_access_token(user.id, user.email, user.is_admin)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        verification_code_preview=code
    )

@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    if user.is_verified:
        return {"message": "Email is already verified", "is_verified": True}

    if user.verification_code != data.code.strip():
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user.is_verified = True
    user.verification_code = None
    db.commit()
    return {"message": "Email verified successfully!", "is_verified": True}

@router.post("/resend-verification")
def resend_verification_code(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found")

    if user.is_verified:
        return {"message": "Account is already verified"}

    code = f"{random.randint(100000, 999999)}"
    user.verification_code = code
    db.commit()

    send_verification_email(user.email, code)
    return {"message": "A new verification code has been sent to your email", "verification_code_preview": code}

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email_clean = data.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        # Avoid user enumeration in security response
        return {"message": "If your email is registered, a password reset link has been sent."}

    reset_token = secrets.token_hex(16)
    user.reset_password_token = reset_token
    user.reset_token_expires = datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    db.commit()

    send_password_reset_email(user.email, reset_token)
    return {
        "message": "Password reset link sent to your email.",
        "reset_token_preview": reset_token
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_password_token == data.token.strip()).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token")

    if user.reset_token_expires and user.reset_token_expires < datetime.datetime.utcnow():
        raise HTTPException(status_code=400, detail="Password reset token has expired. Please request a new one.")

    user.password_hash = hash_password(data.new_password)
    user.reset_password_token = None
    user.reset_token_expires = None
    db.commit()

    return {"message": "Password updated successfully. You can now sign in with your new password."}

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
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        verification_code_preview=user.verification_code
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
