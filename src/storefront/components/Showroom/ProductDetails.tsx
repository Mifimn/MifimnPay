"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, ChevronLeft, Star, 
  Plus, Box, Share2, Info, AlertTriangle,
  ChevronRight, Copy, CheckCircle2
} from 'lucide-react';
import { DetailsSkeleton } from './SkeletonLoader';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';

interface ProductDetailsProps {
  isLoading: boolean;
  productData?: any; 
  relatedProducts?: any[]; 
  vendorName?: string; 
}

export default function ProductDetails({ isLoading, productData, relatedProducts = [], vendorName }: ProductDetailsProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  
  const { basket, addToBasket } = useCartStore();
  const { themeColor } = useThemeStore();
  const [copied, setCopied] = useState(false);

  // Database Mapping
  const product = productData ? {
    id: productData.id,
    short_id: productData.short_id,
    name: productData.name,
    price: productData.price,
    moq: productData.moq || 1,
    img: productData.image_url,
    stock: productData.stock || 0,
    wholesale_price: productData.wholesale_price,
    description: productData.description
  } : null;

  const images = product?.img ? [product.img] : ["https://picsum.photos/seed/mifimn/600"];

  const existingItem = basket.find(item => item.id === product?.id);
  const currentQty = existingItem ? Number(existingItem.quantity) : 0;
  const maxStock = product?.stock || 500;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  const handleCopyLink = () => {
    if (!product) return;
    const baseUrl = window.location.origin;
    const shortUrl = `${baseUrl}/${vendor_slug}/product/${product.short_id || product.id}`;
    const shareText = `*${product.name}*\n\n💰 Price: ₦${Number(product.price).toLocaleString()}\n📦 MOQ: ${product.moq} Units\n\nView on ${vendorName || vendor_slug}:\n${shortUrl}`;
    
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <DetailsSkeleton />;
  if (!product) return (
    <div className="p-20 text-center space-y-4">
      <h2 className="text-xl font-black uppercase italic dark:text-white">Product Not Found</h2>
      <button onClick={() => router.push(`/${vendor_slug}`)} className="font-bold uppercase text-[10px] tracking-widest" style={{ color: themeColor }}>Return to Showroom</button>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-[1440px] mx-auto p-4 lg:p-10 space-y-10"
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        {/* FIXED: Changed size(14) to size={14} */}
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:opacity-70 font-black uppercase text-[10px] tracking-widest transition-all">
          <ChevronLeft size={14} /> Back to Showroom
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-orange transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Link Copied!" : "Copy Short Link"}
          </button>

          <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <div className="w-full lg:flex-1">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] aspect-square flex items-center justify-center p-8 relative overflow-hidden shadow-sm group">
            <img 
              src={images[0]} 
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
              alt={product.name} 
            />
            <div className="absolute top-6 left-6 text-white px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg" style={{ backgroundColor: themeColor }}>
              VERIFIED STOCK
            </div>
          </div>
        </div>

        <div className="w-full lg:flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2" style={{ color: themeColor }}>
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Store Asset</span>
            </div>
            <h1 className="text-3xl lg:text-6xl font-black uppercase italic tracking-tighter dark:text-white leading-[0.9]">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex gap-0.5" style={{ color: themeColor }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sourcing Approved</span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-[32px] border border-slate-200 dark:border-white/10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Your Current Inquiry</p>
                <p className="text-4xl font-black italic" style={{ color: themeColor }}>{currentQty} <span className="text-xs">Units</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Available Stock</p>
                <p className="text-sm font-black dark:text-white">{product.stock} Units</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => addToBasket({ ...productData, img: productData.image_url }, 1)}
                disabled={currentQty >= maxStock}
                className="py-5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                style={{ 
                    backgroundColor: themeColor, 
                    boxShadow: `0 10px 20px ${themeColor}33`,
                    color: '#FFFFFF' 
                }}
              >
                <Plus size={16} /> Add Full Unit
              </button>

              <button 
                onClick={() => addToBasket({ ...productData, img: productData.image_url }, 0.5)}
                disabled={currentQty < 1 || currentQty + 0.5 > maxStock}
                className={`py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                  currentQty >= 1 
                  ? 'bg-white dark:bg-white/10 border shadow-sm active:scale-95' 
                  : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
                }`}
                style={{ 
                    borderColor: currentQty >= 1 ? themeColor : 'transparent', 
                    color: currentQty >= 1 ? themeColor : undefined 
                }}
              >
                <Box size={16} /> Add Half (0.5)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[ 
               { label: "Retail Price", value: `₦${Number(product.price).toLocaleString()}` }, 
               { label: "Wholesale", value: product.wholesale_price ? `₦${Number(product.wholesale_price).toLocaleString()}` : 'N/A' }, 
               { label: "MOQ", value: `${product.moq} Units` } 
            ].map((tier, i) => (
              <div key={i} className="bg-white dark:bg-[#0a0a0a] py-4 px-2 rounded-[24px] text-center border border-slate-100 dark:border-white/5">
                <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">{tier.label}</p>
                <p className="text-lg font-black tracking-tighter" style={{ color: themeColor }}>{tier.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200 dark:border-white/10">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 dark:text-white">
            Related <span style={{ color: themeColor }}>Assets</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => router.push(`/${vendor_slug}/product/${item.short_id || item.id}`)}
                className="bg-white dark:bg-[#0f0f0f] rounded-[28px] border border-slate-200 dark:border-white/10 p-4 group cursor-pointer hover:scale-[1.02] transition-all"
              >
                <div className="aspect-square bg-slate-50 dark:bg-white/5 rounded-2xl mb-4 flex items-center justify-center p-4">
                  <img src={item.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase h-8 line-clamp-2 leading-tight px-1">{item.name}</h4>
                <div className="flex justify-between items-end mt-3 px-1">
                  <p className="text-lg font-black" style={{ color: themeColor }}>₦{Number(item.price).toLocaleString()}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase pb-1">MOQ: {item.moq}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
