"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Filter, MoreHorizontal, ArrowUpRight, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

type Order = {
  id: string;
  customer_name: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items: any[];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Order fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-brand-black/5 text-brand-gray border-brand-border';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-black tracking-tight uppercase italic transition-colors duration-300 mb-1">
            Storefront Orders
          </h1>
          <p className="text-sm font-bold text-brand-gray tracking-wide uppercase transition-colors duration-300">
            Track and process incoming storefront purchases.
          </p>
        </div>
      </div>

      <div className="flex p-1.5 bg-brand-paper border border-brand-border rounded-2xl shadow-sm w-fit transition-colors duration-300">
        {(['all', 'pending', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              filter === t ? 'bg-brand-black text-brand-paper shadow-md' : 'text-brand-gray hover:text-brand-black'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-brand-paper rounded-[32px] border border-brand-border overflow-hidden shadow-sm min-h-[450px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[450px]">
            <Loader2 size={40} className="animate-spin text-brand-black mb-4" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/30">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Order ID</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Customer</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Total</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-gray text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                    key={order.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg/50 transition-colors group"
                  >
                    <td className="px-8 py-5 font-mono text-xs font-bold text-brand-black">#{order.id.slice(0, 8)}</td>
                    <td className="px-8 py-5">
                      <p className="font-bold text-sm text-brand-black">{order.customer_name}</p>
                      <p className="text-[10px] text-brand-gray font-black uppercase">{order.items?.length || 0} Items</p>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-brand-black">₦{order.total_amount.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right text-xs font-bold text-brand-gray">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[450px] text-center px-6">
            <div className="w-20 h-20 bg-brand-bg rounded-[24px] flex items-center justify-center text-brand-gray mb-6 border border-brand-border">
              <ShoppingBag size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-brand-black uppercase italic tracking-tight">No orders yet</h3>
            <p className="text-sm font-medium text-brand-gray max-w-sm mt-2">When customers purchase from your store, they'll appear here instantly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
