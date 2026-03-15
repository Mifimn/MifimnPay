"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, QrCode, Receipt } from 'lucide-react';

export default function ComparisonDemo() {
  const [mode, setMode] = useState<'storefront' | 'receipt'>('storefront');

  useEffect(() => {
    const interval = setInterval(() => {
      setMode((prev) => (prev === 'storefront' ? 'receipt' : 'storefront'));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[340px] mx-auto h-[450px] sm:h-[550px] perspective-[1500px] md:perspective-[2000px]">

      <AnimatePresence mode="wait">
        {mode === 'storefront' ? (
          <motion.div
            key="storefront"
            initial={{ opacity: 0, rotateY: -30, rotateX: 10, scale: 0.85 }}
            animate={{ opacity: 1, rotateY: -15, rotateX: 5, scale: 1 }}
            exit={{ opacity: 0, rotateY: 30, rotateX: -10, scale: 0.85 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[32px] sm:rounded-[40px] shadow-[10px_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Store Header */}
            <div className="h-28 sm:h-32 bg-gradient-to-br from-brand-orange to-red-500 relative p-5 sm:p-6 flex flex-col justify-end">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl"><QrCode size={14} className="text-white"/></div>
              <h3 className="text-white font-black text-lg sm:text-xl italic uppercase tracking-tighter">Liquid Store</h3>
              <p className="text-white/80 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest">Premium Vendor</p>
            </div>
            {/* Products */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-1 bg-white/40 dark:bg-transparent">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl flex gap-3 items-center shadow-sm">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-slate-100 dark:bg-black/50 rounded-lg sm:rounded-xl shrink-0" />
                  <div className="flex-1">
                    <div className="h-1.5 sm:h-2 w-16 sm:w-20 bg-slate-200 dark:bg-white/20 rounded-full mb-1.5 sm:mb-2" />
                    <div className="h-1.5 sm:h-2 w-10 sm:w-12 bg-slate-200 dark:bg-white/20 rounded-full" />
                  </div>
                  <div className="bg-brand-orange text-white p-1.5 sm:p-2 rounded-lg shrink-0"><ShoppingBag size={12}/></div>
                </div>
              ))}
            </div>
            {/* Checkout Bar */}
            <div className="p-3 sm:p-4 bg-white dark:bg-[#0a0a0a] border-t border-slate-100 dark:border-white/10">
              <div className="w-full h-10 sm:h-12 bg-brand-orange rounded-xl flex items-center justify-center text-white font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-glow-orange">
                Checkout ₦45,000
              </div>
            </div>
          </motion.div>

        ) : (
          <motion.div
            key="receipt"
            initial={{ opacity: 0, rotateY: 30, rotateX: -10, scale: 0.85 }}
            animate={{ opacity: 1, rotateY: 15, rotateX: 5, scale: 1 }}
            exit={{ opacity: 0, rotateY: -30, rotateX: 10, scale: 0.85 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#fdfbf7] dark:bg-[#1a1a1a] border-t-[8px] sm:border-t-[12px] border-brand-orange rounded-[16px] sm:rounded-[20px] shadow-[10px_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[20px_20px_60px_rgba(0,0,0,0.5)] p-6 sm:p-8 flex flex-col relative overflow-hidden"
          >
            {/* Paper Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }} />

            <div className="w-12 sm:w-16 h-12 sm:h-16 bg-brand-orange rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center shadow-glow-orange relative z-10">
               <Receipt size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-center font-black text-xl sm:text-2xl uppercase italic tracking-tighter text-slate-900 dark:text-white mb-6 sm:mb-8 relative z-10">Receipt</h3>

            <div className="space-y-3 sm:space-y-4 flex-1 relative z-10">
              <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">Items (3)</span>
                <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white">₦45,000</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-300 dark:border-slate-700 pb-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500">Tax</span>
                <span className="text-[10px] sm:text-xs font-black text-slate-900 dark:text-white">₦0.00</span>
              </div>
            </div>

            <div className="mt-auto relative z-10">
              <div className="flex justify-between items-center bg-slate-100 dark:bg-black/50 p-3 sm:p-4 rounded-xl">
                <span className="font-black text-[10px] sm:text-sm uppercase tracking-widest text-slate-500">Total</span>
                <span className="font-black text-xl sm:text-2xl text-brand-orange">₦45k</span>
              </div>
            </div>

            {/* Zig-Zag Bottom */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-0 w-full h-6 sm:h-8 bg-transparent" style={{ backgroundImage: 'linear-gradient(45deg, transparent 33.333%, #fdfbf7 33.333%, #fdfbf7 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #fdfbf7 33.333%, #fdfbf7 66.667%, transparent 66.667%)', backgroundSize: '16px 32px', backgroundPosition: '0 -16px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Badge */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 sm:-right-12 top-10 sm:top-20 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/40 dark:border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl z-20 scale-90 sm:scale-100"
      >
        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
        <p className="text-xs sm:text-sm font-black text-brand-orange uppercase italic tracking-tighter flex items-center gap-2">
          {mode === 'storefront' ? 'Browsing...' : 'Paid!'}
          <span className="relative flex h-1.5 sm:h-2 w-1.5 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 sm:h-2 w-1.5 sm:w-2 bg-brand-orange"></span>
          </span>
        </p>
      </motion.div>
    </div>
  );
}
