import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, default="User")
    is_admin = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    reset_password_token = Column(String, nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    name = Column(String, default="User")
    age = Column(Integer, default=28)
    gender = Column(String, default="female")
    weight_kg = Column(Float, default=68.0)
    height_cm = Column(Float, default=168.0)
    target_weight_kg = Column(Float, default=62.0)
    target_body_fat_pct = Column(Float, default=18.0)
    activity_level = Column(String, default="lightly_active")
    goal_type = Column(String, default="lose")
    daily_calorie_target = Column(Integer, default=2000)
    protein_target_g = Column(Float, default=120.0)
    carbs_target_g = Column(Float, default=200.0)
    fat_target_g = Column(Float, default=65.0)
    water_target_ml = Column(Integer, default=2500)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    log_date = Column(String, index=True) # YYYY-MM-DD
    meal_type = Column(String, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    calories = Column(Float, nullable=False)
    protein = Column(Float, default=0.0)
    carbs = Column(Float, default=0.0)
    fat = Column(Float, default=0.0)
    fiber = Column(Float, default=0.0)
    amount = Column(Float, default=100.0)
    unit = Column(String, default="g")
    barcode = Column(String, nullable=True)
    source = Column(String, default="manual")
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CustomFood(Base):
    __tablename__ = "custom_foods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    name = Column(String, index=True, nullable=False)
    brand = Column(String, nullable=True)
    calories_100g = Column(Float, nullable=False)
    protein_100g = Column(Float, default=0.0)
    carbs_100g = Column(Float, default=0.0)
    fat_100g = Column(Float, default=0.0)
    fiber_100g = Column(Float, default=0.0)
    serving_size_g = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    log_date = Column(String, index=True)
    amount_ml = Column(Integer, default=250)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WeightLog(Base):
    __tablename__ = "weight_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    log_date = Column(String, index=True)
    weight_kg = Column(Float, nullable=False)
    body_fat_pct = Column(Float, nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    name = Column(String, nullable=False)
    servings = Column(Integer, default=1)
    calories_per_serving = Column(Float, nullable=False)
    protein_per_serving = Column(Float, default=0.0)
    carbs_per_serving = Column(Float, default=0.0)
    fat_per_serving = Column(Float, default=0.0)
    ingredients_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FavoriteFood(Base):
    __tablename__ = "favorite_foods"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, default=1)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    calories_100g = Column(Float, nullable=False)
    protein_100g = Column(Float, default=0.0)
    carbs_100g = Column(Float, default=0.0)
    fat_100g = Column(Float, default=0.0)
    serving_size_g = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
