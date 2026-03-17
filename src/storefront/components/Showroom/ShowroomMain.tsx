"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Tag } from 'lucide-react';
import { FeedSkeleton } from './SkeletonLoader';
import { useCartStore } from '@/src/storefront/store/useCartStore';

interface ShowroomMainProps {
  isSkeleton: boolean;
  products: any[];
  vendorName?: string;
  aboutText?: string;
  themeColor?: string; 
}

export default function ShowroomMain({ 
  isSkeleton, 
  products, 
  vendorName, 
  aboutText, 
  themeColor = "#f97316" 
}: ShowroomMainProps) {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  // Directly use the cart store so "Quick Add" works flawlessly
  const { addToBasket } = useCartStore();

  return (
    <div className="flex flex-col gap-6">
      {/* Removed the duplicate <HeroSlideshow /> from here!
        The banner is now handled completely by the parent page.tsx 
      */}

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-xl lg:text-2xl uppercase tracking-tighter dark:text-white">
            {vendorName ? <span style={{ color: themeColor }}>{vendorName}'s</span> : 'Official'} Catalog
          </h3>
        </div>

        {/* Display the vendor's About text if they wrote one */}
        {aboutText && (
          <p className="px-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-3xl">
            {aboutText}
          </p>
        )}

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
                  <img 
                    src={prod.image_url || prod.img} 
                    alt={prod.name} 
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                  />
                  {prod.wholesale_price && (
                    <div className="absolute top-3 right-3 text-white p-1.5 rounded-lg shadow-lg" style={{ backgroundColor: themeColor }}>
                      <Tag size={12} />
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase line-clamp-2 leading-tight h-8">
                      {prod.name}
                    </h4>
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-white font-black text-lg">
                        ₦{Number(prod.price).toLocaleString()}
                      </span>
                      {prod.moq > 1 && (
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                          MOQ: {prod.moq} Units
                        </span>
                      )}
                    </div>
                  </div>

                  {/* QUICK ADD BUTTON */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      // Add to cart with proper mapping and respect MOQ
                      addToBasket(
                        { ...prod, img: prod.image_url || prod.img }, 
                        prod.moq > 0 ? prod.moq : 1
                      ); 
                    }}
                    className="w-full mt-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all duration-300"
                    // Inline Javascript styles for dynamic hover color syncing
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = themeColor;
                      e.currentTarget.style.borderColor = themeColor;
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                    }}
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
  );
}
