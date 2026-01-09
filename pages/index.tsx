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
  const siteUrl = 'https://mifimnpay.vercel.app';
  const title = "MifimnPay | Professional Receipt Generator";
  const description = "Generate authentic branded receipts instantly with MifimnPay.";
  const shareImage = `${siteUrl}/favicon.png`;
  
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
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={shareImage} />
      </Head>

      <Navbar />
      
      <main>
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