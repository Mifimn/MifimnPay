import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';

export default function Onboarding() {
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
      // 1. Upload Logo if selected (Stored in a folder named after User ID)
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

      // 2. Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          business_name: businessName || 'New Vendor',
          business_phone: phone,
          currency: currency,
          logo_url: logoUrl,
          updated_at: new Date(),
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-brand-black transition-colors duration-300">
      <Head><title>Setup Profile | MifimnPay</title></Head>
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-brand-paper rounded-2xl border border-brand-border shadow-xl p-8 transition-colors duration-300">
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm transition-colors duration-300">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-center text-brand-black transition-colors duration-300">Business Details</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Business Name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-brand-border bg-brand-bg text-brand-black outline-none focus:border-brand-black focus:bg-brand-paper placeholder:text-brand-gray transition-colors duration-300" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-12 px-4 rounded-xl border border-brand-border bg-brand-bg text-brand-black outline-none focus:border-brand-black focus:bg-brand-paper placeholder:text-brand-gray transition-colors duration-300" />
              </div>
              <button onClick={() => setStep(2)} className="w-full h-12 bg-brand-black text-brand-paper rounded-xl font-bold transition-colors duration-300 active:scale-[0.98]">Continue</button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <h2 className="text-2xl font-bold text-brand-black transition-colors duration-300">Add your Logo</h2>
              <label className="block border-2 border-dashed border-brand-border rounded-xl p-8 hover:bg-brand-bg cursor-pointer relative transition-colors duration-300">
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <img src={previewUrl} alt="Preview" className="h-20 w-20 object-contain mb-2" />
                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 transition-colors duration-300"><CheckCircle2 size={14}/> Image Ready</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-brand-gray transition-colors duration-300">
                    <Upload size={32} className="mb-2" />
                    <p className="text-sm font-medium">Click to upload logo</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
              </label>
              <div className="flex gap-3">
                <button onClick={handleFinish} className="flex-1 h-12 bg-brand-bg text-brand-black border border-brand-border hover:bg-brand-border rounded-xl font-bold transition-colors duration-300">Skip</button>
                <button onClick={handleFinish} disabled={loading} className="flex-[2] h-12 bg-brand-black text-brand-paper rounded-xl font-bold flex items-center justify-center transition-colors duration-300 active:scale-[0.98] disabled:opacity-70">
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
