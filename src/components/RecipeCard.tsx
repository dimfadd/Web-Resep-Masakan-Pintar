import React, { useState, useRef } from 'react';
import { Recipe, NutritionInfo, Ingredient, CookingStep } from '../types';
import {
  Clock, Users, ChefHat, Flame, Zap, Leaf, Droplets,
  CheckCircle2, Circle, Timer, AlertCircle, Star,
  ChevronDown, ChevronUp, Thermometer, Utensils,
  Heart, Printer, X, ArrowLeft, BookmarkPlus, Activity
} from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onClose?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  showBackButton?: boolean;
}

// ─── NUTRITION BADGE ─────────────────────────────────────────────────────

const NutritionBadge: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; bg: string }> = 
  ({ icon, label, value, color, bg }) => (
  <div className={`flex flex-col items-center p-3 rounded-2xl ${bg} border border-white/60 shadow-sm min-w-[72px]`}>
    <div className={`mb-1 ${color}`}>{icon}</div>
    <div className={`text-lg font-black ${color} leading-none`}>{value}</div>
    <div className="text-[10px] font-bold text-stone-500 mt-0.5 uppercase tracking-wide">{label}</div>
  </div>
);

// ─── INGREDIENT ROW ───────────────────────────────────────────────────────

const IngredientRow: React.FC<{ ingredient: Ingredient; index: number; multiplier: number }> = ({ ingredient, index, multiplier }) => {
  const [expanded, setExpanded] = useState(false);
  
  const scale = (val: number) => Math.round(val * multiplier * 10) / 10;
  const scaleInt = (val: number) => Math.round(val * multiplier);

  const hasExtraNutrition = ingredient.nutrition.vitaminC || ingredient.nutrition.vitaminA || 
    ingredient.nutrition.calcium || ingredient.nutrition.iron || ingredient.nutrition.potassium;

  // Helper to scale amount string if it starts with a number
  const scaleAmount = (amount: string) => {
    const match = amount.match(/^(\d+(\.\d+)?)\s*(.*)$/);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[3];
      return `${Math.round(num * multiplier * 100) / 100} ${unit}`;
    }
    return amount;
  };

  const categoryColors: Record<string, string> = {
    protein: 'bg-red-100 text-red-700 border-red-200',
    karbohidrat: 'bg-amber-100 text-amber-700 border-amber-200',
    sayuran: 'bg-green-100 text-green-700 border-green-200',
    bumbu: 'bg-orange-100 text-orange-700 border-orange-200',
    minyak: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    lainnya: 'bg-stone-100 text-stone-600 border-stone-200',
  };

  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${expanded ? 'border-amber-300 bg-amber-50/50' : 'border-stone-200 bg-white'}`}>
      <div 
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Index */}
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <span className="text-[10px] font-black text-amber-700">{index + 1}</span>
        </div>

        {/* Name & amount */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-800 text-sm">{ingredient.name}</span>
            {ingredient.notes && (
              <span className="text-[10px] text-stone-500 italic">({ingredient.notes})</span>
            )}
          </div>
          <span className="text-xs font-semibold text-amber-700">{scaleAmount(ingredient.amount)}</span>
        </div>

        {/* Category */}
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize hidden sm:block ${categoryColors[ingredient.category]}`}>
          {ingredient.category}
        </span>

        {/* Quick nutrition */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-black text-orange-600">{scaleInt(ingredient.nutrition.calories)} kal</span>
          <span className="text-[10px] text-stone-500">{scale(ingredient.nutrition.protein)}g P</span>
          <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded nutrition detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-amber-200">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Kandungan Nutrisi</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: 'Kalori', val: `${scaleInt(ingredient.nutrition.calories)} kkal`, color: 'text-orange-600' },
              { label: 'Protein', val: `${scale(ingredient.nutrition.protein)}g`, color: 'text-red-600' },
              { label: 'Karbo', val: `${scale(ingredient.nutrition.carbs)}g`, color: 'text-amber-600' },
              { label: 'Lemak', val: `${scale(ingredient.nutrition.fat)}g`, color: 'text-yellow-600' },
              { label: 'Serat', val: `${scale(ingredient.nutrition.fiber)}g`, color: 'text-green-600' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-lg p-2 text-center shadow-sm border border-stone-100">
                <div className={`text-xs font-black ${item.color}`}>{item.val}</div>
                <div className="text-[9px] text-stone-400 font-semibold">{item.label}</div>
              </div>
            ))}
          </div>

          {hasExtraNutrition && (
            <div className="mt-2 flex flex-wrap gap-2">
              {ingredient.nutrition.vitaminC !== undefined && ingredient.nutrition.vitaminC > 0 && (
                <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full font-semibold">
                  Vit C: {scale(ingredient.nutrition.vitaminC)}mg
                </span>
              )}
              {ingredient.nutrition.vitaminA !== undefined && ingredient.nutrition.vitaminA > 0 && (
                <span className="text-[10px] bg-yellow-50 border border-yellow-200 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">
                  Vit A: {scale(ingredient.nutrition.vitaminA)}mcg
                </span>
              )}
              {ingredient.nutrition.calcium !== undefined && ingredient.nutrition.calcium > 0 && (
                <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                  Kalsium: {scale(ingredient.nutrition.calcium)}mg
                </span>
              )}
              {ingredient.nutrition.iron !== undefined && ingredient.nutrition.iron > 0 && (
                <span className="text-[10px] bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                  Zat Besi: {scale(ingredient.nutrition.iron)}mg
                </span>
              )}
              {ingredient.nutrition.potassium !== undefined && ingredient.nutrition.potassium > 0 && (
                <span className="text-[10px] bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                  Kalium: {scale(ingredient.nutrition.potassium)}mg
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── COOKING STEP ─────────────────────────────────────────────────────────

const StepCard: React.FC<{ step: CookingStep; isActive: boolean; isPrompted: boolean; onToggle: () => void }> = 
  ({ step, isActive, isPrompted, onToggle }) => {
  const heatColors = {
    rendah: 'text-blue-600 bg-blue-50',
    sedang: 'text-orange-500 bg-orange-50',
    tinggi: 'text-red-600 bg-red-50',
    'tanpa api': 'text-green-600 bg-green-50',
  };

  return (
    <div 
      className={`relative rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
        ${isActive ? 'border-amber-400 bg-amber-50 shadow-lg shadow-amber-100' : 'border-stone-200 bg-white hover:border-amber-200'}
        ${isPrompted && !isActive ? 'animate-pulse ring-2 ring-amber-400 ring-offset-2' : ''}`}
      onClick={onToggle}
    >
      {/* Step number ribbon */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl transition-colors ${isActive ? 'bg-amber-400' : 'bg-stone-200'}`}></div>
      
      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-4">
          {/* Circle number */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-lg transition-colors
            ${isActive ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-stone-100 text-stone-500'}`}>
            {isActive ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-black text-base ${isActive ? 'text-amber-800' : 'text-stone-700'}`}>
                {step.title}
              </h4>
              {step.heat && step.heat !== 'tanpa api' && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${heatColors[step.heat]}`}>
                  🔥 Api {step.heat}
                </span>
              )}
              {step.durationMinutes && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 flex items-center gap-1">
                  <Timer className="w-2.5 h-2.5" /> {step.durationMinutes} menit
                </span>
              )}
            </div>

            <p className={`text-sm mt-1.5 leading-relaxed ${isActive ? 'text-amber-900' : 'text-stone-600'}`}>
              {step.description}
            </p>

            {isActive && step.tip && (
              <div className="mt-3 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                <Star className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 font-medium">{step.tip}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN RECIPE CARD ─────────────────────────────────────────────────────

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClose, onSave, isSaved, showBackButton }) => {
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [promptedStepIndex, setPromptedStepIndex] = useState(0);
  const [servingsMultiplier, setServingsMultiplier] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  const n = recipe.nutritionPerServing;
  const actualServings = Math.round(recipe.servings * servingsMultiplier);

  const difficultyConfig = {
    mudah: { color: 'text-green-700 bg-green-100 border-green-200', label: 'Mudah' },
    sedang: { color: 'text-amber-700 bg-amber-100 border-amber-200', label: 'Sedang' },
    sulit: { color: 'text-red-700 bg-red-100 border-red-200', label: 'Sulit' },
  };

  const typeEmoji: Record<string, string> = {
    berkuah: '🍲', digoreng: '🍳', dipanggang: '🔥', dikukus: '♨️',
    mentah: '🥗', tumisan: '🥘', rebusan: '🫕',
  };

  // Group ingredients by category
  const groupedIngredients = recipe.ingredients.reduce((acc, ing) => {
    if (!acc[ing.category]) acc[ing.category] = [];
    acc[ing.category].push(ing);
    return acc;
  }, {} as Record<string, Ingredient[]>);

  const categoryLabels: Record<string, string> = {
    protein: '🥩 Protein',
    karbohidrat: '🌾 Karbohidrat',
    sayuran: '🥦 Sayuran',
    bumbu: '🌶️ Bumbu & Rempah',
    minyak: '🫙 Minyak & Lemak',
    lainnya: '📦 Lainnya',
  };

  return (
    <div ref={printRef} className="max-w-3xl mx-auto font-sans">
      
      {/* ── HEADER / HERO ──────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden mb-0 shadow-2xl shadow-stone-300">
        {/* Background image */}
        <div className="h-72 sm:h-96 relative">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          ) : recipe.isGeneratingImage ? (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-amber-700 font-semibold text-sm">Melukis foto masakan...</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 flex items-center justify-center">
              <span className="text-8xl">{typeEmoji[recipe.type] || '🍽️'}</span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Back / close buttons */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {(showBackButton || onClose) && (
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            {onSave && (
              <button 
                onClick={onSave}
                className={`ml-auto w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition
                  ${isSaved ? 'bg-amber-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'}`}
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              {recipe.subtitle && (
                <span className="text-amber-300 text-xs font-bold uppercase tracking-widest">{recipe.subtitle}</span>
              )}
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mt-0.5">{recipe.title}</h1>
              {recipe.origin && (
                <p className="text-white/70 text-sm mt-1">📍 {recipe.origin}</p>
              )}
            </div>
          </div>

          {/* Tags row */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${difficultyConfig[recipe.difficulty].color}`}>
              {difficultyConfig[recipe.difficulty].label}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30">
              {typeEmoji[recipe.type]} {recipe.type.charAt(0).toUpperCase() + recipe.type.slice(1)}
            </span>
            {recipe.fitnessGoal.slice(0, 3).map(goal => (
              <span key={goal} className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 capitalize">
                {goal}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Connecting paper fold visual */}
      <div className="h-4 bg-gradient-to-b from-stone-800 to-amber-50 mx-6 rounded-b-xl shadow-inner"></div>

      {/* ── RECIPE PAPER SCROLL ──────────────────────────────────────────── */}
      <div 
        className="bg-amber-50 rounded-b-3xl shadow-xl"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 27px,
              rgba(180, 140, 80, 0.08) 27px,
              rgba(180, 140, 80, 0.08) 28px
            )
          `,
        }}
      >
        {/* Paper fold crease lines */}
        <div className="px-6 sm:px-10 pt-6 pb-10 space-y-8">
          
          {/* ── QUICK INFO ROW ─────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { icon: <Clock className="w-4 h-4" />, label: 'Persiapan', val: `${recipe.prepTimeMinutes} mnt` },
              { icon: <Flame className="w-4 h-4" />, label: 'Memasak', val: `${recipe.cookTimeMinutes} mnt` },
              { icon: <Users className="w-4 h-4" />, label: 'Porsi', val: `${actualServings} orang` },
              { icon: <ChefHat className="w-4 h-4" />, label: 'Level', val: difficultyConfig[recipe.difficulty].label },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 bg-white/70 rounded-xl px-4 py-2.5 shadow-sm border border-amber-200">
                <span className="text-amber-600">{item.icon}</span>
                <div>
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">{item.label}</div>
                  <div className="text-sm font-black text-stone-700">{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── SECTION DIVIDER ────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            <span className="text-amber-600 text-lg">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
          </div>

          {/* ── TOTAL NUTRITION BANNER ─────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-stone-700 uppercase tracking-wider">Nilai Gizi ({actualServings} Porsi)</h2>
            </div>

            {/* Main macros */}
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <NutritionBadge
                icon={<Flame className="w-4 h-4" />}
                label="Kalori"
                value={`${Math.round(n.calories * servingsMultiplier)}`}
                color="text-orange-600"
                bg="bg-orange-50"
              />
              <NutritionBadge
                icon={<Zap className="w-4 h-4" />}
                label="Protein"
                value={`${Math.round(n.protein * servingsMultiplier * 10) / 10}g`}
                color="text-red-600"
                bg="bg-red-50"
              />
              <NutritionBadge
                icon={<span className="text-sm font-black">CH</span>}
                label="Karbo"
                value={`${Math.round(n.carbs * servingsMultiplier * 10) / 10}g`}
                color="text-amber-700"
                bg="bg-amber-50"
              />
              <NutritionBadge
                icon={<Droplets className="w-4 h-4" />}
                label="Lemak"
                value={`${Math.round(n.fat * servingsMultiplier * 10) / 10}g`}
                color="text-yellow-700"
                bg="bg-yellow-50"
              />
              <NutritionBadge
                icon={<Leaf className="w-4 h-4" />}
                label="Serat"
                value={`${Math.round(n.fiber * servingsMultiplier * 10) / 10}g`}
                color="text-green-700"
                bg="bg-green-50"
              />
            </div>

            {/* Micro nutrients */}
            {(n.vitaminC || n.vitaminA || n.calcium || n.iron || n.potassium || n.sodium) ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {n.sodium && n.sodium > 0 ? <span className="text-[11px] font-bold bg-stone-100 text-stone-600 px-3 py-1 rounded-full">Natrium: {Math.round(n.sodium * servingsMultiplier)}mg</span> : null}
                {n.vitaminC && n.vitaminC > 0 ? <span className="text-[11px] font-bold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">Vitamin C: {Math.round(n.vitaminC * servingsMultiplier * 10) / 10}mg</span> : null}
                {n.vitaminA && n.vitaminA > 0 ? <span className="text-[11px] font-bold bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full">Vitamin A: {Math.round(n.vitaminA * servingsMultiplier * 10) / 10}mcg</span> : null}
                {n.calcium && n.calcium > 0 ? <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Kalsium: {Math.round(n.calcium * servingsMultiplier * 10) / 10}mg</span> : null}
                {n.iron && n.iron > 0 ? <span className="text-[11px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full">Zat Besi: {Math.round(n.iron * servingsMultiplier * 10) / 10}mg</span> : null}
                {n.potassium && n.potassium > 0 ? <span className="text-[11px] font-bold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">Kalium: {Math.round(n.potassium * servingsMultiplier * 10) / 10}mg</span> : null}
              </div>
            ) : null}

            {/* Fitness goal pills */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider self-center">Cocok untuk:</span>
              {recipe.fitnessGoal.map(goal => (
                <span key={goal} className="text-[11px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full capitalize shadow-sm">
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* ── EQUIPMENT ──────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-stone-700 uppercase tracking-wider">Peralatan Masak</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.equipment.map((eq, i) => (
                <span key={i} className={`text-sm px-3 py-1.5 rounded-xl font-semibold border ${eq.essential ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                  {eq.essential ? '★' : '○'} {eq.name}
                </span>
              ))}
            </div>
          </div>

          {/* ── INGREDIENTS ────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧂</span>
                <h2 className="text-base font-black text-stone-700 uppercase tracking-wider">Bahan & Kandungan</h2>
              </div>
              {/* Servings adjuster */}
              <div className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-1.5 border border-amber-200 shadow-sm">
                <button onClick={() => setServingsMultiplier(Math.max(0.5, servingsMultiplier - 0.5))}
                  className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-black text-sm flex items-center justify-center hover:bg-amber-300 transition">
                  −
                </button>
                <span className="text-xs font-black text-stone-700 min-w-[3rem] text-center">{actualServings} porsi</span>
                <button onClick={() => setServingsMultiplier(servingsMultiplier + 0.5)}
                  className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 font-black text-sm flex items-center justify-center hover:bg-amber-300 transition">
                  +
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-400 mb-4 italic">Klik bahan untuk melihat detail nutrisi lengkap</p>

            {Object.entries(groupedIngredients).map(([category, ingredients]) => (
              <div key={category} className="mb-5">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2 pl-1">
                  {categoryLabels[category] || category}
                </h3>
                <div className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <IngredientRow 
                      key={ing.id} 
                      ingredient={ing} 
                      index={recipe.ingredients.indexOf(ing)} 
                      multiplier={servingsMultiplier}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── COOKING STEPS ──────────────────────────────────────────── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-black text-stone-700 uppercase tracking-wider">Cara Memasak</h2>
              <span className="text-xs font-bold text-stone-400">({recipe.steps.length} langkah)</span>
            </div>
            <p className="text-xs text-stone-400 mb-4 italic">Klik langkah untuk detail & tips Chef</p>

            <div className="space-y-3">
              {recipe.steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isActive={activeStep === step.id}
                  isPrompted={index === promptedStepIndex}
                  onToggle={() => {
                    setActiveStep(activeStep === step.id ? null : step.id);
                    if (index === promptedStepIndex) {
                      setPromptedStepIndex(index + 1);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── EXTRA INFO ──────────────────────────────────────────────── */}
          {(recipe.storageInstructions || recipe.variations?.length || recipe.pairingWith?.length) && (
            <>
              <div className="relative">
                <div className="h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"></div>
                <div className="flex items-center justify-center mt-1">
                  <span className="text-[9px] text-amber-400 font-bold uppercase tracking-[0.3em]">— catatan chef —</span>
                </div>
              </div>

              <div className="space-y-4">
                {recipe.storageInstructions && (
                  <div className="bg-white/60 rounded-2xl p-4 border border-amber-200">
                    <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider mb-2">📦 Cara Menyimpan</h3>
                    <p className="text-sm text-stone-700 leading-relaxed">{recipe.storageInstructions}</p>
                  </div>
                )}

                {recipe.variations && recipe.variations.length > 0 && (
                  <div className="bg-white/60 rounded-2xl p-4 border border-amber-200">
                    <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider mb-2">✨ Variasi Resep</h3>
                    <ul className="space-y-1">
                      {recipe.variations.map((v, i) => (
                        <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">▸</span> {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.pairingWith && recipe.pairingWith.length > 0 && (
                  <div className="bg-white/60 rounded-2xl p-4 border border-amber-200">
                    <h3 className="text-xs font-black text-stone-500 uppercase tracking-wider mb-2">🍽️ Cocok Dimakan Dengan</h3>
                    <div className="flex flex-wrap gap-2">
                      {recipe.pairingWith.map((p, i) => (
                        <span key={i} className="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── BOTTOM STAMP ────────────────────────────────────────────── */}
          <div className="flex items-center justify-center pt-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-amber-300 border-dashed flex flex-col items-center justify-center rotate-[-15deg] opacity-60">
                <span className="text-2xl">👨‍🍳</span>
                <span className="text-[8px] font-black text-amber-700 uppercase tracking-wider text-center leading-tight">Resep<br/>Terpercaya</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
