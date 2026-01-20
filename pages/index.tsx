// pages/index.tsx
import { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  // Updated to your professional domain
  const siteUrl = 'https://mifimnpay.com.ng';
  const title = "MifimnPay | Professional Receipt & Business Management";
  const description = "Generate branded receipts, track sales analytics, and share your digital storefront via QR codes.";
  const shareImage = `${siteUrl}/og-image.png`;
  
  useEffect(() => {
    if (supabase) {
      console.log('✅ CLIENT CHECK: Supabase is ready!');
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-black selection:text-white">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:secure_url" content={shareImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={shareImage} />
      </Head>

      <Navbar />
      
      <main>
        {/* These components now need to be updated to show all features */}
        <Hero />
        <HowItWorks />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {}, 
  };
}
