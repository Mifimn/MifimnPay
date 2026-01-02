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

  // Form State
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [currency, setCurrency] = useState('₦');

  const handleFinish = async () => {
    if (!businessName) return alert('Business name is required');
    setLoading(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        business_name: businessName,
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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <Head><title>Setup Profile | MifimnPay</title></Head>
      <div className="w-full max-w-lg">
        <div className="flex gap-2 mb-8">
          <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 1 ? 'bg-zinc-950' : 'bg-zinc-200'}`} />
          <div className={`h-1.5 rounded-full flex-1 transition-all ${step >= 2 ? 'bg-zinc-950' : 'bg-zinc-200'}`} />
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-zinc-200 shadow-xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-950"><Store size={24} /></div>
                <h2 className="text-2xl font-bold text-zinc-950">Business Details</h2>
                <p className="text-zinc-500 text-sm mt-1">This appears on your receipts.</p>
              </div>
              <div className="space-y-4">
                <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 outline-none focus:border-zinc-950" />
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-white outline-none">
                    <option value="₦">₦ Naira (NGN)</option>
                    <option value="$">$ Dollar (USD)</option>
                </select>
              </div>
              <button onClick={() => setStep(2)} className="w-full h-12 bg-zinc-950 text-white rounded-xl font-medium">Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-center">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-950"><Upload size={24} /></div>
              <h2 className="text-2xl font-bold text-zinc-950">Add your Logo</h2>
              <p className="text-zinc-500 text-sm mt-1">Optional. You can skip this for now.</p>
              <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 hover:bg-zinc-50 cursor-pointer">
                <Upload className="mx-auto text-zinc-400 mb-2" />
                <p className="text-sm font-medium">Click to upload logo</p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleFinish} className="flex-1 h-12 bg-zinc-100 rounded-xl font-medium">Skip</button>
                <button onClick={handleFinish} disabled={loading} className="flex-[2] h-12 bg-zinc-950 text-white rounded-xl font-medium flex items-center justify-center gap-2">
                   {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Complete Setup'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
