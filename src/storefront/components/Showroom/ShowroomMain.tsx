"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { ChevronRight, Box, Tag } from 'lucide-react';
import HeroSlideshow from './HeroSlideshow';
import { FeedSkeleton } from './SkeletonLoader';

interface ShowroomMainProps {
  onAddInquiry: (product: any) => void;
  isSkeleton: boolean;
  products: any[];
  vendorName?: string;
  themeColor?: string; // Added to match brand
}

export default function ShowroomMain({ onAddInquiry, isSkeleton, products, vendorName, themeColor = "#f97316" }: ShowroomMainProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row gap-6 p-4 lg:p-10">
      <div className="flex-1 space-y-6">
        <HeroSlideshow isLoading={isSkeleton} />

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-xl lg:text-2xl uppercase tracking-tighter dark:text-white">
              {vendorName ? <span style={{ color: themeColor }}>{vendorName}'s</span> : 'Official'} Catalog
            </h3>
          </div>

          {isSkeleton ? (
            <FeedSkeleton />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(prod => (
                <motion.div 
                  whileHover={{ y: -5 }} 
                  key={prod.id} 
                  className="relative bg-white dark:bg-[#0f0f0f] rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm transition-all group flex flex-col h-full cursor-pointer"
                  onClick={() => router.push(`/${vendor_slug}/product/${prod.id}`)}
                >
                  <div className="h-48 bg-slate-50 dark:bg-black/20 flex items-center justify-center p-4 relative overflow-hidden">
                    <img src={prod.image_url || prod.img} alt={prod.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                    {prod.wholesale_price && (
                      <div className="absolute top-3 right-3 text-white p-1.5 rounded-lg shadow-lg" style={{ backgroundColor: themeColor }}>
                        <Tag size={12} />
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase line-clamp-2 leading-tight h-8">{prod.name}</h4>
                      <div className="flex flex-col">
                        <span className="text-slate-900 dark:text-white font-black text-lg">₦{Number(prod.price).toLocaleString()}</span>
                        {prod.moq > 1 && <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">MOQ: {prod.moq} Units</span>}
                      </div>
                    </div>
                    
                    {/* UPDATED BUTTON: Fixed text colors for Dark Theme */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); onAddInquiry(prod); }}
                      className="w-full mt-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-white group-hover:bg-brand-orange transition-all"
                      style={{ 
                        '--hover-bg': themeColor 
                      } as any}
                    >
                      Quick Add
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
