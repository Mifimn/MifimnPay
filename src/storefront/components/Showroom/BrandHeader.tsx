"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, ShoppingBag, User, 
  ChevronRight, Home, Grid, Sun, Moon, 
  Lock, Truck, LogIn, UserPlus 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/storefront/store/useThemeStore';
import { useCartStore } from '@/storefront/store/useCartStore';

const CATEGORIES = [
  "Manufacturing & Processing", "Consumer Electronics", "Industrial Equipment",
  "Electrical & Electronics", "Construction & Decoration", "Light Industry & Daily Use",
  "Auto & Accessories", "Apparel & Accessories", "Lights & Lighting", "Health & Medicine"
];

/**
 * BrandHeader Component
 * The main navigation hub for the storefront.
 * Replaces the Wholesaler BrandHeader with Next.js specific logic.
 */
export default function BrandHeader() {
  const { isDark, toggleTheme } = useThemeStore();
  const { basket, toggleCart } = useCartStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  // Helper to handle navigation within the vendor's context
  const handleNav = (path: string) => {
    setIsMenuOpen(false);
    router.push(`/${vendor_slug}${path}`);
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-4 py-3 lg:px-10">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo - Links back to the specific Vendor's Showroom */}
          <Link href={`/${vendor_slug}`} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center shadow-glow-orange hover:rotate-12 transition-transform">
              <span className="text-white font-black text-xl italic">M</span>
            </div>
            <span className="hidden md:block font-black text-lg tracking-tighter dark:text-white uppercase italic">
              Mifimn<span className="text-brand-orange">Pay</span>
            </span>
          </Link>

          {/* Search Engine */}
          <div className="flex-1 max-w-xl relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400 group-focus-within:text-brand-orange" />
            </div>
            <input 
              type="text"
              placeholder="Search store catalog..."
              className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand-orange/50 focus:bg-white dark:focus:bg-black rounded-xl py-2 pl-9 pr-4 text-[11px] font-bold outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex items-center gap-1 lg:gap-3">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 text-slate-400 hover:text-brand-orange transition-all bg-slate-100 dark:bg-white/5 rounded-lg active:scale-90">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Shopping Bag with 3D Drop Badge */}
            <button onClick={toggleCart} className="p-2 text-slate-400 hover:text-brand-orange transition-all relative">
              <ShoppingBag size={20} />
              <AnimatePresence mode="popLayout">
                {basket.length > 0 && (
                  <motion.span 
                    key={basket.length}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute top-1 right-1 bg-brand-orange text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-black shadow-[0_5px_15px_rgba(255,125,26,0.6)]"
                  >
                    {basket.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            
            {/* Mobile Menu Trigger */}
            <button onClick={() => { setIsMenuOpen(true); setShowCategories(false); }} className="lg:hidden p-2 bg-brand-orange text-white rounded-lg shadow-glow-orange active:scale-90">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[200] bg-white dark:bg-[#0a0a0a] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
              <span className="font-black uppercase italic dark:text-white tracking-widest text-xs">Store Navigation</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full dark:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {!showCategories ? (
                <div className="space-y-3">
                  {[
                    { name: 'Home', icon: Home, path: '/' },
                    { name: 'Browse Categories', icon: Grid, action: () => setShowCategories(true) },
                    { name: 'My Order History', icon: User, path: '/orders' },
                  ].map((item) => (
                    <div 
                      key={item.name}
                      onClick={() => item.action ? item.action() : handleNav(item.path)}
                      className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent active:border-brand-orange/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <item.icon size={20} className="text-brand-orange" />
                        <span className="text-sm font-black uppercase italic dark:text-white">{item.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => setShowCategories(false)} className="flex items-center gap-2 text-brand-orange font-black uppercase text-[10px] mb-6">
                    <ChevronRight size={14} className="rotate-180" /> Back
                  </button>
                  {CATEGORIES.map((cat) => (
                    <div key={cat} onClick={() => setIsMenuOpen(false)} className="p-4 rounded-xl border border-slate-100 dark:border-white/5 active:bg-brand-orange/5 transition-all">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">{cat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
