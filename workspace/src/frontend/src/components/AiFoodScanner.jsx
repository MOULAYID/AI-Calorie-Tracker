import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Sparkles, Loader2, Plus, Check } from 'lucide-react';
import { scanAiFood } from '../services/api';

export default function AiFoodScanner({ isOpen, onClose, selectedDate, onLogAdded }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      processImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (base64) => {
    setLoading(true);
    setScanResult(null);
    try {
      const result = await scanAiFood(base64);
      setScanResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogDish = async () => {
    if (!scanResult) return;

    // Log detected dish items or main dish
    const logItem = {
      log_date: selectedDate,
      meal_type: selectedMeal,
      name: scanResult.dish_name,
      brand: 'AI Meal Scan',
      calories: scanResult.total_calories,
      protein: scanResult.total_protein,
      carbs: scanResult.total_carbs,
      fat: scanResult.total_fat,
      amount: 1,
      unit: 'plate',
      source: 'ai'
    };

    await onLogAdded(logItem);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImagePreview(null);
    setScanResult(null);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-emerald-500/30 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">AI Meal Photo Scanner</h2>
              <p className="text-[10px] text-emerald-400">Gemini 2.5 Vision Dish Recognition</p>
            </div>
          </div>

          <button onClick={() => { handleReset(); onClose(); }} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Upload / Capture Viewfinder */}
          {!imagePreview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/30 hover:border-emerald-500/60 bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Camera className="w-7 h-7" />
              </div>
              <p className="font-bold text-slate-200 text-sm">Take Photo or Upload Image</p>
              <p className="text-slate-400 text-[11px] mt-1">Point your camera at your plate or dish</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden max-h-48 border border-slate-800">
                <img src={imagePreview} alt="Meal preview" className="w-full h-full object-cover" />
                <button
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/70 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                  <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="font-bold text-slate-200">Analyzing dish with Gemini AI...</p>
                  <p className="text-[11px] text-slate-400">Identifying food items & portion sizes</p>
                </div>
              )}

              {/* AI Prediction Results */}
              {scanResult && !loading && (
                <div className="space-y-3 animate-fadeIn">
                  
                  <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-100">{scanResult.dish_name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {Math.round(scanResult.confidence_score * 100)}% AI Confidence
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-400">{Math.round(scanResult.total_calories)} kcal</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <div className="text-slate-400 text-[10px]">Protein</div>
                        <div className="font-bold text-emerald-400 text-xs">{scanResult.total_protein}g</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <div className="text-slate-400 text-[10px]">Carbs</div>
                        <div className="font-bold text-amber-400 text-xs">{scanResult.total_carbs}g</div>
                      </div>
                      <div className="bg-slate-900 p-2 rounded-xl">
                        <div className="text-slate-400 text-[10px]">Fat</div>
                        <div className="font-bold text-purple-400 text-xs">{scanResult.total_fat}g</div>
                      </div>
                    </div>
                  </div>

                  {/* Identified Item Breakdown */}
                  {scanResult.items?.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-slate-300 text-xs">Identified Items:</h4>
                      {scanResult.items.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-2.5 rounded-xl flex justify-between items-center border border-slate-800">
                          <div>
                            <span className="font-semibold text-slate-200">{item.name}</span>
                            <span className="text-slate-400 text-[10px] ml-2">({item.weight_g}g)</span>
                          </div>
                          <div className="text-emerald-400 font-bold">{item.calories} kcal</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Meal Selector */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-slate-400 font-semibold">Log to:</span>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMeal(m)}
                        className={`px-3 py-1 rounded-xl capitalize font-bold text-xs ${selectedMeal === m ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400'}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleLogDish}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                  >
                    <Check className="w-4 h-4 stroke-[3]" /> Log AI Meal to {selectedMeal}
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
