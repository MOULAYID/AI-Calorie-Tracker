import React from 'react';
import { 
  Flame, 
  Plus, 
  Scan, 
  Camera, 
  Search, 
  Droplet, 
  Trash2, 
  Utensils, 
  Sun, 
  Moon, 
  Coffee, 
  Apple,
  Sparkles
} from 'lucide-react';

const MEAL_CATEGORIES = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'from-amber-500 to-orange-400' },
  { key: 'lunch', label: 'Lunch', icon: Sun, color: 'from-emerald-500 to-teal-400' },
  { key: 'dinner', label: 'Dinner', icon: Moon, color: 'from-indigo-500 to-purple-400' },
  { key: 'snack', label: 'Snacks & Drinks', icon: Apple, color: 'from-pink-500 to-rose-400' }
];

export default function Dashboard({ 
  foodLogs = [], 
  waterMl = 0, 
  userProfile, 
  onDeleteLog, 
  onAddWater, 
  onOpenSearch, 
  onOpenAiScan, 
  onOpenBarcodeScan 
}) {
  const goalCalories = userProfile?.daily_calorie_target || 2000;
  const targetProtein = userProfile?.protein_target_g || 120;
  const targetCarbs = userProfile?.carbs_target_g || 200;
  const targetFat = userProfile?.fat_target_g || 65;
  const targetWater = userProfile?.water_target_ml || 2500;

  const totalCalories = Math.round(foodLogs.reduce((acc, i) => acc + (i.calories || 0), 0));
  const totalProtein = Math.round(foodLogs.reduce((acc, i) => acc + (i.protein || 0), 0));
  const totalCarbs = Math.round(foodLogs.reduce((acc, i) => acc + (i.carbs || 0), 0));
  const totalFat = Math.round(foodLogs.reduce((acc, i) => acc + (i.fat || 0), 0));

  const remainingCalories = Math.max(0, goalCalories - totalCalories);
  const percentage = Math.min(100, Math.round((totalCalories / goalCalories) * 100));

  // Circular progress dimensions
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6 pb-12">

      {/* Main Calorie Progress Ring Card */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          
          {/* Ring Visualization */}
          <div className="flex flex-col items-center justify-center relative">
            <svg className="w-56 h-56 transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="stroke-slate-800/80"
                strokeWidth="16"
                fill="transparent"
              />
              {/* Progress Ring */}
              <circle
                cx="112"
                cy="112"
                r={radius}
                className="stroke-emerald-400 transition-all duration-700 ease-out"
                strokeWidth="16"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                Remaining
              </div>
              <div className="text-4xl font-extrabold text-white tracking-tight my-0.5">
                {remainingCalories}
              </div>
              <div className="text-xs text-slate-400">
                / {goalCalories} kcal goal
              </div>
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                {percentage}% of daily goal
              </div>
            </div>
          </div>

          {/* Calorie & Macro Breakdown Stats */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-300">Daily Summary</span>
              <span className="text-xs text-emerald-400 font-medium">{totalCalories} kcal consumed</span>
            </div>

            {/* Protein Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Protein</span>
                <span className="text-slate-400">{totalProtein}g / {targetProtein}g</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalProtein / targetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Carbs</span>
                <span className="text-slate-400">{totalCarbs}g / {targetCarbs}g</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalCarbs / targetCarbs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Fats</span>
                <span className="text-slate-400">{totalFat}g / {targetFat}g</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalFat / targetFat) * 100)}%` }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Quick Action Floating Bar */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => onOpenSearch()}
          className="glass-panel-interactive p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Search / Type</div>
            <div className="text-[10px] text-slate-400">Database & Custom</div>
          </div>
        </button>

        <button
          onClick={() => onOpenAiScan()}
          className="glass-panel-interactive p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group text-center relative overflow-hidden border border-emerald-500/30"
        >
          <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">AI</div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">AI Meal Photo</div>
            <div className="text-[10px] text-emerald-400">Vision Analysis</div>
          </div>
        </button>

        <button
          onClick={() => onOpenBarcodeScan()}
          className="glass-panel-interactive p-4 rounded-2xl flex flex-col items-center justify-center gap-2 group text-center"
        >
          <div className="w-11 h-11 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-teal-400 group-hover:text-slate-950 transition">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Scan Barcode</div>
            <div className="text-[10px] text-slate-400">Instant Lookup</div>
          </div>
        </button>
      </div>

      {/* Water Tracker Card */}
      <div className="glass-panel rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Droplet className="w-5 h-5 fill-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200">Water Intake</div>
            <div className="text-xs text-slate-400">{waterMl} ml / {targetWater} ml</div>
          </div>
        </div>

        <button
          onClick={() => onAddWater(250)}
          className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          +250 ml
        </button>
      </div>

      {/* Meal Section Breakdown */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-400" />
          Today's Meals
        </h2>

        <div className="space-y-3">
          {MEAL_CATEGORIES.map(category => {
            const Icon = category.icon;
            const mealLogs = foodLogs.filter(item => item.meal_type.toLowerCase() === category.key);
            const categoryCalories = Math.round(mealLogs.reduce((acc, i) => acc + (i.calories || 0), 0));

            return (
              <div key={category.key} className="glass-panel rounded-2xl p-4 space-y-3">
                
                {/* Section Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${category.color} flex items-center justify-center text-slate-950 font-bold shadow-md`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200">{category.label}</h3>
                      <p className="text-[11px] text-slate-400">{categoryCalories} kcal</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenSearch(category.key)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    Add
                  </button>
                </div>

                {/* Logged Items List */}
                {mealLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-1">No items logged yet.</p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {mealLogs.map(item => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="text-xs font-semibold text-slate-200 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span>{item.amount} {item.unit}</span>
                            <span>•</span>
                            <span className="text-emerald-400">{Math.round(item.calories)} kcal</span>
                            <span>•</span>
                            <span>P: {item.protein}g C: {item.carbs}g F: {item.fat}g</span>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteLog(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
