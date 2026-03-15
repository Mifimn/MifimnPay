"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, TrendingUp, CheckCircle2 } from 'lucide-react';

const steps = [
  { id: 1, title: "1. Upload Inventory", desc: "Add products to your liquid catalog with images, descriptions, and dynamic pricing." },
  { id: 2, title: "2. Customers Order", desc: "Share your URL. Customers enjoy a frictionless shopping experience optimized for mobile." },
  { id: 3, title: "3. Track & Bill", desc: "Orders arrive on your dashboard. Fulfill them, generate receipts, and watch revenue climb." }
];

export default function InteractiveFeature() {
  const [active, setActive] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((p) => (p === 3 ? 1 : p + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      {/* Left Menu Navigation */}
      <div className="space-y-6">
        {steps.map((step) => (
          <div 
            key={step.id} 
            onClick={() => setActive(step.id)}
            className={`cursor-pointer p-8 rounded-[32px] transition-all duration-500 border ${
              active === step.id 
                ? 'bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-white/60 dark:border-white/20 shadow-xl scale-105' 
                : 'bg-transparent border-transparent hover:bg-white/20 dark:hover:bg-white/5 opacity-50'
            }`}
          >
            <h4 className={`text-2xl font-black uppercase italic tracking-tighter mb-2 ${active === step.id ? 'text-brand-orange' : 'text-slate-900 dark:text-white'}`}>
              {step.title}
            </h4>
            <p className="text-slate-600 dark:text-slate-400 font-bold text-sm leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Right Glass Display Window */}
      <div className="relative w-full aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-slate-200/50 dark:bg-[#111]/50 backdrop-blur-3xl rounded-[48px] border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden flex items-center justify-center p-8">
        <AnimatePresence mode="wait">

          {/* Step 1 UI */}
          {active === 1 && (
            <motion.div key="1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-sm space-y-4">
               <div className="bg-white dark:bg-black p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5">
                 <div className="h-4 w-24 bg-slate-200 dark:bg-white/10 rounded-full mb-6" />
                 <div className="space-y-3">
                   <div className="h-12 w-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">Upload Image</div>
                   <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 flex items-center text-[10px] font-bold text-slate-500">Product Name...</div>
                   <div className="h-10 w-full bg-slate-100 dark:bg-white/5 rounded-xl px-4 flex items-center text-[10px] font-bold text-slate-500">₦ Price...</div>
                 </div>
               </div>
               <div className="flex justify-end"><div className="bg-brand-orange w-12 h-12 rounded-full flex items-center justify-center shadow-glow-orange text-white"><MousePointerClick size={20}/></div></div>
            </motion.div>
          )}

          {/* Step 2 UI */}
          {active === 2 && (
            <motion.div key="2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm">
               <div className="bg-gradient-to-br from-brand-orange to-red-500 p-8 rounded-[40px] text-white shadow-2xl">
                 <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-6 border border-white/30" />
                 <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Liquid Store</h3>
                 <p className="text-white/80 text-xs font-bold mb-8">Premium Quality Goods</p>
                 <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex justify-between items-center">
                   <span className="font-bold text-sm">Shopping Cart</span>
                   <span className="font-black text-xl">₦120k</span>
                 </div>
                 <div className="mt-4 bg-white text-brand-orange w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest text-center shadow-lg cursor-pointer">Place Order</div>
               </div>
            </motion.div>
          )}

          {/* Step 3 UI */}
          {active === 3 && (
            <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-sm space-y-4">
              <div className="bg-white dark:bg-[#0a0a0a] border border-slate-100 dark:border-white/10 p-6 rounded-[32px] shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="bg-emerald-500/20 text-emerald-500 p-2 rounded-xl"><TrendingUp size={20}/></div>
                   <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Analytics Dashboard</h4>
                 </div>
                 <div className="h-32 flex items-end gap-2 mb-6">
                    {[40, 70, 45, 90, 60, 100, 80].map((h, i) => (
                      <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.1 }} className={`flex-1 rounded-t-lg ${i === 5 ? 'bg-brand-orange shadow-glow-orange' : 'bg-slate-200 dark:bg-white/10'}`} />
                    ))}
                 </div>
                 <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                   <span className="text-xs font-bold text-slate-500">Today's Revenue</span>
                   <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">₦120,000</span>
                 </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-emerald-500 text-xs font-black uppercase tracking-widest bg-emerald-500/10 py-3 rounded-full border border-emerald-500/20">
                <CheckCircle2 size={16}/> Receipt Auto-Generated
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
