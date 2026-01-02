import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Store, Upload, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('₦');

  const handleFinish = async () => {
    setLoading(true);
    // Even if they skip, we save 'New Vendor' so it breaks the redirect loop
    const finalName = businessName || 'New Vendor';
    
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: finalName,
        business_phone: phone,
        currency: currency,
      })
      .eq('id', user?.id);

    if (error) {
        alert(error.message);
        setLoading(false);
    } else {
        router.push('/dashboard'); 
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-zinc-950">
      <Head><title>Setup Profile | MifimnPay</title></Head>
      <div className="w-full max-w-lg">
        <div className="flex gap-2 mb-8 items-center justify-center">
             <div className="w-10 h-10 bg-zinc-950 text-white rounded-xl flex items-center justify-center font-bold">M</div>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-8">
          {step === 1 ? (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold">Business Details</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200" />
              </div>
              <button onClick={() => setStep(2)} className="w-full h-12 bg-zinc-950 text-white rounded-xl font-bold">Continue</button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold">Add your Logo</h2>
              <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 hover:bg-zinc-50 cursor-pointer">
                <Upload className="mx-auto text-zinc-400 mb-2" />
                <p className="text-sm font-medium">Click to upload logo (Optional)</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleFinish} className="flex-1 h-12 bg-zinc-100 rounded-xl font-bold">Skip</button>
                <button onClick={handleFinish} disabled={loading} className="flex-[2] h-12 bg-zinc-900 text-white rounded-xl font-bold">
                   {loading ? <Loader2 className="animate-spin" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}