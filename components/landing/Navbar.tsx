"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 px-4 md:px-8 pt-6 transition-all duration-500 ${scrolled ? 'py-4' : 'py-6'}`}
    >
      <nav className={`
        max-w-6xl mx-auto rounded-full flex justify-between items-center px-6 py-4 transition-all duration-500
        ${scrolled 
          ? 'bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.1)]' 
          : 'bg-transparent border border-transparent'
        }
      `}>
        <Link href="/" className="flex items-center gap-3 z-50">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/20">
            <div className="absolute inset-0 bg-brand-orange/20 backdrop-blur-md z-10" />
            <img src="/favicon.png" alt="MifimnPay Logo" className="relative z-20 w-full h-full object-cover p-1" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase italic text-slate-900 dark:text-white">MifimnPay</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="#features" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-brand-orange dark:text-slate-300 transition-colors">Platform</Link>
          <Link href="#how-it-works" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-brand-orange dark:text-slate-300 transition-colors">Workflow</Link>
          <Link href="#testimonials" className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-brand-orange dark:text-slate-300 transition-colors">Reviews</Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white hover:opacity-70 transition-opacity">
            Sign In
          </Link>
          <Link href="/generate" className="group relative px-6 py-3 rounded-full bg-brand-orange text-white font-black text-xs uppercase tracking-widest overflow-hidden shadow-glow-orange transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center gap-2">Open Storefront <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden z-50 p-2 text-slate-900 dark:text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Liquid Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute top-24 left-4 right-4 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-3xl rounded-[32px] border border-white/40 dark:border-white/10 shadow-2xl p-8 md:hidden flex flex-col gap-6"
          >
            <Link href="#features" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Platform</Link>
            <Link href="#how-it-works" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Workflow</Link>
            <Link href="/login" onClick={() => setIsOpen(false)} className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-4">Sign In</Link>
            <Link href="/generate" onClick={() => setIsOpen(false)} className="bg-brand-orange text-white text-center font-black text-sm uppercase tracking-widest py-5 rounded-2xl shadow-glow-orange mt-4">
              Launch Free Storefront
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
