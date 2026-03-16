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

interface ProductDetailsProps {
  isLoading: boolean;
  productData?: any; // Connected to real DB data
}

export default function ProductDetails({ isLoading, productData }: ProductDetailsProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  const { basket, addToBasket } = useCartStore();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Map Supabase data to frontend structure
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

  const images = product ? [product.img] : [];

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
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:text-brand-orange font-black uppercase text-[10px] tracking-widest transition-all">
          <ChevronLeft size={14} /> Back to Showroom
        </button>
        <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
          <Share2 size={16} />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <div className="w-full lg:flex-1 relative group">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] aspect-square flex items-center justify-center relative overflow-hidden shadow-sm">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImgIndex}
                src={images[currentImgIndex]} 
                className="w-full h-full object-contain p-8" 
                alt={product.name} 
              />
            </AnimatePresence>

            <div className="absolute top-6 left-6 bg-brand-orange text-white px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg">
              {product.stock && product.stock > 0 ? 'VERIFIED STOCK' : 'PRE-ORDER AVAILABLE'}
            </div>
          </div>
        </div>

        <div className="w-full lg:flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-orange">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Authentic Supplier</span>
            </div>
            <h1 className="text-3xl lg:text-6xl font-black uppercase italic tracking-tighter dark:text-white leading-[0.9]">
              {product.name}
            </h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Standard Price</p>
                <p className="text-4xl font-black text-brand-orange italic">₦{Number(product.price).toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Inventory</p>
                <p className="text-sm font-black dark:text-white">{product.stock ?? '∞'} Units</p>
              </div>
            </div>

            {product.wholesale_price && (
              <div className="p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl">
                 <p className="text-[9px] font-black text-brand-orange uppercase mb-1 tracking-widest">Wholesale Privilege</p>
                 <p className="text-xl font-black dark:text-white">₦{Number(product.wholesale_price).toLocaleString()} <span className="text-[10px] text-slate-400">/ unit</span></p>
                 <p className="text-[9px] font-bold text-slate-500 uppercase mt-1 italic">Applies when ordering {product.moq}+ units</p>
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => addToBasket({ ...productData, quantity: 1 })}
                disabled={product.stock !== null && product.stock <= 0}
                className="w-full py-5 bg-brand-orange text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-glow-orange active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add to Cart
              </button>

              <div className="flex items-center gap-2 px-2">
                <AlertTriangle size={14} className="text-slate-400" />
                <span className="text-[9px] font-black text-slate-400 uppercase">Min Order: {product.moq} Unit(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
