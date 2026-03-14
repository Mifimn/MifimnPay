import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import InteractiveFeature from '@/components/landing/InteractiveFeature';
import Testimonials from '@/components/landing/Testimonials';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-brand-bg text-brand-black transition-colors duration-300 font-sans selection:bg-brand-black selection:text-brand-paper">
      <Navbar />

      <Hero />

      <HowItWorks />

      {/* Wrapper for the Interactive Feature to give it proper spacing */}
      <section className="py-24 bg-brand-bg transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-brand-black tracking-tighter transition-colors duration-300 uppercase">
              The Complete Toolkit
            </h2>
            <p className="text-brand-gray font-medium max-w-2xl mx-auto transition-colors duration-300">
              Everything works together seamlessly. Generate a receipt, and watch your analytics update instantly.
            </p>
          </div>
          <InteractiveFeature />
        </div>
      </section>

      <Testimonials />

      <Footer />
    </main>
  );
}