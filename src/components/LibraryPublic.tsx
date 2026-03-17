import React, { useState, useEffect, useMemo } from 'react';
import { Recipe, RecipeFilter } from '../types';
import {
  Search, Flame, Zap, Leaf, Clock, Lock, Sparkles,
  ArrowRight, Filter, X, ChefHat
} from 'lucide-react';

interface LibraryPublicProps {
  recipes: Recipe[];
  onOpenRecipe: (recipe: Recipe) => void;
  onUpgrade: () => void;
}

const TYPE_FILTERS = [
  { id: '', label: 'Semua' },
  { id: 'berkuah', label: '🍲 Berkuah' },
  { id: 'digoreng', label: '🍳 Goreng' },
  { id: 'tumisan', label: '🥘 Tumisan' },
  { id: 'dipanggang', label: '🔥 Panggang' },
  { id: 'dikukus', label: '♨️ Kukus' },
  { id: 'rebusan', label: '🫕 Rebusan' },
  { id: 'mentah', label: '🥗 Salad' },
];

const SMART_FILTERS = [
  { id: 'low-cal-high-protein', label: '⚡ Rendah Kalori Tinggi Protein' },
  { id: 'low-cal-high-fiber', label: '🥗 Rendah Kalori Tinggi Serat' },
];

const typeEmoji: Record<string, string> = {
  berkuah: '🍲', digoreng: '🍳', dipanggang: '🔥', dikukus: '♨️',
  mentah: '🥗', tumisan: '🥘', rebusan: '🫕',
};

