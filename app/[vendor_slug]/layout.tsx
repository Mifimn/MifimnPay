"use client";

import React, { useEffect, useState } from 'react';
import "@/styles/globals.css";
import BrandHeader from '@/src/storefront/components/Showroom/BrandHeader';
import CartDrawer from '@/src/storefront/components/Showroom/CartDrawer';
import ModalController from '@/src/storefront/components/Global/ModalController';
import InquiryBasket from '@/src/storefront/components/Showroom/InquiryBasket';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  const { isDark, initTheme, setThemeColor } = useThemeStore();
  const { basket, removeFromBasket } = useCartStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    initTheme();

    // Fetch vendor settings to apply the correct theme color globally to the storefront
    const fetchVendorBranding = async () => {
      if (!vendor_slug) return;
      const { data } = await supabase
        .from('profiles')
        .select('theme_color, business_name, logo_url')
        .eq('slug', vendor_slug)
        .single();

      if (data) {
        setProfile(data);
        if (data.theme_color) {
          setThemeColor(data.theme_color);
        }
      }
    };

    fetchVendorBranding();
  }, [initTheme, vendor_slug, setThemeColor]);

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <main className="bg-white dark:bg-[#050505] min-h-screen relative flex flex-col pb-24 lg:pb-0">
        {/* Dynamic Brand Header using Supabase data */}
        <BrandHeader 
          businessName={profile?.business_name || vendor_slug} 
          logoUrl={profile?.logo_url} 
        />

        <CartDrawer />
        <ModalController />

        <div className="hidden lg:block">
           {basket.length > 0 && (
             <InquiryBasket 
               items={basket} 
               onRemove={(id) => removeFromBasket(id)} 
             />
           )}
        </div>

        <div className="flex-1 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
