import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "MifimnPay | Free Digital Storefront & Receipt Generator",
  description: "Launch your digital storefront, automate professional business receipts, and track real-time sales analytics.",
  manifest: "/manifest.json",
  metadataBase: new URL('https://mifimnpay.com.ng'),
  alternates: { canonical: '/' },
  // 1. Explicit favicon configuration for browsers and mobile devices
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: "website",
    siteName: "MifimnPay",
    title: "MifimnPay | Free Digital Storefront & Receipt Generator",
    description: "Launch your digital storefront, automate professional business receipts, and track real-time sales analytics.",
    url: "https://mifimnpay.com.ng",
    // 2. WhatsApp and other platforms use this image for the preview card
    images: [
      { 
        url: '/og-image.png', 
        width: 1200, 
        height: 630,
        alt: "MifimnPay - Digital Storefront and Receipt Generator"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MifimnPay | Free Digital Storefront & Receipt Generator",
    description: "Launch your digital storefront, automate professional business receipts, and track real-time sales analytics.",
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  // 3. Updated theme color to match your new dark background
  themeColor: "#050505", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 4. Updated body classes for the liquid glass background theme */}
      <body className="antialiased bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
