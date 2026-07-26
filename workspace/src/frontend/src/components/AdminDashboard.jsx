import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Users, Activity, Camera, Barcode, Scale, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchAdminStats } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchAdminStats();
      setStats(res);
    } catch (err) {
      setError('Failed to load owner analytics. Make sure you are logged in as admin@nutriscan.app.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
        Loading Owner Analytics Cockpit...
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-6 rounded-3xl text-center space-y-3">
        <ShieldCheck className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-100">Owner Access Required</h3>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Total Users', value: stats.total_users },
    { name: 'DAU', value: stats.daily_active_users },
    { name: 'MAU', value: stats.monthly_active_users },
    { name: 'Food Scans', value: stats.total_food_scans },
    { name: 'Barcode Lookups', value: stats.total_barcode_scans },
    { name: 'Weight Logs', value: stats.total_weight_logs },
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-100">Owner Business & App Store Cockpit</h2>
            <p className="text-xs text-slate-400">Live platform metrics, user retention, DAU/MAU & scan analytics</p>
          </div>
        </div>

        <button
          onClick={loadStats}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition"
          title="Refresh Analytics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        
        {/* Total Users */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Total Registered Users</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.total_users}</div>
          <div className="text-[10px] text-slate-400">App Accounts</div>
        </div>

        {/* DAU */}
        <div className="glass-panel rounded-2xl p-4 space-y-1 border border-teal-500/30">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Daily Active Users (DAU)</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{stats.daily_active_users}</div>
          <div className="text-[10px] text-slate-400">Active last 24 hours</div>
        </div>

        {/* MAU */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Monthly Active Users (MAU)</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">{stats.monthly_active_users}</div>
          <div className="text-[10px] text-slate-400">Active last 30 days</div>
        </div>

        {/* Total Scans */}
        <div className="glass-panel rounded-2xl p-4 space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-semibold">
            <span>Total AI & Barcode Scans</span>
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.total_food_scans}</div>
          <div className="text-[10px] text-slate-400">{stats.total_barcode_scans} via barcode</div>
        </div>

      </div>

      {/* Platform Analytics Bar Chart */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Platform Overview Metrics
        </h3>

        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} 
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registered Users Table */}
      <div className="glass-panel p-5 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-400" />
          Recent User Accounts ({stats.recent_signups.length})
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {stats.recent_signups.map(user => (
            <div key={user.id} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{user.name}</span>
                  {user.is_admin && <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[9px]">OWNER ADMIN</span>}
                </div>
                <div className="text-slate-400 text-[10px]">{user.email}</div>
              </div>

              <div className="text-right text-[10px]">
                <div className="text-slate-300 font-semibold">Joined: {user.created_at}</div>
                <div className="text-slate-500">Last Active: {user.last_login_at || 'Just now'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
