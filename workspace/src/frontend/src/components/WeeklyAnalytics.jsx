import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Cell 
} from 'recharts';
import { TrendingUp, Award, Activity, Calendar } from 'lucide-react';
import { fetchWeeklyAnalytics } from '../services/api';

export default function WeeklyAnalytics({ selectedDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetchWeeklyAnalytics(selectedDate);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedDate]);

  if (loading || !data) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center text-slate-400 animate-pulse">
        Loading weekly analytics...
      </div>
    );
  }

  const { daily_stats, average_calories, target_calories, adherence_score, weekly_macros } = data;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Weekly Avg */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>7-Day Average</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{average_calories} <span className="text-xs font-normal text-slate-400">kcal/day</span></div>
          <div className="text-[10px] text-emerald-400 font-medium">Target: {target_calories} kcal</div>
        </div>

        {/* Adherence Score */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Goal Adherence</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{adherence_score}%</div>
          <div className="text-[10px] text-slate-400">Target hit rate</div>
        </div>

        {/* Weekly Macro Balance */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Macro Distribution</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xs font-bold text-slate-200 flex gap-2 pt-1">
            <span className="text-emerald-400">P: {weekly_macros.protein_percentage}%</span>
            <span className="text-amber-400">C: {weekly_macros.carbs_percentage}%</span>
            <span className="text-purple-400">F: {weekly_macros.fat_percentage}%</span>
          </div>
          <div className="text-[10px] text-slate-400">Average macro split</div>
        </div>

      </div>

      {/* 7-Day Calorie Bar Chart */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Weekly Calorie Trend
            </h3>
            <p className="text-xs text-slate-400">Daily intake vs your {target_calories} kcal goal</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily_stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                itemStyle={{ color: '#38bdf8' }}
              />
              <ReferenceLine y={target_calories} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#22c55e', fontSize: 10 }} />
              <Bar dataKey="calories" radius={[8, 8, 0, 0]}>
                {daily_stats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.calories > target_calories ? '#f43f5e' : '#10b981'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
