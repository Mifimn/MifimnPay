"use client";

import { useEffect } from "react";
import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { useThemeStore } from "@/src/storefront/store/useThemeStore";
import Script from "next/script";

// Metadata must be in a separate file if using "use client" in layout, 
// but for the sake of this update, ensure your providers handle the theme.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { themeColor, isDark, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    // Inject the vendor's chosen hex code into the --brand-orange variable
    if (typeof window !== 'undefined') {
      document.documentElement.style.setProperty('--brand-orange', themeColor);
    }
  }, [themeColor]);

  return (
    <html lang="en" className={isDark ? 'dark' : ''} suppressHydrationWarning>
      <body 
        className="antialiased bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300"
        style={{ 
          // Inline style backup to ensure variable is available immediately
          ['--brand-orange' as any]: themeColor 
        }}
      >
        <AppProviders>
          {children}
        </AppProviders>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
