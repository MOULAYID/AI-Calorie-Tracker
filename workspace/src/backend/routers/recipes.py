import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Recipe, FavoriteFood, User
from ..schemas import RecipeCreate, RecipeResponse, FavoriteFoodCreate, FavoriteFoodResponse
from ..services.auth import get_current_user_optional

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

@router.get("", response_model=List[RecipeResponse])
def get_recipes(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    recipes = db.query(Recipe).filter(Recipe.user_id == uid).all()
    return recipes

@router.post("", response_model=RecipeResponse)
def create_recipe(
    item: RecipeCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    servings = max(1, item.servings)
    
    total_cal = sum(ing.calories for ing in item.ingredients)
    total_prot = sum(ing.protein for ing in item.ingredients)
    total_carbs = sum(ing.carbs for ing in item.ingredients)
    total_fat = sum(ing.fat for ing in item.ingredients)

    cal_per = round(total_cal / servings, 1)
    prot_per = round(total_prot / servings, 1)
    carbs_per = round(total_carbs / servings, 1)
    fat_per = round(total_fat / servings, 1)

    ing_json = json.dumps([ing.model_dump() for ing in item.ingredients])

    recipe = Recipe(
        user_id=uid,
        name=item.name,
        servings=servings,
        calories_per_serving=cal_per,
        protein_per_serving=prot_per,
        carbs_per_serving=carbs_per,
        fat_per_serving=fat_per,
        ingredients_json=ing_json
    )
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe

@router.delete("/{recipe_id}")
def delete_recipe(
    recipe_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    rec = db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == uid).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(rec)
    db.commit()
    return {"message": "Recipe deleted"}

@router.get("/favorites", response_model=List[FavoriteFoodResponse])
def get_favorites(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    favs = db.query(FavoriteFood).filter(FavoriteFood.user_id == uid).all()
    return favs

@router.post("/favorites", response_model=FavoriteFoodResponse)
def add_favorite(
    item: FavoriteFoodCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    fav = FavoriteFood(
        user_id=uid,
        name=item.name,
        brand=item.brand,
        calories_100g=item.calories_100g,
        protein_100g=item.protein_100g,
        carbs_100g=item.carbs_100g,
        fat_100g=item.fat_100g,
        serving_size_g=item.serving_size_g
    )
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

@router.delete("/favorites/{fav_id}")
def delete_favorite(
    fav_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    uid = current_user.id if current_user else 1
    fav = db.query(FavoriteFood).filter(FavoriteFood.id == fav_id, FavoriteFood.user_id == uid).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite food item not found")
    db.delete(fav)
    db.commit()
    return {"message": "Favorite food item deleted"}
