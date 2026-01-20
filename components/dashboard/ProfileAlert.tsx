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
    // CONSTRAINT 1: Only apply to the dashboard page
    // CONSTRAINT 2: User must be logged in
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
          
          // CONSTRAINT 3: Wait 2 seconds before displaying
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
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-[340px]"
      >
        <div className="bg-zinc-950 text-white rounded-2xl p-4 shadow-2xl border border-zinc-800 flex items-center gap-4">
          {/* Compact Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
            <AlertCircle size={20} />
          </div>

          {/* Mini Content */}
          <div className="flex-grow min-w-0">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-0.5">
              Complete Profile
            </h3>
            <p className="text-zinc-400 text-[10px] font-medium truncate">
              Missing: {missingInfo.join(', ')}
            </p>
          </div>

          {/* Compact Action Button */}
          <button 
            onClick={() => router.push('/settings')}
            className="flex-shrink-0 w-8 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center justify-center transition-colors group"
          >
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Close Button */}
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
