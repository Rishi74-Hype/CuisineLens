export type GoalType = 'lose' | 'maintain' | 'gain';
export type GenderType = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type CuisineType = 'South Asian' | 'Mexican' | 'East Asian' | 'Mediterranean' | 'Southeast Asian' | 'All Regional';
export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface UserProfile {
  name: string;
  goal: GoalType;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  age: number;
  gender: GenderType;
  activityLevel: ActivityLevel;
  cuisineFocus: CuisineType;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  isOnboarded: boolean;
  isPro: boolean;
  dailyScansUsed: number;
  lastScanDate: string; // YYYY-MM-DD
  waterGoalGlasses?: number; // Target glasses of water per day (default 8)
}

export interface MealIngredient {
  name: string;
  estimatedGrams: number;
  calories: number;
  note?: string;
}

export interface MealLogItem {
  id: string;
  dishName: string;
  nativeName?: string;
  cuisine: string;
  mealType: MealCategory;
  portion: 'Small' | 'Medium' | 'Large';
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  cookingFat?: string;
  imageUrl: string;
  loggedAt: string; // ISO string
  ingredients?: MealIngredient[];
  modifiersApplied?: string[];
  confidenceScore?: number;
  regionalNutritionNote?: string;
}

export interface ScanResult {
  dishName: string;
  nativeName?: string;
  cuisine: string;
  suggestedPortion: 'Small' | 'Medium' | 'Large';
  estimatedGrams: number;
  confidenceScore: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  cookingFatDetected?: string;
  regionalNutritionNote?: string;
  ingredients: MealIngredient[];
  alternativeDishes?: {
    dishName: string;
    calories: number;
    diffReason: string;
  }[];
}
