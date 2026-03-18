"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { 
  Package, ChevronLeft, Clock, CheckCircle, 
  XCircle, Loader2, MapPin, CreditCard, ExternalLink, MessageCircle, Truck
} from 'lucide-react';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import dayjs from 'dayjs'; // Make sure you have dayjs installed: npm install dayjs

export default function CustomerOrdersPage() {
  const router = useRouter();
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  const { themeColor } = useThemeStore();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<any[]>([]);
  const [vendor, setVendor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Vendor Details
  useEffect(() => {
    const fetchVendor = async () => {
      const { data } = await supabase.from('profiles').select('id, business_name').eq('slug', vendor_slug).single();
      if (data) setVendor(data);
    };
    if (vendor_slug) fetchVendor();
  }, [vendor_slug]);

  // 2. Auth Check & Fetch Orders
  useEffect(() => {
    if (authLoading || !vendor) return;

    if (!user) {
      router.push(`/${vendor_slug}/login?redirect=/${vendor_slug}/my-orders`);
      return;
    }

    const fetchMyOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', vendor.id)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyOrders();
  }, [user, authLoading, vendor, router, vendor_slug]);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'completed': return { icon: <CheckCircle size={14} />, text: 'Confirmed & Paid', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
      case 'cancelled': return { icon: <XCircle size={14} />, text: 'Cancelled', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
      default: return { icon: <Clock size={14} />, text: 'Pending / Processing', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    }
  };

  if (authLoading || isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin text-slate-400" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-10 pb-32 min-h-[80vh]">

      {/* Header */}
      <div className="flex items-center gap-4 mb-10 mt-6">
        <button onClick={() => router.push(`/${vendor_slug}`)} className="p-3 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-white">
            My <span style={{ color: themeColor }}>Purchases</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {vendor?.business_name || vendor_slug}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[40px] p-12 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-[32px] bg-slate-50 dark:bg-white/5 flex items-center justify-center mb-6 border border-slate-200 dark:border-white/10">
            <Package size={40} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-xl font-black uppercase italic dark:text-white mb-2">No Orders Found</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8 max-w-xs">
            You haven't placed any orders with this store yet.
          </p>
          <button 
            onClick={() => router.push(`/${vendor_slug}`)}
            className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
            style={{ backgroundColor: themeColor }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, idx) => {
            const statusConfig = getStatusDisplay(order.status);
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                key={order.id} 
                className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm"
              >
                {/* Order Header */}
                <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-wrap gap-4 items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                    <p className="font-mono font-bold text-sm dark:text-white uppercase tracking-wider">#{order.id.split('-')[0]}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Placed</span>
                    <p className="font-bold text-sm dark:text-white">{dayjs(order.created_at).format('MMM D, YYYY')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <p className="font-black text-sm dark:text-white" style={{ color: themeColor }}>₦{(order.total_amount).toLocaleString()}</p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${statusConfig.color}`}>
                    {statusConfig.icon} {statusConfig.text}
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6 grid md:grid-cols-2 gap-8">
                  {/* Items */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assets Ordered</h4>
                    <div className="space-y-3">
                      {order.items.map((item: any, i: number) => {
                        const price = item.wholesale_price && item.quantity >= (item.moq || 0) ? item.wholesale_price : item.price;
                        return (
                          <div key={i} className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-2 rounded-2xl border border-slate-100 dark:border-white/5">
                            <div className="w-12 h-12 bg-white rounded-xl p-1 border border-slate-200 dark:border-white/10 shrink-0">
                              <img src={item.img || item.image_url} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black uppercase dark:text-white truncate">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-500">Qty: {item.quantity} <span className="mx-1">•</span> ₦{(price * item.quantity).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Logistics & Payment */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Delivery Information</h4>
                      <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          {order.shipping_location ? <Truck size={14} className="text-slate-400" /> : <MessageCircle size={14} className="text-slate-400" />}
                          <span className="text-xs font-black uppercase dark:text-white">
                            {order.shipping_location || 'WhatsApp Delivery Negotiation'}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{order.shipping_lga}, {order.shipping_state}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Method</h4>
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                        <CreditCard size={14} className="text-slate-400" />
                        <span className="text-xs font-black uppercase dark:text-white">{order.payment_method === 'manual' ? 'Bank Transfer' : 'Automated Verification'}</span>
                      </div>
                    </div>
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