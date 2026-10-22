import React, { useState, useEffect } from 'react';
import { Check, X, ArrowLeftRight, Sliders, Flame, Sparkles, AlertTriangle, ShieldCheck, Search, Plus } from 'lucide-react';
import { MealLogItem, ScanResult, MealCategory, MealIngredient } from '../types/nutrition.ts';
import { REGIONAL_DISHES, findDishByKeywords } from '../data/regionalDishes.ts';

interface ConfirmEditMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: ScanResult;
  imageUrl: string;
  onSaveMeal: (meal: MealLogItem) => void;
  existingMealId?: string; // If editing an existing logged meal
  initialMealType?: MealCategory;
}

export const ConfirmEditMealModal: React.FC<ConfirmEditMealModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  imageUrl,
  onSaveMeal,
  existingMealId,
  initialMealType,
}) => {
  // Determine default meal category based on current local hour if not passed
  const getDefaultMealType = (): MealCategory => {
    if (initialMealType) return initialMealType;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 16) return 'Lunch';
    if (hour >= 16 && hour < 22) return 'Dinner';
    return 'Snack';
  };

  const [dishName, setDishName] = useState(scanResult.dishName);
  const [nativeName, setNativeName] = useState(scanResult.nativeName || '');
  const [cuisine, setCuisine] = useState(scanResult.cuisine);
  const [mealType, setMealType] = useState<MealCategory>(getDefaultMealType());
  const [portion, setPortion] = useState<'Small' | 'Medium' | 'Large'>(scanResult.suggestedPortion || 'Medium');
  const [grams, setGrams] = useState(scanResult.estimatedGrams || 350);

  // Base values from scan
  const baseCalories = scanResult.calories;
  const baseProtein = scanResult.protein;
  const baseCarbs = scanResult.carbs;
  const baseFat = scanResult.fat;
  const baseFiber = scanResult.fiber || 4;
  const baseSodium = scanResult.sodium || 850;
  const baseGrams = scanResult.estimatedGrams || 350;

  // Modifiers applied
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [showSwapSearch, setShowSwapSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize state when scanResult updates
  useEffect(() => {
    setDishName(scanResult.dishName);
    setNativeName(scanResult.nativeName || '');
    setCuisine(scanResult.cuisine);
    setPortion(scanResult.suggestedPortion || 'Medium');
    setGrams(scanResult.estimatedGrams || 350);
    setSelectedModifiers([]);
    setShowSwapSearch(false);
  }, [scanResult]);

  if (!isOpen) return null;

  // Portion multiplier calculation
  const portionMultiplier = portion === 'Small' ? 0.75 : portion === 'Large' ? 1.35 : 1.0;
  
  // Custom slider scale factor relative to base grams
  const gramScale = grams / (baseGrams || 350);

  // Common quick modifiers
  const availableModifiers = [
    { id: 'extra-oil', name: 'Extra Ghee / Cooking Oil', kcal: 110, desc: '+1 tbsp cooking fat' },
    { id: 'lean-swap', name: 'Double Protein / Less Starch', kcal: -40, desc: 'Higher meat/paneer, less rice' },
    { id: 'side-bread', name: 'With Extra Roti / Tortilla', kcal: 130, desc: '+1 piece warm flatbread' },
    { id: 'no-cream', name: 'No Heavy Gravy / Cream', kcal: -80, desc: 'Leaner preparation' },
  ];

  const toggleModifier = (modName: string) => {
    setSelectedModifiers(prev =>
      prev.includes(modName) ? prev.filter(m => m !== modName) : [...prev, modName]
    );
  };

  // Calculate dynamic calories with portion & modifiers
  const modifierKcalDelta = selectedModifiers.reduce((acc, modName) => {
    const mod = availableModifiers.find(m => m.name === modName);
    return acc + (mod ? mod.kcal : 0);
  }, 0);

  const calculatedCalories = Math.max(50, Math.round(baseCalories * gramScale + modifierKcalDelta));
  const calculatedProtein = Math.max(1, Math.round(baseProtein * gramScale));
  const calculatedCarbs = Math.max(1, Math.round(baseCarbs * gramScale));
  const calculatedFat = Math.max(1, Math.round(baseFat * gramScale + (selectedModifiers.includes('Extra Ghee / Cooking Oil') ? 12 : 0)));
  const calculatedFiber = Math.max(0, Math.round(baseFiber * gramScale));
  const calculatedSodium = Math.max(50, Math.round(baseSodium * gramScale));

  // Handle swapping dish to an alternative
  const handleSwapDish = (newDishName: string, newCalories: number) => {
    setDishName(newDishName);
    const dbMatch = findDishByKeywords(newDishName);
    if (dbMatch) {
      setNativeName(dbMatch.nativeName || '');
      setCuisine(`${dbMatch.cuisine} / ${dbMatch.regionOrStyle}`);
      const mPortion = dbMatch.portions[portion];
      setGrams(mPortion.grams);
    }
    setShowSwapSearch(false);
  };

  // Handle quick portion button click
  const handlePortionSelect = (newPortion: 'Small' | 'Medium' | 'Large') => {
    setPortion(newPortion);
    if (newPortion === 'Small') {
      setGrams(Math.round(baseGrams * 0.75));
    } else if (newPortion === 'Large') {
      setGrams(Math.round(baseGrams * 1.35));
    } else {
      setGrams(baseGrams);
    }
  };

  const handleSave = () => {
    const mealItem: MealLogItem = {
      id: existingMealId || `meal-${Date.now()}`,
      dishName,
      nativeName,
      cuisine,
      mealType,
      portion,
      grams,
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      fiber: calculatedFiber,
      sodium: calculatedSodium,
      cookingFat: scanResult.cookingFatDetected || 'Authentic Regional Fat',
      imageUrl,
      loggedAt: new Date().toISOString(),
      confidenceScore: scanResult.confidenceScore,
      regionalNutritionNote: scanResult.regionalNutritionNote,
      modifiersApplied: selectedModifiers,
      ingredients: scanResult.ingredients,
    };

    onSaveMeal(mealItem);
  };

  // Filtered dishes for swap search
  const filteredDishes = REGIONAL_DISHES.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.regionOrStyle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] transition-colors">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Confirm or Adjust Regional Meal
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              AI estimated from photo · Tap any metric or portion to adjust
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Dish Spotlight Card */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Image Preview */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200 dark:border-stone-700 relative">
              <img
                src={imageUrl}
                alt={dishName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 right-1 bg-stone-900/80 backdrop-blur-xs text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                {scanResult.confidenceScore}% AI
              </div>
            </div>

            {/* Dish Title & Swap Trigger */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                    {dishName}
                  </h3>
                  {nativeName && (
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                      {nativeName}
                    </p>
                  )}
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {cuisine}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSwapSearch(!showSwapSearch)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 hover:bg-amber-200 dark:hover:bg-amber-900/70 rounded-lg transition-colors border border-amber-300 dark:border-amber-800/80"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Swap Dish</span>
                </button>
              </div>

              {scanResult.cookingFatDetected && (
                <div className="text-[11px] text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Cooking Fat: <strong className="text-stone-900 dark:text-stone-200">{scanResult.cookingFatDetected}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Swap Drawer (if user clicked Swap Dish) */}
          {showSwapSearch && (
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 dark:text-amber-300 uppercase tracking-wide">
                  Quick Swap to Another Regional Dish
                </span>
                <button
                  onClick={() => setShowSwapSearch(false)}
                  className="text-xs text-amber-800 dark:text-amber-400 hover:text-amber-950 dark:hover:text-amber-200 font-medium"
                >
                  Cancel
                </button>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search 100+ authentic regional dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-stone-800 border border-amber-300 dark:border-amber-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* AI Suggested Alternatives */}
              {scanResult.alternativeDishes && scanResult.alternativeDishes.length > 0 && !searchQuery && (
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block mb-1.5">
                    AI Suggested Alternatives:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.alternativeDishes.map((alt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSwapDish(alt.dishName, alt.calories)}
                        className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-800 dark:text-stone-200 rounded-lg border border-amber-200 dark:border-amber-900/60 transition-colors shadow-2xs"
                      >
                        {alt.dishName} ({alt.calories} kcal)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtered Database Results */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredDishes.slice(0, 6).map(dish => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => handleSwapDish(dish.name, dish.portions.Medium.macros.calories)}
                    className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-white dark:hover:bg-stone-800 flex items-center justify-between text-stone-800 dark:text-stone-200 transition-colors"
                  >
                    <span className="font-semibold">{dish.name}</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                      {dish.portions.Medium.macros.calories} kcal · {dish.regionOrStyle}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TWO-TAP PORTION ADJUSTER (Most Important Feature) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
                  Step 1: Choose Serving Portion
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Tap Small, Medium, or Large for instant recalibration
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                {grams}g serving
              </span>
            </div>

            {/* 3-Button Segmented Control */}
            <div className="grid grid-cols-3 gap-2">
              {(['Small', 'Medium', 'Large'] as const).map(p => {
                const isSelected = portion === p;
                const gramEst = p === 'Small' ? Math.round(baseGrams * 0.75) : p === 'Large' ? Math.round(baseGrams * 1.35) : baseGrams;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePortionSelect(p)}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-600 text-white font-bold shadow-sm'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium'
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wide">{p}</span>
                    <span className={`block text-[11px] mt-0.5 ${isSelected ? 'text-amber-100' : 'text-stone-400 dark:text-stone-500 font-mono'}`}>
                      ~{gramEst}g
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Exact Gram Weight Slider */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                <span>Fine-tune grams:</span>
                <span className="font-mono font-semibold text-stone-800 dark:text-stone-200 tabular-nums">{grams} grams</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="10"
                value={grams}
                onChange={(e) => setGrams(parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Meal Category & Time Slot */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
              Step 2: Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealCategory[]).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setMealType(cat)}
                  className={`py-2 px-2 text-xs rounded-xl font-medium border text-center transition-all ${
                    mealType === cat
                      ? 'border-stone-900 dark:border-amber-500 bg-stone-900 dark:bg-amber-600 text-white font-semibold'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Regional Cooking Modifiers */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wide">
              Authentic Cooking Modifiers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {availableModifiers.map(mod => {
                const isChecked = selectedModifiers.includes(mod.name);
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => toggleModifier(mod.name)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-start justify-between gap-2 ${
                      isChecked
                        ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-stone-900 dark:text-stone-100'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{mod.name}</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">{mod.desc}</span>
                    </div>
                    <span className={`text-[11px] font-mono font-bold shrink-0 ${mod.kcal > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {mod.kcal > 0 ? `+${mod.kcal}` : mod.kcal} kcal
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calculated Live Nutrition Summary Card */}
          <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-2xl p-4 space-y-3 border border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wide text-stone-400 font-semibold block">
                  Calibrated Total
                </span>
                <span className="text-3xl font-black text-amber-400 tabular-nums">
                  {calculatedCalories} <span className="text-sm font-normal text-stone-300">kcal</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-stone-400 block font-mono">
                  Portion: {portion} ({grams}g)
                </span>
                {selectedModifiers.length > 0 && (
                  <span className="text-[10px] text-amber-300 block">
                    {selectedModifiers.length} modifier{selectedModifiers.length > 1 ? 's' : ''} applied
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-stone-800 text-center font-mono">
              <div className="bg-stone-800/80 dark:bg-stone-900/90 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 block font-sans">Protein</span>
                <span className="text-sm font-bold text-rose-400 tabular-nums">{calculatedProtein}g</span>
              </div>
              <div className="bg-stone-800/80 dark:bg-stone-900/90 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 block font-sans">Carbs</span>
                <span className="text-sm font-bold text-amber-400 tabular-nums">{calculatedCarbs}g</span>
              </div>
              <div className="bg-stone-800/80 dark:bg-stone-900/90 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 block font-sans">Fat</span>
                <span className="text-sm font-bold text-emerald-400 tabular-nums">{calculatedFat}g</span>
              </div>
              <div className="bg-stone-800/80 dark:bg-stone-900/90 rounded-xl p-2">
                <span className="text-[10px] text-stone-400 block font-sans">Fiber</span>
                <span className="text-sm font-bold text-cyan-400 tabular-nums">{calculatedFiber}g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 transition-colors">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Log Meal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
