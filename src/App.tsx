import React, { useState, useEffect, useRef } from 'react';
import { Recipe, AppView, GenerateParams, UserTier } from './types';
import * as geminiService from './services/geminiService';
import * as storageService from './services/storageService';

import LandingPage from './components/LandingPage';
import LibraryPublic from './components/LibraryPublic';
import RecipeCard from './components/RecipeCard';
import RecipeLibrary from './components/RecipeLibrary';
import AdminPanel from './components/AdminPanel';
import UpgradeModal from './components/UpgradeModal';

import { ChefHat, BookOpen, Plus, Loader2, CheckCircle2, AlertCircle, LogOut, Crown, Calculator } from 'lucide-react';
import CalorieCalculatorModal from './components/CalorieCalculatorModal';
import { motion, AnimatePresence } from 'motion/react';

// ─── HELPERS ──────────────────────────────────────────────────────────────

const CHEF_STORAGE_KEY = 'rmp_chef_access';

const getStoredChefAccess = (): { code: string; unlockedAt: string } | null => {
  try {
    const raw = localStorage.getItem(CHEF_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const setStoredChefAccess = (code: string) => {
  try {
    localStorage.setItem(CHEF_STORAGE_KEY, JSON.stringify({ code, unlockedAt: new Date().toISOString() }));
  } catch (e) { console.warn(e); }
};

const clearChefAccess = () => {
  try { localStorage.removeItem(CHEF_STORAGE_KEY); } catch (e) {}
};

// ─── TOAST ────────────────────────────────────────────────────────────────

interface ToastState { message: string; type: 'success' | 'error' }

const Toast: React.FC<ToastState> = ({ message, type }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm max-w-sm animate-in slide-in-from-bottom-4
    ${type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
  {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
  {message}
  </div>
);

// ─── SAVING OVERLAY ────────────────────────────────────────────────────────

const SavingOverlay = () => (
  <div className="fixed inset-0 bg-black/50 z-[200] flex flex-col items-center justify-center backdrop-blur-sm">
    <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      <div className="text-center">
        <h3 className="text-lg font-black text-stone-800">Menyimpan Resep...</h3>
        <p className="text-stone-400 text-sm mt-1">Mengunggah foto masakan ke cloud</p>
      </div>
    </div>
  </div>
);

// ─── CHEF/ADMIN NAVBAR ────────────────────────────────────────────────────

const AppNavbar: React.FC<{
  userTier: UserTier;
  view: AppView;
  recipesCount: number;
  onGoHome: () => void;
  onGoLibrary: () => void;
  onGoGenerate: () => void;
  onLogout: () => void;
}> = ({ userTier, view, recipesCount, onGoHome, onGoLibrary, onGoGenerate, onLogout }) => (
  <nav className="bg-white/80 backdrop-blur-2xl border-b border-stone-200 px-4 sm:px-6 py-3 flex items-center justify-between z-50 shrink-0 shadow-md sticky top-0">
    <div className="flex items-center gap-3 cursor-pointer group" onClick={onGoHome}>
      <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
        <ChefHat className="w-5 h-5 text-white" />
      </div>
      <div className="hidden sm:block">
        <h1 className="text-base font-black text-stone-800 leading-tight">Resep Masakan Pintar</h1>
        <span className="text-[9px] uppercase font-bold text-stone-400 tracking-widest">
          {userTier === 'admin' ? '⚙️ Admin Mode' : userTier === 'chef' ? '👨‍🍳 Chef Member' : 'Dapur Digital'}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
      {userTier === 'admin' && (
        <button onClick={onGoGenerate}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
            ${['admin'].includes(view) ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
          <Plus className="w-3.5 h-3.5" /> Admin
        </button>
      )}
      <button onClick={onGoLibrary}
        className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all
          ${view === 'library' || view === 'library_full' ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
        <BookOpen className="w-3.5 h-3.5" />
        Pustaka
        {recipesCount > 0 && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-1.5 rounded-full">{recipesCount}</span>
        )}
      </button>
    </div>

    <div className="flex items-center gap-2">
      {userTier === 'chef' && (
        <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black px-3 py-1.5 rounded-full">
          <Crown className="w-3.5 h-3.5" /> Chef Member
        </div>
      )}
      <button onClick={onLogout}
        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
        title={userTier === 'chef' ? 'Keluar dari Chef' : 'Keluar'}>
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  </nav>
);

// ─── APP ───────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  // ── Tier & View ───────────────────────────────────────────────────────
  const [userTier, setUserTier] = useState<UserTier>('public');
  const [view, setView] = useState<AppView>('landing');

  // ── Data ──────────────────────────────────────────────────────────────
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [freeRecipes, setFreeRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // ── UI State ──────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [previousView, setPreviousView] = useState<AppView>('landing');
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showCalorieCalc, setShowCalorieCalc] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Scroll position preservation ──────────────────────────────────────
  const scrollPosRef = useRef(0);

  useEffect(() => {
    if (view === 'recipe_detail') {
      // Always start at top for detail view
      const scrollable = document.getElementById('main-scroll-container');
      if (scrollable) scrollable.scrollTo(0, 0);
      window.scrollTo(0, 0);
    } else if (['library_public', 'library_full', 'admin', 'landing'].includes(view)) {
      // Restore scroll position if we have one saved
      if (scrollPosRef.current > 0) {
        const targetPos = scrollPosRef.current;
        let attempts = 0;
        const maxAttempts = 20; // Try for up to 2 seconds
        
        const tryRestore = () => {
          const scrollable = document.getElementById('main-scroll-container');
          if (scrollable) {
            scrollable.scrollTo(0, targetPos);
            
            // Check if it actually scrolled. Some views might need more time to render content
            // We use a small tolerance for the comparison
            if (Math.abs(scrollable.scrollTop - targetPos) > 5 && attempts < maxAttempts) {
              attempts++;
              setTimeout(tryRestore, 100);
            }
          } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryRestore, 100);
          }
        };
        
        setTimeout(tryRestore, 100);
      }
    } else {
      // Default reset for other views
      const scrollable = document.getElementById('main-scroll-container');
      if (scrollable) scrollable.scrollTo(0, 0);
      window.scrollTo(0, 0);
      scrollPosRef.current = 0;
    }
  }, [view]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessParam = params.get('access');

    if (accessParam === 'editor') {
      // Admin mode
      setUserTier('admin');
      setView('admin');
      loadAllRecipes();
    } else {
      // Check Chef access from localStorage
      const chefAccess = getStoredChefAccess();
      if (chefAccess) {
        setUserTier('chef');
        setView('library_full');
        loadAllRecipes();
      } else {
        // Public mode
        setUserTier('public');
        setView('landing');
        loadAllRecipes(); // Load all recipes so public can see locked premium ones
      }
    }
  }, []);

  // ── Toast helper ──────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Data loaders ──────────────────────────────────────────────────────
  const loadAllRecipes = async () => {
    if (allRecipes.length === 0) setIsLoadingLibrary(true);
    try {
      const data = await storageService.getAllRecipesFromDB();
      setAllRecipes(data);
      setFreeRecipes(data.filter(r => r.isFree));
      setSavedIds(new Set(data.map(r => r.id)));
    } catch (e) { console.error(e); }
    finally { setIsLoadingLibrary(false); }
  };

  const loadFreeRecipes = async () => {
    if (freeRecipes.length === 0) setIsLoadingLibrary(true);
    try {
      const data = await storageService.getFreeRecipesFromDB();
      setFreeRecipes(data);
    } catch (e) { console.error(e); }
    finally { setIsLoadingLibrary(false); }
  };

  // ── Generate Recipe ───────────────────────────────────────────────────
  const handleGenerate = async (params: GenerateParams) => {
    setIsGenerating(true);
    setLoadingMsg('🤔 Merancang resep...');

    try {
      const recipe = await geminiService.generateRecipe(params);
      // New recipes default to premium (isFree: false)
      const newRecipe = { ...recipe, isFree: false };

      setCurrentRecipe(newRecipe);
      setView('recipe_detail');

      // Auto-save to DB (admin flow)
      if (userTier === 'admin') {
        setIsSaving(true);
        try {
          await storageService.saveRecipeToDB(newRecipe);
          setAllRecipes(prev => [newRecipe, ...prev]);
          setSavedIds(prev => new Set([...prev, newRecipe.id]));
          showToast('✅ Resep disimpan sebagai Premium. Toggle ke Gratis di panel Kelola Resep.');
        } catch (e) { showToast('Resep dibuat tapi gagal disimpan', 'error'); }
        finally { setIsSaving(false); }
      }

      // Generate image in background
      setLoadingMsg('🎨 Melukis foto masakan...');
      setCurrentRecipe(prev => prev ? { ...prev, isGeneratingImage: true } : null);
      try {
        const imageUrl = await geminiService.generateRecipeImage(newRecipe);
        const withImage = { ...newRecipe, imageUrl, isGeneratingImage: false };
        setCurrentRecipe(withImage);
        // Update in DB if admin
        if (userTier === 'admin') {
          await storageService.updateRecipeInDB(newRecipe.id, { imageUrl, isGeneratingImage: false });
          setAllRecipes(prev => prev.map(r => r.id === newRecipe.id ? withImage : r));
        }
      } catch {
        setCurrentRecipe(prev => prev ? { ...prev, isGeneratingImage: false } : null);
      }

    } catch (error: any) {
      showToast(`Gagal generate: ${error?.message || 'Coba lagi'}`, 'error');
      if (userTier === 'admin') setView('admin');
    } finally {
      setIsGenerating(false);
      setLoadingMsg('');
    }
  };

  // ── Save Recipe (Chef user) ───────────────────────────────────────────
  const handleSaveRecipe = async () => {
    if (!currentRecipe) return;
    setIsSaving(true);
    try {
      await storageService.saveRecipeToDB(currentRecipe);
      setAllRecipes(prev => {
        const exists = prev.find(r => r.id === currentRecipe.id);
        return exists ? prev.map(r => r.id === currentRecipe.id ? currentRecipe : r) : [currentRecipe, ...prev];
      });
      setSavedIds(prev => new Set([...prev, currentRecipe.id]));
      showToast('✅ Resep disimpan!');
    } catch (e: any) {
      showToast(`Gagal: ${e?.message}`, 'error');
    } finally { setIsSaving(false); }
  };

  // ── Open Recipe ───────────────────────────────────────────────────────
  const handleOpenRecipe = (recipe: Recipe) => {
    // Save current scroll position before switching to detail view
    const scrollable = document.getElementById('main-scroll-container');
    if (scrollable) {
      scrollPosRef.current = scrollable.scrollTop;
    }
    
    setPreviousView(view);
    setCurrentRecipe(recipe);
    setView('recipe_detail');
  };

  // ── Delete Recipe ─────────────────────────────────────────────────────
  const handleDeleteRecipe = (id: string) => {
    setRecipeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    const id = recipeToDelete;
    setRecipeToDelete(null);
    setAllRecipes(prev => prev.filter(r => r.id !== id));
    setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    try { await storageService.deleteRecipeFromDB(id); showToast('Resep dihapus'); }
    catch { showToast('Gagal menghapus', 'error'); }
  };

  // ── Toggle Free Status ────────────────────────────────────────────────
  const handleToggleFree = async (id: string, isFree: boolean) => {
    setAllRecipes(prev => prev.map(r => r.id === id ? { ...r, isFree } : r));
    try {
      await storageService.toggleRecipeFreeStatus(id, isFree);
      showToast(isFree ? '✅ Resep dijadikan Gratis' : '🔒 Resep dijadikan Premium');
    } catch {
      setAllRecipes(prev => prev.map(r => r.id === id ? { ...r, isFree: !isFree } : r));
      showToast('Gagal mengubah status', 'error');
    }
  };

  // ── Upgrade Success ───────────────────────────────────────────────────
  const handleUpgradeSuccess = async (code: string) => {
    setStoredChefAccess(code);
    setUserTier('chef');
    setShowUpgradeModal(false);
    showToast('🎉 Selamat! Akses Chef kamu telah aktif!');
    await loadAllRecipes();
    setView('library_full');
  };

  // ── Logout / Reset Tier ───────────────────────────────────────────────
  const handleLogout = () => {
    if (userTier === 'admin') {
      window.location.href = window.location.pathname;
    } else if (userTier === 'chef') {
      setShowLogoutConfirm(true);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    clearChefAccess();
    setUserTier('public');
    setView('landing');
    loadFreeRecipes();
  };

  // ── Back handler ──────────────────────────────────────────────────────
  const handleBack = () => {
    if (userTier === 'admin') setView('admin');
    else if (userTier === 'chef') setView('library_full');
    else setView(previousView === 'library_public' ? 'library_public' : 'landing');
  };

  // ── Library nav ───────────────────────────────────────────────────────
  const handleGoLibrary = () => {
    scrollPosRef.current = 0; // Reset scroll when explicitly navigating to library
    if (userTier === 'admin' || userTier === 'chef') {
      setView('library_full');
      loadAllRecipes(); // Refresh in background
    } else {
      setView('library_public');
      loadFreeRecipes(); // Refresh in background
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────

  // PUBLIC flow — no nav bar
  if (userTier === 'public') {
    return (
      <div 
        className="h-full w-full overflow-hidden flex flex-col" 
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        {isSaving && <SavingOverlay />}
        {toast && <Toast message={toast.message} type={toast.type} />}
        {showUpgradeModal && (
          <UpgradeModal
            onClose={() => setShowUpgradeModal(false)}
            onSuccess={handleUpgradeSuccess}
          />
        )}

        <AnimatePresence>
          {showCalorieCalc && (
            <CalorieCalculatorModal onClose={() => setShowCalorieCalc(false)} />
          )}
        </AnimatePresence>

        {/* Floating Calorie Calculator Button */}
        {view !== 'recipe_detail' && (
          <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
                className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-stone-100 relative mb-1"
              >
                <p className="text-[11px] font-black text-stone-800 whitespace-nowrap flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  Cek Kebutuhan Kalori Harianmu! 🍎
                </p>
                {/* Triangle pointer */}
                <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-stone-100 rotate-45"></div>
              </motion.div>
            </AnimatePresence>

            <div className="relative">
              {/* Pulsing background ring */}
              <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-20"></div>
              
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCalorieCalc(true)}
                className="relative z-10 bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white p-4 rounded-2xl shadow-2xl shadow-red-200 flex items-center justify-center group"
              >
                <div className="p-1 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                  <Calculator className="w-7 h-7" />
                </div>
              </motion.button>
            </div>
          </div>
        )}

        {view === 'landing' && (
          <div id="main-scroll-container" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <LandingPage
              freeRecipes={freeRecipes}
              onEnterLibrary={() => { scrollPosRef.current = 0; setView('library_public'); }}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
        )}

        {view === 'library_public' && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Simple public navbar */}
            <nav className="bg-white/80 backdrop-blur-2xl border-b border-stone-200 px-5 py-3 flex items-center justify-between shadow-md shrink-0">
              <button onClick={() => { scrollPosRef.current = 0; setView('landing'); }} className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <ChefHat className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-stone-800 text-sm hidden sm:block">Resep Masakan Pintar</span>
              </button>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] sm:text-xs font-black px-3 py-2 sm:px-4 sm:py-2 rounded-xl shadow-lg shadow-amber-200 hover:scale-105 active:scale-95 transition-all"
              >
                <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Upgrade ke Chef
              </button>
            </nav>
            <LibraryPublic
              recipes={allRecipes}
              onOpenRecipe={handleOpenRecipe}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
        )}

        {view === 'recipe_detail' && currentRecipe && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-stone-100">
            <nav className="bg-white border-b border-stone-200 px-5 py-3 flex items-center justify-between shadow-sm shrink-0">
              <button onClick={handleBack} className="flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-amber-600 transition">
                ← Kembali
              </button>
              <button onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:scale-105 transition-all">
                <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Upgrade ke Chef
              </button>
            </nav>
            <div id="main-scroll-container" className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-6 px-4 sm:px-6">
              <RecipeCard recipe={currentRecipe} onClose={handleBack} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ADMIN + CHEF flow — with nav bar
  return (
    <div className="h-full w-full flex flex-col bg-stone-100 overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {isSaving && <SavingOverlay />}
      {toast && <Toast message={toast.message} type={toast.type} />}

      <AnimatePresence>
        {showCalorieCalc && (
          <CalorieCalculatorModal onClose={() => setShowCalorieCalc(false)} />
        )}
      </AnimatePresence>

      {/* Floating Calorie Calculator Button */}
      {view !== 'recipe_detail' && (
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end gap-3">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="bg-white px-4 py-2 rounded-2xl shadow-xl border border-stone-100 relative mb-1"
            >
              <p className="text-[11px] font-black text-stone-800 whitespace-nowrap flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                Cek Gizi & Kalori Harianmu! 🍎
              </p>
              {/* Triangle pointer */}
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-stone-100 rotate-45"></div>
            </motion.div>
          </AnimatePresence>

          <div className="relative">
            {/* Pulsing background ring */}
            <div className="absolute inset-0 bg-red-500 rounded-2xl animate-ping opacity-20"></div>
            
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCalorieCalc(true)}
              className="relative z-10 bg-gradient-to-br from-red-500 via-rose-600 to-red-700 text-white p-4 rounded-2xl shadow-2xl shadow-red-200 flex items-center justify-center group"
            >
              <div className="p-1 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                <Calculator className="w-7 h-7" />
              </div>
            </motion.button>
          </div>
        </div>
      )}

      {view !== 'recipe_detail' && (
        <AppNavbar
          userTier={userTier}
          view={view}
          recipesCount={allRecipes.length}
          onGoHome={() => setView(userTier === 'admin' ? 'admin' : 'library_full')}
          onGoLibrary={handleGoLibrary}
          onGoGenerate={() => setView('admin')}
          onLogout={handleLogout}
        />
      )}

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">

        {/* ADMIN PANEL */}
        {view === 'admin' && userTier === 'admin' && (
          <AdminPanel
            recipes={allRecipes}
            onGenerate={handleGenerate}
            onDeleteRecipe={handleDeleteRecipe}
            onToggleFree={handleToggleFree}
            isGenerating={isGenerating}
            loadingMessage={loadingMsg}
          />
        )}

        {/* FULL LIBRARY (chef + admin) */}
        {(view === 'library_full' || view === 'library') && (
          <RecipeLibrary
            recipes={allRecipes}
            onOpenRecipe={handleOpenRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onEditRecipe={handleOpenRecipe}
            onCreateNew={() => userTier === 'admin' ? setView('admin') : undefined}
            isAdmin={userTier === 'admin'}
            isPremium={(userTier as string) !== 'public'}
            onUpgrade={() => setShowUpgradeModal(true)}
            isLoading={isLoadingLibrary}
          />
        )}

        {/* RECIPE DETAIL (chef + admin) */}
        {view === 'recipe_detail' && currentRecipe && (
          <div id="main-scroll-container" className="flex-1 min-h-0 overflow-y-auto bg-stone-100 custom-scrollbar">
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-md">
              <button onClick={handleBack} className="text-sm font-bold text-stone-600 hover:text-amber-600 transition">
                ← Kembali
              </button>
              {userTier === 'chef' && !savedIds.has(currentRecipe.id) && (
                <button onClick={handleSaveRecipe} disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                  <BookOpen className="w-4 h-4" /> Simpan ke Pustaka
                </button>
              )}
              {savedIds.has(currentRecipe.id) && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 px-4 py-2 rounded-xl text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Tersimpan
                </div>
              )}
            </div>
            <div className="py-6 px-4 sm:px-6">
              <RecipeCard recipe={currentRecipe} onClose={handleBack} isSaved={savedIds.has(currentRecipe.id)} />
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {recipeToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-800 text-center mb-2">Hapus Resep?</h3>
            <p className="text-sm text-stone-500 text-center mb-6 font-medium">
              Tindakan ini tidak dapat dibatalkan. Resep akan dihapus secara permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRecipeToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition">
                Batal
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-stone-800 text-center mb-2">Keluar dari Akses Chef?</h3>
            <p className="text-sm text-stone-500 text-center mb-6 font-medium">
              Kamu akan kembali ke mode publik. Kamu perlu memasukkan kode akses lagi nanti untuk masuk.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition">
                Batal
              </button>
              <button onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 transition">
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
