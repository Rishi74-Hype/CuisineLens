import React, { useState } from 'react';
import { Target, User, Activity, Globe, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { UserProfile, GoalType, GenderType, ActivityLevel, CuisineType } from '../types/nutrition.ts';
import { calculateCalorieTargets } from '../utils/nutritionCalculator.ts';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(currentProfile.name || 'Alex');
  const [goal, setGoal] = useState<GoalType>(currentProfile.goal || 'lose');
  const [weightKg, setWeightKg] = useState(currentProfile.currentWeightKg || 72);
  const [targetWeightKg, setTargetWeightKg] = useState(currentProfile.targetWeightKg || 68);
  const [heightCm, setHeightCm] = useState(currentProfile.heightCm || 175);
  const [age, setAge] = useState(currentProfile.age || 28);
  const [gender, setGender] = useState<GenderType>(currentProfile.gender || 'male');
  const [activity, setActivity] = useState<ActivityLevel>(currentProfile.activityLevel || 'moderate');
  const [cuisineFocus, setCuisineFocus] = useState<CuisineType>(currentProfile.cuisineFocus || 'South Asian');

  if (!isOpen) return null;

  // Real-time target calculation preview
  const preview = calculateCalorieTargets(weightKg, heightCm, age, gender, activity, goal);

  const handleFinish = () => {
    const updated: UserProfile = {
      ...currentProfile,
      name,
      goal,
      currentWeightKg: weightKg,
      targetWeightKg,
      heightCm,
      age,
      gender,
      activityLevel: activity,
      cuisineFocus,
      targetCalories: preview.calories,
      targetProtein: preview.protein,
      targetCarbs: preview.carbs,
      targetFat: preview.fat,
      isOnboarded: true,
    };
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              {step}/3
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {step === 1 && 'Nutrition Goal & Body Metrics'}
                {step === 2 && 'Daily Activity & Lifestyle'}
                {step === 3 && 'Regional Cuisine & Target Review'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Calibrates BMR, TDEE, and regional meal portion targets
              </p>
            </div>
          </div>
          {currentProfile.isOnboarded && (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
            >
              Skip
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2">
                  What is your primary goal?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'lose', label: 'Lose Fat', desc: '-500 kcal deficit' },
                    { id: 'maintain', label: 'Maintain', desc: 'Balanced energy' },
                    { id: 'gain', label: 'Gain Muscle', desc: '+400 kcal surplus' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGoal(g.id as GoalType)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        goal === g.id
                          ? 'border-amber-600 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/50 text-stone-900 dark:text-stone-100 font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="block text-xs">{g.label}</span>
                      <span className="block text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Current Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={weightKg}
                    onChange={e => setWeightKg(parseFloat(e.target.value) || 70)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Target Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="40"
                    max="220"
                    value={targetWeightKg}
                    onChange={e => setTargetWeightKg(parseFloat(e.target.value) || 68)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={heightCm}
                    onChange={e => setHeightCm(parseInt(e.target.value, 10) || 170)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={age}
                    onChange={e => setAge(parseInt(e.target.value, 10) || 28)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as GenderType)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                Daily Physical Activity Level
              </label>
              <div className="space-y-2">
                {[
                  { id: 'sedentary', label: 'Sedentary', desc: 'Desk job, minimal exercise (1.2x BMR)' },
                  { id: 'light', label: 'Lightly Active', desc: 'Light workouts 1–3 days/week (1.375x BMR)' },
                  { id: 'moderate', label: 'Moderately Active', desc: 'Moderate exercise 3–5 days/week (1.55x BMR)' },
                  { id: 'active', label: 'Very Active', desc: 'Hard exercise 6–7 days/week (1.725x BMR)' },
                ].map(act => (
                  <button
                    key={act.id}
                    type="button"
                    onClick={() => setActivity(act.id as ActivityLevel)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      activity === act.id
                        ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-stone-900 dark:text-stone-100 font-bold'
                        : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold block">{act.label}</span>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 block">{act.desc}</span>
                    </div>
                    {activity === act.id && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-1.5">
                  Primary Regional Cuisine Specialization
                </label>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mb-2">
                  Optimizes AI prompts and dish databases for authentic cooking oils and staples.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'South Asian', label: 'South Asian / Indian', sub: 'Ghee, curries, lentils, rotis' },
                    { id: 'Mexican', label: 'Mexican & Latin', sub: 'Corn masa, chiles, pork, beans' },
                    { id: 'East Asian', label: 'East Asian', sub: 'Ramen, bibimbap, sesame oil' },
                    { id: 'Southeast Asian', label: 'Southeast Asian', sub: 'Pho, pad thai, rice noodles' },
                    { id: 'Mediterranean', label: 'Mediterranean', sub: 'Olive oil, hummus, shawarma' },
                    { id: 'All Regional', label: 'All Regional Dishes', sub: 'Universal regional tracker' },
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCuisineFocus(c.id as CuisineType)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        cuisineFocus === c.id
                          ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-stone-900 dark:text-stone-100 font-bold'
                          : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/80 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <span className="text-xs font-semibold block">{c.label}</span>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">{c.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Computed Target Energy Ring Card */}
              <div className="bg-stone-900 dark:bg-stone-950 text-white rounded-2xl p-4 space-y-3 border border-transparent dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wide text-stone-400 font-semibold block">
                      Recommended Calorie Target
                    </span>
                    <span className="text-3xl font-black text-amber-400 tabular-nums">
                      {preview.calories} <span className="text-sm font-normal text-stone-300">kcal/day</span>
                    </span>
                  </div>
                  <div className="text-right text-xs text-stone-300">
                    <span className="block font-semibold">{goal.toUpperCase()}</span>
                    <span className="text-[10px] text-stone-400">Mifflin-St Jeor formula</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-800 text-center font-mono">
                  <div className="bg-stone-800/80 dark:bg-stone-900 rounded-xl p-2">
                    <span className="text-[10px] text-stone-400 block font-sans">Protein</span>
                    <span className="text-sm font-bold text-rose-400 tabular-nums">{preview.protein}g</span>
                  </div>
                  <div className="bg-stone-800/80 dark:bg-stone-900 rounded-xl p-2">
                    <span className="text-[10px] text-stone-400 block font-sans">Carbs</span>
                    <span className="text-sm font-bold text-amber-400 tabular-nums">{preview.carbs}g</span>
                  </div>
                  <div className="bg-stone-800/80 dark:bg-stone-900 rounded-xl p-2">
                    <span className="text-[10px] text-stone-400 block font-sans">Fat</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">{preview.fat}g</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 transition-colors">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save & Start Tracking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
