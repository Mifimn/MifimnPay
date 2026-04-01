"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, Loader2, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function VerifyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [status, setStatus] = useState<'unverified' | 'pending' | 'verified' | 'rejected'>('unverified');
  const [formData, setFormData] = useState({ name: '', nin: '' });

  useEffect(() => {
    if (user) {
      const fetchStatus = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('verification_status, legal_full_name, nin_number, verification_token')
          .eq('id', user.id)
          .single();

        if (data) {
          setStatus(data.verification_status as any);
          setFormData({ name: data.legal_full_name || '', nin: data.nin_number || '' });

          // THE GUARD: Check if the token in the URL matches the database
          if (!urlToken || data.verification_token !== urlToken) {
            setIsTokenValid(false);
          } else {
            setIsTokenValid(true);
          }
        }
      };
      fetchStatus();
    }
  }, [user, urlToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Clear the token so the link can't be reused after submission
    const { error } = await supabase.from('profiles').update({
      legal_full_name: formData.name,
      nin_number: formData.nin,
      verification_status: 'pending',
      verification_token: null 
    }).eq('id', user?.id);

    if (!error) setStatus('pending');
    setLoading(false);
  };

  if (isTokenValid === null) {
    return <div className="pt-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-orange" size={32} /></div>;
  }

  // INVALID LINK SCREEN
  if (isTokenValid === false && status !== 'pending' && status !== 'verified') {
    return (
      <div className="max-w-md mx-auto pt-10">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Access Denied</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">
            This verification link is invalid, expired, or was not requested. Please request a new link from your dashboard.
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-brand-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // VALID LINK OR ALREADY SUBMITTED
  return (
    <div className="max-w-md mx-auto pt-10">
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-brand-orange mb-4" size={48} />
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Identity Verification</h1>
        </div>

        {status === 'verified' ? (
          <div className="text-center py-6 text-green-500 font-black uppercase text-sm">
            <CheckCircle2 className="mx-auto mb-2" /> Verified & Unlimited
          </div>
        ) : status === 'pending' ? (
          <div className="text-center py-6 text-slate-500 font-black uppercase text-[10px] tracking-widest">
            <Loader2 className="animate-spin mx-auto mb-4" /> Reviewing your NIN...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input 
              required placeholder="Legal Full Name (On NIN)" 
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-brand-orange outline-none font-bold text-brand-black dark:text-white"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              required maxLength={11} placeholder="11-Digit NIN Number" 
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 focus:border-brand-orange outline-none font-bold text-brand-black dark:text-white"
              value={formData.nin} onChange={e => setFormData({...formData, nin: e.target.value})}
            />
            <button className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 active:scale-95 transition-all">
              {loading ? "Processing..." : "Submit for Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}