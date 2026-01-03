import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function ProfileAlert() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(true);

  useEffect(() => {
    if (user) {
      const checkProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('business_name, business_phone, logo_url')
          .eq('id', user.id)
          .single();

        // Trigger alert if profile is incomplete
        if (!data?.business_name || data.business_name === 'My Business' || !data?.business_phone || !data?.logo_url) {
          setIsComplete(false);
          setIsVisible(true);
          
          // Auto-hide after exactly 10 seconds
          const timer = setTimeout(() => setIsVisible(false), 10000);
          return () => clearTimeout(timer);
        }
      };
      checkProfile();
    }
  }, [user]);

  if (!isVisible || isComplete) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white px-4 py-4 shadow-2xl flex items-center justify-between border-b border-orange-400 animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3 max-w-6xl mx-auto w-full">
        <AlertCircle size={22} className="animate-pulse shrink-0" />
        <p className="text-sm md:text-base font-bold">
          Your profile is incomplete! Complete your business setup to remove watermarks and generate professional receipts.
        </p>
      </div>
      <button onClick={() => setIsVisible(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
        <X size={20} />
      </button>
    </div>
  );
}
