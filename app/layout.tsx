import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import Script from "next/script"; // Added for Paystack

export const metadata: Metadata = {
  title: "MifimnPay | Free Digital Storefront & Receipt Generator",
  description: "Launch your digital storefront, automate professional business receipts, and track real-time sales analytics.",
  manifest: "/manifest.json",
  metadataBase: new URL('https://mifimnpay.com.ng'),
  alternates: { canonical: '/' },
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
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "MifimnPay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MifimnPay | Free Digital Storefront & Receipt Generator",
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white transition-colors duration-300">
        <AppProviders>
          {children}
        </AppProviders>
        {/* Paystack Inline Script */}
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
