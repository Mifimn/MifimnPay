"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { useThemeStore } from "@/src/storefront/store/useThemeStore";
import Script from "next/script";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { themeColor, initTheme } = useThemeStore();
  const pathname = usePathname();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // DEFINITIVE LIST OF ADMIN ROUTES
      const isAdminArea = 
        pathname === '/' || 
        pathname.startsWith('/dashboard') || 
        pathname.startsWith('/orders') || 
        pathname.startsWith('/customers') || 
        pathname.startsWith('/history') || 
        pathname.startsWith('/products') || 
        pathname.startsWith('/setup') || 
        pathname.startsWith('/settings') || 
        pathname.startsWith('/generate') || 
        pathname.startsWith('/login');

      // FORCE DEFAULT ORANGE FOR ADMIN, VENDOR COLOR FOR STOREFRONT
      const finalColor = isAdminArea ? "#ff7d1a" : themeColor;
      
      document.documentElement.style.setProperty('--brand-orange', finalColor);
    }
  }, [themeColor, pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
        <AppProviders>
          {children}
        </AppProviders>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
