"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, ChevronLeft, Star, 
  Plus, Box, Share2, Info,
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

  const { basket, addToBasket, toggleCart } = useCartStore();
  const { themeColor } = useThemeStore();

  const [copied, setCopied] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const [retailQty, setRetailQty] = useState(1);
  const [wholesalePacks, setWholesalePacks] = useState(1);

  const product = productData ? {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    moq: productData.moq || 1,
    img: productData.image_url,
    image_urls: productData.image_urls || [], 
    stock: productData.stock || 0,
    wholesale_price: productData.wholesale_price,
    description: productData.description
  } : null;

  const images = product?.image_urls?.length > 0 
    ? product.image_urls 
    : (product?.img ? [product.img] : ["https://picsum.photos/seed/mifimn/600"]);

  const existingItem = basket.find(item => item.id === product?.id);
  // FIXED: Changed from existingItem.quantity to existingItem.qty to fix the limit bug
  const currentQtyInCart = existingItem ? Number(existingItem.qty || 0) : 0;
  const maxStock = product?.stock || 500;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product?.id]);

  const handleCopyLink = () => {
    if (!product) return;
    const fullUrl = `${window.location.origin}/${vendor_slug}/product/${product.id}`;
    navigator.clipboard.writeText(`*${product.name}*\n\n💰 Price: ₦${Number(product.price).toLocaleString()}\n📦 MOQ: ${product.moq} Units\n\nView on ${vendorName || vendor_slug}:\n${fullUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextImage = () => setCurrentImgIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleAddRetail = () => {
    if (!product) return;
    const safeQtyToAdd = Math.min(retailQty, maxStock - currentQtyInCart);
    if (safeQtyToAdd > 0) {
      addToBasket({ ...product }, safeQtyToAdd); 
      setRetailQty(1); 
      // FIXED: Removed toggleCart() so users can click add multiple times without the drawer interrupting them
    }
  };

  const handleAddWholesale = () => {
    if (!product) return;
    const totalUnitsToAdd = wholesalePacks * product.moq;
    const safeQtyToAdd = Math.min(totalUnitsToAdd, maxStock - currentQtyInCart);

    if (safeQtyToAdd > 0) {
      addToBasket({ ...product }, safeQtyToAdd); 
      setWholesalePacks(1); 
      // FIXED: Removed toggleCart() so users can click add multiple times
    }
  };

  if (isLoading) return <DetailsSkeleton />;
  if (!product) return <div className="p-20 text-center"><h2 className="text-xl font-black uppercase dark:text-white">Not Found</h2></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[1440px] mx-auto p-4 lg:p-10 space-y-10">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-slate-400 hover:opacity-70 font-black uppercase text-[10px] tracking-widest transition-all">
          <ChevronLeft size={14} /> Back to Showroom
        </button>

        <div className="flex items-center gap-3">
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-orange transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10">
            {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? "Details Copied!" : "Copy Link"}
          </button>
          <button className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400"><Share2 size={16} /></button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        <div className="w-full lg:flex-1">
          <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] aspect-square flex items-center justify-center p-8 relative overflow-hidden shadow-sm group">
            <AnimatePresence mode="wait">
              <motion.img key={currentImgIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} src={images[currentImgIndex]} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt={product.name} />
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-black/50 text-slate-900 dark:text-white rounded-full shadow-lg backdrop-blur-md hover:scale-110 transition-all z-10"><ChevronLeft size={20} /></button>
                <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 dark:bg-black/50 text-slate-900 dark:text-white rounded-full shadow-lg backdrop-blur-md hover:scale-110 transition-all z-10"><ChevronRight size={20} /></button>
              </>
            )}
            <div className="absolute top-6 left-6 text-white px-4 py-1.5 rounded-full text-[10px] font-black italic shadow-lg z-10" style={{ backgroundColor: themeColor }}>VERIFIED STOCK</div>
          </div>
        </div>

        <div className="w-full lg:flex-1 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2" style={{ color: themeColor }}>
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Store Asset</span>
            </div>
            <h1 className="text-3xl lg:text-6xl font-black uppercase italic tracking-tighter dark:text-white leading-[0.9]">{product.name}</h1>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex gap-0.5" style={{ color: themeColor }}>{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Available Stock: {product.stock} Units</span>
            </div>
          </div>

          <div className="space-y-4">
            {/* RETAIL BLOCK */}
            <div className="bg-slate-50 dark:bg-[#0a0a0a] p-5 rounded-[24px] border border-slate-200 dark:border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/5 pb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Retail Order</span>
                <span className="font-black text-lg dark:text-white" style={{ color: themeColor }}>₦{Number(product.price).toLocaleString()} <span className="text-[10px] text-slate-400">/ unit</span></span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white dark:bg-black rounded-xl border border-slate-200 dark:border-white/10 p-1">
                  <button onClick={() => setRetailQty(Math.max(1, retailQty - 1))} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">-</button>
                  <span className="w-10 text-center text-sm font-black dark:text-white">{retailQty}</span>
                  <button onClick={() => setRetailQty(retailQty + 1)} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">+</button>
                </div>
                <button 
                  onClick={handleAddRetail}
                  disabled={currentQtyInCart + retailQty > maxStock}
                  className="flex-1 h-12 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: themeColor }}
                >
                  <Plus size={16} /> Add {retailQty} to Cart
                </button>
              </div>
            </div>

            {/* WHOLESALE BLOCK */}
            {product.wholesale_price && (
              <div className="bg-brand-orange/5 dark:bg-brand-orange/10 p-5 rounded-[24px] border border-brand-orange/20 space-y-4">
                <div className="flex justify-between items-center border-b border-brand-orange/20 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-orange block">Wholesale Order</span>
                    <span className="text-[9px] font-bold text-brand-orange/70 uppercase">1 Pack = {product.moq} Units</span>
                  </div>
                  {/* DISPLAYED AS PACK PRICE */}
                  <span className="font-black text-lg text-brand-orange">₦{Number(product.wholesale_price).toLocaleString()} <span className="text-[10px]">/ pack</span></span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white dark:bg-black rounded-xl border border-brand-orange/20 p-1">
                    <button onClick={() => setWholesalePacks(Math.max(1, wholesalePacks - 1))} className="w-10 h-10 flex items-center justify-center text-brand-orange hover:text-brand-orange/80 transition-colors">-</button>
                    <span className="w-10 text-center text-sm font-black text-brand-orange">{wholesalePacks}</span>
                    <button onClick={() => setWholesalePacks(wholesalePacks + 1)} className="w-10 h-10 flex items-center justify-center text-brand-orange hover:text-brand-orange/80 transition-colors">+</button>
                  </div>
                  <button 
                    onClick={handleAddWholesale}
                    disabled={currentQtyInCart + (wholesalePacks * product.moq) > maxStock}
                    className="flex-1 h-12 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-glow-orange flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Box size={16} /> Add {wholesalePacks * product.moq} Units (₦{(product.wholesale_price * wholesalePacks).toLocaleString()})
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[ 
               { label: "Retail Price", value: `₦${Number(product.price).toLocaleString()}` }, 
               { label: "Wholesale Pack", value: product.wholesale_price ? `₦${Number(product.wholesale_price).toLocaleString()}` : 'N/A' }, 
               { label: "Pack MOQ", value: `${product.moq} Units` } 
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
