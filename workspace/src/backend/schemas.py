from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    name: str = "User"
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    is_premium: bool
    is_verified: bool
    created_at: Any

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    verification_code_preview: Optional[str] = None # Returned for demo/testing preview

# Admin Schemas
class AdminUserItem(BaseModel):
    id: int
    name: str
    email: str
    is_admin: bool
    is_verified: bool
    created_at: str
    last_login_at: str

class AdminStatsResponse(BaseModel):
    total_users: int
    daily_active_users: int
    monthly_active_users: int
    total_food_scans: int
    total_barcode_scans: int
    total_weight_logs: int
    recent_signups: List[AdminUserItem]

# Profile & Logs Schemas
class UserProfileBase(BaseModel):
    name: str = "User"
    age: int = Field(28, ge=1, le=120)
    gender: str = "female"
    weight_kg: float = Field(68.0, gt=0)
    height_cm: float = Field(168.0, gt=0)
    target_weight_kg: float = Field(62.0, gt=0)
    target_body_fat_pct: float = Field(18.0, ge=3.0, le=60.0)
    activity_level: str = "lightly_active"
    goal_type: str = "lose"
    water_target_ml: int = 2500

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileResponse(UserProfileBase):
    id: int
    user_id: int
    daily_calorie_target: int
    protein_target_g: float
    carbs_target_g: float
    fat_target_g: float

    class Config:
        from_attributes = True

class FoodLogCreate(BaseModel):
    log_date: str
    meal_type: str
    name: str
    brand: Optional[str] = None
    calories: float
    protein: float = 0.0
    carbs: float = 0.0
    fat: float = 0.0
    fiber: float = 0.0
    amount: float = 100.0
    unit: str = "g"
    barcode: Optional[str] = None
    source: str = "manual"
    image_url: Optional[str] = None

class FoodLogResponse(FoodLogCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class CustomFoodCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    calories_100g: float
    protein_100g: float = 0.0
    carbs_100g: float = 0.0
    fat_100g: float = 0.0
    fiber_100g: float = 0.0
    serving_size_g: float = 100.0

class CustomFoodResponse(CustomFoodCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class WaterLogCreate(BaseModel):
    log_date: str
    amount_ml: int = 250

class WaterLogResponse(BaseModel):
    id: int
    user_id: int
    log_date: str
    amount_ml: int

    class Config:
        from_attributes = True

class WeightLogCreate(BaseModel):
    log_date: str
    weight_kg: float
    body_fat_pct: Optional[float] = None
    notes: Optional[str] = None

class WeightLogResponse(WeightLogCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class RecipeIngredient(BaseModel):
    name: str
    amount_g: float
    calories: float
    protein: float
    carbs: float
    fat: float

class RecipeCreate(BaseModel):
    name: str
    servings: int = 1
    ingredients: List[RecipeIngredient]

class RecipeResponse(BaseModel):
    id: int
    user_id: int
    name: str
    servings: int
    calories_per_serving: float
    protein_per_serving: float
    carbs_per_serving: float
    fat_per_serving: float

    class Config:
        from_attributes = True

class FavoriteFoodCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    calories_100g: float
    protein_100g: float = 0.0
    carbs_100g: float = 0.0
    fat_100g: float = 0.0
    serving_size_g: float = 100.0

class FavoriteFoodResponse(FavoriteFoodCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class AiScanRequest(BaseModel):
    image_base64: str

class AiScanItem(BaseModel):
    name: str
    weight_g: float
    calories: float
    protein: float
    carbs: float
    fat: float

class AiScanResponse(BaseModel):
    dish_name: str
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fat: float
    confidence_score: float
    items: List[AiScanItem]

class FoodSearchResult(BaseModel):
    name: str
    brand: Optional[str] = None
    calories_100g: float
    protein_100g: float
    carbs_100g: float
    fat_100g: float
    fiber_100g: float
    barcode: Optional[str] = None
    image_url: Optional[str] = None
    source: str
