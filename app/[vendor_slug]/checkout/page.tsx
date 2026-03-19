"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, Send, ShieldCheck, MapPin, Phone, 
  User, CreditCard, Loader2, ChevronDown, Image as ImageIcon, CheckCircle, MessageCircle
} from 'lucide-react';
import { useCartStore } from '@/src/storefront/store/useCartStore';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { NIGERIA_STATES_LGA } from '@/lib/nigeria-data'; 

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  const { themeColor } = useThemeStore();
  const { user } = useAuth();
  const { basket, clearCart } = useCartStore();

  const [vendor, setVendor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', address: '' });
  const [shipping, setShipping] = useState({ state: '', lga: '', location: '', method: 'whatsapp', fee: 0 });
  const [availableOptions, setAvailableOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendor_slug) return;
      const { data } = await supabase
        .from('profiles')
        .select('id, business_name, business_phone, bank_name, account_number, account_name, whatsapp_only, logistics_config')
        .eq('slug', vendor_slug)
        .single();
      if (data) setVendor(data);
    };
    fetchVendor();
  }, [vendor_slug]);

  useEffect(() => {
    if (!vendor || !shipping.state || !shipping.lga) {
      setShipping(prev => ({ ...prev, method: 'whatsapp', fee: 0, location: '' }));
      setAvailableOptions([]);
      return;
    }

    if (vendor.whatsapp_only) {
      setShipping(prev => ({ ...prev, method: 'whatsapp', fee: 0, location: '' }));
      return;
    }

    const config = vendor.logistics_config || [];
    const matchedZone = config.find((z: any) => z.state === shipping.state && z.lga === shipping.lga);

    if (matchedZone) {
      setShipping(prev => ({ 
        ...prev, 
        method: matchedZone.method, 
        fee: Number(matchedZone.price) || 0,
        location: '' 
      }));
      setAvailableOptions(matchedZone.options ? matchedZone.options.split(',').map((o:string) => o.trim()) : []);
    } else {
      setShipping(prev => ({ ...prev, method: 'whatsapp', fee: 0, location: '' }));
      setAvailableOptions([]);
    }
  }, [shipping.state, shipping.lga, vendor]);

  const subtotal = basket.reduce((acc, item) => {
    const isWholesale = item.wholesale_price && item.quantity >= (item.moq || 1);
    const unitPrice = isWholesale ? (item.wholesale_price! / (item.moq || 1)) : Number(item.price);
    return acc + (unitPrice * item.quantity);
  }, 0);

  const totalPrice = subtotal + shipping.fee;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleProcessOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (basket.length === 0) return alert("Your cart is empty.");
    if (!customerInfo.name || !customerInfo.phone || !shipping.state || !shipping.lga) {
      return alert("Please fill in all contact and shipping details.");
    }
    if (!receiptFile && shipping.method !== 'whatsapp') {
      return alert("Please upload your payment receipt to confirm the order.");
    }

    setIsSubmitting(true);
    try {
      let uploadedReceiptUrl = null;

      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${vendor.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(filePath);
        uploadedReceiptUrl = publicUrlData.publicUrl;
      }

      // 2. Insert Order (Trigger will handle receipt/CRM auto-sync)
      const { error: dbError } = await supabase.from('orders').insert([{
        vendor_id: vendor.id,
        customer_id: user?.id || null,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        shipping_state: shipping.state,
        shipping_lga: shipping.lga,
        shipping_location: shipping.location,
        shipping_fee: shipping.fee,
        total_amount: totalPrice,
        payment_method: 'manual',
        status: 'pending', // Explicitly start at pending
        receipt_url: uploadedReceiptUrl,
        items: basket
      }]);

      if (dbError) throw dbError;

      clearCart();
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to process order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vendor) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

  return (
    <>
      <div className="max-w-[1200px] mx-auto p-4 lg:p-10 pb-32 relative">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.back()} className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">Secure <span style={{ color: themeColor }}>Checkout</span></h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storefront Verified</p>
          </div>
        </div>

        <form onSubmit={handleProcessOrder} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="font-black uppercase italic text-sm dark:text-white flex items-center gap-2">
                <User size={18} style={{ color: themeColor }} /> 1. Logistics Contact Info
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Receiver's Name</label>
                  <input required type="text" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-orange transition-colors" placeholder="e.g. John Doe" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Receiver's Phone</label>
                  <input required type="tel" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full h-12 px-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-orange transition-colors" placeholder="e.g. +234..." />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Address (Optional)</label>
                <textarea value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-brand-orange transition-colors resize-none h-20" placeholder="Full house address..." />
              </div>
            </section>

            <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="font-black uppercase italic text-sm dark:text-white flex items-center gap-2">
                <MapPin size={18} style={{ color: themeColor }} /> 2. Delivery Zone
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <select 
                    required
                    value={shipping.state} 
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value, lga: '' })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-xs font-bold outline-none appearance-none dark:text-white text-slate-900"
                  >
                    <option value="">Select State</option>
                    {Object.keys(NIGERIA_STATES_LGA).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>

                <div className="relative">
                  <select 
                    required
                    disabled={!shipping.state}
                    value={shipping.lga} 
                    onChange={(e) => setShipping({ ...shipping, lga: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-xs font-bold outline-none appearance-none dark:text-white disabled:opacity-30 text-slate-900"
                  >
                    <option value="">Select LGA</option>
                    {shipping.state && NIGERIA_STATES_LGA[shipping.state].map((lga: string) => <option key={lga} value={lga}>{lga}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              {shipping.lga && (
                <AnimatePresence mode="wait">
                  {shipping.method === 'whatsapp' ? (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-orange-50 dark:bg-brand-orange/10 border border-orange-200 dark:border-brand-orange/20 rounded-xl">
                      <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest leading-relaxed">
                        Delivery to this area requires manual calculation. The vendor will negotiate the delivery fee with you on WhatsApp.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative">
                      <select 
                        required
                        value={shipping.location}
                        onChange={(e) => setShipping({ ...shipping, location: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl py-4 px-6 text-xs font-bold dark:text-white text-slate-900 outline-none appearance-none"
                      >
                        <option value="">Select {shipping.method === 'landmark' ? 'Nearest Landmark' : 'Pickup Park'}</option>
                        {availableOptions.map((opt: string) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </section>

            <section className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
              <h3 className="font-black uppercase italic text-sm dark:text-white flex items-center gap-2">
                <CreditCard size={18} style={{ color: themeColor }} /> 3. Secure Payment
              </h3>

              {shipping.method === 'whatsapp' ? (
                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 text-center space-y-2">
                  <MessageCircle size={32} className="mx-auto text-slate-300 dark:text-white/20 mb-4" />
                  <h4 className="text-sm font-black uppercase italic dark:text-white">Payment Deferred</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Because shipping needs to be negotiated, you will pay the vendor directly on WhatsApp once the final total is confirmed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-2">Direct Transfer Details</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black dark:text-white uppercase">{vendor.bank_name || 'Bank Not Set'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-black italic tracking-widest" style={{ color: themeColor }}>{vendor.account_number || '0000000000'}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-right max-w-[150px] truncate">
                        {vendor.account_name || 'Account Name'}
                      </span>
                    </div>
                  </div>

                  <div className="relative h-48 group border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center hover:border-brand-orange/40 transition-all cursor-pointer bg-slate-50/50 dark:bg-white/5 overflow-hidden">
                    {receiptPreview ? (
                      <img src={receiptPreview} alt="Receipt" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="text-slate-300 dark:text-slate-500 mb-3" size={32} />
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Upload Receipt Screenshot</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-3xl border border-slate-200 dark:border-white/10 rounded-[40px] p-6 lg:p-8 shadow-2xl">
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-8">
                <div className="p-2 bg-green-500/10 text-green-500 rounded-full shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Store Support Line</p>
                  <p className="text-sm font-bold dark:text-white">{vendor.business_phone || 'Not Provided'}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500">
                  <span>Items Subtotal</span>
                  <span className="text-slate-900 dark:text-white">₦{Math.round(subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 pb-4 border-b border-slate-200 dark:border-white/5">
                  <span>Shipping Fee</span>
                  <span className="text-slate-900 dark:text-white">{shipping.fee > 0 ? `₦${shipping.fee.toLocaleString()}` : 'Negotiable'}</span>
                </div>
                <div className="pt-2 flex justify-between items-end">
                  <span className="font-black uppercase italic text-xs text-slate-900 dark:text-white">Total</span>
                  <span className="text-3xl font-black tracking-tighter" style={{ color: themeColor }}>₦{Math.round(totalPrice).toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-white rounded-[24px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (
                  <>Confirm Order <CheckCircle size={18}/></>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2">
                <ShieldCheck size={12} className="text-green-500" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">MifimnPay Verified Storefront</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-[#0a0a0a] rounded-[40px] p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border border-slate-200 dark:border-white/10"
            >
              <div className="w-24 h-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                <CheckCircle size={48} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">Order Placed!</h3>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-3 leading-relaxed">
                  Your order has been securely sent to the vendor. Give your order ID to the rider upon delivery.
                </p>
              </div>
              <div className="pt-2">
                <button 
                  onClick={() => router.push(`/${vendor_slug}/my-orders`)} 
                  className="w-full py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                  style={{ backgroundColor: themeColor }}
                >
                  View My Orders
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}