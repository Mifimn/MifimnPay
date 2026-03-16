"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, Send, ShieldCheck, MapPin, Phone, 
  User, CreditCard, Truck, MessageCircle, Loader2, 
  ChevronDown, Image as ImageIcon, Banknote, CheckCircle
} from 'lucide-react';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { useModalStore } from '@/src/storefront/store/useModalStore';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';

// UI PREVIEW DATA
const MOCK_LOGISTICS: any = {
  "Kwara": {
    "Offa": { method: 'landmark', price: 1000, options: ["Olofa Palace", "A-One Hotel", "Avalon Hotel"] },
    "Ilorin South": { method: 'landmark', price: 1500, options: ["Post Office", "Challenge", "Tanke Junction"] },
    "Ijagbo": { method: 'park', price: 1200, options: ["Ijagbo Junction Park", "First Bold Park"] }
  },
  "Lagos": {
    "Ikeja": { method: 'park', price: 5000, options: ["GIGM Ikeja", "Young Shall Grow", "Peace Mass"] }
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  const { themeColor } = useThemeStore();
  const { 
    basket, clearCart, shippingFee, deliveryDetails, 
    setLogistics, paymentMethod, setPaymentMethod 
  } = useCartStore();
  const { openModal } = useModalStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  // Sync pricing and method whenever location changes
  useEffect(() => {
    const data = MOCK_LOGISTICS[deliveryDetails.state]?.[deliveryDetails.lga];
    if (data) {
      setLogistics({ method: data.method, location: '' }, data.price);
    } else {
      setLogistics({ method: 'whatsapp', location: '' }, 0);
    }
  }, [deliveryDetails.state, deliveryDetails.lga, setLogistics]);

  const subtotal = basket.reduce((acc, item) => acc + (Number(item.price) * (item.quantity || 1)), 0);
  const totalPrice = subtotal + shippingFee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleProcessOrder = async () => {
    if (basket.length === 0) return;
    if (paymentMethod === 'manual' && !receiptPreview && deliveryDetails.method !== 'whatsapp') {
      alert("Please upload your payment receipt to proceed.");
      return;
    }

    setIsSubmitting(true);
    // Simulation of payment processing or upload
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsSubmitting(false);

    openModal({
      title: paymentMethod === 'paystack' ? "Payment Successful!" : "Inquiry Received!",
      message: paymentMethod === 'paystack' 
        ? "Your order has been confirmed. The vendor will process it shortly."
        : "Your receipt has been uploaded. The vendor will confirm the transfer within 72 hours.",
      type: "success",
      onConfirm: () => {
        clearCart();
        router.push(`/${vendor_slug}`);
      }
    });
  };

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-10 pb-32">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.back()} className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-slate-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Secure <span style={{ color: themeColor }}>Checkout</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storefront Verified</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Section 1: Logistics */}
          <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[32px] p-8 space-y-6">
            <h3 className="font-black uppercase italic text-sm dark:text-white flex items-center gap-2">
              <MapPin size={18} style={{ color: themeColor }} /> 1. Shipping Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <select 
                  value={deliveryDetails.state} 
                  onChange={(e) => setLogistics({ state: e.target.value, lga: '' }, 0)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-xs font-bold outline-none appearance-none dark:text-white"
                >
                  <option value="">Select State</option>
                  <option value="Kwara">Kwara</option>
                  <option value="Lagos">Lagos</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              <div className="relative">
                <select 
                  disabled={!deliveryDetails.state}
                  value={deliveryDetails.lga} 
                  onChange={(e) => setLogistics({ lga: e.target.value }, 0)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-xs font-bold outline-none appearance-none dark:text-white disabled:opacity-30"
                >
                  <option value="">Select LGA</option>
                  {deliveryDetails.state === "Kwara" && ["Offa", "Ilorin South", "Ijagbo"].map(lga => <option key={lga} value={lga}>{lga}</option>)}
                  {deliveryDetails.state === "Lagos" && ["Ikeja", "Lekki"].map(lga => <option key={lga} value={lga}>{lga}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {deliveryDetails.lga && deliveryDetails.method !== 'whatsapp' && (
              <div className="relative animate-in fade-in slide-in-from-top-2">
                <select 
                  value={deliveryDetails.location}
                  onChange={(e) => setLogistics({ location: e.target.value }, shippingFee)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-4 px-6 text-xs font-bold dark:text-white outline-none appearance-none"
                >
                  <option value="">Select {deliveryDetails.method === 'landmark' ? 'Nearest Landmark' : 'Pickup Park'}</option>
                  {MOCK_LOGISTICS[deliveryDetails.state]?.[deliveryDetails.lga]?.options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            )}
          </section>

          {/* Section 2: Payment Method */}
          <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[32px] p-8 space-y-6">
            <h3 className="font-black uppercase italic text-sm dark:text-white flex items-center gap-2">
              <CreditCard size={18} style={{ color: themeColor }} /> 2. Payment Method
            </h3>

            <div className="flex p-1.5 bg-slate-100 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/10">
              <button 
                onClick={() => setPaymentMethod('paystack')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'paystack' ? 'bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                Paystack (Secure)
              </button>
              <button 
                onClick={() => setPaymentMethod('manual')}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${paymentMethod === 'manual' ? 'bg-white dark:bg-white/10 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
              >
                Direct Transfer
              </button>
            </div>

            <AnimatePresence mode="wait">
              {paymentMethod === 'manual' ? (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Details</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black dark:text-white italic">Opay / 9012345678</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{vendor_slug.toUpperCase()} STORE</span>
                    </div>
                  </div>

                  <div className="relative h-40 group border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand-orange/40 transition-all cursor-pointer bg-slate-50/50 dark:bg-white/5">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <>
                        <ImageIcon className="text-slate-400 mb-2" size={24} />
                        <span className="text-[10px] font-black uppercase text-slate-500">Upload Receipt Screenshot</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="p-6 bg-brand-orange/5 border border-brand-orange/10 rounded-2xl flex items-center gap-4"
                >
                  <ShieldCheck className="text-brand-orange" size={24} />
                  <p className="text-[10px] font-black uppercase text-brand-orange tracking-widest leading-relaxed">
                    Automated bank transfer via Paystack. Your payment is verified instantly.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        {/* Summary Side Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/40 dark:border-white/10 rounded-[40px] p-8 shadow-2xl">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                <span>Items Subtotal</span>
                <span className="text-white">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 pb-4 border-b border-white/5">
                <span>Shipping Fee ({deliveryDetails.lga || 'N/A'})</span>
                <span className="text-white">{shippingFee > 0 ? `₦${shippingFee.toLocaleString()}` : 'Negotiable'}</span>
              </div>
              <div className="pt-2 flex justify-between items-end">
                <span className="font-black uppercase italic text-xs dark:text-white">Total</span>
                <span className="text-3xl font-black tracking-tighter" style={{ color: themeColor }}>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleProcessOrder}
              disabled={isSubmitting}
              className="w-full py-6 text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (
                deliveryDetails.method === 'whatsapp' ? <>Chat to Order <MessageCircle size={18}/></> : <>Confirm Order <Send size={18}/></>
              )}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2">
              <CheckCircle size={12} className="text-green-500" />
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">MifimnPay Verified Storefront</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
