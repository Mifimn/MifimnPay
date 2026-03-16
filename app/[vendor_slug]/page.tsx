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

          // 2. Fetch Products for this specific vendor
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
    <div className="min-h-screen">
      {/* 3. Scrolling Promotion Marquee */}
      {profile?.banner_type === 'text' && profile?.promo_texts?.some((t: string) => t.length > 0) && (
        <div className="bg-slate-900 dark:bg-black text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/10">
           <div className="inline-block animate-marquee">
             {profile.promo_texts.map((text: string, i: number) => (
               text && <span key={i} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
             ))}
             {/* Repeat for seamless loop */}
             {profile.promo_texts.map((text: string, i: number) => (
               text && <span key={`rep-${i}`} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
             ))}
           </div>
        </div>
      )}

      {/* 4. The Main Showroom Grid */}
      <ShowroomMain 
        isSkeleton={isLoading} 
        products={vendorProducts} 
        vendorName={profile?.business_name || vendor_slug}
        aboutText={profile?.about_text}
      />

      {/* 5. Empty State */}
      {!isLoading && vendorProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-[24px] flex items-center justify-center mb-6 border border-brand-orange/20">
             <span className="text-brand-orange font-black text-3xl italic">!</span>
          </div>
          <h2 className="text-3xl font-black uppercase italic dark:text-white tracking-tighter">
            Storefront <span className="text-brand-orange">Coming Soon</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-xs uppercase tracking-wide">
            The vendor <span className="text-slate-900 dark:text-white">@{vendor_slug}</span> is currently setting up their showroom catalog.
          </p>
        </div>
      )}
    </div>
  );
}
