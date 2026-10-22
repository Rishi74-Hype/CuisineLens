import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { DailyView } from './components/DailyView.tsx';
import { ScanModal } from './components/ScanModal.tsx';
import { ConfirmEditMealModal } from './components/ConfirmEditMealModal.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { PaywallModal } from './components/PaywallModal.tsx';
import { RegionalDishesExplorer } from './components/RegionalDishesExplorer.tsx';
import { WeeklyInsightsModal } from './components/WeeklyInsightsModal.tsx';
import { GeminiChatbotModal } from './components/GeminiChatbotModal.tsx';
import { BioscienceExplorerModal } from './components/BioscienceExplorerModal.tsx';
import { UserProfile, MealLogItem, ScanResult } from './types/nutrition.ts';
import { RegionalDish } from './data/regionalDishes.ts';
import {
  loadProfile,
  saveProfile,
  loadMealLogs,
  saveMealLogs,
  loadWaterLogs,
  saveWaterLogs,
  WaterLogMap,
  DEFAULT_USER_PROFILE,
} from './utils/nutritionCalculator.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Calendar, Camera, Database, BarChart3, Bot, FlaskConical } from 'lucide-react';

function AppContent() {
  const { user, syncProfileToFirestore, syncMealToFirestore, deleteMealFromFirestore, syncWaterToFirestore } = useAuth();

  const [userProfile, setUserProfile] = useState<UserProfile>(loadProfile);
  const [mealLogs, setMealLogs] = useState<MealLogItem[]>(loadMealLogs);
  const [waterLogs, setWaterLogs] = useState<WaterLogMap>(loadWaterLogs);
  const [currentTab, setCurrentTab] = useState<'today' | 'scanner' | 'database' | 'insights'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Dark mode theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cuisinelens_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('cuisinelens_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('cuisinelens_theme', 'light');
      }
    } catch (e) {
      console.error('Failed to update theme', e);
    }
  }, [darkMode]);

  // Modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isConfirmEditOpen, setIsConfirmEditOpen] = useState(false);
  const [activeScanResult, setActiveScanResult] = useState<ScanResult | null>(null);
  const [activeScanImageUrl, setActiveScanImageUrl] = useState<string>('');
  const [editingMealId, setEditingMealId] = useState<string | undefined>(undefined);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!userProfile.isOnboarded);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isScienceOpen, setIsScienceOpen] = useState(false);

  // Sync state to localStorage & Firestore
  useEffect(() => {
    saveProfile(userProfile);
    if (user) {
      syncProfileToFirestore(userProfile);
    }
  }, [userProfile, user]);

  useEffect(() => {
    saveMealLogs(mealLogs);
  }, [mealLogs]);

  useEffect(() => {
    saveWaterLogs(waterLogs);
  }, [waterLogs]);

  const handleLogWater = (delta: number) => {
    setWaterLogs(prev => {
      const current = prev[selectedDate] || 0;
      const nextVal = Math.max(0, current + delta);
      if (user) {
        syncWaterToFirestore(selectedDate, nextVal);
      }
      return { ...prev, [selectedDate]: nextVal };
    });
  };

  const handleSetWater = (glasses: number) => {
    const val = Math.max(0, glasses);
    setWaterLogs(prev => ({
      ...prev,
      [selectedDate]: val,
    }));
    if (user) {
      syncWaterToFirestore(selectedDate, val);
    }
  };

  const handleUpdateWaterGoal = (newGoal: number) => {
    setUserProfile(prev => ({
      ...prev,
      waterGoalGlasses: newGoal,
    }));
  };

  // Handlers
  const handleOpenScanner = () => {
    if (!userProfile.isPro && userProfile.dailyScansUsed >= 3) {
      setIsPaywallOpen(true);
      return;
    }
    setIsScannerOpen(true);
  };

  const handleScanSuccess = (result: ScanResult, imageUrl: string) => {
    setIsScannerOpen(false);
    setActiveScanResult(result);
    setActiveScanImageUrl(imageUrl);
    setEditingMealId(undefined);
    setIsConfirmEditOpen(true);
  };

  const handleSaveMeal = (meal: MealLogItem) => {
    if (editingMealId) {
      setMealLogs(prev => prev.map(m => (m.id === editingMealId ? meal : m)));
    } else {
      setMealLogs(prev => [meal, ...prev]);
    }
    if (user) {
      syncMealToFirestore(meal);
    }
    setIsConfirmEditOpen(false);
    setActiveScanResult(null);
    setCurrentTab('today');
  };

  const handleDeleteMeal = (id: string) => {
    setMealLogs(prev => prev.filter(m => m.id !== id));
    if (user) {
      deleteMealFromFirestore(id);
    }
  };

  const handleEditMeal = (meal: MealLogItem) => {
    const convertedScanResult: ScanResult = {
      dishName: meal.dishName,
      nativeName: meal.nativeName,
      cuisine: meal.cuisine,
      suggestedPortion: meal.portion,
      estimatedGrams: meal.grams,
      confidenceScore: meal.confidenceScore || 92,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber,
      sodium: meal.sodium,
      cookingFatDetected: meal.cookingFat,
      regionalNutritionNote: meal.regionalNutritionNote,
      ingredients: meal.ingredients || [],
    };
    setActiveScanResult(convertedScanResult);
    setActiveScanImageUrl(meal.imageUrl);
    setEditingMealId(meal.id);
    setIsConfirmEditOpen(true);
  };

  const handleQuickLogDish = (dish: RegionalDish) => {
    const portionData = dish.portions.Medium;
    const mealItem: MealLogItem = {
      id: `dish-log-${Date.now()}`,
      dishName: dish.name,
      nativeName: dish.nativeName,
      cuisine: `${dish.cuisine} / ${dish.regionOrStyle}`,
      mealType: 'Lunch',
      portion: 'Medium',
      grams: portionData.grams,
      calories: portionData.macros.calories,
      protein: portionData.macros.protein,
      carbs: portionData.macros.carbs,
      fat: portionData.macros.fat,
      fiber: portionData.macros.fiber,
      sodium: portionData.macros.sodium,
      cookingFat: dish.cookingFat,
      imageUrl: dish.sampleImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      loggedAt: `${selectedDate}T${new Date().toTimeString().split(' ')[0]}Z`,
      confidenceScore: 99,
      regionalNutritionNote: dish.nutritionalInsight,
      ingredients: dish.commonIngredients.map(ing => ({
        name: ing,
        estimatedGrams: Math.round(portionData.grams / dish.commonIngredients.length),
        calories: Math.round(portionData.macros.calories / dish.commonIngredients.length),
      })),
    };

    setMealLogs(prev => [mealItem, ...prev]);
    if (user) {
      syncMealToFirestore(mealItem);
    }
    setCurrentTab('today');
  };

  const handleToggleProStatus = (newProStatus: boolean) => {
    setUserProfile(prev => ({
      ...prev,
      isPro: newProStatus,
      dailyScansUsed: newProStatus ? 0 : prev.dailyScansUsed,
    }));
  };

  const handleIncrementScanCount = () => {
    setUserProfile(prev => ({
      ...prev,
      dailyScansUsed: prev.dailyScansUsed + 1,
      lastScanDate: new Date().toISOString().split('T')[0],
    }));
  };

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans selection:bg-amber-200 dark:selection:bg-amber-900 transition-colors">
      {/* Top Header Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onOpenProfile={() => setIsOnboardingOpen(true)}
        onOpenScanner={handleOpenScanner}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenScience={() => setIsScienceOpen(true)}
      />

      {/* Main Content Areas */}
      <main>
        {currentTab === 'today' && (
          <DailyView
            userProfile={userProfile}
            mealLogs={mealLogs}
            waterConsumed={waterLogs[selectedDate] || 0}
            waterGoal={userProfile.waterGoalGlasses || 8}
            onLogWater={handleLogWater}
            onSetWater={handleSetWater}
            onUpdateWaterGoal={handleUpdateWaterGoal}
            onOpenScanner={handleOpenScanner}
            onEditMeal={handleEditMeal}
            onDeleteMeal={handleDeleteMeal}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
            onOpenChat={() => setIsChatOpen(true)}
            onOpenScience={() => setIsScienceOpen(true)}
          />
        )}

        {currentTab === 'database' && (
          <RegionalDishesExplorer
            onQuickLogDish={handleQuickLogDish}
            onOpenScanner={handleOpenScanner}
          />
        )}

        {currentTab === 'insights' && (
          <WeeklyInsightsModal
            userProfile={userProfile}
            mealLogs={mealLogs}
            onOpenPaywall={() => setIsPaywallOpen(true)}
            onOpenScanner={handleOpenScanner}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Anchor */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 grid grid-cols-5 items-center h-16 pb-safe transition-colors">
        <button
          onClick={() => setCurrentTab('today')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'today' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-1">Today</span>
        </button>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex flex-col items-center justify-center h-full text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] mt-1">Chat AI</span>
        </button>

        <button
          onClick={handleOpenScanner}
          className="flex flex-col items-center justify-center h-full text-amber-600 dark:text-amber-400 font-semibold"
        >
          <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-md -mt-3">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-stone-700 dark:text-stone-300 mt-0.5">Scan</span>
        </button>

        <button
          onClick={() => setIsScienceOpen(true)}
          className="flex flex-col items-center justify-center h-full text-stone-500 dark:text-stone-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
        >
          <FlaskConical className="w-5 h-5" />
          <span className="text-[10px] mt-1">Science</span>
        </button>

        <button
          onClick={() => setCurrentTab('database')}
          className={`flex flex-col items-center justify-center h-full transition-colors ${
            currentTab === 'database' ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          <Database className="w-5 h-5" />
          <span className="text-[10px] mt-1">Dishes</span>
        </button>
      </nav>

      {/* Snap & Log Photo Modal */}
      <ScanModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        userProfile={userProfile}
        onScanSuccess={handleScanSuccess}
        onOpenPaywall={() => setIsPaywallOpen(true)}
        onIncrementScanCount={handleIncrementScanCount}
      />

      {/* Confirm & Adjust 2-Tap Meal Modal */}
      {activeScanResult && (
        <ConfirmEditMealModal
          isOpen={isConfirmEditOpen}
          onClose={() => {
            setIsConfirmEditOpen(false);
            setActiveScanResult(null);
          }}
          scanResult={activeScanResult}
          imageUrl={activeScanImageUrl}
          onSaveMeal={handleSaveMeal}
          existingMealId={editingMealId}
        />
      )}

      {/* Onboarding & Goals Setup Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={(prof) => {
          setUserProfile(prof);
          if (user) syncProfileToFirestore(prof);
        }}
      />

      {/* Paywall & RevenueCat Simulator Modal */}
      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        userProfile={userProfile}
        onToggleProStatus={handleToggleProStatus}
      />

      {/* Multi-turn Gemini Chatbot Modal */}
      <GeminiChatbotModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userProfile={userProfile}
      />

      {/* Bioscience, PubChem, PubMed, Search & Maps Grounding Modal */}
      <BioscienceExplorerModal
        isOpen={isScienceOpen}
        onClose={() => setIsScienceOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
