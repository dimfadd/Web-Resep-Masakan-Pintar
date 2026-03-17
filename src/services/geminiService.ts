import { Recipe, GenerateParams, NutritionInfo, Ingredient, CookingStep } from "../types";

// ─── NUTRITION CALCULATION HELPER ─────────────────────────────────────────

export const sumNutrition = (ingredients: Ingredient[]): NutritionInfo => {
  return ingredients.reduce((acc, ing) => ({
    calories: acc.calories + (ing.nutrition.calories || 0),
    protein: acc.protein + (ing.nutrition.protein || 0),
    carbs: acc.carbs + (ing.nutrition.carbs || 0),
    fat: acc.fat + (ing.nutrition.fat || 0),
    fiber: acc.fiber + (ing.nutrition.fiber || 0),
    sodium: (acc.sodium || 0) + (ing.nutrition.sodium || 0),
    vitaminC: (acc.vitaminC || 0) + (ing.nutrition.vitaminC || 0),
    vitaminA: (acc.vitaminA || 0) + (ing.nutrition.vitaminA || 0),
    calcium: (acc.calcium || 0) + (ing.nutrition.calcium || 0),
    iron: (acc.iron || 0) + (ing.nutrition.iron || 0),
    potassium: (acc.potassium || 0) + (ing.nutrition.potassium || 0),
  }), {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0,
    sodium: 0, vitaminC: 0, vitaminA: 0, calcium: 0, iron: 0, potassium: 0
  });
};

const divideNutrition = (nutrition: NutritionInfo, servings: number): NutritionInfo => {
  const s = servings || 1;
  return {
    calories: Math.round(nutrition.calories / s),
    protein: Math.round((nutrition.protein / s) * 10) / 10,
    carbs: Math.round((nutrition.carbs / s) * 10) / 10,
    fat: Math.round((nutrition.fat / s) * 10) / 10,
    fiber: Math.round((nutrition.fiber / s) * 10) / 10,
    sodium: Math.round((nutrition.sodium || 0) / s),
    vitaminC: Math.round(((nutrition.vitaminC || 0) / s) * 10) / 10,
    vitaminA: Math.round((nutrition.vitaminA || 0) / s),
    calcium: Math.round((nutrition.calcium || 0) / s),
    iron: Math.round(((nutrition.iron || 0) / s) * 10) / 10,
    potassium: Math.round((nutrition.potassium || 0) / s),
  };
};

// ─── AUTO FITNESS TAG GENERATOR ───────────────────────────────────────────

const autoTagFitness = (nutrition: NutritionInfo): Recipe['fitnessGoal'] => {
  const goals: Recipe['fitnessGoal'] = ['jaga berat badan'];
  const perServing = nutrition; // assume already per serving

  if (perServing.calories < 400) goals.push('rendah kalori', 'turun berat badan');
  if (perServing.protein >= 25) goals.push('tinggi protein', 'naik berat badan');
  if (perServing.carbs < 30) goals.push('rendah karbo', 'turun berat badan');
  if (perServing.fiber >= 8) goals.push('tinggi serat');
  if (perServing.calories >= 500 && perServing.protein >= 20) goals.push('naik berat badan');

  return [...new Set(goals)] as Recipe['fitnessGoal'];
};

// ─── MAIN GENERATE FUNCTION ───────────────────────────────────────────────

