import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChefHat, Search, Check } from 'lucide-react';
import { fetchRecipes, createRecipe, deleteRecipe, searchFoods } from '../services/api';

export default function RecipeBuilderModal({ isOpen, onClose, selectedDate, onLogAdded }) {
  const [recipes, setRecipes] = useState([]);
  const [activeTab, setActiveTab] = useState('saved'); // saved | builder
  const [selectedMeal, setSelectedMeal] = useState('lunch');

  // Recipe Builder Form State
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState([]);
  
  // Ingredient Search State
  const [ingQuery, setIngQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [ingAmount, setIngAmount] = useState(100);

  useEffect(() => {
    if (isOpen) loadRecipes();
  }, [isOpen]);

  const loadRecipes = async () => {
    try {
      const res = await fetchRecipes();
      setRecipes(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!ingQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchFoods(ingQuery);
      setSearchResults(res);
    }, 300);
    return () => clearTimeout(timer);
  }, [ingQuery]);

  if (!isOpen) return null;

  const handleAddIngredient = (food) => {
    const factor = ingAmount / 100.0;
    const item = {
      name: food.name,
      amount_g: ingAmount,
      calories: Math.round(food.calories_100g * factor),
      protein: Math.round(food.protein_100g * factor * 10) / 10,
      carbs: Math.round(food.carbs_100g * factor * 10) / 10,
      fat: Math.round(food.fat_100g * factor * 10) / 10
    };
    setIngredients(prev => [...prev, item]);
    setIngQuery('');
    setSearchResults([]);
  };

  const handleRemoveIngredient = (idx) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRecipe = async (e) => {
    e.preventDefault();
    if (!recipeName || ingredients.length === 0) return;
    try {
      await createRecipe({
        name: recipeName,
        servings: parseInt(servings, 10) || 1,
        ingredients: ingredients
      });
      loadRecipes();
      setRecipeName('');
      setIngredients([]);
      setActiveTab('saved');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogRecipe = async (recipe) => {
    const logItem = {
      log_date: selectedDate,
      meal_type: selectedMeal,
      name: recipe.name,
      brand: 'Custom Recipe',
      calories: recipe.calories_per_serving,
      protein: recipe.protein_per_serving,
      carbs: recipe.carbs_per_serving,
      fat: recipe.fat_per_serving,
      amount: 1,
      unit: 'serving',
      source: 'recipe'
    };

    await onLogAdded(logItem);
    onClose();
  };

  const handleDeleteRec = async (id) => {
    await deleteRecipe(id);
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const totalRecipeCal = ingredients.reduce((acc, i) => acc + i.calories, 0);
  const totalRecipeProt = ingredients.reduce((acc, i) => acc + i.protein, 0);
  const totalRecipeCarbs = ingredients.reduce((acc, i) => acc + i.carbs, 0);
  const totalRecipeFat = ingredients.reduce((acc, i) => acc + i.fat, 0);

  const calPerServing = Math.round(totalRecipeCal / (servings || 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'saved' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Saved Recipes
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'builder' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              + Create Recipe
            </button>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'saved' ? (
          <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            
            {/* Meal Selector */}
            <div className="flex items-center gap-2 font-semibold text-slate-400">
              <span>Log recipe to:</span>
              {['breakfast', 'lunch', 'dinner', 'snack'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMeal(m)}
                  className={`px-2.5 py-1 rounded-lg capitalize text-xs ${selectedMeal === m ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30' : 'bg-slate-900 text-slate-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Saved Recipes List */}
            {recipes.length === 0 ? (
              <div className="py-8 text-center text-slate-500 italic">
                No custom recipes saved yet. Click <strong>+ Create Recipe</strong> to build your first meal recipe!
              </div>
            ) : (
              <div className="space-y-3">
                {recipes.map(recipe => (
                  <div key={recipe.id} className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-100">{recipe.name}</h4>
                        <p className="text-[10px] text-slate-400">{recipe.servings} serving(s) recipe</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-extrabold text-emerald-400">{recipe.calories_per_serving} kcal</div>
                        <div className="text-[10px] text-slate-500">per serving</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div className="text-[10px] text-slate-400">
                        P: {recipe.protein_per_serving}g • C: {recipe.carbs_per_serving}g • F: {recipe.fat_per_serving}g
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteRec(recipe.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg bg-slate-900"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleLogRecipe(recipe)}
                          className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-xl flex items-center gap-1 active:scale-95 transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Log Recipe
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        ) : (
          /* Recipe Builder Form */
          <form onSubmit={handleSaveRecipe} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Recipe Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Protein Smoothie Bowl"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Servings</label>
                <input
                  type="number"
                  min="1"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-center font-bold"
                />
              </div>
            </div>

            {/* Add Ingredients Search */}
            <div className="space-y-2">
              <label className="block text-slate-400 font-semibold">Add Ingredients:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search ingredient (e.g. Oats, Egg, Milk...)"
                  value={ingQuery}
                  onChange={(e) => setIngQuery(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="number"
                  placeholder="g"
                  value={ingAmount}
                  onChange={(e) => setIngAmount(parseFloat(e.target.value) || 100)}
                  className="w-16 px-2 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-center font-bold"
                />
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1 max-h-36 overflow-y-auto bg-slate-900 p-2 rounded-xl border border-slate-800">
                  {searchResults.map((food, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleAddIngredient(food)}
                      className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer flex justify-between items-center"
                    >
                      <span className="font-semibold text-slate-200">{food.name}</span>
                      <span className="text-emerald-400 font-bold">{food.calories_100g} kcal/100g</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Added Ingredients List */}
            {ingredients.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-300">Recipe Ingredients:</h4>
                <div className="space-y-1.5">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <div>
                        <span className="font-semibold text-slate-200">{ing.name}</span>
                        <span className="text-slate-400 text-[10px] ml-2">({ing.amount_g}g)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{ing.calories} kcal</span>
                        <button type="button" onClick={() => handleRemoveIngredient(idx)} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/90 p-3 rounded-2xl border border-emerald-500/30 flex justify-between items-center mt-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Per Serving ({servings} total)</div>
                    <div className="text-xs font-bold text-slate-200">
                      P: {Math.round(totalRecipeProt / servings)}g • C: {Math.round(totalRecipeCarbs / servings)}g • F: {Math.round(totalRecipeFat / servings)}g
                    </div>
                  </div>
                  <div className="text-lg font-black text-emerald-400">{calPerServing} kcal</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={ingredients.length === 0}
              className="w-full py-3 mt-2 rounded-2xl bg-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs"
            >
              Save Custom Recipe
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
