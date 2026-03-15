"use client";

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const reviews = [
  {
    name: "TJ Agro & Feeds",
    location: "Ilorin, Kwara",
    text: "MifimnPay transformed how we handle bulk feed orders. The digital storefront is an absolute lifesaver for managing inventory and billing clients.",
    rating: 5,
    colSpan: "md:col-span-2"
  },
  {
    name: "ChunkZone Gaming",
    location: "Offa",
    text: "Generating tournament receipts used to be entirely manual. Now it's automated with a sleek, premium UI. Players love it.",
    rating: 5,
    colSpan: "md:col-span-1"
  },
  {
    name: "Kwara Campus Hub",
    location: "Malete",
    text: "Perfect for student entrepreneurs. You setup your link, share it, and the sales analytics tell you exactly what is making money.",
    rating: 4,
    colSpan: "md:col-span-1"
  },
  {
    name: "Amina Textiles",
    location: "Lagos",
    text: "No more 'how much is this' DMs. Customers click my storefront link, pick their fabrics, and the system generates the invoice. Beautiful.",
    rating: 5,
    colSpan: "md:col-span-2"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Trusted by Over<br/><span className="text-brand-orange">5,000 Vendors.</span></h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10 p-8 rounded-[32px] shadow-lg flex flex-col justify-between ${review.colSpan}`}
            >
              <div>
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={16} className="fill-brand-orange text-brand-orange" />
                  ))}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-bold text-lg md:text-xl leading-relaxed mb-8 italic">"{review.text}"</p>
              </div>
              <div className="flex items-center gap-4 border-t border-slate-200 dark:border-white/10 pt-6 mt-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-white/10 dark:to-white/5 flex items-center justify-center font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{review.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{review.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Logos Strip */}
        <div className="mt-24 pt-12 border-t border-slate-200 dark:border-white/10">
           <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Powering Transactions Alongside</p>
           <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-40 hover:opacity-100 transition-opacity duration-500 text-slate-900 dark:text-white grayscale hover:grayscale-0">
             <span className="text-2xl font-black tracking-tighter">OPAY</span>
             <span className="text-2xl font-black italic">Moniepoint</span>
             <span className="text-2xl font-black font-serif tracking-tight">Kuda.</span>
             <span className="text-2xl font-black tracking-tighter">PalmPay</span>
           </div>
        </div>
      </div>
    </section>
  );
}
