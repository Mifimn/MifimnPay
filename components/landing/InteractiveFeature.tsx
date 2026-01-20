import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, BarChart3, QrCode, Check, TrendingUp, Smartphone, ArrowUpRight } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: "1. Smart Generation",
    desc: "Create branded receipts and track every sale automatically.",
    icon: <Edit3 size={20} />
  },
  {
    id: 2,
    title: "2. Sales Analysis",
    desc: "View real-time charts of your daily and weekly revenue.",
    icon: <BarChart3 size={20} />
  },
  {
    id: 3,
    title: "3. Digital Storefront",
    desc: "Share your QR code so customers can browse your store.",
    icon: <QrCode size={20} />
  }
];

export default function InteractiveFeature() {
  const [activeStep, setActiveStep] = useState(1);

  // Auto-cycle through steps every 5 seconds to match the "motion" feel
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === 3 ? 1 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      {/* LEFT SIDE: The Steps Menu */}
      <div className="space-y-4">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => setActiveStep(step.id)}
            className={`w-full text-left p-6 rounded-2xl transition-all duration-300 border ${
              activeStep === step.id
                ? "bg-zinc-900 text-white border-zinc-900 shadow-xl scale-105"
                : "bg-white text-zinc-500 border-zinc-100 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${activeStep === step.id ? 'bg-zinc-800' : 'bg-zinc-100 text-zinc-900'}`}>
                {step.icon}
              </div>
              <div>
                <h3 className={`font-black text-lg ${activeStep === step.id ? 'text-white' : 'text-zinc-900'}`}>
                  {step.title}
                </h3>
                <p className={`text-sm font-medium mt-1 ${activeStep === step.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* RIGHT SIDE: The Virtual Phone Screen */}
      <div className="relative mx-auto border-zinc-800 bg-zinc-900 border-[14px] rounded-[2.5rem] h-[550px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
        {/* Phone Notch */}
        <div className="h-[32px] bg-zinc-800 w-full absolute top-0 left-0 z-20 flex justify-center">
            <div className="h-4 w-24 bg-black rounded-b-xl"></div>
        </div>
        
        {/* Screen Content */}
        <div className="bg-zinc-50 w-full h-full pt-12 relative flex flex-col items-center font-sans">
          <AnimatePresence mode="wait">
            
            {/* SCENE 1: RECEIPT GENERATION MOTION */}
            {activeStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full px-4 pt-4"
              >
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 mb-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold text-[10px]">M</div>
                    <div className="h-2 w-16 bg-zinc-100 rounded-full" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Customer</div>
                      <div className="h-6 border-b border-zinc-100 flex items-center text-[10px] font-bold text-zinc-900">
                        <Typewriter text="Amina Yusuf" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Amount</div>
                      <div className="h-6 border-b border-zinc-100 flex items-center text-[10px] font-bold text-zinc-900">
                        <Typewriter text="₦1,200,000" delay={1.5} />
                      </div>
                    </div>
                  </div>
                </div>
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 3 }}
                  className="bg-green-500 text-white text-center py-3 rounded-xl text-xs font-black shadow-lg flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Receipt Generated
                </motion.div>
              </motion.div>
            )}

            {/* SCENE 2: SALES ANALYTICS MOTION */}
            {activeStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full px-4 pt-4 space-y-4"
              >
                <div className="bg-zinc-900 p-5 rounded-[24px] text-white shadow-xl">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Revenue Growth</p>
                  <p className="text-2xl font-black mt-1 tracking-tight">₦450,200</p>
                  
                  {/* Animated Bar Chart */}
                  <div className="flex items-end gap-2 h-24 mt-6">
                    <motion.div initial={{ height: 0 }} animate={{ height: '40%' }} transition={{ delay: 0.2 }} className="bg-zinc-800 w-full rounded-t-md" />
                    <motion.div initial={{ height: 0 }} animate={{ height: '65%' }} transition={{ delay: 0.3 }} className="bg-zinc-800 w-full rounded-t-md" />
                    <motion.div initial={{ height: 0 }} animate={{ height: '95%' }} transition={{ delay: 0.4 }} className="bg-white w-full rounded-t-md" />
                    <motion.div initial={{ height: 0 }} animate={{ height: '55%' }} transition={{ delay: 0.5 }} className="bg-zinc-800 w-full rounded-t-md" />
                  </div>
                </div>

                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white p-4 rounded-2xl border border-zinc-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={16}/></div>
                    <span className="text-[10px] font-bold text-zinc-900 uppercase">Profit Margin</span>
                  </div>
                  <span className="text-[10px] font-black text-green-600">+18%</span>
                </motion.div>
              </motion.div>
            )}

            {/* SCENE 3: QR STOREFRONT MOTION */}
            {activeStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center w-full px-4 pt-8 text-center"
              >
                 <motion.div 
                   initial={{ scale: 0.8 }}
                   animate={{ scale: 1 }}
                   className="bg-white p-6 rounded-[40px] shadow-2xl border border-zinc-100 mb-8"
                 >
                    <QrCode size={130} strokeWidth={1} className="text-zinc-900" />
                 </motion.div>
                 
                 <h4 className="font-black text-zinc-950 text-sm mb-1 uppercase tracking-tighter">Scan to Browse</h4>
                 <p className="text-zinc-400 text-[10px] font-medium mb-8">mifimnpay.com.ng/m/store</p>
                 
                 <motion.div 
                   initial={{ width: '0%' }}
                   animate={{ width: '100%' }}
                   className="bg-zinc-950 p-3.5 rounded-2xl flex items-center justify-between"
                 >
                    <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                      <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-white"><Smartphone size={12}/></div>
                      <span className="text-[9px] text-white font-black tracking-tight">Open Digital Store</span>
                    </div>
                    <ArrowUpRight size={14} className="text-zinc-500" />
                 </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Typing Animation Helper
function Typewriter({ text, delay = 0 }: { text: string, delay?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    const startTimeout = setTimeout(() => {
        let i = 0;
        const typing = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i === text.length) clearInterval(typing);
        }, 60); 
        return () => clearInterval(typing);
    }, delay * 1000);
    return () => clearTimeout(startTimeout);
  }, [text, delay]);

  return <span>{displayed}<span className="animate-pulse">|</span></span>;
}
