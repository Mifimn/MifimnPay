"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Tag, Package, Save, Loader2, Layers, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const editId = searchParams.get('id');

  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    wholesale_price: '',
    moq: '1',
    stock: '',
    is_active: true,
  });

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
          setImagePreview(data.image_url);
        }
      };
      fetchProduct();
    }
  }, [editId, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in");
    setIsSaving(true);

    try {
      let finalImageUrl = imagePreview;

      // 1. Upload Image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        finalImageUrl = urlData.publicUrl;
      }

      // 2. Prepare Payload
      const payload = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        moq: parseInt(formData.moq),
        stock: formData.stock ? parseInt(formData.stock) : null,
        image_url: finalImageUrl,
        is_active: formData.is_active,
        updated_at: new Date(),
      };

      // 3. Database Operation (Upsert)
      const { error: dbError } = editId 
        ? await supabase.from('menu_items').update(payload).eq('id', editId)
        : await supabase.from('menu_items').insert([payload]);

      if (dbError) throw dbError;

      router.push('/products');
      router.refresh(); // Force refresh to show new data
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while saving");
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
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <div className="flex items-center gap-2"><Save size={16} /> Save Product</div>}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Identity</h2>
            <InputField label="Product Name" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} placeholder="e.g. Designer Sneaker" required />
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">About the Asset</label>
              <textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-brand-orange resize-none h-32" 
              />
            </div>
          </section>

          {/* Image Upload Logic */}
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 relative group min-h-[250px] flex flex-col items-center justify-center overflow-hidden">
            {imagePreview ? (
              <div className="relative w-full h-full">
                <img src={imagePreview} className="w-full h-64 object-contain rounded-xl" alt="Preview" />
                <button 
                  type="button" 
                  onClick={() => {setImagePreview(null); setImageFile(null);}}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer space-y-3">
                <UploadCloud size={40} className="text-slate-300 group-hover:text-brand-orange transition-colors" />
                <div className="text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Visual Asset</p>
                   <p className="text-[8px] text-slate-500 uppercase mt-1">PNG, JPG or JPEG</p>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Tag size={14} /> Pricing & B2B</h2>
            <InputField label="Retail Price (₦)" value={formData.price} onChange={(v:any) => setFormData({...formData, price: v})} placeholder="0.00" type="number" required />
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

function InputField({ label, value, onChange, placeholder, type = "text", required = false }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <input 
        required={required}
        type={type} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder} 
        className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-orange" 
      />
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
