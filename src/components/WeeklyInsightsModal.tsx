import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, RefreshCw, Heart, ShieldAlert, Award, Calendar, ChevronRight } from 'lucide-react';
import { UserProfile, MealLogItem } from '../types/nutrition.ts';

interface WeeklyInsightsModalProps {
  userProfile: UserProfile;
  mealLogs: MealLogItem[];
  onOpenPaywall: () => void;
  onOpenScanner: () => void;
}

export const WeeklyInsightsModal: React.FC<WeeklyInsightsModalProps> = ({
  userProfile,
  mealLogs,
  onOpenPaywall,
  onOpenScanner,
}) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null);

  // Group meals across the last 7 days
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayMeals = mealLogs.filter(m => m.loggedAt.split('T')[0] === iso);
    const dayCalories = dayMeals.reduce((acc, m) => acc + m.calories, 0);
    const dayProtein = dayMeals.reduce((acc, m) => acc + m.protein, 0);
    const dayCarbs = dayMeals.reduce((acc, m) => acc + m.carbs, 0);
    const dayFat = dayMeals.reduce((acc, m) => acc + m.fat, 0);
    return {
      iso,
      dayLabel,
      dateNum: d.getDate(),
      calories: dayCalories,
      protein: dayProtein,
      carbs: dayCarbs,
      fat: dayFat,
      mealsCount: dayMeals.length,
      target: userProfile.targetCalories,
    };
  });

  const totalWeeklyCalories = last7Days.reduce((acc, d) => acc + d.calories, 0);
  const daysWithLogs = last7Days.filter(d => d.calories > 0);
  const avgDailyCalories = daysWithLogs.length > 0 ? Math.round(totalWeeklyCalories / daysWithLogs.length) : 0;
  const daysOnTarget = last7Days.filter(d => d.calories > 0 && d.calories <= userProfile.targetCalories).length;

  const fetchAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/nutrition-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meals: mealLogs.slice(-6),
          userGoal: userProfile.goal,
          calorieTarget: userProfile.targetCalories,
          consumedCalories: avgDailyCalories || 1800,
        }),
      });
      const data = await response.json();
      if (data.success && data.advice) {
        setAdvice(data.advice);
      }
    } catch (e) {
      console.error('Failed to fetch advice', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [mealLogs.length]);

  // Line Chart Coordinates Math
  const maxCaloriesInWeek = Math.max(...last7Days.map(d => d.calories), userProfile.targetCalories);
  const yMax = Math.ceil((maxCaloriesInWeek * 1.25) / 500) * 500; // Round up to nearest 500
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 52;
  const paddingRight = 32;
  const paddingTop = 25;
  const paddingBottom = 35;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = svgHeight - paddingTop - paddingBottom;

  const getY = (val: number) => {
    const ratio = Math.min(1, Math.max(0, val / yMax));
    return paddingTop + plotHeight - ratio * plotHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (last7Days.length - 1)) * plotWidth;
  };

  const points = last7Days.map((d, i) => ({
    x: getX(i),
    y: getY(d.calories),
    ...d,
  }));

  // Create smooth SVG cubic bezier path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const linePathData = createSmoothPath(points);
  const areaPathData = `${linePathData} L ${points[points.length - 1].x},${paddingTop + plotHeight} L ${points[0].x},${paddingTop + plotHeight} Z`;
  const targetY = getY(userProfile.targetCalories);

  // Y-axis grid marks
  const yTicks = [0, Math.round(yMax * 0.33), Math.round(yMax * 0.66), yMax];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Regional Culinary Nutrition Insights
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            7-day trends, calorie trajectory line charts, and dietitian advice
          </p>
        </div>
        <button
          onClick={fetchAdvice}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl border border-stone-200 dark:border-stone-700 transition-colors w-fit shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* AI Dietitian Assessment Card */}
      <div className="bg-gradient-to-br from-amber-900 via-stone-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 border border-transparent dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center border border-amber-400/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              AI Regional Dietitian Assessment
            </span>
          </div>
          <span className="text-xs text-stone-300 font-medium">
            Goal: <strong className="text-white uppercase">{userProfile.goal}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="py-6 flex items-center justify-center gap-2 text-stone-300 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>Analyzing your regional meals and macro distribution...</span>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed font-sans">
            {advice ||
              `Your regional meals are rich in micronutrients and digestive spices. To hit your ${userProfile.goal} goal consistently, be mindful of hidden cooking fats (ghee, sesame oil) and balance starchy staples with abundant fiber-rich lentils and greens.`}
          </p>
        )}

        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
          <div className="flex items-center gap-4">
            <span>
              7-Day Average:{' '}
              <strong className="text-white tabular-nums">
                {avgDailyCalories.toLocaleString()} kcal/day
              </strong>
            </span>
            <span>
              Target:{' '}
              <strong className="text-white tabular-nums">
                {userProfile.targetCalories.toLocaleString()} kcal
              </strong>
            </span>
          </div>
          <span className="text-amber-300 font-medium">
            {daysOnTarget > 0 ? `✓ ${daysOnTarget} of ${daysWithLogs.length} days on target` : 'Logged meals in progress'}
          </span>
        </div>
      </div>

      {/* 7-DAY CALORIE TREND: LINE CHART & BAR CHART */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 border border-stone-200 dark:border-stone-800 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Calorie Consumption Over Last 7 Days
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Trajectory compared against your saved daily goal of{' '}
              <strong className="text-stone-800 dark:text-stone-200 tabular-nums font-mono">
                {userProfile.targetCalories.toLocaleString()} kcal
              </strong>
            </p>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'line'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Line Chart</span>
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Bar Chart</span>
            </button>
          </div>
        </div>

        {/* Selected Data Point Callout (if hovered) */}
        {hoveredDayIdx !== null && points[hoveredDayIdx] && (
          <div className="p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center justify-between text-xs text-stone-700 dark:text-stone-300 animate-fadeIn">
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100">
                {points[hoveredDayIdx].dayLabel}, {points[hoveredDayIdx].iso}
              </span>
              <span className="text-stone-500 dark:text-stone-400 ml-2">
                ({points[hoveredDayIdx].mealsCount} meal{points[hoveredDayIdx].mealsCount === 1 ? '' : 's'} logged)
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span>
                Calories:{' '}
                <strong className="text-amber-700 dark:text-amber-400 font-bold tabular-nums">
                  {points[hoveredDayIdx].calories.toLocaleString()} kcal
                </strong>
              </span>
              <span className="text-stone-400 dark:text-stone-600">·</span>
              <span className="text-stone-500 dark:text-stone-400">
                P:{points[hoveredDayIdx].protein}g C:{points[hoveredDayIdx].carbs}g F:{points[hoveredDayIdx].fat}g
              </span>
            </div>
          </div>
        )}

        {/* LINE CHART VIEW */}
        {chartType === 'line' && (
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="calorieAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.32" />
                  <stop offset="70%" stopColor="#d97706" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines & Y-axis labels */}
              {yTicks.map(tick => {
                const y = getY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      className="stroke-stone-100 dark:stroke-stone-800"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] fill-stone-400 dark:fill-stone-500 font-mono"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Target Goal Reference Line */}
              <line
                x1={paddingLeft}
                y1={targetY}
                x2={svgWidth - paddingRight}
                y2={targetY}
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={svgWidth - paddingRight}
                y={targetY - 6}
                textAnchor="end"
                className="text-[10px] font-bold fill-amber-700 dark:fill-amber-400 font-mono"
              >
                Goal: {userProfile.targetCalories} kcal
              </text>

              {/* Gradient Area under Line */}
              <path d={areaPathData} fill="url(#calorieAreaGradient)" />

              {/* Calorie Trend Polyline */}
              <path
                d={linePathData}
                fill="none"
                stroke="#d97706"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points (Circles) */}
              {points.map((pt, idx) => {
                const isHovered = hoveredDayIdx === idx;
                const isOver = pt.calories > userProfile.targetCalories;
                const isEmpty = pt.calories === 0;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDayIdx(idx)}
                    onMouseLeave={() => setHoveredDayIdx(null)}
                    onClick={() => setHoveredDayIdx(idx)}
                  >
                    {/* Hover Hitbox */}
                    <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                    {/* Outer pulse when active */}
                    {isHovered && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="9"
                        fill="#d97706"
                        opacity="0.2"
                      />
                    )}

                    {/* Point Circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? '6' : '4.5'}
                      fill={isEmpty ? '#78716c' : isOver ? '#f43f5e' : '#d97706'}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-white dark:text-stone-900 transition-all duration-200"
                    />

                    {/* Calorie value label above node if calories > 0 */}
                    {pt.calories > 0 && (
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        className={`text-[10px] font-mono font-bold ${
                          isHovered ? 'fill-stone-900 dark:fill-stone-100 text-xs' : 'fill-stone-600 dark:fill-stone-400'
                        }`}
                      >
                        {pt.calories}
                      </text>
                    )}

                    {/* Day Label on X Axis */}
                    <text
                      x={pt.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-semibold ${
                        isHovered ? 'fill-stone-900 dark:fill-stone-100 font-bold' : 'fill-stone-500 dark:fill-stone-400'
                      }`}
                    >
                      {pt.dayLabel}
                    </text>
                    <text
                      x={pt.x}
                      y={svgHeight - 1}
                      textAnchor="middle"
                      className="text-[9px] fill-stone-400 dark:fill-stone-500 font-mono"
                    >
                      {pt.dateNum}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* BAR CHART VIEW (Alternative toggle) */}
        {chartType === 'bar' && (
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-stone-100 dark:border-stone-800">
            {last7Days.map((day, idx) => {
              const maxKcal = Math.max(userProfile.targetCalories * 1.3, 2600);
              const heightPercent = Math.min(100, Math.round((day.calories / maxKcal) * 100));
              const isTargetMet = day.calories > 0 && day.calories <= userProfile.targetCalories;
              const isOver = day.calories > userProfile.targetCalories;

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer"
                  onMouseEnter={() => setHoveredDayIdx(idx)}
                  onMouseLeave={() => setHoveredDayIdx(null)}
                >
                  <span className="text-[10px] font-mono font-semibold text-stone-600 dark:text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                    {day.calories > 0 ? `${day.calories}` : '0'}
                  </span>
                  <div className="w-full max-w-[42px] bg-stone-100 dark:bg-stone-800 rounded-t-xl h-full flex items-end overflow-hidden p-0.5">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.calories === 0
                          ? 'bg-transparent'
                          : isOver
                          ? 'bg-rose-500'
                          : isTargetMet
                          ? 'bg-amber-600'
                          : 'bg-stone-400 dark:bg-stone-600'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <span className="block text-[11px] font-bold text-stone-800 dark:text-stone-200">
                      {day.dayLabel}
                    </span>
                    <span className="block text-[10px] text-stone-400 dark:text-stone-500 tabular-nums">
                      {day.dateNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-600" />
              <span>Calorie Intake Line</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 border-b-2 border-dashed border-amber-600" />
              <span>Target ({userProfile.targetCalories} kcal)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Over Goal</span>
            </span>
          </div>
          <span className="text-[11px] text-stone-400 dark:text-stone-500">
            Hover or tap points to view exact macros
          </span>
        </div>
      </div>

      {/* Regional Culinary Health Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Digestive Spices Moat
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Authentic spices (turmeric curcumin, cumin, roasted coriander, star anise, ginger) improve gut motility and insulin sensitivity.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Hidden Oil Awareness
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            In rich gravies, a single tablespoon of untracked clarified butter or fried oil adds 110–130 kcal. Use our 2-tap portion modifier to calibrate your meal.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-sm space-y-2 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            Staple Starch Balancing
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            When meals feature both rice and flatbreads (e.g. biryani + naan, or tacos with extra tortillas), prioritize lean proteins or pair with raita / pickled greens.
          </p>
        </div>
      </div>
    </div>
  );
};
