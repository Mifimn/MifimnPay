import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "MifimnPay | Professional Receipt Generator",
  description: "Generate authentic branded receipts instantly with MifimnPay.",
  manifest: "/manifest.json",
  metadataBase: new URL('https://mifimnpay.com.ng'),
  alternates: { canonical: '/' },
  openGraph: {
    type: "website",
    title: "MifimnPay | Professional Receipt Generator",
    description: "Generate authentic branded receipts instantly with MifimnPay.",
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MifimnPay | Professional Receipt Generator",
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-brand-bg text-brand-black transition-colors duration-300">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}