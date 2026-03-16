"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ArrowRight, Package, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/storefront/store/useCartStore';
import { useRouter, useParams } from 'next/navigation';

export default function CartDrawer() {
  const { basket, isOpen, toggleCart, removeFromBasket } = useCartStore();
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  // Calculates if order is eligible for checkout based on all MOQ requirements
  const subtotal = basket.reduce((acc, item) => {
    const price = (item.wholesale_price && item.quantity >= (item.moq || 0)) 
      ? item.wholesale_price 
      : item.price;
    return acc + (price * item.quantity);
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
                  const isWholesale = item.wholesale_price && item.quantity >= (item.moq || 0);
                  const activePrice = isWholesale ? item.wholesale_price : item.price;
                  const moqMet = item.quantity >= (item.moq || 1);

                  return (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-brand-orange/20 transition-all">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-white rounded-xl p-1 shrink-0 border border-slate-100">
                          <img src={item.image_url || item.img} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-black uppercase dark:text-white truncate">{item.name}</h4>
                          <div className="flex items-center gap-2">
                            <p className="text-brand-orange font-black text-sm">₦{Number(activePrice).toLocaleString()}</p>
                            {isWholesale && <span className="bg-green-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase">Wholesale</span>}
                          </div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Qty: {item.quantity} Unit(s)</p>
                        </div>
                        <button onClick={() => removeFromBasket(item.id)} className="text-slate-300 hover:text-red-500 p-2 h-fit">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {!moqMet && (
                        <div className="mt-3 flex items-center gap-2 text-red-500">
                           <AlertCircle size={12} />
                           <p className="text-[8px] font-black uppercase italic">Below Min Order ({item.moq} Units)</p>
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
                  <span className="text-2xl font-black text-brand-orange">₦{subtotal.toLocaleString()}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-glow-orange flex items-center justify-center gap-3 hover:scale-[1.02] transition-all"
                >
                  Proceed to Payment <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
