import { motion } from 'framer-motion';
import { Store, Share2, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: <Store size={32} strokeWidth={1.5} />,
    title: "1. Setup Your Store",
    desc: "Create your professional business profile and get your unique storefront link (mifimnpay.com.ng/m/your-name)."
  },
  {
    icon: <Share2 size={32} strokeWidth={1.5} />,
    title: "2. Generate & Sell",
    desc: "Create branded receipts in seconds or let customers scan your QR code to browse your products directly."
  },
  {
    icon: <TrendingUp size={32} strokeWidth={1.5} />,
    title: "3. Analyze Growth",
    desc: "Track every Naira. Use your dashboard to see revenue charts, top products, and daily business performance."
  }
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-white border-y border-brand-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-brand-black tracking-tighter">BEYOND JUST RECEIPTS</h2>
          <p className="text-brand-gray font-medium max-w-2xl mx-auto">Everything you need to move from a "DM vendor" to a professional business owner.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-[32px] bg-brand-bg border border-brand-border hover:border-zinc-950 transition-all"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-black shadow-sm border border-brand-border mb-8 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-2xl font-black text-brand-black mb-4 tracking-tight">{step.title}</h3>
              <p className="text-brand-gray font-medium leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
