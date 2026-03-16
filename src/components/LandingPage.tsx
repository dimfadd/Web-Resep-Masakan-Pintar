import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import {
  ChefHat, Sparkles, Flame, Zap, Clock,
  Star, CheckCircle2, ArrowRight, Lock, Unlock, ChevronDown,
  Users, Shield, TrendingDown, Dumbbell, Soup, Heart, Filter
} from 'lucide-react';

interface LandingPageProps {
  onEnterLibrary: () => void;
  onUpgrade: () => void;
  freeRecipes: Recipe[];
}

// ── NAVBAR ────────────────────────────────────────────────────────────────
const Navbar: React.FC<{ onEnterLibrary: () => void; onUpgrade: () => void }> = ({ onEnterLibrary, onUpgrade }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled ? 'bg-white/85 backdrop-blur-2xl border-stone-200 shadow-lg' : 'bg-white/20 backdrop-blur-md border-transparent'}`}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-stone-800 text-base leading-none block">Resep Masakan Pintar</span>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Dapur Digital Indonesia</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onEnterLibrary}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-amber-600 transition px-4 py-2 rounded-xl hover:bg-amber-50">
            Jelajahi Resep
          </button>
          <button onClick={onUpgrade}
            className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] sm:text-sm font-black px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-lg shadow-amber-200 hover:shadow-amber-300 hover:scale-105 active:scale-95 transition-all">
            <ChefHat className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Upgrade ke Chef
          </button>
        </div>
      </div>
    </nav>
  );
};

// ── HERO ──────────────────────────────────────────────────────────────────
const HeroSection: React.FC<{ onEnterLibrary: () => void; onUpgrade: () => void }> = ({ onEnterLibrary, onUpgrade }) => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 sm:pt-20">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50"></div>
    <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(251,191,36,0.25) 0%, transparent 70%)` }}></div>
    <div className="absolute top-32 right-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none"></div>
    <div className="absolute bottom-20 left-10 w-56 h-56 bg-amber-300/20 rounded-full blur-3xl pointer-events-none"></div>
    {['🍜','🥘','🍲','🥗','🍛','🌶️','🧄','🫚'].map((e, i) => (
      <div key={i} className="absolute text-3xl opacity-[0.07] pointer-events-none select-none animate-pulse"
        style={{ left: `${8 + (i * 12.5) % 84}%`, top: `${15 + (i * 11.3) % 70}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${3 + i % 3}s` }}>
        {e}
      </div>
    ))}

    <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
      <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-amber-200 text-amber-700 text-xs font-black px-4 py-2 rounded-full shadow-sm mb-6 mt-2 sm:mt-0 uppercase tracking-wider">
        <ChefHat className="w-3.5 h-3.5" /> Dibuat dengan 💖 untuk Masakan Lezat & Bergizi
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-800 leading-[1.1] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Resep Masakan Yang Sudah <br /> Dihitung Nilai Gizinya <br />
        <span className="relative inline-block">
          <span className="relative z-10 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">Resep Keluarga Indonesia</span>
          <svg className="absolute -bottom-6 left-0 w-full" viewBox="0 0 300 12" fill="none">
            <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </span>
      </h1>

      <p className="text-lg sm:text-xl text-stone-600 font-medium leading-relaxed max-w-2xl mx-auto mb-6">
        Makan tanpa ragu karena tau <strong className="text-stone-800">batasan konsumsi harian</strong>. Bebas pilih masakan untuk{' '}
        <span className="text-green-600 font-bold">menurunkan berat badan</span>,{' '}
        <span className="text-blue-600 font-bold">menaikkan berat badan</span>,{' '}
        <span className="text-amber-600 font-bold">berkuah</span>, dan masih banyak lagi.
      </p>

      <div className="max-w-2xl mx-auto mb-12 rounded-3xl border border-amber-100 bg-white p-8 sm:p-10 shadow-xl shadow-amber-50 relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500"></div>
        
        <div className="flex flex-col items-center text-center gap-5 relative z-10">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
            <Heart className="w-7 h-7 fill-amber-600/10 animate-pulse" />
          </div>
          
          <p className="text-xl sm:text-2xl text-stone-800 font-black leading-snug">
            "Karena tubuh yang sehat diawali dengan apa yang kita masukkan ke perut, <span className="text-amber-600 underline decoration-amber-200 decoration-4 underline-offset-4">kita wajib tahu</span> nilai gizi setiap suapan kita hari ini."
          </p>
        </div>

        {/* Decorative soft glows */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button onClick={onEnterLibrary}
          className="group flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-amber-200 hover:shadow-amber-300 hover:scale-105 active:scale-95 transition-all">
          <ChefHat className="w-5 h-5" /> Jelajahi Resep Gratis
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button onClick={onUpgrade}
          className="flex items-center gap-3 bg-white border-2 border-stone-200 text-stone-700 font-black text-base px-7 py-4 rounded-2xl hover:border-amber-400 hover:text-amber-700 transition-all shadow-sm hover:shadow-md">
          <ChefHat className="w-4 h-4" /> Upgrade ke Chef — Mulai 20rb/bln
        </button>
      </div>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-stone-500">
        {[
          { icon: <Users className="w-4 h-4 text-amber-500" />, text: '2.000+ pengguna aktif' },
          { icon: <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />, text: 'Rating 4.9' },
          { icon: <Shield className="w-4 h-4 text-green-500" />, text: 'Nutrisi terverifikasi' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 font-semibold">{item.icon} {item.text}</div>
        ))}
      </div>

      <div className="mt-16 flex justify-center animate-bounce">
        <ChevronDown className="w-6 h-6 text-stone-400" />
      </div>
    </div>
  </section>
);

