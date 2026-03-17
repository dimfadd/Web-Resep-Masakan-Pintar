import React, { useState, useEffect } from 'react';
import { Recipe, GenerateParams, PurchaseRequest } from '../types';
import {
  Sparkles, BookOpen, Lock, Unlock, Trash2, RefreshCw,
  Plus, Key, Copy, CheckCircle2, ChefHat, ToggleLeft, ToggleRight,
  Flame, Zap, Clock, Search, Filter, AlertCircle, Loader2, ShoppingCart, Send
} from 'lucide-react';
import { createAccessCodes, getPurchaseRequests, approvePurchaseRequest } from '../services/storageService';

interface AdminPanelProps {
  recipes: Recipe[];
  onGenerate: (params: GenerateParams) => void;
  onDeleteRecipe: (id: string) => void;
  onToggleFree: (id: string, isFree: boolean) => void;
  isGenerating: boolean;
  loadingMessage: string;
}

const QUICK_RECIPES = [
  'buatkan resep nasi goreng kampung',
  'buatkan resep soto ayam bening Lamongan',
  'buatkan resep rendang daging sapi Padang',
  'buatkan resep gado-gado Betawi lengkap',
  'buatkan resep ayam geprek sambal bawang',
  'buatkan resep tempe orek kering pedas',
  'buatkan resep sup bening bayam jagung',
  'buatkan resep gulai ikan kakap',
];

// ── GENERATE SECTION ──────────────────────────────────────────────────────
const GOAL_OPTIONS = [
  { id: '', label: 'Default', emoji: '🍽️' },
  { id: 'tinggi protein untuk menaikkan berat badan', label: 'Bulking', emoji: '💪' },
  { id: 'rendah kalori untuk menurunkan berat badan', label: 'Diet', emoji: '🥗' },
  { id: 'rendah karbo keto', label: 'Keto', emoji: '🥑' },
  { id: 'tinggi serat untuk pencernaan', label: 'Serat', emoji: '🌿' },
];

const GenerateSection: React.FC<{
  onGenerate: (params: GenerateParams) => void;
  isGenerating: boolean;
  loadingMessage: string;
}> = ({ onGenerate, isGenerating, loadingMessage }) => {
  const [query, setQuery] = useState('');
  const [servings, setServings] = useState(1);
  const [goalHint, setGoalHint] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isGenerating) return;
    onGenerate({ query: query.trim(), servings, fitnessGoalHint: goalHint });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-stone-800 text-base">Generate Resep Baru</h2>
          <p className="text-xs text-stone-400 font-semibold">Resep baru langsung masuk ke pustaka sebagai Premium</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Ketik nama masakan... cth: "buatkan resep gudeg jogja tradisional"'
          rows={2}
          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold placeholder-stone-400 outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition resize-none text-sm"
        />

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
            <span className="text-xs font-black text-stone-500">Porsi:</span>
            <button type="button" onClick={() => setServings(Math.max(1, servings - 1))}
              className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full font-black flex items-center justify-center hover:bg-amber-300 transition text-sm">−</button>
            <span className="w-6 text-center font-black text-stone-700 text-sm">{servings}</span>
            <button type="button" onClick={() => setServings(Math.min(20, servings + 1))}
              className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full font-black flex items-center justify-center hover:bg-amber-300 transition text-sm">+</button>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl px-2 py-1.5 overflow-x-auto no-scrollbar max-w-full sm:max-w-xs">
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setGoalHint(opt.id)}
                className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all border
                  ${goalHint === opt.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-amber-300'}`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isGenerating || !query.trim()}
            className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-2.5 rounded-xl shadow-lg shadow-amber-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
          >
            {isGenerating
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadingMessage || 'Membuat resep...'}</>
              : <><Sparkles className="w-4 h-4" /> Generate</>
            }
          </button>
        </div>
      </form>

      {/* Quick suggestions */}
      <div className="mt-4 pt-4 border-t border-stone-100">
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider mb-2">Cepat:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_RECIPES.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(r)}
              disabled={isGenerating}
              className="text-[11px] font-bold bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {r.replace('buatkan resep ', '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── ACCESS CODES SECTION ──────────────────────────────────────────────────
