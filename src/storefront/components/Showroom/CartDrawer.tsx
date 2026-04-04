"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, Package, Info } from 'lucide-react';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { useRouter, useParams } from 'next/navigation';

export default function CartDrawer() {
  const { basket, isOpen, toggleCart, removeFromBasket } = useCartStore();
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  // SMART PACK MATH: Divides the pack price by MOQ to get true unit price
  const subtotal = basket.reduce((acc, item) => {
    const itemQty = Number(item.qty || 1); // FIXED: Using qty
    const itemMoq = Number(item.moq || 1);
    const isWholesale = item.wholesale_price && itemQty >= itemMoq;
    
    const unitPrice = isWholesale 
      ? (Number(item.wholesale_price!) / itemMoq) 
      : Number(item.price);
      
    return acc + (unitPrice * itemQty);
  }, 0);

  const handleCheckout = () => {
    toggleCart();
    router.push(`/${vendor_slug}/checkout`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleCart} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0a0a0a] backdrop-blur-2xl z-[160] border-l border-white/10 shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black uppercase italic dark:text-white tracking-tighter">
                Shopping <span className="text-brand-orange">Basket</span>
              </h2>
              <button onClick={toggleCart} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full dark:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {basket.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                  <Package size={48} strokeWidth={1} />
                  <p className="font-bold uppercase text-[10px] tracking-widest">Basket Empty</p>
                </div>
              ) : (
                basket.map((item) => {
                  const itemQty = Number(item.qty || 1); // FIXED: Using qty
                  const itemMoq = Number(item.moq || 1);
                  const isWholesale = item.wholesale_price && itemQty >= itemMoq;
                  
                  const unitPrice = isWholesale 
                    ? (Number(item.wholesale_price!) / itemMoq) 
                    : Number(item.price);
                    
                  const itemTotal = unitPrice * itemQty;

                  return (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-all">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 border border-slate-100 dark:border-white/10">
                          <img src={item.image_url || item.img} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-black uppercase dark:text-white truncate">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-brand-orange font-black text-sm">₦{Math.round(itemTotal).toLocaleString()}</p>
                            {isWholesale && <span className="bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">Wholesale Applied</span>}
                          </div>

                          <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 dark:bg-black/40 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Quantity:</span>
                            <span className="text-xs font-black dark:text-white">{itemQty}</span>
                          </div>
                        </div>
                        <button onClick={() => removeFromBasket(item.id)} className="text-slate-300 hover:text-red-500 p-2 h-fit transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* UPSELL LOGIC FIX */}
                      {!isWholesale && item.wholesale_price && (itemMoq > 1) && (itemMoq - itemQty > 0) && (
                        <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-500/10 p-2.5 rounded-lg border border-green-500/20">
                           <Info size={14} className="shrink-0" />
                           <p className="text-[9px] font-black uppercase italic tracking-widest leading-tight">
                             Upsell: Add {itemMoq - itemQty} more to unlock wholesale pricing!
                           </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {basket.length > 0 && (
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-slate-400">Estimated Total</span>
                  <span className="text-2xl font-black text-brand-orange">₦{Math.round(subtotal).toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-glow-orange flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
