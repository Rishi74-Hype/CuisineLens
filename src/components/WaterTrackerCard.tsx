import React, { useState } from 'react';
import { Droplets, Plus, Minus, Check, Edit2, RotateCcw, Sparkles } from 'lucide-react';

interface WaterTrackerCardProps {
  consumedGlasses: number;
  goalGlasses: number;
  onLogGlass: (delta: number) => void;
  onSetGlasses: (glasses: number) => void;
  onUpdateGoal: (newGoal: number) => void;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({
  consumedGlasses,
  goalGlasses,
  onLogGlass,
  onSetGlasses,
  onUpdateGoal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const mlPerGlass = 250;
  const consumedMl = consumedGlasses * mlPerGlass;
  const goalMl = goalGlasses * mlPerGlass;
  const percentage = Math.round((consumedGlasses / (goalGlasses || 8)) * 100);
  const isGoalAchieved = consumedGlasses >= goalGlasses;

  const handleSaveGoal = (newGoal: number) => {
    if (newGoal >= 1 && newGoal <= 30) {
      onUpdateGoal(newGoal);
      setIsEditingGoal(false);
    }
  };

  const displayCount = Math.max(goalGlasses, Math.min(consumedGlasses + 1, 16));
  const glassIndices = Array.from({ length: displayCount }, (_, i) => i + 1);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/60">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Daily Hydration Tracker
              </h2>
              {isGoalAchieved && (
                <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Goal Met</span>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{consumedGlasses}</strong> of{' '}
              <strong className="text-stone-900 dark:text-stone-100 tabular-nums">{goalGlasses}</strong> glasses (
              <span className="tabular-nums font-mono">{consumedMl}</span> / {goalMl} ml)
            </p>
          </div>
        </div>

        {/* Goal Edit Button / State */}
        <div className="flex items-center gap-2">
          {!isEditingGoal ? (
            <button
              onClick={() => setIsEditingGoal(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span>Goal: {goalGlasses} ({goalMl}ml)</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 p-1 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
              <span className="text-xs text-stone-500 dark:text-stone-400 pl-2">Glasses:</span>
              {[6, 8, 10, 12].map(preset => (
                <button
                  key={preset}
                  onClick={() => handleSaveGoal(preset)}
                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
                    goalGlasses === preset
                      ? 'bg-sky-600 text-white'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  }`}
                >
                  {preset}
                </button>
              ))}
              <button
                onClick={() => setIsEditingGoal(false)}
                className="px-2 py-1 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
          <span className="font-semibold text-stone-700 dark:text-stone-300">Hydration Progress</span>
          <span className="font-mono font-bold text-sky-700 dark:text-sky-400 tabular-nums">
            {percentage}%
          </span>
        </div>
        <div className="w-full h-3 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden p-0.5 border border-stone-200 dark:border-stone-700">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>

      {/* Interactive Glasses Grid */}
      <div>
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500 mb-2">
          <span>Tap any glass to set count directly:</span>
          <span className="font-mono text-[11px]">1 glass = 250ml</span>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {glassIndices.map(num => {
            const isFilled = num <= consumedGlasses;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onSetGlasses(num === consumedGlasses ? num - 1 : num)}
                className={`group relative p-2 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 min-h-[58px] ${
                  isFilled
                    ? 'border-sky-300 dark:border-sky-700 bg-sky-50/80 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 shadow-2xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 hover:border-sky-200 dark:hover:border-sky-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-400 dark:text-stone-500'
                }`}
                title={`Glass #${num} (${num * 250}ml)`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isFilled ? 'text-sky-600 dark:text-sky-400' : 'text-stone-300 dark:text-stone-600'
                  }`}
                >
                  <Droplets className="w-4 h-4 fill-current" />
                </div>
                <span className="text-[10px] font-mono font-bold tabular-nums">
                  #{num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Controls & Fast Log Buttons */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLogGlass(1)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-sky-600/20 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+1 Glass (250ml)</span>
          </button>

          <button
            type="button"
            onClick={() => onLogGlass(2)}
            className="flex items-center gap-1 px-3 py-2.5 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 font-semibold text-xs rounded-xl border border-sky-200 dark:border-sky-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+500ml Bottle</span>
          </button>

          <button
            type="button"
            disabled={consumedGlasses <= 0}
            onClick={() => onLogGlass(-1)}
            className="p-2.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none rounded-xl border border-stone-200 dark:border-stone-700 transition-colors"
            title="Undo last glass"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {consumedGlasses > 0 && (
          <button
            type="button"
            onClick={() => onSetGlasses(0)}
            className="flex items-center gap-1 text-[11px] font-medium text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Today</span>
          </button>
        )}
      </div>

      {/* Regional Nutrition Hydration Context */}
      <div className="bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-3 text-xs text-sky-950 dark:text-sky-200 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] text-stone-600 dark:text-stone-400">
          <strong className="text-sky-900 dark:text-sky-300">Regional Dining Note:</strong> Traditional dishes with potent digestive spices (cumin, black mustard, cayenne, ginger) and natural broths increase thermogenesis. Consistent hydration aids digestion and balances daily sodium.
        </p>
      </div>
    </div>
  );
};
