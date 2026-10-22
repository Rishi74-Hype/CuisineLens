import React, { useState } from 'react';
import { Search, Database, Plus, ChevronRight, ShieldCheck, Flame, BookOpen } from 'lucide-react';
import { REGIONAL_DISHES, RegionalDish } from '../data/regionalDishes.ts';
import { CuisineType, MealLogItem } from '../types/nutrition.ts';
import { AudioTranscriberButton } from './AudioTranscriberButton.tsx';

interface RegionalDishesExplorerProps {
  onQuickLogDish: (dish: RegionalDish) => void;
  onOpenScanner: () => void;
}

export const RegionalDishesExplorer: React.FC<RegionalDishesExplorerProps> = ({
  onQuickLogDish,
  onOpenScanner,
}) => {
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortionView, setSelectedPortionView] = useState<'Small' | 'Medium' | 'Large'>('Medium');

  const cuisines = ['All', 'South Asian', 'Mexican', 'East Asian', 'Southeast Asian', 'Mediterranean'];

  const filteredDishes = REGIONAL_DISHES.filter(d => {
    const matchesCuisine = selectedCuisine === 'All' || d.cuisine === selectedCuisine;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery ||
      d.name.toLowerCase().includes(q) ||
      (d.nativeName && d.nativeName.toLowerCase().includes(q)) ||
      d.regionOrStyle.toLowerCase().includes(q) ||
      d.commonIngredients.some(ing => ing.toLowerCase().includes(q));

    return matchesCuisine && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-transparent dark:border-stone-800">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wide uppercase">
            <Database className="w-4 h-4" />
            <span>The Regional Nutrition Moat</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curated Regional Dish Database
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Standard Western trackers fail on ethnic meals because they misestimate rich cooking fats (ghee, sesame oil, lard) and regional staple portions. Our database calibrates authentic preparations.
          </p>
        </div>
        <button
          onClick={onOpenScanner}
          className="shrink-0 px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20"
        >
          Scan Photo with AI
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Input with Microphone */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search dishes, ingredients (e.g. biryani, ghee, ramen, masa)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500 transition-colors"
              />
            </div>
            <AudioTranscriberButton
              onTranscribe={(txt) => setSearchQuery(txt)}
            />
          </div>

          {/* S / M / L Global Portion Toggle */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 dark:text-stone-400 font-medium">Show Serving:</span>
            <div className="p-1 bg-stone-100 dark:bg-stone-800 rounded-xl flex items-center gap-1">
              {(['Small', 'Medium', 'Large'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPortionView(p)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    selectedPortionView === p
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cuisine Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {cuisines.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap ${
                selectedCuisine === c
                  ? 'bg-stone-900 dark:bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Dish Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDishes.map(dish => {
          const portionData = dish.portions[selectedPortionView];
          return (
            <div
              key={dish.id}
              className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:border-amber-300 dark:hover:border-amber-600/60 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Photo Thumbnail if available */}
                {dish.sampleImage && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 relative">
                    <img
                      src={dish.sampleImage}
                      alt={dish.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {dish.regionOrStyle}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                        {dish.name}
                      </h3>
                      {dish.nativeName && (
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {dish.nativeName}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-extrabold text-stone-900 dark:text-stone-100 tabular-nums">
                        {portionData.macros.calories}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 block -mt-1">kcal</span>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mt-1">
                    <span>{dish.cuisine}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dish.regionOrStyle}</span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedPortionView} ({portionData.grams}g)</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>

                {/* Macro breakdown */}
                <div className="grid grid-cols-4 gap-1.5 p-2 bg-stone-50 dark:bg-stone-850 rounded-xl text-center font-mono text-xs border border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-sans">Protein</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 tabular-nums">{portionData.macros.protein}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-sans">Carbs</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{portionData.macros.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-sans">Fat</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{portionData.macros.fat}g</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-sans">Fiber</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">{portionData.macros.fiber}g</span>
                  </div>
                </div>

                {/* Regional insight */}
                <div className="text-[11px] text-stone-500 dark:text-stone-400 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-amber-900 dark:text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span>Regional Cooking Fat: {dish.cookingFat}</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 line-clamp-2">
                    {dish.nutritionalInsight}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onQuickLogDish(dish)}
                className="w-full py-2.5 px-4 bg-stone-900 dark:bg-amber-600 hover:bg-stone-800 dark:hover:bg-amber-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Log to Meal Tracker</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
