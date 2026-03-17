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
      document.documentElement.style.setProperty('--brand-orange', themeColor);
    }
  }, [themeColor]);

  // Determine if we are on a storefront route (e.g., /[vendor_slug])
  const isStorefront = pathname !== '/' && 
                       !pathname.startsWith('/dashboard') && 
                       !pathname.startsWith('/admin') && 
                       !pathname.startsWith('/login');

  return (
    <html lang="en" className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <head>
        {/* Only attach the PWA manifest if NOT on a storefront page */}
        {!isStorefront && <link rel="manifest" href="/manifest.json" />}
        <meta name="theme-color" content={themeColor} />
      </head>
      <body 
        className="antialiased bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300"
        style={{ ['--brand-orange' as any]: themeColor }}
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
