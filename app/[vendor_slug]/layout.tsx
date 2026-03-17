"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BrandHeader from '@/src/storefront/components/Showroom/BrandHeader';
import CartDrawer from '@/src/storefront/components/Showroom/CartDrawer';
import ModalController from '@/src/storefront/components/Global/ModalController';
import InquiryBasket from '@/src/storefront/components/Showroom/InquiryBasket';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { supabase } from '@/lib/supabaseClient';

/**
 * StorefrontLayout Component
 * Isolated wrapper for vendor-specific storefronts.
 * Ensures custom branding color only applies here.
 */
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
    // 1. Initialize Dark/Light mode preference
    initTheme();

    // 2. Fetch vendor settings to apply branding
    const fetchVendorBranding = async () => {
      if (!vendor_slug) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('theme_color, business_name, logo_url')
        .eq('slug', vendor_slug)
        .single();

      if (data && !error) {
        setProfile(data);
        
        // 3. Apply the vendor's custom color
        if (data.theme_color) {
          setThemeColor(data.theme_color);
          
          // FORCE injection into the CSS variable specifically for this layout context
          // This ensures that even if the global layout tries to reset it, 
          // the storefront layout takes priority.
          document.documentElement.style.setProperty('--brand-orange', data.theme_color);
        }
      }
    };

    fetchVendorBranding();
  }, [vendor_slug, setThemeColor, initTheme]);

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <main className="bg-white dark:bg-[#050505] min-h-screen relative flex flex-col pb-24 lg:pb-0">
        
        {/* Navigation & Branding */}
        <BrandHeader 
          businessName={profile?.business_name || vendor_slug} 
          logoUrl={profile?.logo_url} 
        />

        {/* Storefront Overlay Components */}
        <CartDrawer />
        <ModalController />

        {/* Desktop Inquiry Basket */}
        <div className="hidden lg:block">
           {basket.length > 0 && (
             <InquiryBasket 
               items={basket} 
               onRemove={(id) => removeFromBasket(id)} 
             />
           )}
        </div>

        {/* Page Content */}
        <div className="flex-1 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
