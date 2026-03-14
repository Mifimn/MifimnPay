"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, Tag, Package, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AddProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Form State (Frontend only for now!)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    retailPrice: '',
    wholesalePrice: '',
    stock: '',
    isActive: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Fake a network request for the UI experience
    setTimeout(() => {
      setIsSaving(false);
      router.push('/products');
    }, 1000);
  };

  return (
    <form onSubmit={handleSave} className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/products" 
            className="w-10 h-10 bg-brand-paper border border-brand-border rounded-xl flex items-center justify-center text-brand-black hover:bg-brand-bg transition-colors shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-brand-black tracking-tight uppercase italic transition-colors duration-300">
              New Product
            </h1>
            <p className="text-xs font-bold text-brand-gray tracking-widest uppercase mt-1 transition-colors duration-300">
              Add to inventory
            </p>
          </div>
        </div>

        <button 
          type="submit"
          disabled={isSaving}
          className="bg-brand-black text-brand-paper px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-black/20 disabled:opacity-70 disabled:hover:scale-100"
        >
          {isSaving ? <span className="animate-pulse">Saving...</span> : <><Save size={16} /> Save Product</>}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Main Details (Takes up 2/3 of the space) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Basic Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-brand-paper p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6 transition-colors duration-300"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-gray border-b border-brand-border pb-4">Basic Details</h2>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-black ml-1">Product Name</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Premium Perfume Oil"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full h-14 px-5 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:border-brand-black text-brand-black font-bold transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-black ml-1">Description (Optional)</label>
              <textarea 
                placeholder="Describe your product..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-5 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:border-brand-black text-brand-black font-medium transition-all shadow-inner resize-none custom-scrollbar"
              />
            </div>
          </motion.div>

          {/* Media / Image Upload Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-brand-paper p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6 transition-colors duration-300"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-gray border-b border-brand-border pb-4">Product Image</h2>
            
            <button 
              type="button"
              className="w-full h-48 border-2 border-dashed border-brand-border hover:border-brand-black rounded-3xl flex flex-col items-center justify-center gap-3 bg-brand-bg hover:bg-brand-bg/50 transition-all group"
            >
              <div className="w-14 h-14 bg-brand-paper rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <UploadCloud size={24} className="text-brand-black" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-brand-black">Click to upload image</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-gray mt-1">PNG, JPG up to 5MB</p>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Right Column: Pricing & Inventory */}
        <div className="space-y-8">
          
          {/* Pricing Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-brand-paper p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6 transition-colors duration-300"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-gray border-b border-brand-border pb-4 flex items-center gap-2">
              <Tag size={14} /> Pricing
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-black ml-1">Retail Price (₦)</label>
              <input 
                required
                type="number" 
                placeholder="0.00"
                value={formData.retailPrice}
                onChange={(e) => setFormData({...formData, retailPrice: e.target.value})}
                className="w-full h-14 px-5 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:border-brand-black text-brand-black font-mono font-bold transition-all shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-black ml-1">Wholesale Price (₦)</label>
              <input 
                type="number" 
                placeholder="Optional for B2B"
                value={formData.wholesalePrice}
                onChange={(e) => setFormData({...formData, wholesalePrice: e.target.value})}
                className="w-full h-14 px-5 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:border-brand-black text-brand-black font-mono font-bold transition-all shadow-inner"
              />
            </div>
          </motion.div>

          {/* Inventory Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-brand-paper p-8 rounded-[32px] border border-brand-border shadow-sm space-y-6 transition-colors duration-300"
          >
            <h2 className="text-xs font-black uppercase tracking-widest text-brand-gray border-b border-brand-border pb-4 flex items-center gap-2">
              <Package size={14} /> Inventory
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-black ml-1">Stock Quantity</label>
              <input 
                type="number" 
                placeholder="Leave blank for infinite"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full h-14 px-5 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:border-brand-black text-brand-black font-mono font-bold transition-all shadow-inner"
              />
            </div>

            <div className="pt-4 border-t border-brand-border flex items-center justify-between">
              <label className="text-xs font-bold text-brand-black">Active on Storefront</label>
              <button 
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`w-12 h-6 rounded-full transition-colors relative ${formData.isActive ? 'bg-brand-black' : 'bg-brand-border'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-brand-paper absolute top-1 transition-all ${formData.isActive ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </form>
  );
}
