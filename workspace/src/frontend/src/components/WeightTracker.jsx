import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { Scale, Plus, TrendingDown, TrendingUp, Target, Trash2, Activity, Percent } from 'lucide-react';
import { fetchWeightLogs, logWeight, deleteWeightLog } from '../services/api';

export default function WeightTracker({ userProfile }) {
  const [logs, setLogs] = useState([]);
  const [activeChart, setActiveChart] = useState('weight'); // weight | bodyfat
  const [weightKg, setWeightKg] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const targetWeight = userProfile?.target_weight_kg || 62.0;
  const targetBodyFat = userProfile?.target_body_fat_pct || 18.0;

  useEffect(() => {
    loadWeights();
  }, []);

  const loadWeights = async () => {
    setLoading(true);
    try {
      const res = await fetchWeightLogs();
      setLogs(res);
      if (res.length > 0) {
        const last = res[res.length - 1];
        setWeightKg(last.weight_kg.toString());
        if (last.body_fat_pct) setBodyFat(last.body_fat_pct.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!weightKg) return;
    try {
      await logWeight({
        log_date: selectedDate,
        weight_kg: parseFloat(weightKg),
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        notes: notes || null
      });
      loadWeights();
      setNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    await deleteWeightLog(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight_kg : userProfile?.weight_kg || 68.0;
  const currentBodyFat = logs.length > 0 && logs[logs.length - 1].body_fat_pct ? logs[logs.length - 1].body_fat_pct : 22.0;
  
  // Calculate Fat Mass & Lean Mass
  const fatMassKg = Math.round((currentWeight * (currentBodyFat / 100)) * 10) / 10;
  const leanMassKg = Math.round((currentWeight - fatMassKg) * 10) / 10;

  const initialWeight = logs.length > 0 ? logs[0].weight_kg : currentWeight;
  const weightChange = Math.round((currentWeight - initialWeight) * 10) / 10;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        
        {/* Current Weight */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Weight</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{currentWeight} <span className="text-xs font-normal text-slate-400">kg</span></div>
          <div className="text-[10px] text-emerald-400 font-medium">Goal: {targetWeight} kg</div>
        </div>

        {/* Body Fat % */}
        <div className="glass-panel rounded-2xl p-4 space-y-1 border border-teal-500/30">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Body Fat</span>
            <Percent className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{currentBodyFat}%</div>
          <div className="text-[10px] text-slate-400">Goal: {targetBodyFat}%</div>
        </div>

        {/* Fat Mass */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Fat Mass</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{fatMassKg} <span className="text-xs font-normal text-slate-400">kg</span></div>
          <div className="text-[10px] text-slate-400">Total Body Fat</div>
        </div>

        {/* Lean Mass */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Lean Mass</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{leanMassKg} <span className="text-xs font-normal text-slate-400">kg</span></div>
          <div className="text-[10px] text-slate-400">Muscle & Bone</div>
        </div>

      </div>

      {/* Chart Selector & Visualization */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              {activeChart === 'weight' ? 'Weight Progress Chart' : 'Body Fat % Progress Chart'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeChart === 'weight' ? `Target: ${targetWeight} kg` : `Target: ${targetBodyFat}% Body Fat`}
            </p>
          </div>

          <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveChart('weight')}
              className={`px-3 py-1 rounded-lg font-bold transition ${activeChart === 'weight' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Weight (kg)
            </button>
            <button
              onClick={() => setActiveChart('bodyfat')}
              className={`px-3 py-1 rounded-lg font-bold transition ${activeChart === 'bodyfat' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Body Fat %
            </button>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
              No entries logged yet. Add your weight & body fat % below!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="log_date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                  itemStyle={{ color: activeChart === 'weight' ? '#10b981' : '#14b8a6' }}
                />
                <ReferenceLine 
                  y={activeChart === 'weight' ? targetWeight : targetBodyFat} 
                  stroke="#f59e0b" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Goal', fill: '#f59e0b', fontSize: 10 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey={activeChart === 'weight' ? 'weight_kg' : 'body_fat_pct'} 
                  stroke={activeChart === 'weight' ? '#10b981' : '#14b8a6'} 
                  strokeWidth={3}
                  dot={{ fill: activeChart === 'weight' ? '#10b981' : '#14b8a6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Log Form */}
      <div className="glass-panel p-5 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-slate-200">Log Weigh-in & Body Fat %</h3>
        <form onSubmit={handleAddWeight} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Weight (kg) *</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 67.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div>
            <label className="block text-teal-400 font-semibold mb-1">Body Fat %</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 21.5"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-teal-500/40 rounded-xl text-slate-100 font-bold"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" /> Save Body Log
            </button>
          </div>
        </form>
      </div>

      {/* History Table */}
      {logs.length > 0 && (
        <div className="glass-panel p-4 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-slate-200">Body Measurement History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {logs.slice().reverse().map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-200">{item.log_date}</span>
                  <span className="text-slate-400 ml-3">{item.weight_kg} kg</span>
                  {item.body_fat_pct && <span className="text-teal-400 font-bold ml-3">{item.body_fat_pct}% fat</span>}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
