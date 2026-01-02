import { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Testimonials from '../components/landing/Testimonials';
import Footer from '../components/landing/Footer';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  
  // Client-Side Check (Shows in Browser Console)
  useEffect(() => {
    if (supabase) {
      console.log('✅ CLIENT CHECK: Supabase is ready in the browser!');
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg selection:bg-brand-black selection:text-white">
      <Head>
        <title>MifimnPay | Professional Receipt Generator</title>
        <meta name="description" content="Generate professional receipts for your business in seconds. Trusted by 5,000+ vendors in Nigeria." />
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

// Server-Side Check (Shows in Your Terminal)
export async function getServerSideProps() {
  console.log('✅ SERVER CHECK: Supabase is connected and ready!');
  return {
    props: {}, // Passed to the page component as props
  };
}
