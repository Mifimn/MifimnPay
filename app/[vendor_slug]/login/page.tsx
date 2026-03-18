"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, ArrowRight, Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

function StorefrontLoginContent() {
  const { vendor_slug } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Smart redirect: send them back to the exact page they were on, or default to checkout
  const redirectUrl = searchParams.get('redirect') || `/${vendor_slug}/checkout`;

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('business_name, logo_url, theme_color')
        .eq('slug', vendor_slug)
        .single();
      if (data) setVendor(data);
    };
    if (vendor_slug) fetchVendor();
  }, [vendor_slug]);

  // 1. REAL SUPABASE OTP SENDING
  const handleSendOTP = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const storeName = vendor?.business_name || vendor_slug;

      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            store_name: storeName // Sends the store name to your gorgeous HTML email!
          }
        }
      });

      if (authError) throw authError;
      setShowOtpModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. REAL SUPABASE OTP VERIFICATION
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = otp.join(''); // Combine the 6 boxes into one string

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (verifyError) throw verifyError;

      setShowOtpModal(false);
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError("Invalid or expired code. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const themeColor = vendor?.theme_color || '#f97316';

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500">

      {/* Dynamic Background Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20 blur-[120px] rounded-full pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      {/* Main Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/80 dark:bg-white/5 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-white dark:bg-black/20 p-2 shadow-sm border border-slate-200 dark:border-white/20 mb-6 overflow-hidden">
            {vendor?.logo_url ? (
              <img src={vendor.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl italic" style={{ color: themeColor }}>
                {vendor?.business_name?.charAt(0) || 'M'}
              </div>
            )}
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">
            Customer <span style={{ color: themeColor }}>Portal</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
            Secure Entry to @{vendor_slug}
          </p>
        </div>

        {error && !showOtpModal && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
            <AlertCircle size={16} className="shrink-0" /> <p className="leading-tight">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to begin"
                className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:border-slate-300 dark:focus:border-white/20 text-sm font-bold dark:text-white transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={isLoading || !email}
            className="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50"
            style={{ backgroundColor: themeColor, boxShadow: `0 10px 20px ${themeColor}33` }}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Access Store <ArrowRight size={16} /></>}
          </button>
        </form>
      </motion.div>

      {/* OTP VERIFICATION MODAL */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowOtpModal(false); setError(null); }}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0f0f0f] backdrop-blur-2xl rounded-[32px] border border-slate-200 dark:border-white/10 shadow-2xl p-8 z-10"
            >
              <button onClick={() => { setShowOtpModal(false); setError(null); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6 border border-green-500/20">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2">Check Your Email</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed mb-6">
                  We sent a 6-digit verification code to <br /> 
                  <span className="text-slate-900 dark:text-white underline">{email}</span>
                </p>

                {error && (
                  <div className="w-full p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-500 text-[9px] font-black uppercase tracking-widest text-left">
                    <AlertCircle size={14} className="shrink-0" /> <p className="leading-tight">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-8 w-full">
                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} type="text" maxLength={1} value={digit}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) {
                            const newOtp = [...otp];
                            newOtp[idx] = val;
                            setOtp(newOtp);
                            // Auto-focus next input
                            if (val && idx < 5) {
                              const nextInput = e.target.nextElementSibling as HTMLInputElement;
                              if (nextInput) nextInput.focus();
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Auto-focus previous input on backspace
                          if (e.key === 'Backspace' && !digit && idx > 0) {
                            const prevInput = e.currentTarget.previousElementSibling as HTMLInputElement;
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        className="w-10 h-12 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl text-center font-black text-lg text-slate-900 dark:text-white outline-none focus:border-slate-400 dark:focus:border-white/20 transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button 
                    type="submit" disabled={isLoading || otp.includes('')}
                    className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : <>Verify & Continue</>}
                  </button>

                  <button type="button" onClick={handleSendOTP} disabled={isLoading} className="text-[9px] font-black uppercase text-slate-400 tracking-widest hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-50">
                    Didn&apos;t get a code? <span className="underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">Resend</span>
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Wrap in Suspense because we are using useSearchParams()
export default function StorefrontLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
      <StorefrontLoginContent />
    </Suspense>
  );
}
