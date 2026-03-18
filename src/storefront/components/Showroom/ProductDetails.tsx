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
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Database Mapping
  const product = productData ? {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    moq: productData.moq || 1,
    img: productData.image_url,
    image_urls: productData.image_urls || [], // Array of multiple images
    stock: productData.stock || 0,
    wholesale_price: productData.wholesale_price,
    description: productData.description
  } : null;

  // Multi-image logic fallback
  const images = product?.image_urls?.length > 0 
    ? product.image_urls 
    : (product?.img ? [product.img] : ["https://picsum.photos/seed/mifimn/600"]);

  const existingItem = basket.find(item => item.id === product?.id);
  const currentQty = existingItem ? Number(existingItem.quantity) : 0;
  const maxStock = product?.stock || 500;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  const handleCopyLink = () => {
    if (!product) return;
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/${vendor_slug}/product/${product.id}`;
    const shareText = `*${product.name}*\n\n💰 Price: ₦${Number(product.price).toLocaleString()}\n📦 MOQ: ${product.moq} Units\n\nView on ${vendorName || vendor_slug}:\n${fullUrl}`;

    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

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
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:opacity-70 font-black uppercase text-[10px] tracking-widest transition-all">
          <ChevronLeft size={14} /> Back to Showroom
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-orange transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
          >
            {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Details Copied!" : "Copy Product Link"}
          </button>

          <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* IMAGE SLIDER FRAME */}
        <div className="w-full lg:flex-1">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] aspect-square flex items-center justify-center p-8 relative overflow-hidden shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.img 
                key={currentImgIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                src={images[currentImgIndex]} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                alt={product.name} 
              />
            </AnimatePresence>

            {/* Slider Controls (Only show if multiple images) */}
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-black/50 text-slate-900 dark:text-white rounded-full shadow-lg backdrop-blur-md hover:scale-110 transition-all z-10">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-black/50 text-slate-900 dark:text-white rounded-full shadow-lg backdrop-blur-md hover:scale-110 transition-all z-10">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 bg-black/20 dark:bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${currentImgIndex === idx ? 'w-4' : 'w-1.5 bg-white/50'}`}
                      style={{ backgroundColor: currentImgIndex === idx ? themeColor : undefined }}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute top-6 left-6 text-white px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg z-10" style={{ backgroundColor: themeColor }}>
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

            {/* RETAIL vs WHOLESALE BUTTONS */}
            <div className={`grid gap-3 ${product.wholesale_price ? 'grid-cols-2' : 'grid-cols-1'}`}>

              {/* Add Retail (1 Unit increments) */}
              <button 
                onClick={() => addToBasket({ ...productData, img: productData.image_url, price: productData.price }, 1)}
                disabled={currentQty >= maxStock}
                className="py-5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: themeColor, boxShadow: `0 10px 20px ${themeColor}33`, color: '#FFFFFF' }}
              >
                <Plus size={16} /> {currentQty > 0 ? "Add Another (+1)" : "Add Retail"}
              </button>

              {/* Add Wholesale (Smart MOQ scaling) */}
              {product.wholesale_price && (
                <button 
                  onClick={() => {
                    // Smart Logic: First click adds the minimum required MOQ. Future clicks add 1 unit.
                    const qtyToAdd = (currentQty === 0 && product.moq > 1) ? product.moq : 1;
                    addToBasket({ ...productData, img: productData.image_url, price: productData.wholesale_price }, qtyToAdd);
                  }}
                  disabled={currentQty >= maxStock}
                  className="py-5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl px-2 text-center"
                >
                  <Box size={16} /> 
                  {currentQty > 0 
                    ? "Add Another (+1)" 
                    : `Add Wholesale ${product.moq > 1 ? `(${product.moq} Min)` : ''}`
                  }
                </button>
              )}
            </div>

            <AnimatePresence>
              {product.wholesale_price && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-slate-400">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <p className="text-[9px] font-bold uppercase italic leading-tight">
                    Wholesale option is available. Ensure you meet the MOQ ({product.moq} Units) if required by the vendor before checking out.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200 dark:border-white/10">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-8 dark:text-white">
            Related <span style={{ color: themeColor }}>Assets</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((item: any) => (
              <div 
                key={item.id} 
                onClick={() => router.push(`/${vendor_slug}/product/${item.id}`)}
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
