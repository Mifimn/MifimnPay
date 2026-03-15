import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Terms of Use | MifimnPay',
  description: 'Read the terms and conditions for using MifimnPay\'s digital storefronts, receipt generators, and analytics platform.',
};

export default function TermsOfUsePage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white font-sans selection:bg-brand-orange selection:text-white overflow-hidden">
      
      {/* Global Liquid Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand-orange/20 dark:bg-brand-orange/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}></div>
      </div>

      <div className="relative z-10">
        <Navbar />
        
        <section className="pt-40 pb-24 max-w-4xl mx-auto px-6">
          <header className="mb-16 text-center">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 mb-6">
              Terms of Use
            </h1>
            <p className="text-slate-600 dark:text-slate-400 font-bold tracking-widest uppercase text-xs">
              Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </header>

          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/40 dark:border-white/10 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] space-y-12">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">1. Acceptance of Terms</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                By accessing and using MifimnPay ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">2. Description of Service</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                MifimnPay provides digital business tools for vendors, including but not limited to digital storefront hosting, customizable image receipt generation, order tracking, and sales analytics. We are a software provider, not a bank, payment gateway, or financial institution.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">3. Vendor Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-3 text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                <li>You are responsible for the accuracy of the products, prices, and information displayed on your digital storefront.</li>
                <li>You must not use MifimnPay to sell illegal goods, restricted substances, or services that violate local laws.</li>
                <li>You are solely responsible for fulfilling the orders placed by customers through your MifimnPay storefront.</li>
                <li>You must keep your login credentials secure and are responsible for all activity under your account.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">4. Intellectual Property</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                MifimnPay retains all rights to the software, design, and architecture of the platform. You retain all rights to the business data, logos, and product images you upload to the platform. By uploading content, you grant us a license to display it solely for the purpose of rendering your storefront and receipts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">5. Limitation of Liability</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                MifimnPay is provided "as is" without warranties of any kind. We are not liable for any disputes, financial losses, or damages arising between you and your customers. We are not responsible for any downtime or data loss, though we strive to maintain 99.9% uptime.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-orange">6. Account Termination</h2>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                We reserve the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, or uses the platform maliciously.
              </p>
            </section>

          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
}
