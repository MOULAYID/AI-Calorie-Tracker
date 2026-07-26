import React, { useState } from 'react';
import { X, User, Check } from 'lucide-react';
import { updateGoals } from '../services/api';

export default function UserProfileModal({ isOpen, onClose, userProfile, onProfileUpdated }) {
  const [name, setName] = useState(userProfile?.name || 'User');
  const [age, setAge] = useState(userProfile?.age || 28);
  const [gender, setGender] = useState(userProfile?.gender || 'female');
  const [weightKg, setWeightKg] = useState(userProfile?.weight_kg || 68);
  const [heightCm, setHeightCm] = useState(userProfile?.height_cm || 168);
  const [targetWeightKg, setTargetWeightKg] = useState(userProfile?.target_weight_kg || 62);
  const [targetBodyFat, setTargetBodyFat] = useState(userProfile?.target_body_fat_pct || 18);
  const [activityLevel, setActivityLevel] = useState(userProfile?.activity_level || 'lightly_active');
  const [goalType, setGoalType] = useState(userProfile?.goal_type || 'lose');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateGoals({
        name,
        age: parseInt(age, 10),
        gender,
        weight_kg: parseFloat(weightKg),
        height_cm: parseFloat(heightCm),
        target_weight_kg: parseFloat(targetWeightKg),
        target_body_fat_pct: parseFloat(targetBodyFat),
        activity_level: activityLevel,
        goal_type: goalType,
        water_target_ml: userProfile?.water_target_ml || 2500
      });
      onProfileUpdated(updated);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">BMR & Body Goals Settings</h2>
              <p className="text-[10px] text-slate-400">Target Calorie & Body Fat % Calculator</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Current Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div>
              <label className="block text-amber-400 font-semibold mb-1">Target Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-amber-500/40 rounded-xl text-slate-100 font-bold"
              />
            </div>

            <div>
              <label className="block text-teal-400 font-semibold mb-1">Target Body Fat %</label>
              <input
                type="number"
                step="0.5"
                value={targetBodyFat}
                onChange={(e) => setTargetBodyFat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-teal-500/40 rounded-xl text-slate-100 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            >
              <option value="sedentary">Sedentary (Little or no exercise)</option>
              <option value="lightly_active">Lightly Active (Exercise 1-3 days/wk)</option>
              <option value="moderately_active">Moderately Active (Exercise 3-5 days/wk)</option>
              <option value="very_active">Very Active (Hard exercise 6-7 days/wk)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Weight Goal</label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            >
              <option value="lose">Weight Loss (-500 kcal/day)</option>
              <option value="maintain">Maintain Weight (TDEE)</option>
              <option value="gain">Muscle / Weight Gain (+500 kcal/day)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
          >
            <Check className="w-4 h-4 stroke-[3]" /> Save Profile & Body Targets
          </button>

        </form>

      </div>
    </div>
  );
}
