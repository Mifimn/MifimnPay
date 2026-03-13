"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Box } from 'lucide-react';
import HeroSlideshow from './HeroSlideshow';
import { FeedSkeleton } from './SkeletonLoader';
import { Product } from '@/storefront/store/useCartStore';

const CATEGORIES = [
  "Manufacturing & Processing", "Consumer Electronics", "Industrial Equipment",
  "Electrical & Electronics", "Construction & Decoration", "Light Industry & Daily Use",
  "Auto & Accessories", "Apparel & Accessories", "Lights & Lighting", "Health & Medicine"
];

// Mock data remains for initial rendering
const PRODUCTS: Product[] = [
  { id: 1, name: "Industrial Hydraulic Pump", price: "2,200.00", moq: "10 Pcs", img: "https://picsum.photos/seed/pump/400" },
  { id: 2, name: "Smart Water Purifier System", price: "450.00", moq: "50 Pcs", img: "https://picsum.photos/seed/water/400" },
  { id: 3, name: "Heavy Duty Electric Drill", price: "85.50", moq: "100 Pcs", img: "https://picsum.photos/seed/drill/400" },
  { id: 4, name: "Precision Angle Grinder", price: "62.00", moq: "20 Pcs", img: "https://picsum.photos/seed/grinder/400" },
  { id: 5, name: "Solar Power Station 2000W", price: "1,150.00", moq: "5 Pcs", img: "https://picsum.photos/seed/solar/400" },
  { id: 6, name: "LED Warehouse High Bay Light", price: "18.00", moq: "200 Pcs", img: "https://picsum.photos/seed/led/400" },
  { id: 7, name: "Automatic Packing Machine", price: "5,400.00", moq: "1 Unit", img: "https://picsum.photos/seed/machine/400" },
  { id: 8, name: "Digital Multimeter Pro", price: "24.90", moq: "50 Pcs", img: "https://picsum.photos/seed/meter/400" },
];

interface ShowroomMainProps {
  onAddInquiry: (product: Product) => void;
  isSkeleton: boolean;
}

/**
 * ShowroomMain Component
 * Path: src/storefront/components/Showroom/ShowroomMain.tsx
 * * The central feed for products, featuring a category sidebar and hero banner.
 * Optimized for Next.js App Router and TypeScript.
 */
export default function ShowroomMain({ onAddInquiry, isSkeleton }: ShowroomMainProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-10">
      {/* Sidebar Categories */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
            <div className="w-1.5 h-5 bg-brand-orange rounded-full"></div>
            <h3 className="font-black text-xs uppercase tracking-widest">Categories</h3>
          </div>
          <ul className="space-y-1">
            {CATEGORIES.map(cat => (
              <li key={cat} className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-orange/5 cursor-pointer border border-transparent hover:border-brand-orange/20 transition-all">
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-brand-orange uppercase">{cat}</span>
                <ChevronRight size={14} className="text-brand-orange opacity-0 group-hover:opacity-100 transition-all" />
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1 space-y-6">
        <HeroSlideshow isLoading={isSkeleton} />
        
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xl lg:text-2xl uppercase tracking-tighter dark:text-white">
              Selected <span className="text-brand-orange">Trending</span> Products
            </h3>
          </div>

          {isSkeleton ? (
            <FeedSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {PRODUCTS.map(prod => (
                <motion.div 
                  whileHover={{ y: -5, scale: 1.01 }} 
                  key={prod.id} 
                  className="relative bg-white dark:bg-[#0f0f0f] rounded-[20px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm transition-all group flex flex-col h-full cursor-pointer"
                  onClick={() => router.push(`/${vendor_slug}/product/${prod.id}`)}
                >
                  <div className="absolute inset-0 border-2 border-brand-orange opacity-0 group-hover:opacity-100 rounded-[20px] blur-[1px] pointer-events-none transition-opacity shadow-glow-orange"></div>
                  
                  <div className="h-48 bg-slate-50 dark:bg-white/5 flex items-center justify-center p-2 border-b border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <img src={prod.img} alt={prod.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 left-2 bg-brand-orange text-white text-[7px] font-black px-2 py-0.5 rounded-full shadow-lg transform -rotate-6">VERIFIED</div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between relative z-10">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase line-clamp-2 h-8 leading-tight">{prod.name}</h4>
                      <div className="flex items-baseline gap-1">
                        <span className="text-brand-orange font-black text-lg leading-none">${prod.price}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase">/ Unit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Box size={10} className="text-brand-orange opacity-70" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">MOQ: {prod.moq}</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddInquiry(prod); }}
                      className="w-full mt-3 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-brand-orange group-hover:text-white transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
