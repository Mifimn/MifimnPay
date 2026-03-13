"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, Send } from 'lucide-react';

/**
 * Interface for Product Item in the Basket
 *
 */
interface BasketItem {
  id: string | number;
  img: string;
  quantity: number;
}

interface InquiryBasketProps {
  items: BasketItem[];
  onRemove: (id: string | number) => void;
}

/**
 * InquiryBasket Component
 * Path: src/storefront/components/Showroom/InquiryBasket.tsx
 * * Provides a floating, 3D-styled quick access sidebar for the shopping basket.
 * Optimized for Next.js and TypeScript.
 */
export default function InquiryBasket({ items, onRemove }: InquiryBasketProps) {
  // Calculate total units (including decimals like 0.5)
  const totalUnits = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  return (
    <div className="fixed right-2 sm:right-6 top-1/2 -translate-y-1/2 z-[70] pointer-events-none perspective-[1200px]">
      <motion.div 
        initial={{ x: 100, opacity: 0, rotateY: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1, 
          rotateY: -25, 
          transition: { type: 'spring', stiffness: 80, damping: 15, delay: 0.2 }
        }}
        whileHover={{ rotateY: -10, x: -5 }}
        className="
          relative pointer-events-auto bg-white/90 dark:bg-[#0a0a0a]/90 
          backdrop-blur-2xl border border-slate-200/50 dark:border-brand-orange/30 
          shadow-[20px_20px_50px_rgba(0,0,0,0.3)] flex flex-col items-center 
          rounded-l-[28px] rounded-r-md w-[52px] sm:w-[85px] p-2 sm:p-4 gap-3 sm:gap-5
        "
        style={{ transformStyle: 'preserve-3d', transformOrigin: 'right center' }}
      >
        {/* --- 3D FLOATING EDGE --- */}
        <div 
          className="absolute top-0 right-0 w-[6px] h-full bg-slate-200 dark:bg-orange-600/40 rounded-r-md" 
          style={{ transform: 'rotateY(90deg) translateZ(3px)', transformOrigin: 'right' }}
        />

        {/* --- INNER GLOW --- */}
        <div className="absolute inset-0 rounded-l-[28px] border-r-4 border-brand-orange/10 pointer-events-none" />

        {/* Basket Header */}
        <div className="relative group">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="p-2 sm:p-3 bg-brand-orange rounded-xl sm:rounded-2xl text-white shadow-[0_8px_20px_rgba(255,125,26,0.4)]"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </motion.div>
          
          {/* Badge: Displays total units */}
          {totalUnits > 0 && (
            <motion.span 
              key={totalUnits}
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -top-2 -right-2 bg-black text-white text-[8px] sm:text-[10px] font-black w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-brand-orange"
            >
              {totalUnits}
            </motion.span>
          )}
        </div>

        {/* Item Preview List */}
        <div className="flex flex-col gap-2 max-h-[200px] sm:max-h-[350px] overflow-y-auto no-scrollbar py-1">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                className="relative group/item"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white shadow-sm flex items-center justify-center relative">
                  <img src={item.img} alt="" className="w-full h-full object-contain p-1" />
                  
                  {/* Fractional Indicator for 0.5 units */}
                  {item.quantity % 1 !== 0 && (
                    <div className="absolute inset-0 bg-brand-orange/10 flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-black/90 px-1 rounded-[2px] border border-brand-orange/20 shadow-sm">
                        <span className="text-[7px] sm:text-[8px] font-black text-brand-orange">.5</span>
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity z-20"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Button */}
        <motion.button 
          whileHover={{ y: -2, backgroundColor: '#ff7d1a', color: '#fff' }}
          whileTap={{ scale: 0.9 }}
          className="p-2 sm:p-3 bg-slate-100 dark:bg-white/5 rounded-lg sm:rounded-2xl text-brand-orange transition-all shadow-inner"
        >
          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>

        <div className="w-1 h-4 bg-orange-500/20 rounded-full blur-[1px]" />
      </motion.div>
    </div>
  );
}
