"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, ChevronLeft, Star, 
  Plus, Box, Share2, Info, AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { DetailsSkeleton } from './SkeletonLoader';
import { useCartStore } from '@/storefront/store/useCartStore';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';

interface ProductDetailsProps {
  isLoading: boolean;
  productData?: any; // Connected to Supabase data
}

/**
 * ProductDetails Component
 * Path: src/storefront/components/Showroom/ProductDetails.tsx
 * Updated with Supabase integration and dynamic theme support.
 */
export default function ProductDetails({ isLoading, productData }: ProductDetailsProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  const { themeColor } = useThemeStore();
  const { basket, addToBasket } = useCartStore();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Map Supabase 'menu_items' data to the component structure
  const product = productData ? {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    wholesale_price: productData.wholesale_price,
    moq: productData.moq || 1,
    img: productData.image_url || "https://picsum.photos/seed/mifimn/600",
    stock: productData.stock,
    description: productData.description
  } : null;

  // Use product image and mock gallery additions
  const images = product ? [
    product.img, 
    "https://picsum.photos/seed/detail1/600", 
    "https://picsum.photos/seed/detail2/600"
  ] : [];

  const existingItem = basket.find(item => item.id === product?.id);
  const currentQty = existingItem ? Number(existingItem.quantity) : 0;
  const maxStock = product?.stock || 9999;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  if (isLoading || !product) return <DetailsSkeleton />;

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-[1440px] mx-auto p-4 lg:p-10 space-y-10"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:opacity-70 font-black uppercase text-[10px] tracking-widest transition-all">
          <ChevronLeft size={14} /> Back to Showroom
        </button>
        <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
          <Share2 size={16} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Sliding Product Gallery */}
        <div className="w-full lg:flex-1 relative group">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] aspect-square flex items-center justify-center relative overflow-hidden shadow-sm">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImgIndex}
                src={images[currentImgIndex]} 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-contain p-8" 
                alt={product.name} 
              />
            </AnimatePresence>

            <button onClick={prevImg} className="absolute left-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} style={{ color: themeColor }} />
            </button>
            <button onClick={nextImg} className="absolute right-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} style={{ color: themeColor }} />
            </button>

            <div className="absolute top-6 left-6 text-white px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg" style={{ backgroundColor: themeColor }}>
              VERIFIED STOCK
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="w-full lg:flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2" style={{ color: themeColor }}>
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authentic Supplier</span>
            </div>
            <h1 className="text-3xl lg:text-6xl font-black uppercase italic tracking-tighter dark:text-white leading-[0.9]">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex gap-0.5" style={{ color: themeColor }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Premium Quality</span>
            </div>
          </div>

          {/* Sourcing Intelligence Widget */}
          <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Items in Cart</p>
                <p className="text-4xl font-black italic" style={{ color: themeColor }}>{currentQty} <span className="text-xs">Units</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Availability</p>
                <p className="text-sm font-black dark:text-white">{product.stock ?? '∞'} In Stock</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => addToBasket({ ...productData, quantity: 1 }, 1)}
                disabled={currentQty >= maxStock}
                className="py-5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor, boxShadow: `0 10px 20px ${themeColor}33` }}
              >
                <Plus size={16} /> Add 1.0 Unit
              </button>

              <button 
                onClick={() => addToBasket({ ...productData, quantity: 0.5 }, 0.5)}
                disabled={currentQty < 1 || currentQty + 0.5 > maxStock}
                className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  currentQty >= 1 
                  ? 'bg-white dark:bg-white/10 border shadow-sm active:scale-95' 
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
                style={{ borderColor: currentQty >= 1 ? themeColor : 'transparent', color: currentQty >= 1 ? themeColor : undefined }}
              >
                <Box size={16} /> Add 0.5 Unit
              </button>
            </div>

            <AnimatePresence>
              {currentQty < 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-slate-400">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <p className="text-[9px] font-bold uppercase italic leading-tight">
                    Add at least 1 unit to unlock fractional adjustments.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[ 
               { label: "Unit Price", value: `₦${Number(product.price).toLocaleString()}` }, 
               { label: "Min. Order", value: `${product.moq} Units` }, 
               { label: "Status", value: "Verified" } 
            ].map((tier, i) => (
              <div key={i} className="bg-white dark:bg-[#0a0a0a] py-4 px-2 rounded-[24px] text-center border border-slate-100 dark:border-white/5">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{tier.label}</p>
                <p className="text-lg font-black tracking-tighter" style={{ color: themeColor }}>{tier.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
