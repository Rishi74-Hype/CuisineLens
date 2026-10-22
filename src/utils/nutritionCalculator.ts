import { UserProfile, MealLogItem, GoalType, ActivityLevel, GenderType, CuisineType } from '../types/nutrition.ts';

export function calculateCalorieTargets(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: GenderType,
  activity: ActivityLevel,
  goal: GoalType
): { calories: number; protein: number; carbs: number; fat: number } {
  // Mifflin-St Jeor Equation
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    bmr += 5;
  } else if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78; // average
  }

  // TDEE multiplier
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };
  const tdee = bmr * (activityMultipliers[activity] || 1.375);

  // Goal adjustment
  let targetCalories = Math.round(tdee);
  if (goal === 'lose') {
    targetCalories = Math.max(1200, Math.round(tdee - 500));
  } else if (goal === 'gain') {
    targetCalories = Math.round(tdee + 400);
  }

  // Macro distribution (e.g. 28% protein, 45% carbs, 27% fat)
  const proteinCalories = targetCalories * 0.28;
  const fatCalories = targetCalories * 0.27;
  const carbCalories = targetCalories - proteinCalories - fatCalories;

  const protein = Math.round(proteinCalories / 4);
  const fat = Math.round(fatCalories / 9);
  const carbs = Math.round(carbCalories / 4);

  return { calories: targetCalories, protein, carbs, fat };
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Alex',
  goal: 'lose',
  currentWeightKg: 74,
  targetWeightKg: 68,
  heightCm: 175,
  age: 28,
  gender: 'male',
  activityLevel: 'moderate',
  cuisineFocus: 'South Asian',
  targetCalories: 2150,
  targetProtein: 150,
  targetCarbs: 235,
  targetFat: 65,
  isOnboarded: true,
  isPro: false,
  dailyScansUsed: 1,
  lastScanDate: new Date().toISOString().split('T')[0],
  waterGoalGlasses: 8,
};

export function calculateConsistencyStreak(
  mealLogs: MealLogItem[],
  targetCalories: number,
  goal: GoalType
): { streak: number; isTodayCounted: boolean } {
  const caloriesByDate: Record<string, number> = {};
  mealLogs.forEach(meal => {
    const dateStr = meal.loggedAt.split('T')[0];
    caloriesByDate[dateStr] = (caloriesByDate[dateStr] || 0) + meal.calories;
  });

  const checkMet = (kcal: number) => {
    if (kcal <= 0) return false;
    if (goal === 'lose') return kcal <= targetCalories + 50;
    if (goal === 'gain') return kcal >= targetCalories - 100;
    return kcal >= targetCalories * 0.75 && kcal <= targetCalories * 1.15;
  };

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayCalories = caloriesByDate[todayStr] || 0;
  const isTodayMet = checkMet(todayCalories);

  let streak = 0;
  let isTodayCounted = false;

  if (isTodayMet) {
    streak = 1;
    isTodayCounted = true;
  }

  // Check backwards from yesterday
  for (let i = 1; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const kcal = caloriesByDate[dateStr] || 0;
    const met = checkMet(kcal);

    if (met) {
      streak += 1;
    } else {
      break;
    }
  }

  return { streak, isTodayCounted };
}

