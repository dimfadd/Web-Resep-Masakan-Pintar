import React, { useState, useMemo } from 'react';
import { Recipe, RecipeFilter } from '../types';
import {
  Search, Filter, Flame, Zap, Clock, ChefHat, Leaf,
  SlidersHorizontal, X, BookOpen, Plus, Trash2, Edit3,
  TrendingUp, Dumbbell, Salad, Soup, Star
} from 'lucide-react';

interface RecipeLibraryProps {
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onCreateNew: () => void;
  isAdmin: boolean;
  isLoading: boolean;
  isPremium: boolean;
  onUpgrade: () => void;
}

// ─── RECIPE MINI CARD ────────────────────────────────────────────────────

const RecipeMiniCard: React.FC<{
  recipe: Recipe;
  onOpen: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isAdmin: boolean;
}> = ({ recipe, onOpen, onDelete, onEdit, isAdmin }) => {
  const n = recipe.nutritionPerServing;
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  const typeEmoji: Record<string, string> = {
    berkuah: '🍲', digoreng: '🍳', dipanggang: '🔥', dikukus: '♨️',
    mentah: '🥗', tumisan: '🥘', rebusan: '🫕',
  };

  const topGoal = recipe.fitnessGoal.find(g => g !== 'jaga berat badan');

  const goalColors: Record<string, string> = {
    'turun berat badan': 'bg-green-100 text-green-700',
    'naik berat badan': 'bg-red-100 text-red-700',
    'tinggi protein': 'bg-blue-100 text-blue-700',
    'rendah kalori': 'bg-teal-100 text-teal-700',
    'rendah karbo': 'bg-purple-100 text-purple-700',
    'tinggi serat': 'bg-lime-100 text-lime-700',
    'jaga berat badan': 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
         onClick={onOpen}>
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-amber-100 to-orange-200 overflow-hidden shrink-0">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : recipe.isGeneratingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-amber-300 border-t-amber-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{typeEmoji[recipe.type] || '🍽️'}</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Type badge */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-stone-700 shadow-sm">
            {typeEmoji[recipe.type]} {recipe.type}
          </span>
        </div>

        {/* Fitness badge */}
        {topGoal && (
          <div className="absolute top-3 right-3">
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg capitalize shadow-sm ${goalColors[topGoal]}`}>
              {topGoal}
            </span>
          </div>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
               onClick={(e) => e.stopPropagation()}>
            <button onClick={onDelete} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition">
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-black text-stone-800 text-base leading-tight line-clamp-2 group-hover:text-amber-700 transition-colors">
          {recipe.title}
        </h3>
        {recipe.subtitle && (
          <p className="text-[11px] text-stone-400 font-semibold mt-0.5">{recipe.subtitle}</p>
        )}

        <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed flex-1">
          {recipe.description}
        </p>

        {/* Quick stats */}
        <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            {totalTime} mnt
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            {n.calories} kal
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-red-500" />
            {n.protein}g P
          </span>
          <span className="flex items-center gap-1">
            <Leaf className="w-3 h-3 text-green-500" />
            {n.fiber}g S
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── SMART FILTER PANEL ────────────────────────────────────────────────────

const PRESET_GOALS = [
  { id: 'all', label: 'Semua', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'turun berat badan', label: 'Turun Berat Badan', icon: <Salad className="w-4 h-4" /> },
  { id: 'naik berat badan', label: 'Naik Berat Badan', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'tinggi protein', label: 'Tinggi Protein', icon: <Zap className="w-4 h-4" /> },
  { id: 'rendah kalori', label: 'Rendah Kalori', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'tinggi serat', label: 'Tinggi Serat', icon: <Leaf className="w-4 h-4" /> },
  { id: 'rendah karbo', label: 'Rendah Karbo', icon: <Star className="w-4 h-4" /> },
  { id: 'low-cal-high-protein', label: 'Rendah Kalori Tinggi Protein', icon: <Zap className="w-4 h-4" /> },
  { id: 'low-cal-high-fiber', label: 'Rendah Kalori Tinggi Serat', icon: <Leaf className="w-4 h-4" /> },
];

const TYPE_FILTERS = ['berkuah', 'digoreng', 'dipanggang', 'dikukus', 'tumisan', 'rebusan', 'mentah'];

const RecipeLibrary: React.FC<RecipeLibraryProps> = ({
  recipes, onOpenRecipe, onDeleteRecipe, onEditRecipe, onCreateNew, isAdmin, isLoading, isPremium, onUpgrade
}) => {
  const [filter, setFilter] = useState<RecipeFilter>({
    search: '',
    type: [],
    fitnessGoal: [],
    difficulty: [],
  });
  const [activeGoalPreset, setActiveGoalPreset] = useState('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGoalPreset = (goalId: string) => {
    setActiveGoalPreset(goalId);
    if (goalId === 'all') {
      setFilter(prev => ({ ...prev, fitnessGoal: [] }));
    } else {
      setFilter(prev => ({ ...prev, fitnessGoal: [goalId] }));
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      // Search
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const match =
          recipe.title.toLowerCase().includes(q) ||
          recipe.description.toLowerCase().includes(q) ||
          recipe.tags.some(t => t.toLowerCase().includes(q)) ||
          recipe.ingredients.some(i => i.name.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Type filter
      if (filter.type.length > 0 && !filter.type.includes(recipe.type)) return false;

      // Fitness goal
      if (filter.fitnessGoal.length > 0) {
        const hasGoal = filter.fitnessGoal.every(g => recipe.fitnessGoal.includes(g as any));
        if (!hasGoal) return false;
      }

      // Max calories
      if (filter.maxCalories && recipe.nutritionPerServing.calories > filter.maxCalories) return false;

      // Min protein
      if (filter.minProtein && recipe.nutritionPerServing.protein < filter.minProtein) return false;

      // Max cook time
      if (filter.maxCookTime) {
        const total = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
        if (total > filter.maxCookTime) return false;
      }

      // Difficulty
      if (filter.difficulty.length > 0 && !filter.difficulty.includes(recipe.difficulty)) return false;

      // Smart Filters
      if (activeGoalPreset === 'low-cal-high-protein') {
        if (recipe.nutritionPerServing.calories > 400 || recipe.nutritionPerServing.protein < 20) return false;
      }
      if (activeGoalPreset === 'low-cal-high-fiber') {
        if (recipe.nutritionPerServing.calories > 400 || recipe.nutritionPerServing.fiber < 8) return false;
      }

      return true;
    });
  }, [recipes, filter, activeGoalPreset]);

  const reordered = useMemo(() => {
    const free = filteredRecipes.filter(r => r.isFree);
    const premium = filteredRecipes.filter(r => !r.isFree);
    return [...free, ...premium];
  }, [filteredRecipes]);

  const freeCount = recipes.filter(r => r.isFree).length;
  const premiumCount = recipes.filter(r => !r.isFree).length;

  const toggleType = (type: string) => {
    setFilter(prev => ({
      ...prev,
      type: prev.type.includes(type) ? prev.type.filter(t => t !== type) : [...prev.type, type]
    }));
  };

  const typeEmoji: Record<string, string> = {
    berkuah: '🍲', digoreng: '🍳', dipanggang: '🔥', dikukus: '♨️',
    mentah: '🥗', tumisan: '🥘', rebusan: '🫕',
  };

  const clearFilters = () => {
    setFilter({ search: '', type: [], fitnessGoal: [], difficulty: [] });
    setActiveGoalPreset('all');
  };

  const hasActiveFilters = filter.search || filter.type.length > 0 || filter.fitnessGoal.length > 0
    || filter.maxCalories || filter.minProtein || filter.maxCookTime || filter.difficulty.length > 0;

  const displayedRecipes = isPremium || isAdmin ? filteredRecipes : filteredRecipes.slice(0, 10);
  const hasMoreLocked = !isPremium && !isAdmin && filteredRecipes.length > 10;

  return (
    <div id="main-scroll-container" className="flex-1 flex flex-col bg-stone-50">
      
      {/* ── LIBRARY HEADER ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200 px-6 py-5 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-stone-800">📚 Pustaka Resep</h1>
              <p className="text-sm text-stone-500 font-semibold">
                Tersedia <span className="text-green-600">{freeCount} resep GRATIS</span> dan <span className="text-amber-600">{premiumCount} resep PREMIUM</span>
              </p>
            </div>
            {isAdmin && (
              <button onClick={onCreateNew}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.02] active:scale-95 transition-all">
                <Plus className="w-4 h-4" /> Resep Baru
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              placeholder='Cari resep, bahan, atau tips... (cth: "ayam tinggi protein")'
              className="w-full pl-11 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-stone-800 placeholder-stone-400 text-sm font-medium transition"
            />
            {filter.search && (
              <button onClick={() => setFilter(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-200 rounded-full transition">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            )}
          </div>

          {/* Goal presets */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
            {PRESET_GOALS.map(goal => (
              <button
                key={goal.id}
                onClick={() => handleGoalPreset(goal.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all
                  ${activeGoalPreset === goal.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-200'
                    : 'bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-700'}`}
              >
                {goal.icon} {goal.label}
              </button>
            ))}

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ml-auto
                ${showAdvanced ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter Lanjut
            </button>
          </div>

          {/* Advanced filters */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
              {/* Type filters */}
              <div>
                <p className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Jenis Masakan</p>
                <div className="flex flex-wrap gap-2">
                  {TYPE_FILTERS.map(type => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border
                        ${filter.type.includes(type)
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'}`}
                    >
                      {typeEmoji[type]} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numeric filters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-wider block mb-1">Maks. Kalori</label>
                  <input type="number" placeholder="cth. 500"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    value={filter.maxCalories || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, maxCalories: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-wider block mb-1">Min. Protein (g)</label>
                  <input type="number" placeholder="cth. 20"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    value={filter.minProtein || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, minProtein: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
                <div>
                  <label className="text-xs font-black text-stone-400 uppercase tracking-wider block mb-1">Maks. Waktu (mnt)</label>
                  <input type="number" placeholder="cth. 30"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-400"
                    value={filter.maxCookTime || ''}
                    onChange={(e) => setFilter(prev => ({ ...prev, maxCookTime: e.target.value ? Number(e.target.value) : undefined }))} />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <p className="text-xs font-black text-stone-400 uppercase tracking-wider mb-2">Tingkat Kesulitan</p>
                <div className="flex gap-2">
                  {['mudah', 'sedang', 'sulit'].map(d => (
                    <button key={d}
                      onClick={() => setFilter(prev => ({
                        ...prev,
                        difficulty: prev.difficulty.includes(d) ? prev.difficulty.filter(x => x !== d) : [...prev.difficulty, d]
                      }))}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold capitalize transition-all border
                        ${filter.difficulty.includes(d) ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-stone-600 border-stone-200'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[11px] text-stone-400 font-bold">Filter aktif:</span>
              <button onClick={clearFilters}
                className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1 hover:bg-red-100 transition">
                <X className="w-2.5 h-2.5" /> Hapus semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── RECIPE GRID ───────────────────────────────────────────────── */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 gap-3 text-stone-400">
              <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
              Memuat pustaka resep...
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-6xl mb-4">🍽️</span>
              <h3 className="text-xl font-black text-stone-700">
                {recipes.length === 0 ? 'Pustaka Masih Kosong' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-stone-400 text-sm mt-2 max-w-xs">
                {recipes.length === 0 
                  ? 'Mulai dengan mengetik nama masakan di kolom generate.'
                  : 'Coba ubah atau hapus beberapa filter.'}
              </p>
              {recipes.length === 0 && isAdmin && (
                <button onClick={onCreateNew}
                  className="mt-6 flex items-center gap-2 bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-amber-600 transition">
                  <Plus className="w-4 h-4" /> Generate Resep Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {reordered.slice(0, isPremium || isAdmin ? undefined : 10).map(recipe => (
                <RecipeMiniCard
                  key={recipe.id}
                  recipe={recipe}
                  onOpen={() => onOpenRecipe(recipe)}
                  onDelete={() => onDeleteRecipe(recipe.id)}
                  onEdit={() => onEditRecipe(recipe)}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}

          {/* Premium Locked Banner */}
          {hasMoreLocked && (
            <div className="mt-12 bg-gradient-to-br from-stone-800 to-stone-900 rounded-3xl p-8 sm:p-12 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">Upgrade ke Chef</h3>
                <p className="text-stone-300 text-lg mb-8">
                  Ada <span className="text-amber-400 font-bold">{filteredRecipes.length - 10} resep lainnya</span> yang menunggumu! Buka akses penuh ke seluruh pustaka resep dan capai target nutrisimu lebih mudah.
                </p>
                <button 
                  onClick={onUpgrade}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-8 py-4 rounded-xl font-black text-lg transition-all hover:scale-105 shadow-xl shadow-orange-900/50"
                >
                  Upgrade Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeLibrary;
