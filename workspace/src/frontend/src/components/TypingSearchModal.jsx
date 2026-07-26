import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Loader2, Sparkles } from 'lucide-react';
import { searchFoods, createCustomFood } from '../services/api';

export default function TypingSearchModal({ isOpen, onClose, selectedDate, defaultMeal = 'breakfast', onLogAdded }) {
  const [activeTab, setActiveTab] = useState('search'); // search | custom
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(defaultMeal);

  // Selected Item Detail State
  const [selectedFood, setSelectedFood] = useState(null);
  const [amount, setAmount] = useState(100);

  // Custom Food Form State
  const [customName, setCustomName] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const [customCal, setCustomCal] = useState(200);
  const [customProt, setCustomProt] = useState(15);
  const [customCarbs, setCustomCarbs] = useState(25);
  const [customFat, setCustomFat] = useState(5);

  useEffect(() => {
    if (defaultMeal) setSelectedMeal(defaultMeal);
  }, [defaultMeal]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchFoods(query);
        setResults(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setAmount(100);
  };

  const handleAddLog = async () => {
    if (!selectedFood) return;
    const factor = amount / 100.0;
    const logItem = {
      log_date: selectedDate,
      meal_type: selectedMeal,
      name: selectedFood.name,
      brand: selectedFood.brand,
      calories: Math.round(selectedFood.calories_100g * factor),
      protein: Math.round(selectedFood.protein_100g * factor * 10) / 10,
      carbs: Math.round(selectedFood.carbs_100g * factor * 10) / 10,
      fat: Math.round(selectedFood.fat_100g * factor * 10) / 10,
      amount: amount,
      unit: 'g',
      source: selectedFood.source || 'search'
    };

    await onLogAdded(logItem);
    setSelectedFood(null);
    onClose();
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    try {
      const customItem = await createCustomFood({
        name: customName,
        brand: customBrand || 'Custom Recipe',
        calories_100g: parseFloat(customCal) || 0,
        protein_100g: parseFloat(customProt) || 0,
        carbs_100g: parseFloat(customCarbs) || 0,
        fat_100g: parseFloat(customFat) || 0,
        serving_size_g: 100
      });
      handleSelectFood(customItem);
      setActiveTab('search');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'search' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Search Online
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${activeTab === 'custom' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              + Custom Food
            </button>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'search' ? (
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Type food name (e.g. Oats, Salmon, Apple...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              {loading && <Loader2 className="w-4 h-4 text-emerald-400 animate-spin absolute right-3.5 top-3.5" />}
            </div>

            {/* Meal Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Log into:</span>
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

            {/* Results List */}
            {results.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {results.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectFood(item)}
                    className={`p-3 rounded-2xl cursor-pointer border transition flex items-center justify-between ${selectedFood?.name === item.name ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200">{item.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.brand} • <span className="text-emerald-400">{item.calories_100g} kcal</span> / 100g (P: {item.protein_100g}g C: {item.carbs_100g}g F: {item.fat_100g}g)
                      </div>
                    </div>
                    {selectedFood?.name === item.name && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                ))}
              </div>
            )}

            {/* Selected Item Portion Form */}
            {selectedFood && (
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs font-bold text-slate-200">{selectedFood.name}</div>
                  <div className="text-xs font-bold text-emerald-400">
                    {Math.round(selectedFood.calories_100g * (amount / 100))} kcal
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-semibold">Serving Size:</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 100))}
                    className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white text-center focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400">grams (g)</span>
                </div>

                <button
                  onClick={handleAddLog}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                >
                  <Plus className="w-4 h-4" /> Add to {selectedMeal}
                </button>
              </div>
            )}

          </div>
        ) : (
          /* Custom Food Creator Form */
          <form onSubmit={handleCreateCustom} className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Food Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Homemade Protein Pancake"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Brand / Recipe</label>
              <input
                type="text"
                placeholder="Optional"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Calories (per 100g)</label>
                <input
                  type="number"
                  value={customCal}
                  onChange={(e) => setCustomCal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Protein (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customProt}
                  onChange={(e) => setCustomProt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Carbs (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fat (g)</label>
                <input
                  type="number"
                  step="0.1"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              Save Custom Food
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
