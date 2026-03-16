"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ShowroomMain from '@/src/storefront/components/Showroom/ShowroomMain';
import { supabase } from '@/lib/supabaseClient';

export default function VendorShowroomPage() {
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [vendorProducts, setVendorProducts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!vendor_slug) return;
      setIsLoading(true);

      try {
        // 1. Fetch Profile for Banners and Promo Text
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', vendor_slug)
          .single();

        if (profileData) {
          setProfile(profileData);

          // 2. FIXED: Changed table name from 'products' to 'menu_items'
          const { data: products, error } = await supabase
            .from('menu_items') 
            .select('*')
            .eq('user_id', profileData.id)
            .eq('is_active', true) // Only show active products
            .order('created_at', { ascending: false });

          if (error) throw error;

          // 3. DATA MAPPER: Convert DB fields to Showroom props
          const mappedProducts = (products || []).map(p => ({
            ...p,
            img: p.image_url, // Ensure ShowroomMain sees the image correctly
            price: p.price
          }));

          setVendorProducts(mappedProducts);
        }
      } catch (error) {
        console.error("Storefront fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorData();
  }, [vendor_slug]);

  return (
    <div className="min-h-screen">
      {/* Promotion Marquee */}
      {profile?.banner_type === 'text' && profile?.promo_texts?.some((t: string) => t.length > 0) && (
        <div className="bg-slate-900 dark:bg-black text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/10">
           <div className="inline-block animate-marquee">
             {profile.promo_texts.map((text: string, i: number) => (
               text && <span key={i} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
             ))}
           </div>
        </div>
      )}

      {/* Main Showroom Grid */}
      <ShowroomMain 
        isSkeleton={isLoading} 
        products={vendorProducts} 
        vendorName={profile?.business_name || vendor_slug}
        themeColor={profile?.theme_color || '#f97316'} // Pass dynamic theme
      />

      {/* Empty State */}
      {!isLoading && vendorProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-[24px] flex items-center justify-center mb-6 border border-brand-orange/20">
             <span className="text-brand-orange font-black text-3xl italic">!</span>
          </div>
          <h2 className="text-3xl font-black uppercase italic dark:text-white tracking-tighter">
            Storefront <span className="text-brand-orange">Coming Soon</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-xs uppercase tracking-wide">
            The vendor <span className="text-slate-900 dark:text-white">@{vendor_slug}</span> is currently setting up their catalog.
          </p>
        </div>
      )}
    </div>
  );
}