const useColumns = () => {
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const updateCols = () => {
      const width = window.innerWidth;
      if (width >= 1280) setCols(4);
      else if (width >= 1024) setCols(3);
      else if (width >= 640) setCols(2);
      else setCols(1);
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  return cols;
};

const LibraryPublic: React.FC<LibraryPublicProps> = ({ recipes, onOpenRecipe, onUpgrade }) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [smartFilter, setSmartFilter] = useState('');
  const cols = useColumns();

  const filtered = recipes.filter(r => {
    if (typeFilter && r.type !== typeFilter) return false;
    
    if (smartFilter === 'low-cal-high-protein') {
      if (r.nutritionPerServing.calories > 400 || r.nutritionPerServing.protein < 20) return false;
    }
    if (smartFilter === 'low-cal-high-fiber') {
      if (r.nutritionPerServing.calories > 400 || r.nutritionPerServing.fiber < 8) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  // Reorder logic: Put all free recipes at the top
  const reordered = useMemo(() => {
    if (filtered.length === 0) return [];
    
    const free = filtered.filter(r => r.isFree);
    const premium = filtered.filter(r => !r.isFree);
    
    return [...free, ...premium];
  }, [filtered]);

  const freeCount = recipes.filter(r => r.isFree).length;
  const premiumCount = recipes.filter(r => !r.isFree).length;

  return (
    <div className="min-h-full bg-amber-50/50 overflow-y-auto custom-scrollbar">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white/85 backdrop-blur-xl border-b border-stone-200 shadow-md shrink-0">
        <div className="max-w-6xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-black text-stone-800">📚 Pustaka Resep</h1>
              <p className="text-[10px] sm:text-xs text-stone-500 font-semibold">
                Tersedia <span className="text-green-600">{freeCount} resep GRATIS</span> dan <span className="text-amber-600">{premiumCount} resep PREMIUM</span>
              </p>
            </div>
            <button
              onClick={onUpgrade}
              className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] sm:text-sm font-black px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 transition-all"
            >
              <ChefHat className="w-3.5 h-3.5" /> Upgrade ke Chef
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari resep... (cth: ayam, berkuah, rendang)"
              className="w-full pl-11 pr-10 py-3 bg-stone-100 border border-stone-200 rounded-xl text-sm font-medium text-stone-800 placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-200 rounded-full">
                <X className="w-3.5 h-3.5 text-stone-400" />
              </button>
            )}
          </div>

          {/* Type filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mb-3">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => { setTypeFilter(f.id); if (f.id) setSmartFilter(''); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                  ${typeFilter === f.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300 hover:text-amber-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Smart filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider self-center mr-1">Filter Pintar:</span>
            {SMART_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => { setSmartFilter(smartFilter === f.id ? '' : f.id); if (f.id) setTypeFilter(''); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                  ${smartFilter === f.id
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-emerald-300 hover:text-emerald-700'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* ── UPGRADE BANNER ────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-stone-800 to-stone-900 rounded-2xl p-5 mb-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #f59e0b 0%, transparent 60%)' }}
          ></div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-black text-sm uppercase tracking-wider">Konten Premium</span>
              </div>
              <p className="text-white font-bold text-base">Unlock ratusan resep premium + filter gizi lengkap</p>
              <p className="text-stone-400 text-sm mt-0.5">Diet, bulking, keto, tinggi protein — semua ada. Berlangganan sekarang untuk akses penuh.</p>
            </div>
            <button
              onClick={onUpgrade}
              className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black px-6 py-3 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              Upgrade ke Chef <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── FREE RECIPES GRID ─────────────────────────────────────────── */}
        {filtered.length === 0 && recipes.length > 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <h3 className="font-black text-stone-700 text-xl mb-2">Resep tidak ditemukan</h3>
            <p className="text-stone-400 text-sm">Coba hapus filter atau ubah kata kunci pencarian</p>
            <button onClick={() => { setSearch(''); setTypeFilter(''); }} className="mt-4 text-amber-600 font-bold underline text-sm">Reset filter</button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-black text-stone-700">
                {typeFilter || smartFilter || search ? `${filtered.length} Hasil` : 'Semua Resep'}
              </h2>
              {(typeFilter || smartFilter || search) && (
                <button onClick={() => { setSearch(''); setTypeFilter(''); setSmartFilter(''); }} className="text-xs text-stone-400 hover:text-red-500 font-bold flex items-center gap-1 transition">
                  <X className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {/* Recipe cards */}
              {reordered.map(recipe => {
                const isPremium = !recipe.isFree;
                return (
                  <div
                    key={recipe.id}
                    onClick={() => isPremium ? onUpgrade() : onOpenRecipe(recipe)}
                    className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative"
                  >
                    <div className="h-44 bg-gradient-to-br from-amber-100 to-orange-200 relative overflow-hidden">
                      {recipe.imageUrl
                        ? <img src={recipe.imageUrl} alt={recipe.title} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isPremium ? 'blur-sm scale-110' : ''}`} />
                        : <div className={`w-full h-full flex items-center justify-center ${isPremium ? 'blur-sm' : ''}`}><span className="text-5xl">{typeEmoji[recipe.type] || '🍽️'}</span></div>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                      
                      {/* Badge (Gratis/Premium) */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {isPremium ? (
                          <span className="text-[10px] font-black bg-amber-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                            <Lock className="w-3 h-3" /> PREMIUM
                          </span>
                        ) : (
                          <span className="text-[10px] font-black bg-green-500 text-white px-2.5 py-1 rounded-full shadow-md">GRATIS</span>
                        )}
                      </div>

                      {/* Fitness Goal Badge */}
                      {recipe.fitnessGoal[0] && recipe.fitnessGoal[0] !== 'maintenance' && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[9px] font-black bg-white/90 text-stone-700 px-2 py-1 rounded-full capitalize shadow-sm">
                            {recipe.fitnessGoal[0]}
                          </span>
                        </div>
                      )}

                      {/* Lock Overlay for Premium */}
                      {isPremium && (
                        <div className="absolute inset-0 bg-stone-900/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Lock className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-wider drop-shadow-md">Buka Akses</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className={`font-black text-sm leading-tight mb-1 transition-colors line-clamp-2 ${isPremium ? 'text-stone-600' : 'text-stone-800 group-hover:text-amber-700'}`}>
                        {recipe.title}
                      </h3>
                      <p className="text-stone-500 text-xs line-clamp-2 mb-3 leading-relaxed">{recipe.description}</p>
                      <div className="flex items-center justify-between text-xs text-stone-400 font-bold">
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{recipe.nutritionPerServing.calories} kal</span>
                        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-red-500" />{recipe.nutritionPerServing.protein}g P</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{recipe.cookTimeMinutes}mnt</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom upgrade nudge */}
            {!typeFilter && !search && (
              <div className="mt-10 text-center">
                <p className="text-stone-500 text-sm mb-4">
                  Ingin akses ke semua resep? Berlangganan sekarang untuk akses penuh tanpa batas.
                </p>
                <button
                  onClick={onUpgrade}
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:scale-105 active:scale-95 transition-all"
                >
                  <ChefHat className="w-5 h-5" /> Upgrade ke Chef — Mulai Rp 20.000
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LibraryPublic;
