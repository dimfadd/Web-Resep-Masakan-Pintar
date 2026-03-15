import React, { useState } from 'react';
import { X, Calculator, Activity, ArrowRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CalorieCalculatorModalProps {
  onClose: () => void;
}

const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({ onClose }) => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [activity, setActivity] = useState<string>('1.2');
  const [result, setResult] = useState<number | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    const act = parseFloat(activity);

    if (isNaN(w) || isNaN(h) || isNaN(a)) return;

    let bmr = 0;
    if (gender === 'male') {
      bmr = (10 * w) + (6.25 * h) - (5 * a) + 5;
    } else {
      bmr = (10 * w) + (6.25 * h) - (5 * a) - 161;
    }

    setResult(Math.round(bmr * act));
  };

  const activityOptions = [
    { value: '1.2', label: 'Sedentary', desc: 'Jarang olahraga / kerja kantoran' },
    { value: '1.375', label: 'Ringan', desc: 'Olahraga 1-3x seminggu' },
    { value: '1.55', label: 'Sedang', desc: 'Olahraga 3-5x seminggu' },
    { value: '1.725', label: 'Berat', desc: 'Olahraga 6-7x seminggu' },
    { value: '1.9', label: 'Sangat Berat', desc: 'Atlet / kerja fisik berat' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative max-h-[95vh] sm:max-h-[90vh] flex flex-col"
      >
        {/* Close button - Fixed at top right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-black/10 hover:bg-black/20 sm:bg-white/20 sm:hover:bg-white/30 rounded-full transition-colors z-[110]"
        >
          <X className="w-4 h-4 sm:w-5 h-5 text-white sm:text-white" />
        </button>

        <div className="overflow-y-auto custom-scrollbar flex-1 flex flex-col">
          {/* Header - Now part of scrollable content */}
          <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 sm:p-8 text-white relative shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-5 h-5 sm:w-6 h-6" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-80">Kalkulator Gizi</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black leading-tight">Hitung Kebutuhan Kalori Harianmu</h2>
            <p className="text-red-100 text-[10px] sm:text-sm mt-2 font-medium">Dihitung menggunakan rumus Mifflin-St Jeor untuk hasil yang akurat.</p>
          </div>

          <div className="p-6 sm:p-8">
          {!result ? (
            <form onSubmit={calculate} className="space-y-6">
              {/* Gender Toggle */}
              <div className="flex p-1 bg-stone-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${gender === 'male' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-400'}`}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${gender === 'female' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-400'}`}
                >
                  Perempuan
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Berat (kg)</label>
                  <input
                    type="number"
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="65"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:ring-2 focus:ring-red-500 outline-none transition text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Tinggi (cm)</label>
                  <input
                    type="number"
                    required
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    placeholder="170"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:ring-2 focus:ring-red-500 outline-none transition text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Usia</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    placeholder="25"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:ring-2 focus:ring-red-500 outline-none transition text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Level Aktivitas</label>
                <div className="space-y-2">
                  {activityOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setActivity(opt.value)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${activity === opt.value ? 'border-red-500 bg-red-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                    >
                      <div>
                        <p className={`text-sm font-black ${activity === opt.value ? 'text-red-700' : 'text-stone-700'}`}>{opt.label}</p>
                        <p className="text-[10px] text-stone-400 font-medium">{opt.desc}</p>
                      </div>
                      {activity === opt.value && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Hitung Sekarang <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="text-center space-y-8 py-4">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-500 blur-3xl opacity-20 animate-pulse"></div>
                <div className="relative">
                  <p className="text-stone-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-2">Kebutuhan Kalori Harianmu</p>
                  <h3 className="text-5xl sm:text-7xl font-black text-stone-800 tracking-tighter">
                    {result} <span className="text-xl sm:text-2xl text-red-500">kkal</span>
                  </h3>
                </div>
              </div>

              <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 text-left">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <Info className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-700 mb-1">Apa artinya ini?</p>
                    <p className="text-xs text-stone-500 leading-relaxed font-medium">
                      Ini adalah jumlah kalori yang kamu butuhkan setiap hari untuk menjaga berat badan saat ini. 
                      Untuk <span className="text-red-600 font-bold">menurunkan berat badan</span>, targetkan 300-500 kkal di bawah angka ini.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 py-4 rounded-2xl font-black text-stone-500 bg-stone-100 hover:bg-stone-200 transition"
                >
                  Hitung Ulang
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black text-white bg-stone-800 hover:bg-stone-900 transition"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CalorieCalculatorModal;
