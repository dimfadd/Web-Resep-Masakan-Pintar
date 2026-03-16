import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Recipe, GenerateParams, NutritionInfo, Ingredient, CookingStep } from "../types";

const getClient = () => {
  // Try multiple common environment variable names for the Gemini API key
  // In Vite, import.meta.env is the standard way to access env vars
  const apiKey = 
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY || 
    process.env.API_KEY;
    
  if (!apiKey) {
    throw new Error("Gemini API Key tidak ditemukan. Pastikan GEMINI_API_KEY sudah terpasang di environment.");
  }
  return new GoogleGenAI({ apiKey });
};

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
  const ai = getClient();

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

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      subtitle: { type: Type.STRING },
      description: { type: Type.STRING },
      origin: { type: Type.STRING },
      servings: { type: Type.INTEGER },
      prepTimeMinutes: { type: Type.INTEGER },
      cookTimeMinutes: { type: Type.INTEGER },
      difficulty: { type: Type.STRING, enum: ['mudah', 'sedang', 'sulit'] },
      type: { type: Type.STRING, enum: ['berkuah', 'digoreng', 'dipanggang', 'dikukus', 'mentah', 'tumisan', 'rebusan'] },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      ingredients: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            amount: { type: Type.STRING },
            amountGrams: { type: Type.NUMBER },
            category: { type: Type.STRING, enum: ['protein', 'karbohidrat', 'sayuran', 'bumbu', 'minyak', 'lainnya'] },
            notes: { type: Type.STRING },
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                fiber: { type: Type.NUMBER },
                sodium: { type: Type.NUMBER },
                vitaminC: { type: Type.NUMBER },
                vitaminA: { type: Type.NUMBER },
                calcium: { type: Type.NUMBER },
                iron: { type: Type.NUMBER },
                potassium: { type: Type.NUMBER },
              },
              required: ['calories', 'protein', 'carbs', 'fat', 'fiber'],
            },
          },
          required: ['name', 'amount', 'category', 'nutrition'],
        },
      },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            durationMinutes: { type: Type.NUMBER },
            tip: { type: Type.STRING },
            heat: { type: Type.STRING, enum: ['rendah', 'sedang', 'tinggi', 'tanpa api'] },
          },
          required: ['stepNumber', 'title', 'description'],
        },
      },
      equipment: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            essential: { type: Type.BOOLEAN },
          },
          required: ['name', 'essential'],
        },
      },
      imagePrompt: { type: Type.STRING },
      storageInstructions: { type: Type.STRING },
      variations: { type: Type.ARRAY, items: { type: Type.STRING } },
      pairingWith: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ['title', 'description', 'servings', 'prepTimeMinutes', 'cookTimeMinutes',
               'difficulty', 'type', 'ingredients', 'steps', 'equipment', 'imagePrompt'],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("Gemini tidak mengembalikan data");

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
  const ai = getClient();

  const prompt = `${recipe.imagePrompt || recipe.title}. 
  Food photography style. Professional overhead shot or 45-degree angle. 
  Authentic Indonesian cuisine. Beautiful plating on traditional Indonesian ceramic or wooden board. 
  Warm natural lighting. Appetizing, vibrant colors. Garnished professionally.
  Negative: text, labels, watermark, cartoon, illustration style.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: prompt }] },
      config: { responseModalities: ["IMAGE", "TEXT"] },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if ((part as any).inlineData?.data) {
          const p = part as any;
          return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`;
        }
      }
    }
  } catch (e) {
    console.warn("Image generation failed, using placeholder:", e);
  }

  // Fallback: unsplash food image
  const foodKeywords = encodeURIComponent(recipe.title.split(' ').slice(0, 3).join(' '));
  return `https://source.unsplash.com/800x600/?${foodKeywords},indonesian,food`;
};
