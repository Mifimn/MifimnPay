"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import ComparisonDemo from './ComparisonDemo';

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center pt-28 md:pt-32 pb-16 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10 md:gap-16 items-center">

        {/* Left Content */}
        <div className="lg:col-span-7 space-y-8 md:space-y-10 relative z-20 text-center lg:text-left pt-10 md:pt-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-3 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 px-5 py-2.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-sm"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-orange"></span>
            </span>
            The Next-Gen Retail OS
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase italic"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">Sell Online.</span><br/>
            <span className="text-brand-orange relative inline-block">
              Automate
              <svg className="absolute w-full h-3 md:h-4 -bottom-1 md:-bottom-2 left-0 text-brand-orange/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </span><br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">The Rest.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-slate-600 dark:text-slate-400 font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Transform your business with a stunning liquid storefront, intelligent order routing, instant branded receipts, and live analytics. Designed perfectly for scaling vendors.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Link href="/generate" className="relative group overflow-hidden bg-brand-orange text-white px-8 py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-glow-orange flex items-center justify-center gap-3">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Store size={18} strokeWidth={3} />
              Launch Free Store
            </Link>
            <Link href="/login" className="bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 text-slate-900 dark:text-white px-8 py-4 md:py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/60 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3">
               Access Dashboard
            </Link>
          </motion.div>
        </div>

        {/* Right Content: 3D Demo Frame */}
        <motion.div 
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
           className="lg:col-span-5 relative w-full h-[450px] md:h-[500px] lg:h-full flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-transparent rounded-full blur-[60px] md:blur-[80px]" />
          <ComparisonDemo />
        </motion.div>

      </div>
    </section>
  );
}
