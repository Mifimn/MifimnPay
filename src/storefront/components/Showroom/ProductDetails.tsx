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
import { useCartStore, Product } from '@/storefront/store/useCartStore';

const RELATED = [
  { id: 101, name: "Industrial Steel Valve", price: "120.00", moq: "50 Pcs", img: "https://picsum.photos/seed/valve/400", stock: 500 },
  { id: 102, name: "Pressure Gauge Pro", price: "45.00", moq: "100 Pcs", img: "https://picsum.photos/seed/gauge/400", stock: 1000 },
  { id: 103, name: "Hydraulic Hose 20m", price: "88.00", moq: "20 Pcs", img: "https://picsum.photos/seed/hose/400", stock: 200 },
  { id: 104, name: "Cooling Fan Unit", price: "310.00", moq: "5 Pcs", img: "https://picsum.photos/seed/fan/400", stock: 50 },
];

interface ProductDetailsProps {
  isLoading: boolean;
  productData?: Product;
}

/**
 * ProductDetails Component
 * Path: src/storefront/components/Showroom/ProductDetails.tsx
 * * Features a touch-enabled image slider and sourcing intelligence.
 * Replaces 3D Stage with a sliding gallery.
 */
export default function ProductDetails({ isLoading, productData }: ProductDetailsProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  
  const { basket, addToBasket } = useCartStore();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Fallback for demo if productData isn't fetched yet
  const product = productData || {
    id: 1,
    name: "Industrial Hydraulic Pump",
    price: "2,200.00",
    moq: "10 Pcs",
    img: "https://picsum.photos/seed/pump/600",
    stock: 500
  };

  // Mock gallery (In production, replace with product.images array)
  const images = [product.img, "https://picsum.photos/seed/detail1/600", "https://picsum.photos/seed/detail2/600"];

  const existingItem = basket.find(item => item.id === product?.id);
  const currentQty = existingItem ? Number(existingItem.quantity) : 0;
  const maxStock = product?.stock || 500;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);

  if (isLoading) return <DetailsSkeleton />;

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
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-orange font-black uppercase text-[10px] tracking-widest transition-all">
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

            {/* Navigation Arrows */}
            <button onClick={prevImg} className="absolute left-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={20} className="text-brand-orange" />
            </button>
            <button onClick={nextImg} className="absolute right-4 p-3 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={20} className="text-brand-orange" />
            </button>

            {/* Index Dots */}
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImgIndex ? 'w-6 bg-brand-orange' : 'w-1.5 bg-slate-300'}`} />
              ))}
            </div>

            <div className="absolute top-6 left-6 bg-brand-orange text-white px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg">
              VERIFIED STOCK
            </div>
          </div>
        </div>

        {/* Action Center */}
        <div className="w-full lg:flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-orange">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authentic Supplier</span>
            </div>
            <h1 className="text-3xl lg:text-6xl font-black uppercase italic tracking-tighter dark:text-white leading-[0.9]">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex gap-0.5 text-brand-orange">
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
                <p className="text-4xl font-black text-brand-orange italic">{currentQty} <span className="text-xs">Units</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Availability</p>
                <p className="text-sm font-black dark:text-white">{maxStock} In Stock</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => addToBasket(product, 1)}
                disabled={currentQty >= maxStock}
                className="py-5 bg-brand-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-glow-orange active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add 1.0 Unit
              </button>

              <button 
                onClick={() => addToBasket(product, 0.5)}
                disabled={currentQty < 1 || currentQty + 0.5 > maxStock}
                className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  currentQty >= 1 
                  ? 'bg-white dark:bg-white/10 text-brand-orange border border-brand-orange/30 shadow-sm active:scale-95' 
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
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
               { label: "Unit Price", value: `$${product.price}` }, 
               { label: "Minimum", value: product.moq }, 
               { label: "Status", value: "Verified" } 
            ].map((tier, i) => (
              <div key={i} className="bg-white dark:bg-[#0a0a0a] py-4 px-2 rounded-[24px] text-center border border-slate-100 dark:border-white/5">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{tier.label}</p>
                <p className="text-lg font-black text-brand-orange tracking-tighter">{tier.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Discovery Section */}
      <section className="pt-10 border-t border-slate-200 dark:border-white/10">
        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 dark:text-white">
          Related <span className="text-brand-orange">Items</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
          {RELATED.map(item => (
            <div 
              key={item.id} 
              onClick={() => router.push(`/${vendor_slug}/product/${item.id}`)} 
              className="bg-white dark:bg-[#0f0f0f] rounded-[28px] border border-slate-200 dark:border-white/10 p-4 group cursor-pointer hover:border-brand-orange/50 transition-all shadow-sm"
            >
              <div className="aspect-square bg-slate-50 dark:bg-white/5 rounded-2xl mb-4 flex items-center justify-center p-4">
                <img src={item.img} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
              </div>
              <h4 className="text-[10px] font-black text-slate-500 uppercase h-8 line-clamp-2 leading-tight px-1">{item.name}</h4>
              <div className="flex justify-between items-end mt-3 px-1">
                <p className="text-lg font-black text-brand-orange">${item.price}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase pb-1">MOQ: {item.moq}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
