"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, Send, ShieldCheck, 
  MapPin, Phone, User, CreditCard,
  CheckCircle2, Loader2
} from 'lucide-react';
import { useCartStore } from '@/storefront/store/useCartStore';
import { useModalStore } from '@/storefront/store/useModalStore';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  
  const { basket, clearCart } = useCartStore();
  const { openModal } = useModalStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const totalUnits = basket.reduce((acc, item) => acc + Number(item.quantity || 1), 0);
  const totalPrice = basket.reduce((acc, item) => acc + (Number(item.price) * (Number(item.quantity) || 1)), 0);

  const handleProcessOrder = async () => {
    if (basket.length === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate API call to your Supabase/Backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    
    openModal({
      title: "Inquiry Sent!",
      message: `Your request for ${totalUnits} units has been sent to @${vendor_slug}. They will contact you shortly via MifimnPay.`,
      type: "success",
      onConfirm: () => {
        clearCart();
        router.push(`/${vendor_slug}`);
      }
    });
  };

  if (basket.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
          <CreditCard className="text-slate-400" size={32} />
        </div>
        <h2 className="text-2xl font-black uppercase italic dark:text-white tracking-tighter">Your list is <span className="text-brand-orange">empty</span></h2>
        <button 
          onClick={() => router.push(`/${vendor_slug}`)}
          className="mt-6 text-brand-orange font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
        >
          <ChevronLeft size={14} /> Back to Sourcing
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto p-4 lg:p-10">
      <div className="flex items-center gap-4 mb-10">
        <button onClick={() => router.back()} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-brand-orange transition-all">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Review <span className="text-brand-orange">Inquiry</span></h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Finalize your sourcing request</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                <User size={16} className="text-brand-orange" />
              </div>
              <h3 className="font-black uppercase italic text-sm dark:text-white">Delivery Details</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:border-brand-orange/50 dark:text-white" />
              <input type="text" placeholder="Phone Number" className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:border-brand-orange/50 dark:text-white" />
              <div className="md:col-span-2">
                <input type="text" placeholder="Shipping Address" className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:border-brand-orange/50 dark:text-white" />
              </div>
            </div>
          </section>

          {/* Item Review Feed */}
          <section className="space-y-4">
            <h3 className="font-black uppercase italic text-xs text-slate-400 tracking-widest px-4">Selected Assets</h3>
            {basket.map((item) => (
              <div key={item.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl p-2 shrink-0 border border-slate-100">
                  <img src={item.img} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-black uppercase dark:text-white truncate">{item.name}</h4>
                  <p className="text-brand-orange font-black text-sm">${item.price}</p>
                </div>
                <div className="text-right px-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Qty</p>
                  <p className="text-lg font-black dark:text-white">{item.quantity || 1}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* Right: Summary & Action */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[40px] p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-8">
              <ShieldCheck className="text-brand-orange" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Verified Sourcing</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Total Units</span>
                <span className="font-black dark:text-white">{totalUnits}</span>
              </div>
              <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-100 dark:border-white/5">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Processing Fee</span>
                <span className="font-black text-green-500 uppercase text-[10px]">Free</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                <span className="font-black uppercase italic text-xs dark:text-white">Est. Total</span>
                <span className="text-3xl font-black text-brand-orange tracking-tighter">${totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleProcessOrder}
              disabled={isSubmitting}
              className="w-full py-6 bg-brand-orange text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-glow-orange flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all mb-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Processing
                </>
              ) : (
                <>
                  Confirm Inquiry <Send size={18} />
                </>
              )}
            </button>
            
            <p className="text-center text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
              By confirming, you agree to @{vendor_slug}&apos;s sourcing terms and MifimnPay verified protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