// ── FREE RECIPES TEASER ────────────────────────────────────────────────────
const FreeRecipesTeaser: React.FC<{ 
  recipes: Recipe[]; 
  onEnterLibrary: () => void;
}> = ({ recipes, onEnterLibrary }) => {
  const preview = recipes.slice(0, 3);
  const typeEmoji: Record<string, string> = {
    berkuah: '🍲', digoreng: '🍳', dipanggang: '🔥', dikukus: '♨️', mentah: '🥗', tumisan: '🥘', rebusan: '🫕',
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">Coba Dulu Gratis</span>
          <h2 className="text-4xl font-black text-stone-800 mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Resep Pilihan Hari Ini</h2>
          <p className="text-stone-500 max-w-xl mx-auto">Lihat dulu kualitas resep kami — lengkap dengan info nutrisi per bahan dan tutorial step-by-step.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {preview.length === 0
            ? [1,2,3].map(i => (
                <div key={i} className="rounded-3xl overflow-hidden border border-stone-100 shadow-sm animate-pulse">
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-5xl opacity-20">{['🍲','🍛','🥗'][i-1]}</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-stone-100 rounded-full w-3/4"></div>
                    <div className="h-3 bg-stone-100 rounded-full w-full"></div>
                    <div className="h-3 bg-stone-100 rounded-full w-2/3"></div>
                  </div>
                </div>
              ))
            : preview.map(recipe => (
                <div key={recipe.id} onClick={onEnterLibrary}
                  className="group rounded-3xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-200 relative overflow-hidden">
                    {recipe.imageUrl
                      ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="text-6xl">{typeEmoji[recipe.type] || '🍽️'}</span></div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-black bg-green-500 text-white px-2.5 py-1 rounded-full uppercase">Gratis</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-stone-800 text-lg leading-tight mb-1">{recipe.title}</h3>
                    <p className="text-stone-500 text-sm line-clamp-2 mb-4">{recipe.description}</p>
                    <div className="flex gap-3 text-xs font-bold text-stone-500">
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{recipe.nutritionPerServing.calories} kal</span>
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-red-500" />{recipe.nutritionPerServing.protein}g P</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{recipe.cookTimeMinutes} mnt</span>
                    </div>
                  </div>
                </div>
              ))
          }
        </div>

        <div className="text-center mt-10">
          <button onClick={onEnterLibrary} className="inline-flex items-center gap-2 text-amber-600 font-black hover:gap-3 transition-all text-base border-b-2 border-amber-400 pb-0.5">
            Lihat semua resep gratis <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ── FEATURES ──────────────────────────────────────────────────────────────
const FeaturesSection: React.FC = () => {
  const features = [
    { icon: <Flame className="w-6 h-6" />, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50 border-orange-100', title: 'Nutrisi Akurat per Bahan', desc: 'Setiap bahan dihitung kalori, protein, karbo, lemak, serat, vitamin, dan mineralnya.' },
    { icon: <Filter className="w-6 h-6" />, color: 'from-blue-400 to-indigo-500', bg: 'bg-blue-50 border-blue-100', title: 'Filter Cerdas Tujuan Gizi', desc: 'Mau diet? Bulking? Rendah karbo? Tinggal pilih filter dan resep langsung sesuai targetmu.' },
    { icon: <ChefHat className="w-6 h-6" />, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50 border-amber-100', title: 'Tutorial Langkah Detail', desc: 'Setiap resep punya langkah memasak dengan tips chef, suhu api, dan estimasi waktu tiap tahap.' },
    { icon: <Soup className="w-6 h-6" />, color: 'from-teal-400 to-green-500', bg: 'bg-teal-50 border-teal-100', title: 'Ratusan Resep Indonesia', desc: 'Dari Sabang sampai Merauke — gudeg, rendang, soto, rawon, dan ratusan resep autentik.' },
    { icon: <TrendingDown className="w-6 h-6" />, color: 'from-green-400 to-emerald-500', bg: 'bg-green-50 border-green-100', title: 'Rencana Makan Sehat', desc: 'Pilih resep rendah kalori untuk turun berat badan, atau tinggi protein untuk bulking.' },
    { icon: <Dumbbell className="w-6 h-6" />, color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50 border-purple-100', title: 'Mode Bulking & Diet', desc: 'Tag khusus tiap resep: diet, bulking, maintenance, keto, tinggi serat — langsung kelihatan.' },
  ];

  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">Kenapa Resep Masakan Pintar?</span>
          <h2 className="text-4xl font-black text-stone-800 mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Bukan sekadar resep biasa</h2>
          <p className="text-stone-500 max-w-xl mx-auto">Dirancang untuk orang yang peduli kesehatan tapi tetap mau menikmati masakan Indonesia yang lezat.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div key={i} className={`${f.bg} border rounded-2xl p-8 hover:scale-[1.02] transition-transform duration-200 flex flex-col items-center text-center`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg mb-6`}>{f.icon}</div>
              <h3 className="font-black text-stone-800 text-lg mb-3">{f.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── TESTIMONIALS ──────────────────────────────────────────────────────────
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    { name: 'Sari Dewi', role: 'Ibu rumah tangga, Jakarta', avatar: '👩', stars: 5, text: 'Akhirnya ada platform resep yang benar-benar nulis kandungan gizinya! Bisa milih masakan yang pas buat diet tanpa hitung-hitung sendiri.' },
    { name: 'Rizky Pratama', role: 'Gym enthusiast, Surabaya', avatar: '💪', stars: 5, text: 'Filter "tinggi protein" itu game changer banget. Sekarang meal prep lebih mudah dan aku tahu persis berapa gram protein yang masuk tiap makan.' },
    { name: 'Ayu Lestari', role: 'Mahasiswa gizi, Yogyakarta', avatar: '🎓', stars: 5, text: 'Nilai nutrisinya detail banget sampai ke vitamin dan mineral. Berguna banget buat referensi tugas kuliah dan masak sehari-hari.' },
    { name: 'Budi Santoso', role: 'Chef rumahan, Bandung', avatar: '👨‍🍳', stars: 5, text: 'Langkah memasaknya detail dan ada tips di tiap step. Resep yang biasanya gagal jadi berhasil setelah ikutin panduan di sini.' },
    { name: 'Mira Handayani', role: 'Dokter, Medan', avatar: '👩‍⚕️', stars: 5, text: 'Saya rekomendasikan ke pasien yang butuh diet khusus. Mereka bisa filter by kalori dan langsung dapat pilihan masakan yang sesuai.' },
    { name: 'Dimas Arif', role: 'Personal trainer, Bali', avatar: '🏋️', stars: 5, text: 'Klien-klien saya sekarang punya pegangan resep yang pas untuk bulking. Data proteinnya akurat dan variasi menunya banyak.' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">Kata Mereka</span>
          <h2 className="text-4xl font-black text-stone-800 mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Dipercaya ribuan dapur Indonesia</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-stone-50 border border-stone-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex gap-1 mb-3">
                {Array(t.stars).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-stone-700 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">{t.avatar}</div>
                <div>
                  <div className="font-black text-stone-800 text-sm">{t.name}</div>
                  <div className="text-stone-400 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── PRICING ───────────────────────────────────────────────────────────────
const PricingSection: React.FC<{ onUpgrade: () => void; onEnterLibrary: () => void }> = ({ onUpgrade, onEnterLibrary }) => (
  <section className="py-24 bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 50%, #f59e0b 0%, transparent 60%), radial-gradient(circle at 70% 50%, #ea580c 0%, transparent 60%)` }}></div>
    <div className="relative z-10 max-w-4xl mx-auto px-5">
      <div className="text-center mb-14">
        <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full">Pilih Paket</span>
        <h2 className="text-4xl font-black text-white mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Investasi untuk Kesehatanmu</h2>
        <p className="text-stone-400 max-w-xl mx-auto">Pilih paket langganan yang sesuai dengan kebutuhanmu. Akses penuh ke ratusan resep sehat & lezat.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="bg-stone-700/50 border border-stone-600 rounded-3xl p-8">
          <div className="mb-6">
            <span className="text-sm font-black text-stone-300 uppercase tracking-wider">Bulanan</span>
            <div className="text-4xl font-black text-white mt-2">Rp 20.000</div>
            <p className="text-stone-400 text-sm mt-1">Per bulan</p>
          </div>
          <ul className="space-y-3 mb-8">
            {['Akses PENUH semua resep','Filter gizi lengkap','Update resep baru tiap minggu','Prioritas request resep'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-stone-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <button onClick={onUpgrade} className="w-full py-3 rounded-2xl border border-amber-500 text-amber-400 font-bold hover:bg-amber-500 hover:text-white transition">Pilih Bulanan</button>
        </div>

        <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-8 shadow-2xl shadow-orange-900/50">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">⭐ Hemat 17%</div>
          <div className="mb-6">
            <span className="text-sm font-black text-amber-100 uppercase tracking-wider">Tahunan</span>
            <div className="flex items-end gap-2 mt-2">
              <div className="text-4xl font-black text-white">Rp 199k</div>
              <div className="text-lg text-amber-100 line-through mb-1 opacity-70">Rp 240k</div>
            </div>
            <p className="text-amber-100 text-sm mt-1 font-semibold">Akses setahun penuh ✨</p>
          </div>
          <ul className="space-y-3 mb-8">
            {['Semua fitur paket Bulanan','Hemat biaya 2 bulan','Akses prioritas fitur baru','E-book eksklusif (segera)'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-white text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-amber-100 shrink-0" /> {item}
              </li>
            ))}
          </ul>
          <button onClick={onUpgrade} className="w-full py-3.5 rounded-2xl bg-white text-orange-600 font-black text-base shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
            <ChefHat className="w-5 h-5" /> Pilih Tahunan
          </button>
        </div>
      </div>

      <p className="text-center text-stone-500 text-sm mt-8">
        Sudah punya kode akses?{' '}
        <button onClick={onUpgrade} className="text-amber-400 font-bold hover:text-amber-300 transition underline">Masukkan kode di sini</button>
      </p>
    </div>
  </section>
);

// ── FAQ ───────────────────────────────────────────────────────────────────
const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    { q: 'Bagaimana sistem langganannya?', a: 'Kami menyediakan paket bulanan dan tahunan. Kamu bisa berhenti berlangganan kapan saja. Pembayaran dilakukan secara otomatis melalui Midtrans.' },
    { q: 'Seberapa akurat nilai nutrisinya?', a: 'Nilai nutrisi dihitung berdasarkan database nutrisi standar (USDA/PERSAGI) yang disesuaikan untuk bahan-bahan masakan Indonesia.' },
    { q: 'Bagaimana cara mendapatkan akses setelah bayar?', a: 'Setelah pembayaran berhasil melalui Midtrans, akses Chef akan otomatis aktif di akun kamu. Kamu juga akan menerima kode akses sebagai cadangan.' },
    { q: 'Apakah ada resep untuk kondisi seperti diabetes atau hipertensi?', a: 'Kamu bisa gunakan filter "rendah kalori" dan "rendah karbo". Namun, konsultasikan selalu dengan dokter atau ahli gizi untuk kondisi medis spesifik.' },
    { q: 'Berapa banyak resep yang tersedia?', a: '10 resep gratis untuk semua pengguna. Pengguna Chef mendapat akses ke seluruh pustaka yang terus bertambah setiap minggu.' },
    { q: 'Bisakah saya request resep tertentu?', a: 'Pengguna Chef mendapatkan prioritas request resep. Kirimkan request melalui kontak yang tersedia dan resep akan dibuatkan dalam waktu dekat.' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full">FAQ</span>
          <h2 className="text-4xl font-black text-stone-800 mt-4 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Pertanyaan yang sering ditanyakan</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${open === i ? 'border-amber-300 bg-amber-50' : 'border-stone-200 bg-white'}`}>
              <button className="w-full text-left px-6 py-5 flex items-center justify-between gap-4" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-black text-stone-800 text-base">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <div className="px-6 pb-5"><p className="text-stone-600 leading-relaxed">{faq.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ────────────────────────────────────────────────────────────────
const Footer: React.FC<{ onUpgrade: () => void }> = ({ onUpgrade }) => (
  <footer className="bg-stone-900 text-stone-400 py-12">
    <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-black text-white text-sm block">Resep Masakan Pintar</span>
          <span className="text-[10px] text-stone-500">Dapur Digital Indonesia</span>
        </div>
      </div>
      <p className="text-xs text-stone-500">© {new Date().getFullYear()} Resep Masakan Pintar. Semua resep & data nutrisi dilindungi.</p>
      <button onClick={onUpgrade} className="text-xs font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1.5">
        <ChefHat className="w-3.5 h-3.5" /> Upgrade ke Chef
      </button>
    </div>
  </footer>
);

// ── MAIN EXPORT ───────────────────────────────────────────────────────────
const LandingPage: React.FC<LandingPageProps> = ({ onEnterLibrary, onUpgrade, freeRecipes }) => (
  <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
    <Navbar onEnterLibrary={onEnterLibrary} onUpgrade={onUpgrade} />
    <HeroSection onEnterLibrary={onEnterLibrary} onUpgrade={onUpgrade} />
    <FreeRecipesTeaser 
      recipes={freeRecipes} 
      onEnterLibrary={onEnterLibrary} 
    />
    <FeaturesSection />
    <TestimonialsSection />
    <PricingSection onUpgrade={onUpgrade} onEnterLibrary={onEnterLibrary} />
    <FAQSection />
    <Footer onUpgrade={onUpgrade} />
  </div>
);

export default LandingPage;
