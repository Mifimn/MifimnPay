"use client";

import { useEffect } from "react";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { useThemeStore } from "@/src/storefront/store/useThemeStore";
import Script from "next/script";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { themeColor, isDark, initTheme } = useThemeStore();
  const pathname = usePathname();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Logic: If path starts with dashboard/admin/login, use default Mifimn Orange
      const isPlatform = pathname.startsWith('/dashboard') || 
                         pathname.startsWith('/admin') || 
                         pathname.startsWith('/login') || 
                         pathname === '/';

      const finalColor = isPlatform ? "#ff7d1a" : themeColor;
      document.documentElement.style.setProperty('--brand-orange', finalColor);
    }
  }, [themeColor, pathname]);

  const isStorefront = pathname !== '/' && 
                       !pathname.startsWith('/dashboard') && 
                       !pathname.startsWith('/admin') && 
                       !pathname.startsWith('/login');

  return (
    <html lang="en" className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <head>
        {!isStorefront && <link rel="manifest" href="/manifest.json" />}
      </head>
      <body className="antialiased bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
        <AppProviders>
          {children}
        </AppProviders>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
