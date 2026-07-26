import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TypingSearchModal from './components/TypingSearchModal';
import AiFoodScanner from './components/AiFoodScanner';
import BarcodeScanner from './components/BarcodeScanner';
import WeeklyAnalytics from './components/WeeklyAnalytics';
import UserProfileModal from './components/UserProfileModal';
import WeightTracker from './components/WeightTracker';
import RecipeBuilderModal from './components/RecipeBuilderModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import { AdBanner, InterstitialAdModal } from './components/AdBanner';
import { 
  fetchGoals, 
  fetchFoodLogs, 
  addFoodLog, 
  deleteFoodLog, 
  fetchWaterLog, 
  logWater,
  fetchCurrentUser,
  setAuthToken,
  getAuthToken
} from './services/api';
import { LayoutDashboard, BarChart3, Camera, Scale, ChefHat, User, ShieldCheck, LogOut } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | analytics | weight | admin
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [foodLogs, setFoodLogs] = useState([]);
  const [waterMl, setWaterMl] = useState(0);

  // Modal Open States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiScanOpen, setIsAiScanOpen] = useState(false);
  const [isBarcodeScanOpen, setIsBarcodeScanOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [targetMeal, setTargetMeal] = useState('breakfast');

  // Initial Auth Check & Data Fetching
  useEffect(() => {
    async function initAuth() {
      if (getAuthToken()) {
        const u = await fetchCurrentUser();
        if (u) setCurrentUser(u);
      }
      const p = await fetchGoals();
      setUserProfile(p);
    }
    initAuth();
  }, []);

  // Fetch Day Data when selectedDate or currentUser changes
  useEffect(() => {
    async function loadDayData() {
      const logs = await fetchFoodLogs(selectedDate);
      setFoodLogs(logs);
      const water = await fetchWaterLog(selectedDate);
      setWaterMl(water);
    }
    loadDayData();
  }, [selectedDate, currentUser]);

  const handleAddLog = async (item) => {
    const newLog = await addFoodLog(item);
    setFoodLogs(prev => [...prev, newLog]);
    // Show interstitial ad after AI meal scan
    if (item.source === 'ai_scan') {
      setIsAdModalOpen(true);
    }
  };

  const handleDeleteLog = async (id) => {
    await deleteFoodLog(id, selectedDate);
    setFoodLogs(prev => prev.filter(i => i.id !== id));
  };

  const handleAddWater = async (amount) => {
    await logWater(selectedDate, amount);
    setWaterMl(prev => prev + amount);
  };

  const handleOpenSearch = (meal = 'breakfast') => {
    setTargetMeal(meal);
    setIsSearchOpen(true);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setActiveTab('dashboard');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header Bar */}
      <Header
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        userProfile={userProfile}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Top Auth & Navigation Ribbon */}
      <div className="max-w-4xl w-full mx-auto px-4 pt-3 flex flex-wrap justify-between items-center text-xs gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-xl font-bold transition ${activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 rounded-xl font-bold transition ${activeTab === 'analytics' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400'}`}
          >
            Weekly Trends
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3 py-1 rounded-xl font-bold transition ${activeTab === 'weight' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-400'}`}
          >
            Weight & Fat
          </button>
          
          {currentUser?.is_admin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1 ${activeTab === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-900 text-amber-400'}`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Owner Cockpit
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRecipeOpen(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-bold border border-slate-800 flex items-center gap-1 transition"
          >
            <ChefHat className="w-3.5 h-3.5" />
            Recipes
          </button>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
              <span className="font-bold text-slate-200">{currentUser.name}</span>
              <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 ml-1" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-xl font-extrabold flex items-center gap-1 transition active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-4 pb-24">
        
        {/* Ad Banner on Dashboard */}
        {activeTab === 'dashboard' && <AdBanner type="banner" />}

        {activeTab === 'dashboard' && (
          <Dashboard
            foodLogs={foodLogs}
            waterMl={waterMl}
            userProfile={userProfile}
            onDeleteLog={handleDeleteLog}
            onAddWater={handleAddWater}
            onOpenSearch={handleOpenSearch}
            onOpenAiScan={() => setIsAiScanOpen(true)}
            onOpenBarcodeScan={() => setIsBarcodeScanOpen(true)}
          />
        )}
        {activeTab === 'analytics' && <WeeklyAnalytics selectedDate={selectedDate} />}
        {activeTab === 'weight' && <WeightTracker userProfile={userProfile} />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Bottom Navigation Dock (Mobile-first UX) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-slate-800 px-6 py-3">
        <div className="max-w-md mx-auto flex items-center justify-around">
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('weight')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'weight' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Scale className="w-5 h-5" />
            <span className="text-[10px]">Weight</span>
          </button>

          <button
            onClick={() => handleOpenSearch()}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition -translate-y-2"
            title="Scan / Search Food"
          >
            <Camera className="w-6 h-6" />
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'analytics' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px]">Weekly</span>
          </button>

          {currentUser?.is_admin ? (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center gap-1 transition ${activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="text-[10px]">Owner</span>
            </button>
          ) : (
            <button
              onClick={() => setIsRecipeOpen(true)}
              className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition"
            >
              <ChefHat className="w-5 h-5" />
              <span className="text-[10px]">Recipes</span>
            </button>
          )}

        </div>
      </nav>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setCurrentUser(u);
          if (u.is_admin) setActiveTab('admin');
        }}
      />

      <TypingSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        selectedDate={selectedDate}
        defaultMeal={targetMeal}
        onLogAdded={handleAddLog}
      />

      <AiFoodScanner
        isOpen={isAiScanOpen}
        onClose={() => setIsAiScanOpen(false)}
        selectedDate={selectedDate}
        onLogAdded={handleAddLog}
      />

      <BarcodeScanner
        isOpen={isBarcodeScanOpen}
        onClose={() => setIsBarcodeScanOpen(false)}
        selectedDate={selectedDate}
        onLogAdded={handleAddLog}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onProfileUpdated={(p) => setUserProfile(p)}
      />

      <RecipeBuilderModal
        isOpen={isRecipeOpen}
        onClose={() => setIsRecipeOpen(false)}
        selectedDate={selectedDate}
        onLogAdded={handleAddLog}
      />

      <InterstitialAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />

    </div>
  );
}
