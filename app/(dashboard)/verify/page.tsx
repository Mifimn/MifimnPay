"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export default function VerifyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'unverified' | 'pending' | 'verified'>('unverified');
  const [formData, setFormData] = useState({ name: '', nin: '' });

  useEffect(() => {
    if (user) {
      const fetchStatus = async () => {
        const { data } = await supabase.from('profiles').select('verification_status, legal_full_name, nin_number').eq('id', user.id).single();
        if (data) {
          setStatus(data.verification_status as any);
          setFormData({ name: data.legal_full_name || '', nin: data.nin_number || '' });
        }
      };
      fetchStatus();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      legal_full_name: formData.name,
      nin_number: formData.nin,
      verification_status: 'pending'
    }).eq('id', user?.id);

    if (!error) setStatus('pending');
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto pt-10">
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8">
        <div className="text-center mb-8">
          <ShieldCheck className="mx-auto text-brand-orange mb-4" size={48} />
          <h1 className="text-2xl font-black uppercase italic italic tracking-tighter">Identity Verification</h1>
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
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-transparent focus:border-brand-orange outline-none font-bold"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              required maxLength={11} placeholder="11-Digit NIN Number" 
              className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-transparent focus:border-brand-orange outline-none font-bold"
              value={formData.nin} onChange={e => setFormData({...formData, nin: e.target.value})}
            />
            <button className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">
              {loading ? "Processing..." : "Submit for Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}