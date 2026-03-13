"use client";

import React, { useEffect } from 'react';
import "@/styles/globals.css";
import BrandHeader from '@/storefront/components/Showroom/BrandHeader';
import CartDrawer from '@/storefront/components/Showroom/CartDrawer';
import ModalController from '@/storefront/components/Global/ModalController';
// REMOVE THIS: import MobileNavbar from '@/storefront/components/Showroom/MobileNavbar'; 
import InquiryBasket from '@/storefront/components/Showroom/InquiryBasket';
import { useThemeStore } from '@/storefront/store/useThemeStore';
import { useCartStore } from '@/storefront/store/useCartStore';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDark, initTheme } = useThemeStore();
  const { basket, removeFromBasket } = useCartStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <div className={`${isDark ? 'dark' : ''} min-h-screen transition-colors duration-500`}>
      <main className="bg-white dark:bg-[#0a0a0a] min-h-screen relative flex flex-col pb-24 lg:pb-0">
        <BrandHeader />
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

        {/* REMOVE THIS COMPONENT TAG: <MobileNavbar /> */}

        <div className="flex-1 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
