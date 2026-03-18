"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, Search, ShoppingBag, User, 
  ChevronRight, Home, Grid, Sun, Moon, LogIn
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { useAuth } from '@/lib/AuthContext';

interface BrandHeaderProps {
  businessName?: string;
  logoUrl?: string | null;
}

export default function BrandHeader({ businessName, logoUrl }: BrandHeaderProps) {
  const { isDark, toggleTheme, themeColor } = useThemeStore();
  const { basket, toggleCart } = useCartStore();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const vendor_slug = (params?.vendor_slug as string) || "";

  const displayInitial = (businessName || vendor_slug || "M").charAt(0).toUpperCase();

  const handleNav = (path: string) => {
    setIsMenuOpen(false);
    router.push(`/${vendor_slug}${path}`);
  };

  // STRICTLY CUSTOMER ROUTING
  // This ensures the storefront never bleeds into the admin dashboard
  const handleUserClick = () => {
    setIsMenuOpen(false);
    if (user) {
      // Act as a customer: route to their inquiries/checkout
      router.push(`/${vendor_slug}/checkout`);
    } else {
      // Prompt customer login and redirect right back to this store
      router.push(`/login?redirect=/${vendor_slug}`);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    const currentParams = new URLSearchParams(Array.from(searchParams.entries()));
    
    if (term) {
      currentParams.set('q', term);
    } else {
      currentParams.delete('q');
    }
    
    if (pathname !== `/${vendor_slug}`) {
      router.push(`/${vendor_slug}?${currentParams.toString()}`);
    } else {
      router.replace(`${pathname}?${currentParams.toString()}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-[100] bg-white/80 dark:bg-[#050505]/80 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-3 py-3 lg:px-10 transition-colors duration-500">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 lg:gap-4">

          {/* STORE LOGO */}
          <Link href={`/${vendor_slug}`} className="flex items-center gap-3 shrink-0 group">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 group-hover:rotate-6 group-active:scale-95 overflow-hidden shrink-0"
              style={{ backgroundColor: themeColor || '#f97316' }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-black text-xl italic drop-shadow-md">{displayInitial}</span>
              )}
            </div>
            {/* Hide text on mobile to give Search Bar maximum space */}
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-sm tracking-tight dark:text-white uppercase italic leading-none truncate max-w-[120px]">
                {businessName || vendor_slug}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Verified Store
              </span>
            </div>
          </Link>

          {/* SEARCH BAR - Visible on all devices now */}
          <div className="flex-1 relative group max-w-xl">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={14} className="text-slate-400 group-focus-within:text-brand-orange transition-colors" />
            </div>
            <input 
              type="text"
              placeholder="Search products..."
              defaultValue={searchParams.get('q') || ''}
              onChange={handleSearch}
              className="w-full bg-slate-100/50 dark:bg-white/5 border border-transparent focus:border-slate-300 dark:focus:border-white/20 focus:bg-white dark:focus:bg-black rounded-2xl py-2.5 pl-9 pr-4 text-[11px] lg:text-xs font-bold outline-none transition-all dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* DESKTOP ICONS - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button 
              onClick={handleUserClick} 
              title="Customer Login"
              className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            >
              <User size={18} />
            </button>

            <button onClick={toggleCart} className="p-2.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all relative bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10">
              <ShoppingBag size={18} />
              <AnimatePresence mode="popLayout">
                {basket.length > 0 && (
                  <motion.span 
                    key={basket.length}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#050505] shadow-xl"
                    style={{ backgroundColor: themeColor || '#f97316' }}
                  >
                    {basket.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* MOBILE MENU TOGGLE - Visible only on mobile */}
          <div className="flex lg:hidden items-center shrink-0">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="p-2.5 text-white rounded-xl shadow-lg active:scale-90 transition-transform relative"
              style={{ backgroundColor: themeColor || '#f97316' }}
            >
              <Menu size={18} />
              {basket.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white/20">
                  {basket.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 z-[190] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full max-w-sm z-[200] bg-white/90 dark:bg-[#050505]/90 backdrop-blur-3xl shadow-2xl flex flex-col border-l border-white/20">
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
                <span className="font-black uppercase italic dark:text-white tracking-[0.2em] text-[10px]">Menu</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"><X size={20} className="dark:text-white" /></button>
              </div>
              
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                
                {/* Mobile Quick Actions (Cart & Theme) */}
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent dark:text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                    {isDark ? <Sun size={16} /> : <Moon size={16} />} Theme
                  </button>
                  <button onClick={() => { toggleCart(); setIsMenuOpen(false); }} className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-transparent dark:text-white text-xs font-black uppercase tracking-widest active:scale-95 transition-all relative">
                    <ShoppingBag size={16} /> Cart
                    {basket.length > 0 && <span className="text-brand-orange ml-1">({basket.length})</span>}
                  </button>
                </div>

                {/* Mobile Customer Authentication Button */}
                <div 
                  onClick={handleUserClick}
                  className="flex items-center justify-between p-5 rounded-[24px] bg-slate-900 dark:bg-white text-white dark:text-black active:scale-[0.98] transition-all cursor-pointer shadow-lg sm:hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 dark:bg-black/5 rounded-2xl">
                      <User size={20} />
                    </div>
                    <span className="text-sm font-black uppercase italic tracking-tight">
                      {user ? 'My Profile' : 'Customer Login'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Navigation</h4>
                  {[
                    { name: 'Storefront Home', icon: Home, path: '/' },
                    { name: 'My Inquiries', icon: Grid, path: '/checkout' },
                    { name: 'Contact Vendor', icon: User, path: '#contact' },
                  ].map((item) => (
                    <div key={item.name} onClick={() => handleNav(item.path)} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50 dark:bg-white/5 border border-transparent active:scale-[0.98] transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group-hover:rotate-6 transition-transform">
                          <item.icon size={20} style={{ color: themeColor || '#f97316' }} />
                        </div>
                        <span className="text-sm font-black uppercase italic dark:text-white tracking-tight">{item.name}</span>
                      </div>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  ))}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
