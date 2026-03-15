"use client";

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 dark:bg-black pt-24 pb-12 overflow-hidden border-t border-white/10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[400px] bg-brand-orange/20 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 mb-20">
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-6">
              Ready to <br/><span className="text-brand-orange">Scale?</span>
            </h2>
            <p className="text-slate-400 font-bold max-w-sm mb-8">
              Join thousands of Nigerian businesses turning DMs into automated storefronts and smart receipts.
            </p>
            <Link href="/generate" className="inline-block bg-white text-slate-900 px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
              Launch Storefront Free
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 md:justify-items-end">
            <div className="space-y-4 flex flex-col text-sm font-bold text-slate-400">
              <span className="text-white font-black uppercase tracking-widest text-xs mb-2 block">Platform</span>
              <Link href="#features" className="hover:text-brand-orange transition-colors">Digital Storefront</Link>
              <Link href="#features" className="hover:text-brand-orange transition-colors">Receipt Generator</Link>
              <Link href="#features" className="hover:text-brand-orange transition-colors">Sales Analytics</Link>
            </div>
            <div className="space-y-4 flex flex-col text-sm font-bold text-slate-400">
              <span className="text-white font-black uppercase tracking-widest text-xs mb-2 block">Legal & Social</span>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Use</Link>
              <Link href="https://x.com/mifimn" target="_blank" className="hover:text-brand-orange transition-colors">Twitter (X)</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
           <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="MifimnPay Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-black text-xl text-white uppercase tracking-tighter italic">MifimnPay</span>
          </div>

          <div className="flex flex-col items-center md:items-end gap-1 text-slate-500 text-xs font-bold uppercase tracking-widest text-center md:text-right">
            <p>© {new Date().getFullYear()} MifimnPay. All rights reserved.</p>
            <p>
              Engineered by{' '}
              <Link href="https://mifimn.vercel.app/" target="_blank" className="text-brand-orange hover:text-white transition-colors">
                ~Mifimn
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
