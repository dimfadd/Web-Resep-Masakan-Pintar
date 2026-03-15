// ─── NUTRITION TYPES ───────────────────────────────────────────────────────

export interface NutritionInfo {
  calories: number;       // kkal
  protein: number;        // gram
  carbs: number;          // gram
  fat: number;            // gram
  fiber: number;          // gram
  sodium?: number;        // mg
  vitaminC?: number;      // mg
  vitaminA?: number;      // mcg
  calcium?: number;       // mg
  iron?: number;          // mg
  potassium?: number;     // mg
}

// ─── INGREDIENT ────────────────────────────────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  amount: string;         // e.g. "200 gram", "2 siung", "3 sdm"
  amountGrams?: number;   // normalized gram weight for nutrition calc
  nutrition: NutritionInfo;
  notes?: string;         // e.g. "iris tipis", "haluskan"
  category: 'protein' | 'karbohidrat' | 'sayuran' | 'bumbu' | 'minyak' | 'lainnya';
}

// ─── COOKING STEP ──────────────────────────────────────────────────────────

export interface CookingStep {
  id: string;
  stepNumber: number;
  title: string;          // e.g. "Tumis bumbu"
  description: string;    // detail instruction
  durationMinutes?: number;
  tip?: string;           // chef tip for this step
  heat?: 'rendah' | 'sedang' | 'tinggi' | 'tanpa api';
}

// ─── EQUIPMENT ─────────────────────────────────────────────────────────────

export interface Equipment {
  name: string;
  essential: boolean;
}

// ─── RECIPE ────────────────────────────────────────────────────────────────

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;      // e.g. "Khas Yogyakarta"
  description: string;
  origin?: string;        // asal daerah
  servings: number;       // porsi
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  
  // Categories
  type: 'berkuah' | 'digoreng' | 'dipanggang' | 'dikukus' | 'mentah' | 'tumisan' | 'rebusan';
  tags: string[];         // e.g. ["tinggi protein", "diet", "bulking", "rendah kalori"]
  
  // Fitness goals
  fitnessGoal: ('diet' | 'bulking' | 'maintenance' | 'tinggi protein' | 'rendah kalori' | 'rendah karbo' | 'tinggi serat' | 'turun berat badan' | 'naik berat badan' | 'jaga berat badan')[];
  
  // Content
  ingredients: Ingredient[];
  steps: CookingStep[];
  equipment: Equipment[];
  
  // Nutrition totals (auto-calculated from ingredients)
  totalNutrition: NutritionInfo;
  nutritionPerServing: NutritionInfo;
  
  // Image
  imageUrl?: string;
  imagePrompt?: string;
  isGeneratingImage?: boolean;

  // Freemium flag — admin toggles this per recipe
  // true  = visible to public (10 free slots)
  // false = premium/chef only (default for new recipes)
  isFree: boolean;

  // Meta
  createdAt: string;
  updatedAt: string;
  folder?: string;
  language: 'id';
  
  // Chef notes
  storageInstructions?: string;  // cara menyimpan
  variations?: string[];         // variasi resep
  pairingWith?: string[];        // cocok dimakan dengan
}

// ─── FREEMIUM ──────────────────────────────────────────────────────────────

export interface AccessCode {
  code: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
}

export interface PurchaseRequest {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  status: 'pending' | 'approved';
  createdAt: string;
  code?: string;
  plan?: 'monthly' | 'yearly';
}

// ─── APP STATE ─────────────────────────────────────────────────────────────

// 'library' and 'generate' kept for backwards compat with RecipeLibrary/HomeScreen
export type AppView =
  | 'landing'
  | 'library_public'
  | 'library_full'
  | 'library'
  | 'generate'
  | 'recipe_detail'
  | 'admin';

export type UserTier = 'public' | 'chef' | 'admin';

export interface RecipeFilter {
  search: string;
  type: string[];
  fitnessGoal: string[];
  minProtein?: number;
  maxCalories?: number;
  maxCookTime?: number;
  difficulty: string[];
}

export interface GenerateParams {
  query: string;
  servings?: number;
  fitnessGoalHint?: string;
}
