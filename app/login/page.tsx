"use client";

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; 
import Navbar from '@/components/landing/Navbar'; 

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect'); // Captures where to send them after login

  const [isLoading, setIsLoading] = useState(false);
  const [authStep, setAuthStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth-callback${redirectUrl ? `?next=${redirectUrl}` : ''}` 
      },
    });
    if (error) setError(error.message);
  };

  // STEP 1: Request OTP Code
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true, // Auto-signs them up if they don't exist
        }
      });

      if (error) throw error;
      setAuthStep('otp'); // Move to step 2
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      // Check profile for routing logic
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, is_admin')
        .eq('id', data.user?.id)
        .single();

      // If they came from checkout, send them right back
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (profile?.is_admin) {
        router.push('/admin');
      } else if (!profile?.business_name || profile.business_name === 'My Business') {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError("Invalid or expired code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* Left Branding Side */}
      <div className="hidden md:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
        <div className="z-10 mt-20"> 
          <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center font-black mb-6 text-xl shadow-glow-orange italic">M</div>
          <h2 className="text-5xl font-black max-w-md leading-[1] tracking-tighter uppercase italic">Professional Receipts & Checkouts.</h2>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px]" />
      </div>

      {/* Right Auth Side */}
      <div className="flex items-center justify-center p-6 md:p-12 pt-32 md:pt-12 relative"> 
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">

          <div className="text-center md:text-left space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              {authStep === 'email' ? 'Welcome' : 'Check Email'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
              {authStep === 'email' ? 'Sign in to manage your business or checkout.' : `We sent a code to ${email}`}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-black uppercase tracking-widest">
              <AlertCircle size={18} /> <p>{error}</p>
            </motion.div>
          )}

          {authStep === 'email' ? (
            /* --- STEP 1: EMAIL INPUT --- */
            <motion.div key="step-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <button 
                onClick={handleGoogleLogin} 
                className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-[0.98] mb-6"
              >
                 <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                 Continue with Google
              </button>

              <div className="relative flex items-center justify-center mb-6">
                <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
                <span className="absolute bg-white dark:bg-[#0a0a0a] px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">or passwordless</span>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@email.com" 
                    required 
                    className="w-full h-14 px-5 border-2 border-transparent bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:border-brand-orange transition-all font-bold text-slate-900 dark:text-white tracking-wide" 
                  />
                </div>

                <button 
                  disabled={isLoading} 
                  className="w-full h-14 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-glow-orange active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : 'Send Login Code'}
                </button>
              </form>
            </motion.div>
          ) : (
            /* --- STEP 2: OTP VERIFICATION --- */
            <motion.form key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">6-Digit Code</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Only allows numbers
                    placeholder="000000" 
                    required 
                    className="w-full h-14 pl-12 pr-5 border-2 border-transparent bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:border-brand-orange transition-all font-black text-2xl tracking-[0.5em] text-slate-900 dark:text-white" 
                  />
                </div>
              </div>

              <button 
                disabled={isLoading || otp.length < 6} 
                className="w-full h-14 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-glow-orange active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
              </button>

              <button 
                type="button"
                onClick={() => { setAuthStep('email'); setOtp(''); setError(null); }}
                className="flex items-center justify-center gap-2 w-full text-[10px] font-black text-slate-400 hover:text-brand-orange transition-all uppercase tracking-widest mt-4"
              >
                <ArrowLeft size={14} /> Use a different email
              </button>
            </motion.form>
          )}

        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative transition-colors duration-300">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" /></div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
