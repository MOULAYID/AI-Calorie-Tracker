import React, { useState } from 'react';
import { Sparkles, X, ExternalLink } from 'lucide-react';

export function AdBanner({ type = "banner" }) {
  if (type === "banner") {
    return (
      <div className="w-full my-4 p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-bold text-[9px] uppercase">Ad</span>
          <span className="text-slate-300 font-semibold">NutriScan Pro: Unlock Unlimited AI Meal Scans</span>
        </div>
        <button
          onClick={() => alert("Redirecting to Ad Sponsor / Premium Upgrade...")}
          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] flex items-center gap-1 transition"
        >
          Learn More <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return null;
}

export function InterstitialAdModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-sm p-6 border border-emerald-500/40 text-center space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-xl"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold">
          <Sparkles className="w-6 h-6" />
        </div>

        <div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase">Sponsored Ad</span>
          <h3 className="text-base font-extrabold text-slate-100 mt-1">Upgrade to NutriScan AI Premium</h3>
          <p className="text-xs text-slate-400 mt-1">Get 100% ad-free experience, unlimited Gemini 2.5 Flash Vision meal photo scans, and priority database lookups!</p>
        </div>

        <div className="pt-2 space-y-2">
          <button
            onClick={() => { alert("Redirecting to App Store / Play Store In-App Purchase..."); onClose(); }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20"
          >
            Upgrade to Premium ($4.99/mo)
          </button>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
          >
            Continue with Free (Ad-Supported)
          </button>
        </div>
      </div>
    </div>
  );
}
