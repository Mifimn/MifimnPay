"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Updated for App Router
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Loader2, AlertCircle, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // Path alias update
import Navbar from '@/components/landing/Navbar'; 

/**
 * app/login/page.tsx
 * Unified Authentication Page (Sign In / Sign Up)
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/auth-callback` 
      },
    });
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (authMode === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        setShowEmailModal(true);
        setAuthMode('signin');
        setPassword('');
        setConfirmPassword('');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Check profile for redirection
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_name, is_admin')
          .eq('id', data.user.id)
          .single();

        if (profile?.is_admin) {
          router.push('/admin');
        } else if (!profile?.business_name || profile.business_name === 'My Business') {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] relative transition-colors duration-300">
      <Navbar />

      <AnimatePresence>
        {showEmailModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-brand-orange" />
              <button 
                onClick={() => setShowEmailModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 text-brand-orange rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100 dark:border-white/10">
                <Mail size={40} strokeWidth={1.5} />
              </div>

              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase italic">Verify email</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed mb-8 uppercase tracking-tight">
                Confirmation link sent to <span className="text-brand-orange">{email}</span>.
              </p>

              <button 
                onClick={() => setShowEmailModal(false)}
                className="w-full h-14 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-glow-orange active:scale-[0.98] transition-all"
              >
                Confirm
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen grid md:grid-cols-2">
        <div className="hidden md:flex flex-col justify-between bg-slate-900 p-12 text-white relative overflow-hidden">
          <div className="z-10 mt-20"> 
            <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center font-black mb-6 text-xl shadow-glow-orange italic">M</div>
            <h2 className="text-5xl font-black max-w-md leading-[1] tracking-tighter uppercase italic">Professional Receipts, Generated Instantly.</h2>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px]" />
        </div>

        <div className="flex items-center justify-center p-6 md:p-12 pt-32 md:pt-12"> 
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                {authMode === 'signin' ? 'Welcome back' : 'Join Us'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Manage your business receipts efficiently.</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-black uppercase tracking-widest">
                <AlertCircle size={18} /> <p>{error}</p>
              </motion.div>
            )}

            <button 
              onClick={handleGoogleLogin} 
              className="w-full h-14 flex items-center justify-center gap-3 bg-white dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-[0.98]"
            >
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
               Continue with Google
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-200 dark:border-white/10"></div>
              <span className="absolute bg-white dark:bg-[#0a0a0a] px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">or email</span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="name@company.com" 
                    required 
                    className="w-full h-14 px-5 border-2 border-transparent bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:border-brand-orange transition-all font-bold text-slate-900 dark:text-white" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                    className="w-full h-14 px-5 border-2 border-transparent bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:border-brand-orange transition-all font-bold text-slate-900 dark:text-white" 
                  />
                </div>

                <AnimatePresence>
                  {authMode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-[9px] font-black text-slate-400 ml-1 uppercase tracking-widest">Confirm Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required={authMode === 'signup'}
                        className="w-full h-14 px-5 border-2 border-transparent bg-slate-50 dark:bg-white/5 rounded-2xl outline-none focus:border-brand-orange transition-all font-bold text-slate-900 dark:text-white" 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                disabled={isLoading} 
                className="w-full h-14 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-glow-orange active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="text-center pt-4">
              <button 
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                }} 
                className="text-[10px] font-black text-slate-400 hover:text-brand-orange transition-all uppercase tracking-widest"
              >
                {authMode === 'signin' ? (
                  <>New here? <span className="text-slate-900 dark:text-white underline underline-offset-4 decoration-brand-orange">Create account</span></>
                ) : (
                  <>Already registered? <span className="text-slate-900 dark:text-white underline underline-offset-4 decoration-brand-orange">Sign in</span></>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}