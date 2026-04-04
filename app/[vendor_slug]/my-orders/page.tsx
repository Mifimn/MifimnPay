"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  Package, ChevronLeft, Clock, CheckCircle, 
  XCircle, Loader2, MapPin, CreditCard, ExternalLink, 
  MessageCircle, Truck, User, ShoppingBag, Fingerprint
} from 'lucide-react';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  const { themeColor } = useThemeStore();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [customerRecord, setCustomerRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Vendor Details to get the internal ID
  useEffect(() => {
    const fetchVendor = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, business_name')
        .eq('slug', vendor_slug)
        .single();
      if (data) setVendor(data);
    };
    if (vendor_slug) fetchVendor();
  }, [vendor_slug]);

  // 2. Fetch Customer Specific Data & Orders using Double-Link logic
  useEffect(() => {
    if (authLoading || !vendor) return;

    if (!user) {
      router.push(`/${vendor_slug}/login?redirect=/${vendor_slug}/my-orders`);
      return;
    }

    const fetchCustomerPortalData = async () => {
      try {
        // Find the CRM record for this user in this store context
        const { data: customer } = await supabase
          .from('customers')
          .select('*')
          .eq('auth_id', user.id)
          .eq('vendor_id', vendor.id)
          .maybeSingle();

        if (customer) setCustomerRecord(customer);

        // Fetch Orders using BOTH customer_id (Auth) and customer_crm_id (CRM link)
        const { data: ordersData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendor.id)
          .or(`customer_id.eq.${user.id}${customer ? `,customer_crm_id.eq.${customer.id}` : ''}`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(ordersData || []);
      } catch (error) {
        console.error("Error fetching customer portal data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerPortalData();
  }, [user, authLoading, vendor, router, vendor_slug]);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'completed': return { icon: <CheckCircle size={14} />, text: 'Delivered & Confirmed', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
      case 'shipped': return { icon: <Truck size={14} />, text: 'Shipped / At Park', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
      case 'processing': return { icon: <Package size={14} />, text: 'Payment Verified', color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20' };
      case 'cancelled': return { icon: <XCircle size={14} />, text: 'Cancelled', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
      default: return { icon: <Clock size={14} />, text: 'Awaiting Payment', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
    }
  };

  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-10 pb-32 min-h-screen">

      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-8 mt-6">
        <button onClick={() => router.push(`/${vendor_slug}`)} className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter dark:text-white">
            Customer <span style={{ color: themeColor }}>Portal</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {vendor?.business_name || vendor_slug} Verified Account
          </p>
        </div>
      </div>

      {/* Customer Profile Header Section */}
      <section className="mb-12">
        <div className="bg-slate-900 dark:bg-brand-orange/5 border border-white/10 rounded-[32px] p-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 blur-[60px] rounded-full" />

          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 flex items-center justify-center text-white shadow-inner">
              <User size={40} strokeWidth={1.5} />
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                {customerRecord?.full_name || user?.email?.split('@')[0]}
              </h2>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Fingerprint size={12} className="text-brand-orange" />
                  <span>Verified Buyer</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShoppingBag size={12} className="text-brand-orange" />
                  <span>{orders.length} Total Orders</span>
                </div>
              </div>
            </div>

            <div className="pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-8">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Registered Email</p>
               <p className="text-sm font-bold text-white lowercase">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 flex items-center gap-2">
        <Clock size={14} /> Order Manifest
      </h3>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-black/20 flex items-center justify-center mb-6">
            <Package size={32} className="text-slate-300" />
          </div>
          <h2 className="text-lg font-black uppercase italic dark:text-white mb-2">Manifest Empty</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">No order history detected for this account.</p>
          <button onClick={() => router.push(`/${vendor_slug}`)} className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all" style={{ backgroundColor: themeColor }}>Return to Shop</button>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order, idx) => {
            const statusConfig = getStatusDisplay(order.status);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                key={order.id} 
                className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-wrap gap-6 items-center justify-between">
                  <div className="flex gap-6">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Reference</span>
                      <p className="font-mono font-bold text-sm dark:text-white uppercase tracking-wider">#{order.short_id}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Timestamp</span>
                      <p className="font-bold text-sm dark:text-white">{dayjs(order.created_at).format('DD/MM/YYYY')}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Paid</span>
                      {/* FIXED: Robust Number conversion for the order total */}
                      <p className="font-black text-sm text-brand-orange">₦{Number(order.total_amount || 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${statusConfig.color}`}>
                    {statusConfig.icon} {statusConfig.text}
                  </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-12">
                  {/* Items List */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5 border-b border-slate-100 dark:border-white/5 pb-2">Line Items</h4>
                    <div className="space-y-4">
                      {order.items.map((item: any, i: number) => {
                        // FIXED: Looking for 'qty', and relying on the final 'price' saved by checkout
                        const itemQty = Number(item.qty || item.quantity || 1);
                        const unitPrice = Number(item.price || 0);

                        return (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10 shrink-0 flex items-center justify-center">
                              {/* FIXED: Fallback logic for missing images */}
                              {(item.img || item.image_url) ? (
                                <img src={item.img || item.image_url} alt={item.name} className="w-full h-full object-contain rounded-lg" />
                              ) : (
                                <span className="text-xl font-black text-slate-300 dark:text-slate-600 uppercase">
                                  {item.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black uppercase dark:text-white truncate">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">₦{unitPrice.toLocaleString()} x {itemQty}</p>
                            </div>
                            <p className="text-xs font-black dark:text-white">₦{(unitPrice * itemQty).toLocaleString()}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Logistics Details</h4>
                      <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-inner">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-white dark:bg-white/5 rounded-lg shadow-sm border border-slate-100 dark:border-white/10">
                            {order.shipping_location ? <Truck size={16} className="text-brand-orange" /> : <MessageCircle size={16} className="text-brand-orange" />}
                          </div>
                          <span className="text-xs font-black uppercase dark:text-white">
                            {order.shipping_location || 'WhatsApp Negotiation'}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter ml-11 italic">{order.shipping_lga}, {order.shipping_state}</p>
                      </div>
                    </div>

                    {/* SECURE DELIVERY PIN BLOCK */}
                    {order.status !== 'cancelled' && (
                      <div className={`p-6 rounded-[28px] border-2 flex items-center justify-between transition-all ${order.status === 'completed' ? 'bg-green-500/5 border-green-500/20' : 'bg-blue-500/5 border-blue-500/20'}`}>
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                             {order.status === 'completed' ? 'Fulfillment Closed' : 'Secure Delivery PIN'}
                          </p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase leading-tight max-w-[160px]">
                            {order.status === 'completed' 
                              ? 'Verification successful.' 
                              : 'Provide this code to the rider to confirm your delivery.'}
                          </p>
                        </div>
                        <div className={`px-5 py-3 rounded-2xl shadow-sm text-xl font-mono font-black tracking-[0.25em] border-2 ${order.status === 'completed' ? 'bg-green-500 text-white border-green-600' : 'bg-white dark:bg-black text-slate-900 dark:text-white border-blue-200 dark:border-blue-500/30'}`}>
                          {order.short_id}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