export const INITIAL_MEAL_LOGS: MealLogItem[] = [
  // Today's meals (1110 kcal)
  {
    id: 'meal-seed-1',
    dishName: 'Mysore Masala Dosa with Sambar & Chutneys',
    nativeName: 'ಮೈಸೂರು ಮಸಾಲ ದೋಸೆ',
    cuisine: 'South Asian / Karnataka',
    mealType: 'Breakfast',
    portion: 'Medium',
    grams: 320,
    calories: 470,
    protein: 12,
    carbs: 71,
    fat: 16,
    fiber: 6.2,
    sodium: 790,
    cookingFat: 'Ghee on Griddle',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    loggedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    confidenceScore: 96,
    regionalNutritionNote: 'Fermented lentil and rice crepe with tempered spiced potato filling and fresh coconut chutney.',
    ingredients: [
      { name: 'Fermented Rice & Dal Batter', estimatedGrams: 160, calories: 230 },
      { name: 'Spiced Potato Filling', estimatedGrams: 90, calories: 120 },
      { name: 'Toor Dal Sambar', estimatedGrams: 120, calories: 60 },
      { name: 'Fresh Coconut Chutney', estimatedGrams: 40, calories: 60 },
    ],
  },
  {
    id: 'meal-seed-2',
    dishName: 'Chicken Dum Biryani with Raita',
    nativeName: 'دَم بریانی / दम बिरयानी',
    cuisine: 'South Asian / Hyderabadi',
    mealType: 'Lunch',
    portion: 'Medium',
    grams: 380,
    calories: 640,
    protein: 34,
    carbs: 76,
    fat: 22,
    fiber: 3.5,
    sodium: 880,
    cookingFat: 'Desi Ghee & Fried Oil',
    imageUrl: '/src/assets/images/regional_biryani_platter_1792609756511.jpg',
    loggedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    confidenceScore: 94,
    regionalNutritionNote: 'Marinated chicken pieces cooked dum style with aged saffron basmati and caramelized shallots.',
    ingredients: [
      { name: 'Aged Basmati Rice', estimatedGrams: 200, calories: 280 },
      { name: 'Marinated Chicken', estimatedGrams: 130, calories: 220 },
      { name: 'Desi Ghee & Birista', estimatedGrams: 20, calories: 100 },
      { name: 'Cucumber Mint Raita', estimatedGrams: 60, calories: 40 },
    ],
  },
  // Yesterday's meals (1680 kcal - target met)
  {
    id: 'meal-seed-yesterday-1',
    dishName: 'Tacos al Pastor (Street Style)',
    nativeName: 'Tacos al Pastor',
    cuisine: 'Mexican / CDMX',
    mealType: 'Lunch',
    portion: 'Medium',
    grams: 270,
    calories: 510,
    protein: 32,
    carbs: 48,
    fat: 21,
    fiber: 6.0,
    sodium: 880,
    cookingFat: 'Rendered Pork & Griddle',
    imageUrl: '/src/assets/images/regional_tacos_pastor_1792609756799.jpg',
    loggedAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    confidenceScore: 95,
  },
  {
    id: 'meal-seed-yesterday-2',
    dishName: 'Murgh Makhani with Roti',
    nativeName: 'बटर चिकन',
    cuisine: 'South Asian / Delhi',
    mealType: 'Dinner',
    portion: 'Medium',
    grams: 350,
    calories: 620,
    protein: 38,
    carbs: 52,
    fat: 30,
    fiber: 4.0,
    sodium: 890,
    cookingFat: 'White Butter & Cream',
    imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    loggedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    confidenceScore: 93,
  },
  {
    id: 'meal-seed-yesterday-3',
    dishName: 'Paneer Tikka with Mint Chutney',
    nativeName: 'पनीर टिक्का',
    cuisine: 'South Asian',
    mealType: 'Snack',
    portion: 'Small',
    grams: 180,
    calories: 310,
    protein: 18,
    carbs: 10,
    fat: 22,
    fiber: 2.0,
    sodium: 490,
    cookingFat: 'Mustard Oil & Ghee',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    loggedAt: new Date(Date.now() - 22 * 3600000).toISOString(),
    confidenceScore: 92,
  },
  // 2 days ago meals (1610 kcal - target met)
  {
    id: 'meal-seed-d2-1',
    dishName: 'Tonkotsu Ramen with Chashu',
    nativeName: '豚骨ラーメン',
    cuisine: 'East Asian / Hakata',
    mealType: 'Dinner',
    portion: 'Medium',
    grams: 580,
    calories: 740,
    protein: 36,
    carbs: 79,
    fat: 31,
    fiber: 3.5,
    sodium: 1980,
    cookingFat: 'Rendered Pork Bone Emulsion',
    imageUrl: '/src/assets/images/regional_tonkotsu_ramen_1792609757733.jpg',
    loggedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    confidenceScore: 96,
  },
  {
    id: 'meal-seed-d2-2',
    dishName: 'Pho Bo Dac Biet',
    nativeName: 'Phở Bò',
    cuisine: 'Southeast Asian / Vietnam',
    mealType: 'Lunch',
    portion: 'Medium',
    grams: 620,
    calories: 510,
    protein: 38,
    carbs: 70,
    fat: 9,
    fiber: 3.5,
    sodium: 1680,
    cookingFat: 'Clear Bone Broth',
    imageUrl: '/src/assets/images/regional_pho_dac_biet_1792609757829.jpg',
    loggedAt: new Date(Date.now() - 52 * 3600000).toISOString(),
    confidenceScore: 97,
  },
  {
    id: 'meal-seed-d2-3',
    dishName: 'North African Shakshuka with Feta',
    nativeName: 'شكشوكة',
    cuisine: 'Mediterranean',
    mealType: 'Breakfast',
    portion: 'Small',
    grams: 250,
    calories: 340,
    protein: 16,
    carbs: 28,
    fat: 18,
    fiber: 4.0,
    sodium: 610,
    cookingFat: 'Extra Virgin Olive Oil',
    imageUrl: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80',
    loggedAt: new Date(Date.now() - 56 * 3600000).toISOString(),
    confidenceScore: 94,
  },
];

const PROFILE_STORAGE_KEY = 'cuisinelens_user_profile_v2';
const MEALS_STORAGE_KEY = 'cuisinelens_meal_logs_v2';

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const profile = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastScanDate !== today) {
      profile.dailyScansUsed = 0;
      profile.lastScanDate = today;
    }
    return profile;
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadMealLogs(): MealLogItem[] {
  try {
    const raw = localStorage.getItem(MEALS_STORAGE_KEY);
    if (!raw) return INITIAL_MEAL_LOGS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MEAL_LOGS;
  }
}

export function saveMealLogs(logs: MealLogItem[]): void {
  try {
    localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save meal logs', e);
  }
}

const WATER_STORAGE_KEY = 'cuisinelens_water_logs_v1';

export type WaterLogMap = Record<string, number>;

export function loadWaterLogs(): WaterLogMap {
  try {
    const raw = localStorage.getItem(WATER_STORAGE_KEY);
    if (!raw) {
      const today = new Date().toISOString().split('T')[0];
      return { [today]: 5 }; // default initial 5 glasses for today
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveWaterLogs(logs: WaterLogMap): void {
  try {
    localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save water logs', e);
  }
}

