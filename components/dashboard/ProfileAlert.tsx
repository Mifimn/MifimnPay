import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AlertCircle, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileAlert() {
  const { user } = useAuth();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [missingInfo, setMissingInfo] = useState<string[]>([]);

  useEffect(() => {
    // Only apply to the dashboard page
    if (user && router.pathname === '/dashboard') {
      
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
  }, [user, router.pathname]);

  if (!isVisible || missingInfo.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-0 right-0 z-[100] px-4 flex justify-center pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-[450px] bg-brand-paper border border-orange-200 dark:border-orange-900/30 shadow-xl rounded-2xl overflow-hidden transition-colors duration-300">
          <div className="flex items-center gap-3 p-3 md:p-4">
            {/* Minimalist Icon Section */}
            <div className="flex-shrink-0 w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400 rounded-xl flex items-center justify-center transition-colors duration-300">
              <AlertCircle size={20} />
            </div>

            {/* Content Section */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 dark:text-orange-400 transition-colors duration-300">
                  Profile Incomplete
                </span>
              </div>
              <p className="text-brand-gray text-[11px] font-medium leading-tight transition-colors duration-300">
                Upload your <span className="text-brand-black font-bold transition-colors duration-300">{missingInfo.join(', ')}</span> to look professional.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => router.push('/settings')}
                className="h-9 px-4 bg-brand-black text-brand-paper rounded-xl text-[11px] font-bold hover:opacity-90 transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                Fix <ArrowRight size={14} />
              </button>
              
              <button 
                onClick={() => setIsVisible(false)}
                className="w-9 h-9 flex items-center justify-center text-brand-gray hover:text-brand-black hover:bg-brand-bg rounded-xl transition-colors duration-300"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Subtle progress indicator at the bottom */}
          <div className="h-1 w-full bg-brand-bg transition-colors duration-300">
            <div 
              className="h-full bg-orange-500 transition-all duration-500" 
              style={{ width: `${((4 - missingInfo.length) / 4) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
