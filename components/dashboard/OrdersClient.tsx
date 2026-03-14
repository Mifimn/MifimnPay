"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function OrdersClient() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      const { data } = await supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setOrders(data || []);
      setIsLoading(false);
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-black text-brand-black uppercase italic mb-1">Storefront Orders</h1>
        <p className="text-sm font-bold text-brand-gray uppercase">Track incoming storefront purchases.</p>
      </div>
      <div className="bg-brand-paper rounded-[32px] border border-brand-border overflow-hidden shadow-sm min-h-[450px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-[450px]"><Loader2 size={40} className="animate-spin text-brand-black" /></div>
        ) : filteredOrders.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-border bg-brand-bg/30">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-brand-gray">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-brand-gray">Total</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-brand-gray">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-brand-border hover:bg-brand-bg/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-brand-black">{order.customer_name}</td>
                  <td className="px-8 py-5 font-mono font-bold text-brand-black">₦{order.total_amount.toLocaleString()}</td>
                  <td className="px-8 py-5"><span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-brand-black/5 border border-brand-border">{order.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-[450px]"><ShoppingBag size={32} className="text-brand-gray mb-4" /><h3 className="text-xl font-black text-brand-black uppercase italic">No orders yet</h3></div>
        )}
      </div>
    </div>
  );
}
