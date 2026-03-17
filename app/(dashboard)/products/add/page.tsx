"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Tag, Package, Save, Loader2, Layers, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const editId = searchParams.get('id');

  const [isSaving, setIsSaving] = useState(false);

  // Multi-image state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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

          // Load existing images array, fallback to single image_url if upgrading from old version
          const loadedImages = data.image_urls && data.image_urls.length > 0 
            ? data.image_urls 
            : (data.image_url ? [data.image_url] : []);

          setExistingImages(loadedImages);
        }
      };
      fetchProduct();
    }
  }, [editId, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles((prev) => [...prev, ...filesArray]);

      const previewsArray = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...previewsArray]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setNewImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in");
    setIsSaving(true);

    try {
      const uploadedUrls: string[] = [];

      // 1. Upload all NEW images
      for (const file of newImageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Combine old images kept by user with newly uploaded images
      const finalImageUrls = [...existingImages, ...uploadedUrls];

      // 2. Prepare Payload
      const payload = {
        user_id: user.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        wholesale_price: formData.wholesale_price ? parseFloat(formData.wholesale_price) : null,
        moq: parseInt(formData.moq),
        stock: formData.stock ? parseInt(formData.stock) : null,
        // Save first image as main image for backward compatibility
        image_url: finalImageUrls.length > 0 ? finalImageUrls[0] : null, 
        // Save the full array of images
        image_urls: finalImageUrls, 
        is_active: formData.is_active,
        updated_at: new Date(),
      };

      // 3. Database Operation (Upsert)
      const { error: dbError } = editId 
        ? await supabase.from('menu_items').update(payload).eq('id', editId)
        : await supabase.from('menu_items').insert([payload]);

      if (dbError) throw dbError;

      router.push('/products');
      router.refresh(); 
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  const totalImages = existingImages.length + newImagePreviews.length;

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

          {/* Multi-Image Upload Section */}
          <section className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visual Assets Gallery</h2>
              <span className="text-[9px] font-bold text-slate-500 uppercase">{totalImages} / 5 Images</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <AnimatePresence>
                {/* Render Existing Images from DB */}
                {existingImages.map((url, index) => (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={`existing-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-200 dark:border-white/10">
                    <img src={url} className="w-full h-full object-cover" alt={`Existing ${index}`} />
                    <button type="button" onClick={() => removeExistingImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                      <X size={14} />
                    </button>
                    {index === 0 && <div className="absolute bottom-0 left-0 right-0 bg-brand-orange text-white text-[8px] font-black uppercase tracking-widest text-center py-1">Main Image</div>}
                  </motion.div>
                ))}

                {/* Render Newly Selected Previews */}
                {newImagePreviews.map((preview, index) => (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} key={`new-${index}`} className="relative aspect-square rounded-2xl overflow-hidden group border border-brand-orange/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    <img src={preview} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10">
                      <X size={14} />
                    </button>
                    <div className="absolute inset-0 bg-brand-orange/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-brand-orange font-black text-[10px] uppercase bg-white dark:bg-black px-2 py-1 rounded-lg">New</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Upload Button */}
              {totalImages < 5 && (
                <label className="aspect-square flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-slate-300 dark:border-white/20 rounded-2xl hover:border-brand-orange hover:bg-brand-orange/5 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-colors text-slate-400 mb-3">
                    <Plus size={20} />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-brand-orange transition-colors">Add Image</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
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
