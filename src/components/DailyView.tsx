import React, { useState } from 'react';
import { Plus, Flame, Clock, Sparkles, ChevronRight, Edit3, Trash2, Camera, Info, ShieldCheck, AlertCircle, Bot, FlaskConical, MapPin, Search } from 'lucide-react';
import { UserProfile, MealLogItem, MealCategory } from '../types/nutrition.ts';
import { WaterTrackerCard } from './WaterTrackerCard.tsx';
import { calculateConsistencyStreak } from '../utils/nutritionCalculator.ts';

interface DailyViewProps {
  userProfile: UserProfile;
  mealLogs: MealLogItem[];
  waterConsumed: number;
  waterGoal: number;
  onLogWater: (delta: number) => void;
  onSetWater: (glasses: number) => void;
  onUpdateWaterGoal: (newGoal: number) => void;
  onOpenScanner: () => void;
  onEditMeal: (meal: MealLogItem) => void;
  onDeleteMeal: (id: string) => void;
  onOpenPaywall: () => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
  onOpenChat?: () => void;
  onOpenScience?: () => void;
}

export const DailyView: React.FC<DailyViewProps> = ({
  userProfile,
  mealLogs,
  waterConsumed,
  waterGoal,
  onLogWater,
  onSetWater,
  onUpdateWaterGoal,
  onOpenScanner,
  onEditMeal,
  onDeleteMeal,
  onOpenPaywall,
  onSelectDate,
  selectedDate,
  onOpenChat,
  onOpenScience,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | MealCategory>('All');

  // Filter meals for the selected date
  const filteredMeals = mealLogs.filter(meal => {
    const mealDate = meal.loggedAt.split('T')[0];
    const matchesDate = mealDate === selectedDate;
    if (!matchesDate) return false;
    if (activeCategoryFilter === 'All') return true;
    return meal.mealType === activeCategoryFilter;
  });

  // Calculate totals
  const totalCalories = filteredMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = filteredMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = filteredMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = filteredMeals.reduce((acc, m) => acc + m.fat, 0);
  const totalFiber = filteredMeals.reduce((acc, m) => acc + (m.fiber || 0), 0);
  const totalSodium = filteredMeals.reduce((acc, m) => acc + (m.sodium || 0), 0);

  const remainingCalories = userProfile.targetCalories - totalCalories;
  const caloriePercent = Math.round((totalCalories / (userProfile.targetCalories || 2000)) * 100);
  const clampedPercent = Math.min(100, Math.max(0, caloriePercent));

  // Consistency Streak Calculation
  const { streak, isTodayCounted } = calculateConsistencyStreak(
    mealLogs,
    userProfile.targetCalories,
    userProfile.goal
  );

  // Generate 7-day strip (selected date in center/recent)
  const today = new Date();
  const pastDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayAbbr = d.toLocaleDateString('en-US', { weekday: 'short' })[0];
    const dateNum = d.getDate();
    return { iso, dayAbbr, dateNum, isToday: iso === today.toISOString().split('T')[0] };
  });

  // Calorie ring SVG circle parameters
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-7">
      {/* 7-Day Date Scroller Strip */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
        {pastDays.map(day => {
          const isSelected = day.iso === selectedDate;
          return (
            <button
              key={day.iso}
              onClick={() => onSelectDate(day.iso)}
              className={`flex-1 min-w-[46px] max-w-[80px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-stone-900 dark:bg-amber-600 text-white shadow-md'
                  : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
              }`}
            >
              <span className={`text-[11px] font-semibold uppercase ${isSelected ? 'text-stone-300 dark:text-amber-100' : 'text-stone-400 dark:text-stone-500'}`}>
                {day.dayAbbr}
              </span>
              <span className="text-base font-bold tabular-nums">
                {day.dateNum}
              </span>
              {day.isToday && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-amber-400 dark:bg-white' : 'bg-amber-600 dark:bg-amber-400'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Consistency Streak Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-900 border border-amber-500/25 dark:border-amber-600/30 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
            <Flame className="w-6 h-6 fill-amber-500 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                {streak} Day Consistency Streak
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isTodayCounted
                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800'
                  : 'text-amber-800 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800'
              }`}>
                {isTodayCounted ? '✓ Target Met Today' : '⏳ Today in Progress'}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
              {streak > 0
                ? `${streak} consecutive day${streak === 1 ? '' : 's'} meeting your ${userProfile.targetCalories.toLocaleString()} kcal goal.`
                : `Hit your ${userProfile.targetCalories.toLocaleString()} kcal target today to start your consistency streak!`}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end text-right shrink-0">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400">Goal Adherence</span>
          <span className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 tabular-nums">
            {totalCalories.toLocaleString()} / {userProfile.targetCalories.toLocaleString()} kcal
          </span>
        </div>
      </div>

      {/* Main Grid: Calorie Ring & Macro Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Calorie Target Progress Ring */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                Daily Calorie Target
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Saved Goal: <strong className="text-stone-800 dark:text-stone-200 tabular-nums">{userProfile.targetCalories.toLocaleString()} kcal</strong>
              </p>
            </div>
            <div className="flex items-center gap-2 text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300/80 dark:border-amber-800/80 px-2.5 py-1 rounded-lg">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600 dark:text-amber-400" />
                <span className="tabular-nums">{streak}d streak</span>
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                caloriePercent > 100
                  ? 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800'
                  : 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800'
              }`}>
                {caloriePercent}% Consumed
              </span>
            </div>
          </div>

          {/* Visual Circular Progress Ring */}
          <div className="flex items-center justify-center py-5">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="text-stone-100 dark:text-stone-800"
                  strokeWidth="13"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Animated Percentage Consumed Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`${
                    caloriePercent > 100
                      ? 'text-rose-500'
                      : caloriePercent >= 80
                      ? 'text-amber-600'
                      : 'text-amber-500'
                  } transition-all duration-700 ease-out`}
                  strokeWidth="13"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>

              {/* Center Content: Prominent Percentage Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-4xl font-black text-stone-900 dark:text-white tabular-nums tracking-tight">
                  {caloriePercent}%
                </span>
                <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400 mt-0.5">
                  Target Consumed
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400 tabular-nums mt-1 font-mono">
                  {totalCalories.toLocaleString()} / {userProfile.targetCalories.toLocaleString()} kcal
                </span>
                <span className={`text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded ${
                  remainingCalories >= 0
                    ? 'text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
                }`}>
                  {remainingCalories >= 0
                    ? `${remainingCalories.toLocaleString()} kcal remaining`
                    : `${Math.abs(remainingCalories).toLocaleString()} kcal over goal`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${caloriePercent > 100 ? 'bg-rose-500' : 'bg-amber-600'}`} />
              <span>Consumed: <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{totalCalories.toLocaleString()} kcal</strong> ({caloriePercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300 dark:bg-stone-700" />
              <span>Target: <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{userProfile.targetCalories.toLocaleString()} kcal</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Macro Progress Bars & Regional Fat Calibration */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Macronutrients Breakdown
              </h2>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                Target: {userProfile.targetProtein}g Protein · {userProfile.targetCarbs}g Carbs · {userProfile.targetFat}g Fat
              </p>
            </div>
            {!userProfile.isPro && (
              <button
                onClick={onOpenPaywall}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1"
              >
                <span>Unlock Micronutrients</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Protein */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200">Protein</span>
                <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                  <strong className="text-stone-900 dark:text-stone-100">{totalProtein}g</strong> / {userProfile.targetProtein}g
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalProtein / userProfile.targetProtein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200">Carbohydrates</span>
                <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                  <strong className="text-stone-900 dark:text-stone-100">{totalCarbs}g</strong> / {userProfile.targetCarbs}g
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalCarbs / userProfile.targetCarbs) * 100)}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200">Healthy Fats & Cooking Oils</span>
                <span className="text-stone-500 dark:text-stone-400 tabular-nums">
                  <strong className="text-stone-900 dark:text-stone-100">{totalFat}g</strong> / {userProfile.targetFat}g
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalFat / userProfile.targetFat) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Secondary stats: Fiber & Sodium */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 grid grid-cols-2 gap-4">
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 border border-stone-100 dark:border-stone-800">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Dietary Fiber</span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">{totalFiber.toFixed(1)}g</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">Target: 30g+</span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-3 border border-stone-100 dark:border-stone-800">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">Estimated Sodium</span>
              <span className="text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">{totalSodium} mg</span>
              <span className="text-[10px] text-stone-400 dark:text-stone-500 block mt-0.5">Limit: &lt;2300 mg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Water Intake Tracker Card */}
      <WaterTrackerCard
        consumedGlasses={waterConsumed}
        goalGlasses={waterGoal}
        onLogGlass={onLogWater}
        onSetGlasses={onSetWater}
        onUpdateGoal={onUpdateWaterGoal}
      />

      {/* AI Nutritionist Chat & Bioscience Grounding Quick Triggers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Gemini Chatbot Trigger */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-stone-900 dark:to-stone-900 border border-amber-200/80 dark:border-amber-800/60 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>AI Regional Nutritionist</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-mono font-semibold">Gemini Multi-Turn</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-1">
                Ask about ghee vs oils, basmati glycemic impact, or speak with voice.
              </p>
            </div>
          </div>
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="shrink-0 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Open Chat
            </button>
          )}
        </div>

        {/* Bioscience, PubChem & Google Grounding Trigger */}
        <div className="bg-gradient-to-br from-cyan-500/10 via-cyan-500/5 to-transparent dark:from-cyan-950/30 dark:via-stone-900 dark:to-stone-900 border border-cyan-200/80 dark:border-cyan-800/60 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-4 transition-all hover:border-cyan-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-cyan-600/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Bioscience & Google Maps</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-200 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-200 font-mono font-semibold">Science</span>
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 line-clamp-1">
                PubChem 2D chemistry, PubMed citations & nearby ethnic markets.
              </p>
            </div>
          </div>
          {onOpenScience && (
            <button
              onClick={onOpenScience}
              className="shrink-0 px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Explore
            </button>
          )}
        </div>
      </div>

      {/* Meals Log Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Today's Meals
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {filteredMeals.length} meal{filteredMeals.length === 1 ? '' : 's'} logged for {selectedDate}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl overflow-x-auto">
            {(['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeCategoryFilter === cat
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Meal Cards List */}
        {filteredMeals.length === 0 ? (
          <div className="bg-white dark:bg-stone-900 rounded-3xl p-10 border border-stone-200 dark:border-stone-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              No meals logged for this view
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Snap a quick photo of your meal or choose from our authentic regional gallery to instantly calculate calories and macros.
            </p>
            <button
              onClick={onOpenScanner}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Log Meal with Photo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeals.map(meal => (
              <div
                key={meal.id}
                className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-amber-200 dark:hover:border-amber-700/60 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  {/* Meal Photo Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0 border border-stone-200 dark:border-stone-700 relative">
                    <img
                      src={meal.imageUrl}
                      alt={meal.dishName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={e => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-1 left-1 bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                      {meal.mealType}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {meal.dishName}
                        </h3>
                        {meal.nativeName && (
                          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium truncate">
                            {meal.nativeName}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                          {meal.calories}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 block -mt-1">kcal</span>
                      </div>
                    </div>

                    {/* Metadata line: zero-pill format with separators */}
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      <span>{meal.portion} ({meal.grams}g)</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{meal.cuisine}</span>
                    </div>

                    {/* Macro pill summary */}
                    <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600 dark:text-stone-300 mt-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                      <span>P: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{meal.protein}g</strong></span>
                      <span>C: <strong className="text-amber-600 dark:text-amber-400 font-semibold">{meal.carbs}g</strong></span>
                      <span>F: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{meal.fat}g</strong></span>
                    </div>
                  </div>
                </div>

                {/* Regional note or cooking fat */}
                {meal.cookingFat && (
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-800/80 px-2.5 py-1.5 rounded-lg flex items-center justify-between border border-stone-100 dark:border-stone-800">
                    <span className="truncate">Fat Profile: <strong>{meal.cookingFat}</strong></span>
                    {meal.confidenceScore && (
                      <span className="text-stone-400 dark:text-stone-500 font-mono text-[10px]">
                        AI: {meal.confidenceScore}%
                      </span>
                    )}
                  </div>
                )}

                {/* Actions: Edit & Delete */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => onEditMeal(meal)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Adjust / Swap</span>
                  </button>
                  <button
                    onClick={() => onDeleteMeal(meal.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 z-20 flex items-center gap-3">
        <button
          onClick={onOpenScanner}
          className="flex-1 h-12 rounded-xl bg-amber-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-[0.98] transition-transform"
        >
          <Camera className="w-5 h-5" />
          <span>Snap Meal Photo</span>
        </button>
      </div>
    </div>
  );
};
