"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Tag, Package, Save, Loader2, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const editId = searchParams.get('id');

  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    wholesale_price: '',
    moq: '1', // Default MOQ is 1
    stock: '',
    is_active: true,
  });

  // If in Edit Mode, fetch existing data
  useEffect(() => {
    if (editId && user) {
      const fetchProduct = async () => {
        const { data } = await supabase.from('menu_items').select('*').eq('id', editId).single();
        if (data) {
          setFormData({
            name: data.name,
            description: data.description || '',
            price: data.price.toString(),
            wholesale_price: data.wholesale_price?.toString() || '',
            moq: data.moq?.toString() || '1',
            stock: data.stock?.toString() || '',
            is_active: data.is_active,
          });
        }
      };
      fetchProduct();
    }
  }, [editId, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    const payload = {
      user_id: user.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
      moq: parseInt(formData.moq),
      stock: formData.stock ? parseInt(formData.stock) : null,
      is_active: formData.is_active,
      updated_at: new Date(),
    };

    try {
      if (editId) {
        await supabase.from('menu_items').update(payload).eq('id', editId);
      } else {
        await supabase.from('menu_items').insert([payload]);
      }
      router.push('/products');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-12 space-y-6 px-4 md:px-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 hover:text-brand-orange transition-all">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
            {editId ? 'Edit Asset' : 'New Asset'}
          </h1>
        </div>
        <button type="submit" disabled={isSaving} className="bg-brand-orange text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-glow-orange active:scale-95 transition-all">
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <div className="flex items-center gap-2"><Save size={16} /> Save Changes</div>}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Identity</h2>
            <InputField label="Product Name" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} placeholder="e.g. Designer Sneaker" />
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">About the Asset</label>
              <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-white outline-none focus:border-brand-orange resize-none h-32" />
            </div>
          </section>

          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center h-64 group cursor-pointer border-dashed">
            <UploadCloud size={32} className="text-slate-300 mb-3 group-hover:text-brand-orange transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Visual Asset</p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Tag size={14} /> Pricing & B2B</h2>
            <InputField label="Retail Price (₦)" value={formData.price} onChange={(v:any) => setFormData({...formData, price: v})} placeholder="0.00" type="number" />
            <div className="pt-4 border-t border-white/5 space-y-4">
              <InputField label="Wholesale (₦)" value={formData.wholesale_price} onChange={(v:any) => setFormData({...formData, wholesale_price: v})} placeholder="Optional" type="number" />
              <InputField label="Min Order (MOQ)" value={formData.moq} onChange={(v:any) => setFormData({...formData, moq: v})} placeholder="1" type="number" />
            </div>
          </section>

          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Layers size={14} /> Availability</h2>
            <InputField label="In-Stock Units" value={formData.stock} onChange={(v:any) => setFormData({...formData, stock: v})} placeholder="∞" type="number" />
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-slate-400">Live Status</span>
              <button type="button" onClick={() => setFormData({...formData, is_active: !formData.is_active})} className={`w-12 h-6 rounded-full relative transition-all ${formData.is_active ? 'bg-green-500' : 'bg-slate-300 dark:bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-white outline-none focus:border-brand-orange" />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-brand-orange" /></div>}>
      <AddProductForm />
    </Suspense>
  );
}