const AccessCodesSection: React.FC = () => {
  const [count, setCount] = useState(5);
  const [generated, setGenerated] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const generateCodeString = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return 'CHEF-' +
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' +
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const handleGenerate = async () => {
    setIsCreating(true);
    setErrorMsg(null);
    try {
      const codes = Array.from({ length: count }, () => generateCodeString());
      await createAccessCodes(codes);
      setGenerated(codes);
    } catch (e) {
      setErrorMsg('Gagal membuat kode. Cek koneksi Firebase.');
    } finally {
      setIsCreating(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(generated.join('\n'));
    setCopied('all');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-black text-stone-800 text-base">Generate Kode Akses</h2>
          <p className="text-xs text-stone-400 font-semibold">Buat kode untuk dikirim ke pelanggan</p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
          <span className="text-xs font-black text-stone-500">Jumlah kode:</span>
          <button onClick={() => setCount(Math.max(1, count - 1))}
            className="w-6 h-6 bg-green-200 text-green-800 rounded-full font-black flex items-center justify-center hover:bg-green-300 transition text-sm">−</button>
          <span className="w-6 text-center font-black text-stone-700">{count}</span>
          <button onClick={() => setCount(Math.min(50, count + 1))}
            className="w-6 h-6 bg-green-200 text-green-800 rounded-full font-black flex items-center justify-center hover:bg-green-300 transition text-sm">+</button>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isCreating}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black py-2.5 rounded-xl shadow-lg shadow-green-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-sm"
        >
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Buat {count} Kode
        </button>
      </div>

      {generated.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-stone-500 uppercase tracking-wider">{generated.length} Kode Baru</span>
            <button onClick={copyAll} className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition">
              {copied === 'all' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied === 'all' ? 'Tersalin!' : 'Salin semua'}
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {generated.map(code => (
              <div key={code} className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-3 py-2">
                <span className="font-mono font-black text-stone-700 text-sm tracking-widest">{code}</span>
                <button onClick={() => copyCode(code)} className="p-1 hover:bg-stone-100 rounded transition">
                  {copied === code
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    : <Copy className="w-3.5 h-3.5 text-stone-400" />
                  }
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 mt-3 font-semibold">
            ✅ Kode sudah disimpan ke Firestore. Kirim ke pelanggan setelah konfirmasi pembayaran.
          </p>
        </div>
      )}
    </div>
  );
};

// ── RECIPE MANAGEMENT ─────────────────────────────────────────────────────
const RecipeManagement: React.FC<{
  recipes: Recipe[];
  onDelete: (id: string) => void;
  onToggleFree: (id: string, isFree: boolean) => void;
}> = ({ recipes, onDelete, onToggleFree }) => {
  const [search, setSearch] = useState('');
  const [filterFree, setFilterFree] = useState<'all' | 'free' | 'premium'>('all');

  const filtered = recipes.filter(r => {
    if (filterFree === 'free' && !r.isFree) return false;
    if (filterFree === 'premium' && r.isFree) return false;
    if (search) return r.title.toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const freeCount = recipes.filter(r => r.isFree).length;
  const premiumCount = recipes.filter(r => !r.isFree).length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-stone-800 text-base">Kelola Resep</h2>
              <p className="text-xs text-stone-400 font-semibold">{recipes.length} total · {freeCount} gratis · {premiumCount} premium</p>
            </div>
          </div>
          {/* Stats pills */}
          <div className="flex gap-2">
            <span className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Unlock className="w-3 h-3" /> {freeCount} gratis
            </span>
            <span className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> {premiumCount} premium
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari resep..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400 transition font-medium"
            />
          </div>
          <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
            {(['all','free','premium'] as const).map(f => (
              <button key={f} onClick={() => setFilterFree(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all
                  ${filterFree === f ? 'bg-white text-amber-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}>
                {f === 'all' ? 'Semua' : f === 'free' ? 'Gratis' : 'Premium'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recipe list */}
      <div className="max-h-[500px] overflow-y-auto divide-y divide-stone-100">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">Belum ada resep</p>
          </div>
        ) : filtered.map(recipe => (
          <div key={recipe.id} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition group">
            {/* Image thumbnail */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-amber-100 shrink-0">
              {recipe.imageUrl
                ? <img src={recipe.imageUrl} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-stone-800 text-sm truncate">{recipe.title}</h4>
              <div className="flex items-center gap-3 text-xs text-stone-400 font-semibold mt-0.5">
                <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-400" />{recipe.nutritionPerServing.calories}kal</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-red-400" />{recipe.nutritionPerServing.protein}g P</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-400" />{recipe.cookTimeMinutes}mnt</span>
              </div>
            </div>

            {/* Free/Premium toggle */}
            <button
              onClick={() => onToggleFree(recipe.id, !recipe.isFree)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black border transition-all hover:scale-105
                ${recipe.isFree
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
              title={recipe.isFree ? 'Klik untuk jadikan Premium' : 'Klik untuk jadikan Gratis'}
            >
              {recipe.isFree ? <><Unlock className="w-3 h-3" /> Gratis</> : <><Lock className="w-3 h-3" /> Premium</>}
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(recipe.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PURCHASE REQUESTS SECTION ──────────────────────────────────────────────
const PurchaseRequestsSection: React.FC = () => {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    const data = await getPurchaseRequests();
    setRequests(data);
    setIsLoading(false);
  };

  const handleApprove = async (request: PurchaseRequest) => {
    setProcessingId(request.id);
    try {
      // Generate a code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const code = 'CHEF-' +
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('') + '-' +
        Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      
      await approvePurchaseRequest(request.id, code, request.email);
      await loadRequests();
    } catch (e) {
      console.error("Failed to approve request", e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendWa = (request: PurchaseRequest) => {
    if (!request.code) return;
    
    // Format WA number (replace leading 0 with 62)
    let waNumber = request.whatsapp.replace(/\D/g, '');
    if (waNumber.startsWith('0')) {
      waNumber = '62' + waNumber.substring(1);
    }
    
    const message = `Halo ${request.name}! Terima kasih telah membeli akses Chef di Resep Masakan Pintar.\n\nPembayaran Anda telah kami konfirmasi. Berikut adalah kode akses Anda:\n\n*${request.code}*\n\nSilakan masukkan email Anda (${request.email}) dan kode ini di website untuk login.\n\nSelamat memasak! 👨‍🍳👩‍🍳`;
    
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
            <ShoppingCart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-stone-800 text-base">Pesanan Akses Chef</h2>
            <p className="text-xs text-stone-400 font-semibold">Kelola pembelian dan kirim kode via WhatsApp</p>
          </div>
        </div>
        <button onClick={loadRequests} disabled={isLoading} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition">
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 text-stone-300 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="py-12 text-center text-stone-400 font-semibold">
          Belum ada pesanan masuk.
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className={`border rounded-xl p-4 ${req.status === 'approved' ? 'bg-stone-50 border-stone-200' : 'bg-white border-amber-200 shadow-sm'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-stone-800">{req.name}</h3>
                    {req.status === 'approved' ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-full">Selesai</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full animate-pulse">Menunggu</span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 space-y-0.5">
                    <div className="flex items-center gap-1"><span>WA:</span> <strong className="text-stone-700">{req.whatsapp}</strong></div>
                    <div className="flex items-center gap-1"><span>Email:</span> <strong className="text-stone-700">{req.email}</strong></div>
                    {req.plan && (
                      <div className="flex items-center gap-1">
                        <span>Paket:</span> 
                        <strong className={`px-1.5 py-0.5 rounded text-[10px] ${req.plan === 'yearly' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {req.plan === 'yearly' ? 'Tahunan' : 'Bulanan'}
                        </strong>
                      </div>
                    )}
                    <div className="text-[10px] text-stone-400 mt-1">{new Date(req.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {req.status === 'pending' ? (
                    <button
                      onClick={() => handleApprove(req)}
                      disabled={processingId === req.id}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-xl font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {processingId === req.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Konfirmasi & Buat Kode
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-stone-200 px-3 py-1.5 rounded-lg text-stone-700 font-black tracking-widest text-sm">
                        {req.code}
                      </div>
                      <button
                        onClick={() => handleSendWa(req)}
                        className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-black text-xs shadow-sm hover:bg-green-600 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" /> Kirim via WA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── MAIN ADMIN PANEL ──────────────────────────────────────────────────────
const AdminPanel: React.FC<AdminPanelProps> = ({
  recipes, onGenerate, onDeleteRecipe, onToggleFree, isGenerating, loadingMessage
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'manage' | 'codes' | 'orders'>('generate');

  return (
    <div id="main-scroll-container" className="flex-1 flex flex-col bg-stone-100">
      {/* Admin header */}
      <div className="bg-stone-900 text-white px-6 py-4 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-black text-base">Admin Panel</h1>
              <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Resep Masakan Pintar</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold">
            <AlertCircle className="w-3.5 h-3.5" /> Mode Admin — ?access=editor
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-stone-800 px-6 shrink-0 sticky top-0 z-20 shadow-md">
        <div className="max-w-5xl mx-auto flex gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'generate', label: 'Generate', icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'manage', label: `Kelola Resep (${recipes.length})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
            { id: 'orders', label: 'Pesanan', icon: <ShoppingCart className="w-3.5 h-3.5" /> },
            { id: 'codes', label: 'Kode Akses', icon: <Key className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-black border-b-2 transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'text-amber-400 border-amber-400'
                  : 'text-stone-400 border-transparent hover:text-stone-200'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === 'generate' && (
            <div className="space-y-6">
              <GenerateSection onGenerate={onGenerate} isGenerating={isGenerating} loadingMessage={loadingMessage} />
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong>Alur kerja:</strong> Generate resep → Otomatis masuk ke Pustaka sebagai <strong>Premium</strong> → Buka tab "Kelola Resep" → Toggle jadi <strong>Gratis</strong> untuk resep pilihan (max 10 gratis).
                </div>
              </div>
            </div>
          )}

          {activeTab === 'manage' && (
            <RecipeManagement recipes={recipes} onDelete={onDeleteRecipe} onToggleFree={onToggleFree} />
          )}

          {activeTab === 'orders' && (
            <PurchaseRequestsSection />
          )}

          {activeTab === 'codes' && (
            <div className="space-y-6">
              <AccessCodesSection />
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800 font-semibold flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  Setiap kode hanya bisa dipakai <strong>satu kali</strong>. Setelah pelanggan masukkan kode, statusnya berubah jadi "used" di Firestore dan tidak bisa dipakai lagi.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
