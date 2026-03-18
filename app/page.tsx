import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import InteractiveFeature from '@/components/landing/InteractiveFeature';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'MifimnPay | Free Digital Storefront & Receipt Generator for Nigerian Vendors',
  description: 'Launch your digital storefront, automate professional business receipts, and track real-time sales analytics. The ultimate business engine for modern entrepreneurs.',
  metadataBase: new URL('https://mifimnpay.com.ng'),
  openGraph: {
    title: 'MifimnPay | Free Digital Storefront & Receipt Generator',
    description: 'Launch your digital storefront, automate professional business receipts, and track real-time sales analytics.',
    url: 'https://mifimnpay.com.ng',
    siteName: 'MifimnPay',
    images: [
      {
        url: '/og-image.png', // Ensure this file is inside your /public folder
        width: 1200,
        height: 630,
        alt: 'MifimnPay The Ultimate Business Engine',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MifimnPay | Free Digital Storefront',
    description: 'Launch your digital storefront, automate professional business receipts, and track real-time sales analytics.',
    images: ['/og-image.png'], // Ensure this file is inside your /public folder
  },
  icons: {
    icon: '/favicon.ico', // Replace the default Next.js favicon in /app with your own
    apple: '/apple-touch-icon.png',
  },
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-brand-orange selection:text-white overflow-hidden">

      {/* Global Liquid Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-orange/20 dark:bg-brand-orange/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute top-[40%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[100px] mix-blend-multiply dark:mix-blend-screen" />

        {/* Subtle Glass Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <HowItWorks />

        <section className="py-32 relative">
          <div className="max-w-7xl mx-auto px-6">
            <header className="text-center mb-24 space-y-6">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-500">
                The Complete Business Engine
              </h2>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-lg md:text-xl max-w-3xl mx-auto tracking-wide">
                A seamless ecosystem. Customers browse your liquid storefront, place orders effortlessly, and you process them with professional analytics updating instantly.
              </p>
            </header>
            <InteractiveFeature />
          </div>
        </section>

        <Testimonials />
        <Footer />
      </div>
    </main>
  );
}