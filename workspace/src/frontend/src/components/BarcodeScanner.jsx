import React, { useState } from 'react';
import { X, Scan, Search, Loader2, Plus, Check } from 'lucide-react';
import { scanBarcode } from '../services/api';

export default function BarcodeScanner({ isOpen, onClose, selectedDate, onLogAdded }) {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [productResult, setProductResult] = useState(null);
  const [amount, setAmount] = useState(100);
  const [selectedMeal, setSelectedMeal] = useState('snack');

  if (!isOpen) return null;

  const handleLookup = async (codeToLookup) => {
    const code = codeToLookup || barcodeInput;
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await scanBarcode(code);
      setProductResult(res);
      setAmount(100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogProduct = async () => {
    if (!productResult) return;
    const factor = amount / 100.0;
    const logItem = {
      log_date: selectedDate,
      meal_type: selectedMeal,
      name: productResult.name,
      brand: productResult.brand,
      calories: Math.round(productResult.calories_100g * factor),
      protein: Math.round(productResult.protein_100g * factor * 10) / 10,
      carbs: Math.round(productResult.carbs_100g * factor * 10) / 10,
      fat: Math.round(productResult.fat_100g * factor * 10) / 10,
      amount: amount,
      unit: 'g',
      barcode: productResult.barcode,
      source: 'barcode'
    };

    await onLogAdded(logItem);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setBarcodeInput('');
    setProductResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-md overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Barcode Scanner</h2>
              <p className="text-[10px] text-slate-400">Open Food Facts Database</p>
            </div>
          </div>

          <button onClick={() => { handleReset(); onClose(); }} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Barcode Frame / Viewfinder Simulation */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center relative border border-slate-800">
            <div className="w-44 h-24 border-2 border-dashed border-teal-400/60 rounded-xl flex items-center justify-center relative overflow-hidden bg-slate-900/80">
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-pulse" />
              <Scan className="w-8 h-8 text-teal-400 opacity-60" />
            </div>
            <p className="text-[11px] text-slate-400 mt-3">Scan product barcode label</p>
          </div>

          {/* Manual Barcode Input */}
          <div className="space-y-2">
            <label className="block text-slate-400 font-semibold">Enter Barcode Code:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 3017620422003 (Nutella) or 5449000000996"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={() => handleLookup()}
                disabled={loading}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick Test Barcode Buttons */}
            <div className="flex gap-1.5 pt-1 overflow-x-auto">
              <span className="text-[10px] text-slate-500 font-semibold self-center">Try:</span>
              <button onClick={() => { setBarcodeInput('3017620422003'); handleLookup('3017620422003'); }} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-teal-400 border border-slate-800">Nutella</button>
              <button onClick={() => { setBarcodeInput('5449000000996'); handleLookup('5449000000996'); }} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-teal-400 border border-slate-800">Coca-Cola</button>
              <button onClick={() => { setBarcodeInput('3033710065066'); handleLookup('3033710065066'); }} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-teal-400 border border-slate-800">Danone</button>
            </div>
          </div>

          {/* Product Lookup Card */}
          {productResult && (
            <div className="glass-panel p-4 rounded-2xl border border-teal-500/40 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-100">{productResult.name}</h3>
                  <p className="text-[10px] text-slate-400">{productResult.brand}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-teal-400">
                    {Math.round(productResult.calories_100g * (amount / 100))} kcal
                  </div>
                  <div className="text-[10px] text-slate-500">for {amount}g</div>
                </div>
              </div>

              {/* Portion Selector */}
              <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl">
                <span className="text-slate-400 text-[11px] font-semibold">Portion Size (g):</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseFloat(e.target.value) || 100))}
                  className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-center font-bold text-slate-100"
                />
              </div>

              {/* Log Button */}
              <button
                onClick={handleLogProduct}
                className="w-full py-2.5 rounded-xl bg-teal-500 text-slate-950 font-extrabold flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" /> Log Product to {selectedMeal}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
