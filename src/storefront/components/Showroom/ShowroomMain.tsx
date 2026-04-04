"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Tag, SearchX } from 'lucide-react';
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
  const searchParams = useSearchParams();
  const vendor_slug = params?.vendor_slug as string;

  const { addToBasket } = useCartStore();

  // READ SEARCH QUERY FROM URL
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  // FILTER PRODUCTS
  const filteredProducts = products.filter(prod => 
    prod.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-xl lg:text-2xl uppercase tracking-tighter dark:text-white">
            {searchQuery ? 'Search Results' : (
              <>{vendorName ? <span style={{ color: themeColor }}>{vendorName}'s</span> : 'Official'} Catalog</>
            )}
          </h3>
        </div>

        {aboutText && !searchQuery && (
          <p className="px-2 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-3xl">
            {aboutText}
          </p>
        )}

        {isSkeleton ? (
          <FeedSkeleton />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(prod => (
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

                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      // FIXED: Always defaults to adding 1 (Retail) instead of the MOQ amount
                      addToBasket(
                        { ...prod, img: prod.image_url || prod.img }, 
                        1
                      ); 
                    }}
                    className="w-full mt-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all duration-300"
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
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <SearchX size={48} className="text-slate-300 dark:text-white/20 mb-4" />
            <h4 className="text-lg font-black uppercase italic dark:text-white">No items found</h4>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase">Try adjusting your search term.</p>
          </div>
        )}
      </section>
    </div>
  );
}
