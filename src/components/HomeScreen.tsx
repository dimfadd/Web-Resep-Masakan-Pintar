import React, { useState } from 'react';
import { GenerateParams } from '../types';
import { Sparkles, ChefHat, Flame, Zap, Leaf, Clock, Users, Search } from 'lucide-react';

interface HomeScreenProps {
  onGenerate: (params: GenerateParams) => void;
  isGenerating: boolean;
  loadingMessage: string;
}

const QUICK_SUGGESTIONS = [
  { label: 'Gudeg Jogja', query: 'buatkan resep gudeg jogja tradisional' },
  { label: 'Ayam Geprek', query: 'buatkan resep ayam geprek sambal bawang tinggi protein' },
  { label: 'Gado-Gado', query: 'buatkan resep gado-gado betawi lengkap' },
  { label: 'Soto Betawi', query: 'buatkan resep soto betawi santan gurih' },
  { label: 'Tempe Orek', query: 'buatkan resep tempe orek kering untuk diet' },
  { label: 'Sup Bening', query: 'buatkan resep sup bening bayam jagung rendah kalori' },
  { label: 'Rendang', query: 'buatkan resep rendang daging sapi padang asli' },
  { label: 'Tumis Kangkung', query: 'buatkan resep tumis kangkung belacan' },
];

const GOAL_OPTIONS = [
  { id: '', label: 'Tidak ada preferensi', emoji: '🍽️' },
  { id: 'tinggi protein untuk menaikkan berat badan', label: 'Tinggi Protein — Naik Berat Badan', emoji: '💪' },
  { id: 'rendah kalori untuk menurunkan berat badan', label: 'Rendah Kalori — Turun Berat Badan', emoji: '🥗' },
  { id: 'rendah karbo keto', label: 'Rendah Karbo — Keto', emoji: '🥑' },
  { id: 'tinggi serat untuk pencernaan', label: 'Tinggi Serat — Kesehatan', emoji: '🌿' },
  { id: 'seimbang untuk menjaga berat badan', label: 'Seimbang — Jaga Berat Badan', emoji: '⚖️' },
];

const HomeScreen: React.FC<HomeScreenProps> = ({ onGenerate, isGenerating, loadingMessage }) => {
  const [query, setQuery] = useState('');
  const [servings, setServings] = useState(4);
  const [goalHint, setGoalHint] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuery = query.trim() || 'buatkan resep nasi goreng kampung';
    onGenerate({ query: finalQuery, servings, fitnessGoalHint: goalHint });
  };

  const handleSuggestion = (suggestionQuery: string) => {
    setQuery(suggestionQuery);
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12 relative overflow-y-auto custom-scrollbar">
      
      {/* Background texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #f59e0b 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, #ea580c 0%, transparent 50%)`
        }}
      ></div>
      
      {/* Floating food emojis decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {['🍜', '🥘', '🍲', '🥗', '🍛', '🥩', '🌶️', '🧄', '🫚', '🧅'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-10"
            style={{
              left: `${10 + (i * 9.5) % 85}%`,
              top: `${10 + (i * 13.7) % 75}%`,
              transform: `rotate(${-20 + (i * 17) % 40}deg)`,
              fontSize: `${1.5 + (i % 3) * 0.5}rem`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl shadow-orange-200 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-800 leading-tight">
            Resep <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Masakan</span> Pintar
          </h1>
          <p className="text-stone-500 mt-2 text-base font-medium">
            Generate resep masakan Indonesia lengkap dengan nutrisi & tutorial detail
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-stone-200 border border-white/60 overflow-hidden">
          
          {/* Card header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-5">
            <p className="text-white/90 text-sm font-bold">Ketik nama masakan yang ingin kamu buat:</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            
            {/* Main query input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Contoh: "buatkan resep gudeg", "ayam geprek tinggi protein"...'
                className="w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-2xl text-stone-800 font-semibold placeholder-stone-400 outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all text-base"
              />
            </div>

            {/* Options toggle */}
            <button
              type="button"
              onClick={() => setShowOptions(!showOptions)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5 transition"
            >
              ⚙️ {showOptions ? 'Sembunyikan' : 'Tampilkan'} opsi lanjutan
            </button>

            {/* Advanced options */}
            {showOptions && (
              <div className="space-y-4 border border-amber-200 rounded-2xl p-4 bg-amber-50/50">
                {/* Servings */}
                <div>
                  <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">
                    <Users className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                    Jumlah Porsi
                  </label>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 font-black flex items-center justify-center hover:bg-amber-300 transition">
                      −
                    </button>
                    <span className="w-16 text-center font-black text-stone-700">{servings} porsi</span>
                    <button type="button" onClick={() => setServings(Math.min(20, servings + 1))}
                      className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 font-black flex items-center justify-center hover:bg-amber-300 transition">
                      +
                    </button>
                  </div>
                </div>

                {/* Fitness goal */}
                <div>
                  <label className="block text-xs font-black text-stone-500 uppercase tracking-wider mb-2">
                    <Zap className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                    Tujuan Nutrisi
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setGoalHint(opt.id)}
                        className={`text-xs px-3 py-2 rounded-xl font-bold text-left flex items-center gap-2 transition-all border
                          ${goalHint === opt.id
                            ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                            : 'bg-white text-stone-600 border-stone-200 hover:border-amber-300'}`}
                      >
                        <span>{opt.emoji}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Generate button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black py-4 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-xl shadow-amber-200 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
            >
              {isGenerating ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  {loadingMessage || 'Sedang membuat resep...'}
                </span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Generate Resep
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick suggestions */}
        <div className="mt-6">
          <p className="text-center text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
            Atau coba resep populer ini:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => handleSuggestion(s.query)}
                disabled={isGenerating}
                className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-amber-200 rounded-xl text-sm font-bold text-stone-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700 transition-all shadow-sm disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Nutrisi Akurat', desc: 'Per bahan & total' },
            { icon: <Zap className="w-4 h-4 text-blue-500" />, label: 'Smart Filter', desc: 'Diet, bulking, dll' },
            { icon: <Leaf className="w-4 h-4 text-green-500" />, label: 'Tutorial Detail', desc: '10+ langkah masak' },
          ].map(item => (
            <div key={item.label} className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/80 shadow-sm">
              <div className="flex justify-center mb-1.5">{item.icon}</div>
              <div className="text-xs font-black text-stone-700">{item.label}</div>
              <div className="text-[10px] text-stone-400 font-medium">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
