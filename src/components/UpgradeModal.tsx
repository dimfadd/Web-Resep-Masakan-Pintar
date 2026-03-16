import React, { useState, useEffect } from 'react';
import { X, Unlock, Loader2, CheckCircle2, AlertCircle, ChefHat, Sparkles, Copy, Send, CreditCard, Calendar } from 'lucide-react';
import { validateAccessCode } from '../services/storageService';

interface UpgradeModalProps {
  onClose: () => void;
  onSuccess: (code: string) => void;
}

declare global {
  interface Window {
    snap: any;
  }
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  
  // Purchase form state
  const [buyName, setBuyName] = useState('');
  const [buyEmail, setBuyEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'info' | 'buy' | 'code' | 'success' | 'payment_pending'>('info');

  // Load Midtrans Snap Script
  useEffect(() => {
    const clientKey = import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '';
    
    // Auto-detect environment based on client key prefix
    // Production keys start with "Mid-", Sandbox keys start with "SB-Mid-"
    const isProduction = clientKey.startsWith('Mid-');
    
    const midtransScriptUrl = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js' 
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    console.log(`Midtrans Mode: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
    console.log(`Loading Snap from: ${midtransScriptUrl}`);

    const script = document.createElement('script');
    script.src = midtransScriptUrl;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !email.trim()) {
      setError('Email dan kode akses harus diisi.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const isValid = await validateAccessCode(code.trim().toUpperCase(), email.trim());
      if (isValid) {
        setStep('success');
        setTimeout(() => onSuccess(code.trim().toUpperCase()), 1800);
      } else {
        setError('Kode tidak valid, sudah digunakan, atau email tidak cocok. Pastikan kode dan email benar.');
      }
    } catch (e: any) {
      setError('Terjadi kesalahan. Periksa koneksi dan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyName.trim() || !buyEmail.trim()) {
      setError('Nama dan email harus diisi.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const amount = selectedPlan === 'monthly' ? 20000 : 199000;
      
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: buyName,
          email: buyEmail,
          plan: selectedPlan,
          amount: amount
        })
      });

      if (!response.ok) throw new Error('Gagal membuat transaksi');
      
      const { token } = await response.json();

      window.snap.pay(token, {
        onSuccess: (result: any) => {
          console.log('Payment Success:', result);
          setStep('payment_pending');
        },
        onPending: (result: any) => {
          console.log('Payment Pending:', result);
          setStep('payment_pending');
        },
        onError: (result: any) => {
          console.error('Payment Error:', result);
          setError('Terjadi kesalahan saat pembayaran.');
        },
        onClose: () => {
          console.log('Customer closed the popup without finishing the payment');
        }
      });
    } catch (e: any) {
      setError('Gagal memproses pembayaran. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col relative">
        
        {/* Close button - Fixed at top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 sm:bg-white/20 sm:hover:bg-white/30 rounded-full flex items-center justify-center transition z-[210]"
        >
          <X className="w-4 h-4 text-white sm:text-white" />
        </button>

        <div className="overflow-y-auto custom-scroll flex-1 flex flex-col">
          {/* Header - Now part of scrollable content */}
          <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 px-6 py-6 sm:px-8 sm:py-8 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Upgrade ke Chef</h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-1 font-semibold">Pilih paket akses penuh kamu</p>
          </div>

          <div className="p-6 sm:p-8">
          {step === 'success' ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-2">Selamat datang, Chef! 🎉</h3>
              <p className="text-stone-500 text-sm">Akses penuh kamu sudah diaktifkan. Membuka pustaka resep...</p>
              <div className="mt-4 flex justify-center">
                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>

          ) : step === 'payment_pending' ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-stone-800 mb-2">Menunggu Pembayaran</h3>
              <p className="text-stone-500 text-sm mb-6">
                Silakan selesaikan pembayaran Anda. Kode akses akan otomatis dikirim ke email Anda setelah pembayaran berhasil dikonfirmasi.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-stone-100 text-stone-700 font-black py-3 rounded-xl hover:bg-stone-200 transition"
              >
                Tutup
              </button>
            </div>

          ) : step === 'buy' ? (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep('info')} className="text-xs font-bold text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1 transition">
                  ← Kembali
                </button>
                <h3 className="font-black text-stone-800 text-lg mb-1">Data Pembayaran</h3>
                <p className="text-stone-500 text-sm">Akses paket {selectedPlan === 'monthly' ? 'Bulanan' : 'Tahunan'}.</p>
              </div>

              <form onSubmit={handlePayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={buyName}
                    onChange={e => setBuyName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={buyEmail}
                    onChange={e => setBuyEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    required
                  />
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-500 font-bold">Total Bayar:</span>
                    <span className="text-amber-600 font-black text-lg">
                      Rp {selectedPlan === 'monthly' ? '20.000' : '199.000'}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : <><CreditCard className="w-5 h-5" /> Bayar Sekarang</>}
                </button>
              </form>
            </div>

          ) : step === 'info' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${selectedPlan === 'monthly' ? 'border-amber-500 bg-amber-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className={`w-5 h-5 ${selectedPlan === 'monthly' ? 'text-amber-500' : 'text-stone-400'}`} />
                    {selectedPlan === 'monthly' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="font-black text-stone-800 text-sm">Bulanan</div>
                  <div className="text-amber-600 font-black">Rp 20rb</div>
                  <div className="text-[10px] text-stone-400 font-bold">Per bulan</div>
                </button>

                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${selectedPlan === 'yearly' ? 'border-amber-500 bg-amber-50' : 'border-stone-100 bg-white hover:border-stone-200'}`}
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase">Hemat 17%</div>
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className={`w-5 h-5 ${selectedPlan === 'yearly' ? 'text-amber-500' : 'text-stone-400'}`} />
                    {selectedPlan === 'yearly' && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="font-black text-stone-800 text-sm">Tahunan</div>
                  <div className="text-amber-600 font-black">Rp 199rb</div>
                  <div className="text-[10px] text-stone-400 font-bold line-through">Rp 240rb</div>
                </button>
              </div>

              <div className="space-y-3">
                <ul className="space-y-2">
                  {[
                    'Akses PENUH ke semua resep',
                    'Filter diet & nutrisi lengkap',
                    'Update resep baru setiap minggu',
                    'Akses otomatis setelah bayar'
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-2 text-stone-600 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setStep('buy')}
                  className="w-full bg-stone-800 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-stone-900 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Lanjut ke Pembayaran
                </button>
                <button
                  onClick={() => setStep('code')}
                  className="w-full bg-white border-2 border-stone-100 text-stone-500 font-black py-4 rounded-2xl hover:bg-stone-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Unlock className="w-5 h-5" /> Sudah Punya Kode? Login
                </button>
              </div>
            </div>

          ) : (
            <div className="space-y-5">
              <div>
                <button onClick={() => setStep('info')} className="text-xs font-bold text-stone-400 hover:text-stone-600 mb-4 flex items-center gap-1 transition">
                  ← Kembali
                </button>
                <h3 className="font-black text-stone-800 text-lg mb-1">Login Akses Chef</h3>
                <p className="text-stone-500 text-sm">Masukkan email dan kode akses Anda.</p>
              </div>

              <form onSubmit={handleValidate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-semibold focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">Kode Akses</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="Contoh: CHEF-XXXX-XXXX"
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-black tracking-widest placeholder:text-stone-300 placeholder:font-normal placeholder:tracking-normal outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    maxLength={20}
                    required
                  />
                </div>
                
                {error && (
                  <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !code.trim() || !email.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-200 hover:shadow-amber-300 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                >
                  {isLoading
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</>
                    : <><Unlock className="w-5 h-5" /> Masuk</>
                  }
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default UpgradeModal;

