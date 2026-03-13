"use client";

import React, { useEffect } from 'react';
import BrandHeader from '@/storefront/components/Showroom/BrandHeader';
import CartDrawer from '@/storefront/components/Showroom/CartDrawer';
import ModalController from '@/storefront/components/Global/ModalController';
import MobileNavbar from '@/storefront/components/Showroom/MobileNavbar';
import InquiryBasket from '@/storefront/components/Showroom/InquiryBasket';
import { useThemeStore } from '@/storefront/store/useThemeStore';
import { useCartStore } from '@/storefront/store/useCartStore';

/**
 * Master Storefront Layout
 * Path: app/[vendor_slug]/layout.tsx
 * * This wrapper manages the global state and UI overlays for the vendor's store.
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, initTheme } = useThemeStore();
  const { basket, removeFromBasket } = useCartStore();

  // Initialize your signature dark mode on mount
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <main className="bg-white dark:bg-[#0a0a0a] min-h-screen relative flex flex-col pb-24 lg:pb-0">
        
        {/* TOP NAVIGATION: Desktop/Tablet Header */}
        <BrandHeader />

        {/* GLOBAL OVERLAYS:
          These components handle state-driven UI that persists across pages.
        */}
        <CartDrawer />
        <ModalController />

        {/* INQUIRY BASKET (3D SIDEBAR):
          Only renders if the basket has items. 
          Hidden on small screens where MobileNavbar is preferred.
        */}
        <div className="hidden lg:block">
           {basket.length > 0 && (
             <InquiryBasket 
               items={basket} 
               onRemove={(id) => removeFromBasket(id)} 
             />
           )}
        </div>

        {/* MOBILE NAVIGATION:
          High-end 3D Floating Bar.
          Visible only on mobile/tablets.
        */}
        <MobileNavbar />

        {/* DYNAMIC PAGE CONTENT: (Showroom, Product Detail, etc.) */}
        <div className="flex-1 relative">
          {children}
        </div>

        {/* VENDORS OPTIONAL FOOTER:
          You can add a simple copyright or MifimnPay branding here.
        */}
      </main>
    </div>
  );
}
