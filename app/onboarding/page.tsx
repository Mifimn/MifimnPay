"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated for App Router
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Path alias update
import { useAuth } from '@/lib/AuthContext';

/**
 * app/onboarding/page.tsx
 * Merchant Setup Experience
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('₦');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    let logoUrl = null;

    try {
      // 1. Upload Logo to Supabase Storage
      if (imageFile && user) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('business-logos')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('business-logos')
          .getPublicUrl(filePath);

        logoUrl = urlData.publicUrl;
      }

      // 2. Update Merchant Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          business_name: businessName || 'New Merchant',
          business_phone: phone,
          currency: currency,
          logo_url: logoUrl,
          updated_at: new Date(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // 3. Final Redirect to Dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-lg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="bg-white dark:bg-[#0f0f0f] rounded-[40px] border border-slate-200 dark:border-white/10 shadow-2xl p-10 relative overflow-hidden"
        >
          {/* Progress Indicator */}
          <div className="flex gap-2 mb-10">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-brand-orange shadow-glow-orange' : 'bg-slate-100 dark:bg-white/5'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-brand-orange shadow-glow-orange' : 'bg-slate-100 dark:bg-white/5'}`} />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-black uppercase tracking-widest"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}

            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Identify</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Setup your merchant identity</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Business Name</label>
                    <input type="text" placeholder="e.g. Musa Textiles" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-14 px-6 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-orange transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Support Line</label>
                    <input type="tel" placeholder="+234..." value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-14 px-6 rounded-2xl border-2 border-transparent bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white font-bold outline-none focus:border-brand-orange transition-all" />
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)} 
                  disabled={!businessName}
                  className="w-full h-14 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-glow-orange active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Continue <ChevronRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center"
              >
                <div>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-2">Branding</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Upload your store logo</p>
                </div>

                <label className="block border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[32px] p-12 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer relative group transition-all">
                  {previewUrl ? (
                    <div className="flex flex-col items-center">
                      <img src={previewUrl} alt="Preview" className="h-24 w-24 object-contain mb-4 rounded-2xl shadow-xl" />
                      <p className="text-[10px] text-green-500 font-black uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={14}/> Brand Ready</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 transition-all group-hover:text-brand-orange">
                      <Upload size={40} strokeWidth={1.5} className="mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Click to browse files</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                </label>

                <div className="flex gap-4">
                  <button 
                    onClick={handleFinish} 
                    className="flex-1 h-14 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                  >
                    Later
                  </button>
                  <button 
                    onClick={handleFinish} 
                    disabled={loading} 
                    className="flex-[2] h-14 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow-orange flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Launch Dashboard'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}