"use client";

import { motion } from 'framer-motion';
import { Store, Receipt, BarChart3, ScanFace } from 'lucide-react';

const features = [
  {
    title: "Digital Storefront",
    desc: "A beautiful, link-in-bio style shop. Upload products, set prices, and let customers place orders 24/7 without endless DMs.",
    icon: <Store size={24} className="text-brand-orange" />,
    colSpan: "md:col-span-2",
  },
  {
    title: "Smart Receipts",
    desc: "Generate professional, branded image receipts instantly. Build trust with every transaction.",
    icon: <Receipt size={24} className="text-blue-500" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Instant QR Access",
    desc: "Download your unique storefront QR code. Perfect for printing on physical packaging or displaying at your physical shop.",
    icon: <ScanFace size={24} className="text-purple-500" />,
    colSpan: "md:col-span-1",
  },
  {
    title: "Live Analytics",
    desc: "Track every Naira. Visual revenue charts, top product tracking, and dynamic financial insights built directly into your dashboard.",
    icon: <BarChart3 size={24} className="text-emerald-500" />,
    colSpan: "md:col-span-2",
  }
];

export default function HowItWorks() {
  return (
    <section id="features" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-16">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange mb-4">Core Infrastructure</h2>
          <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Everything You Need. <br/> Nothing You Don't.</h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <motion.article 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-10 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:-translate-y-2 transition-transform duration-500 ${feat.colSpan} flex flex-col justify-between group`}
            >
              <div className="w-16 h-16 bg-white/60 dark:bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/50 dark:border-white/10 shadow-sm mb-8 group-hover:scale-110 transition-transform duration-500">
                {feat.icon}
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-3">{feat.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 font-bold leading-relaxed">{feat.desc}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
