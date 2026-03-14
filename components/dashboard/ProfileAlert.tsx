"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Updated for App Router
import { AlertCircle, X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileAlert() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Replaces router.pathname in App Router
  const [isVisible, setIsVisible] = useState(false);
  const [missingInfo, setMissingInfo] = useState<string[]>([]);

  useEffect(() => {
    // Show only on the main dashboard overview
    if (user && (pathname === '/dashboard' || pathname === '/')) {

      const checkProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('business_phone, logo_url, tagline, address')
          .eq('id', user.id)
          .single();

        const missing = [];
        if (!data?.logo_url) missing.push("Logo");
        if (!data?.business_phone) missing.push("Phone");
        if (!data?.tagline) missing.push("Tagline");
        if (!data?.address) missing.push("Address");

        if (missing.length > 0) {
          setMissingInfo(missing);

          // Wait 2 seconds before displaying on the dashboard
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 2000);

          return () => clearTimeout(timer);
        }
      };

      checkProfile();
    } else {
      setIsVisible(false);
    }
  }, [user, pathname]);

  if (!isVisible || missingInfo.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-6 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-[480px] bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 shadow-2xl rounded-[24px] overflow-hidden transition-all">
          <div className="flex items-center gap-4 p-4 md:p-5">

            {/* Minimalist Icon Section */}
            <div className="flex-shrink-0 w-12 h-12 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center">
              <AlertCircle size={24} />
            </div>

            {/* Content Section */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange">
                  Profile Incomplete
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold leading-tight">
                Upload your <span className="text-slate-900 dark:text-white font-black uppercase">{missingInfo.join(', ')}</span> to look professional.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsVisible(false);
                  router.push('/settings');
                }}
                className="h-10 px-5 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-glow-orange hover:scale-105 active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                Fix <ArrowRight size={14} />
              </button>

              <button 
                onClick={() => setIsVisible(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Subtle progress indicator at the bottom */}
          <div className="h-1 w-full bg-slate-100 dark:bg-white/5">
            <div 
              className="h-full bg-brand-orange transition-all duration-1000 ease-out" 
              style={{ width: `${((4 - missingInfo.length) / 4) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}