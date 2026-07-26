import React from 'react';
import { Calendar, User, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Header({ selectedDate, setSelectedDate, userProfile, onOpenProfile }) {
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Flame className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NutriScan <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">AI</span>
            </h1>
            <p className="text-xs text-slate-400">Spec-Driven Calorie & Macro Tracker</p>
          </div>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={handlePrevDay} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-semibold text-slate-200">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isToday ? 'Today' : selectedDate}</span>
          </div>

          <button 
            onClick={handleNextDay} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* User Target Profile Badge */}
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/80 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">{userProfile?.name || 'Profile'}</div>
            <div className="text-[10px] text-emerald-400 font-medium">Goal: {userProfile?.daily_calorie_target || 2000} kcal</div>
          </div>
        </button>

      </div>
    </header>
  );
}
