"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ShowroomMain from '@/src/storefront/components/Showroom/ShowroomMain';
import HeroSlideshow from '@/src/storefront/components/Showroom/HeroSlideshow';
import { supabase } from '@/lib/supabaseClient';

/**
 * VendorShowroomPage Component
 * Path: app/[vendor_slug]/page.tsx
 * Dynamic storefront page that adapts to the vendor's branding and inventory.
 */
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
        // 1. Fetch Profile for branding, banners, and promo text settings
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('slug', vendor_slug)
          .single();

        if (profileData) {
          setProfile(profileData);

          // 2. Fetch Products specifically for this vendor
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('user_id', profileData.id)
            .order('created_at', { ascending: false });

          setVendorProducts(products || []);
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
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500">

      {/* 3. Scrolling Promotion Marquee (Top-bar style) */}
      {profile?.banner_type === 'text' && profile?.promo_texts?.some((t: string) => t.length > 0) && (
        <div className="bg-slate-900 dark:bg-black text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-20">
           <div className="inline-block animate-marquee">
             {profile.promo_texts.map((text: string, i: number) => (
               text && <span key={i} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
             ))}
             {/* Repeat for seamless infinite loop */}
             {profile.promo_texts.map((text: string, i: number) => (
               text && <span key={`rep-${i}`} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
             ))}
           </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12 relative z-10">

        {/* 4. High-Impact 3D Hero Section */}
        {/* Dynamically switches between image banners or text promotions */}
        <HeroSlideshow 
          isLoading={isLoading}
          bannerType={profile?.banner_type}
          banners={profile?.banner_urls}
          promoTexts={profile?.promo_texts}
          themeColor={profile?.theme_color}
        />

        {/* 5. Main Showroom Product Grid */}
        <ShowroomMain 
          isSkeleton={isLoading} 
          products={vendorProducts} 
          vendorName={profile?.business_name || vendor_slug}
          aboutText={profile?.about_text}
        />

        {/* 6. Empty State / Coming Soon */}
        {!isLoading && vendorProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
            <div 
              className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 border transition-all duration-500 shadow-lg"
              style={{ 
                backgroundColor: `${profile?.theme_color || '#f97316'}1a`,
                borderColor: `${profile?.theme_color || '#f97316'}33` 
              }}
            >
               <span 
                className="font-black text-3xl italic"
                style={{ color: profile?.theme_color || '#f97316' }}
               >
                !
               </span>
            </div>
            <h2 className="text-3xl font-black uppercase italic dark:text-white tracking-tighter">
              Storefront <span style={{ color: profile?.theme_color || '#f97316' }}>Coming Soon</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-xs uppercase tracking-wide">
              The vendor <span className="text-slate-900 dark:text-white">@{vendor_slug}</span> is currently setting up their showroom catalog.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