export const generateRecipe = async (params: GenerateParams): Promise<Recipe> => {
  const servings = params.servings || 4;

  const systemPrompt = `Kamu adalah Chef dan Ahli Gizi profesional Indonesia.
Tugasmu: generate resep masakan Indonesia yang SANGAT DETAIL dan AKURAT secara nutrisi.

ATURAN WAJIB:
1. Semua teks dalam Bahasa Indonesia.
2. Nilai nutrisi HARUS realistis dan akurat berdasarkan database nutrisi standar (USDA/PERSAGI).
3. Setiap bahan HARUS memiliki nilai kalori, protein, karbohidrat, lemak, dan serat.
4. Langkah memasak harus sangat detail — seorang pemula pun bisa mengikutinya.
5. Return HANYA JSON valid, tanpa markdown atau teks tambahan.`;

  const userPrompt = `${params.query}

Buat untuk ${servings} porsi.
${params.fitnessGoalHint ? `Fokus nutrisi: ${params.fitnessGoalHint}` : ''}

Pastikan:
- Nama masakan spesifik dan autentik
- Semua bahan dengan takaran presisi dalam gram/ml/sendok
- Nilai nutrisi per bahan HARUS diisi (jangan 0 semua kecuali memang 0)
- Langkah detail minimal 6-10 langkah
- Tips memasak yang berguna di setiap langkah penting`;

  const responseSchema = {
    type: "OBJECT",
    properties: {
      title: { type: "STRING" },
      subtitle: { type: "STRING" },
      description: { type: "STRING" },
      origin: { type: "STRING" },
      servings: { type: "INTEGER" },
      prepTimeMinutes: { type: "INTEGER" },
      cookTimeMinutes: { type: "INTEGER" },
      difficulty: { type: "STRING", enum: ['mudah', 'sedang', 'sulit'] },
      type: { type: "STRING", enum: ['berkuah', 'digoreng', 'dipanggang', 'dikukus', 'mentah', 'tumisan', 'rebusan'] },
      tags: { type: "ARRAY", items: { type: "STRING" } },
      ingredients: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            amount: { type: "STRING" },
            amountGrams: { type: "NUMBER" },
            category: { type: "STRING", enum: ['protein', 'karbohidrat', 'sayuran', 'bumbu', 'minyak', 'lainnya'] },
            notes: { type: "STRING" },
            nutrition: {
              type: "OBJECT",
              properties: {
                calories: { type: "NUMBER" },
                protein: { type: "NUMBER" },
                carbs: { type: "NUMBER" },
                fat: { type: "NUMBER" },
                fiber: { type: "NUMBER" },
                sodium: { type: "NUMBER" },
                vitaminC: { type: "NUMBER" },
                vitaminA: { type: "NUMBER" },
                calcium: { type: "NUMBER" },
                iron: { type: "NUMBER" },
                potassium: { type: "NUMBER" },
              },
              required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
            },
          },
          required: ['name', 'amount', 'category', 'nutrition'],
        },
      },
      steps: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            stepNumber: { type: "INTEGER" },
            title: { type: "STRING" },
            description: { type: "STRING" },
            durationMinutes: { type: "NUMBER" },
            tip: { type: "STRING" },
            heat: { type: "STRING", enum: ['rendah', 'sedang', 'tinggi', 'tanpa api'] },
          },
          required: ['stepNumber', 'title', 'description'],
        },
      },
      equipment: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            essential: { type: "BOOLEAN" },
          },
          required: ['name', 'essential'],
        },
      },
      imagePrompt: { type: "STRING" },
      storageInstructions: { type: "STRING" },
      variations: { type: "ARRAY", items: { type: "STRING" } },
      pairingWith: { type: "ARRAY", items: { type: "STRING" } },
    },
    required: ['title', 'description', 'servings', 'prepTimeMinutes', 'cookTimeMinutes',
               'difficulty', 'type', 'ingredients', 'steps', 'equipment', 'imagePrompt'],
  };

  const response = await fetch('/api/ai/generate-recipe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      responseSchema
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Gagal memanggil server untuk generate resep");
  }

  const data = await response.json();
  const jsonText = data.text;
  if (!jsonText) throw new Error("Server tidak mengembalikan data teks");

  const raw = JSON.parse(jsonText);

  // Enrich ingredients with IDs
  const ingredients: Ingredient[] = (raw.ingredients || []).map((ing: any, i: number) => ({
    id: `ing-${Date.now()}-${i}`,
    name: ing.name,
    amount: ing.amount,
    amountGrams: ing.amountGrams,
    category: ing.category || 'lainnya',
    notes: ing.notes,
    nutrition: {
      calories: ing.nutrition?.calories || 0,
      protein: ing.nutrition?.protein || 0,
      carbs: ing.nutrition?.carbs || 0,
      fat: ing.nutrition?.fat || 0,
      fiber: ing.nutrition?.fiber || 0,
      sodium: ing.nutrition?.sodium,
      vitaminC: ing.nutrition?.vitaminC,
      vitaminA: ing.nutrition?.vitaminA,
      calcium: ing.nutrition?.calcium,
      iron: ing.nutrition?.iron,
      potassium: ing.nutrition?.potassium,
    },
  }));

  const steps: CookingStep[] = (raw.steps || []).map((s: any, i: number) => ({
    id: `step-${Date.now()}-${i}`,
    stepNumber: s.stepNumber || i + 1,
    title: s.title,
    description: s.description,
    durationMinutes: s.durationMinutes,
    tip: s.tip,
    heat: s.heat,
  }));

  const totalNutrition = sumNutrition(ingredients);
  const nutritionPerServing = divideNutrition(totalNutrition, raw.servings || servings);

  const recipe: Recipe = {
    id: `recipe-${Date.now()}`,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description,
    origin: raw.origin,
    servings: raw.servings || servings,
    prepTimeMinutes: raw.prepTimeMinutes || 15,
    cookTimeMinutes: raw.cookTimeMinutes || 30,
    difficulty: raw.difficulty || 'sedang',
    type: raw.type || 'tumisan',
    tags: raw.tags || [],
    fitnessGoal: autoTagFitness(nutritionPerServing),
    ingredients,
    steps,
    equipment: raw.equipment || [],
    totalNutrition,
    nutritionPerServing,
    imageUrl: undefined,
    imagePrompt: raw.imagePrompt,
    isGeneratingImage: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    language: 'id',
    isFree: false,
    storageInstructions: raw.storageInstructions,
    variations: raw.variations,
    pairingWith: raw.pairingWith,
  };

  return recipe;
};

// ─── IMAGE GENERATION ─────────────────────────────────────────────────────

export const generateRecipeImage = async (recipe: Recipe): Promise<string> => {
  const prompt = `${recipe.imagePrompt || recipe.title}. 
  Food photography style. Professional overhead shot or 45-degree angle. 
  Authentic Indonesian cuisine. Beautiful plating on traditional Indonesian ceramic or wooden board. 
  Warm natural lighting. Appetizing, vibrant colors. Garnished professionally.
  Negative: text, labels, watermark, cartoon, illustration style.`;

  try {
    const response = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Gagal memanggil server untuk generate gambar");
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (e) {
    console.warn("Image generation failed, using placeholder:", e);
  }

  // Fallback: unsplash food image
  const foodKeywords = encodeURIComponent(recipe.title.split(' ').slice(0, 3).join(' '));
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop`;
};
