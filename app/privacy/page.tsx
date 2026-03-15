import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Privacy Policy | MifimnPay',
  description: 'Learn how MifimnPay collects, uses, and protects your data and your customers\' data on our digital storefront and receipt generation platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-brand-orange selection:text-white overflow-hidden">
      
      {/* Global Liquid Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-orange/20 dark:bg-brand-orange/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <section className="pt-40 pb-24 max-w-4xl mx-auto px-6">
          <header className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 mb-6">
              Privacy Policy
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold tracking-widest uppercase text-xs">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </header>

          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/40 dark:border-white/10 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">1. Introduction</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                Welcome to MifimnPay ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal data of our vendors and their customers. This Privacy Policy explains how we collect, use, and safeguard your information when you use our digital storefronts, receipt generation tools, and analytics dashboard.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">2. Data We Collect</h2>
              <ul className="list-disc pl-5 space-y-3 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                <li><strong className="text-slate-900 dark:text-white">Vendor Account Data:</strong> Name, business name, email address, phone number, and physical address.</li>
                <li><strong className="text-slate-900 dark:text-white">Storefront Data:</strong> Product listings, pricing, branding assets (logos, banners), and promotional texts.</li>
                <li><strong className="text-slate-900 dark:text-white">Transaction & Receipt Data:</strong> Customer names, items purchased, amounts, and dates (entered by vendors or submitted via storefronts).</li>
                <li><strong className="text-slate-900 dark:text-white">Usage Analytics:</strong> How you interact with our platform, to help us improve the system.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">3. How We Use Your Data</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                We use your data strictly to provide and improve the MifimnPay service. This includes rendering your public storefronts, generating accurate receipts, calculating your dashboard analytics, and providing customer support. <strong className="text-slate-900 dark:text-white">We do not sell your personal or business data to third parties.</strong>
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">4. Customer Data Processing</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                As a vendor, you may collect information from your buyers (e.g., names for receipts). MifimnPay acts as a data processor for this information. It is your responsibility to ensure you have the right to collect and input this data into our system.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">5. Data Security</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                We implement robust security measures, including encryption and secure server hosting (via Supabase), to protect your data against unauthorized access, alteration, or destruction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">6. Contact Us</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                If you have questions regarding this Privacy Policy or wish to delete your account and associated data, please contact our support team.
              </p>
            </section>

          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}