"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingBag, Filter, MoreHorizontal, ArrowUpRight, 
  Loader2, Clock, CheckCircle, XCircle, Truck, MapPin, 
  Bus, CreditCard, Eye, Trash2, ExternalLink, X 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  shipping_fee: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'awaiting_confirmation' | 'paid' | 'failed';
  payment_method: 'paystack' | 'manual';
  delivery_method: 'landmark' | 'park' | 'whatsapp';
  delivery_location: string;
  lga: string;
  state: string;
  receipt_url: string | null;
  created_at: string;
  items: any[];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const handleUpdateStatus = async (orderId: string, newStatus: string, receiptPath?: string | null) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') updates.payment_status = 'paid';

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;

      // If manual payment confirmed, delete the receipt to save storage
      if (newStatus === 'completed' && receiptPath) {
        await supabase.storage.from('payment-proofs').remove([receiptPath]);
      }

      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates, receipt_url: newStatus === 'completed' ? null : o.receipt_url } : o));
      setSelectedOrder(null);
    } catch (err) {
      alert("Update failed");
    }
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-1">
            Orders <span className="text-brand-orange">&</span> Logistics
          </h1>
          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase transition-colors duration-300">
            Smart Logistics & Payment Management
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm w-fit">
        {(['all', 'pending', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              filter === t ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm min-h-[450px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[450px]">
            <Loader2 size={40} className="animate-spin text-brand-orange mb-4" />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Order Information</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Payment</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {filteredOrders.map((order, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}
                    key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-bold text-brand-orange mb-1">#{order.id.slice(0, 8)}</span>
                        <p className="font-black text-sm text-slate-900 dark:text-white uppercase italic">{order.customer_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{order.items?.length || 0} Assets • {order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          {order.delivery_method === 'park' ? <Bus size={14} className="text-brand-orange" /> : <MapPin size={14} className="text-brand-orange" />}
                          <span className="text-[10px] font-black uppercase tracking-tight">{order.delivery_location}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">{order.lga}, {order.state}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-slate-900 dark:text-white tracking-tighter">₦{(order.total_amount).toLocaleString()}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CreditCard size={10} className="text-slate-400" />
                          <span className="text-[9px] font-black uppercase text-slate-500">{order.payment_method}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-3 bg-slate-100 dark:bg-white/10 rounded-xl text-slate-500 hover:text-brand-orange transition-all active:scale-95"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[450px] text-center px-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center text-slate-400 mb-6 border border-slate-200 dark:border-white/10">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Empty Manifest</h3>
            <p className="text-[10px] font-bold text-slate-500 max-w-sm mt-2 uppercase tracking-widest">No logistics requests detected on your storefront.</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-[#0f0f0f] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 overflow-y-auto">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em]">Transaction Review</span>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Order Detail</h2>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-3 bg-slate-100 dark:bg-white/10 rounded-2xl"><X size={20}/></button>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Customer & Location */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sourcing Agent</h4>
                      <p className="font-black text-lg text-slate-900 dark:text-white">{selectedOrder.customer_name}</p>
                      <p className="text-sm font-bold text-slate-500">{selectedOrder.customer_phone}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logistics Info</h4>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck size={14} className="text-brand-orange" />
                        <span className="text-sm font-black uppercase text-slate-900 dark:text-white">{selectedOrder.delivery_method}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-500 italic">{selectedOrder.delivery_location}, {selectedOrder.lga}, {selectedOrder.state}</p>
                    </div>
                  </div>

                  {/* Payment Receipt Review */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification Asset</h4>
                    {selectedOrder.receipt_url ? (
                      <div className="relative group aspect-square rounded-3xl overflow-hidden border border-white/10 bg-black">
                        <img src={selectedOrder.receipt_url} alt="Receipt" className="w-full h-full object-cover opacity-80" />
                        <a href={selectedOrder.receipt_url} target="_blank" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                          <ExternalLink className="text-white" size={24} />
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/5">
                        <CreditCard size={24} className="text-slate-300 mb-2" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {selectedOrder.payment_method === 'paystack' ? 'Automated Verified' : 'Receipt Deleted / Not Uploaded'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-white/5">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assets Requested</h4>
                   <div className="space-y-4">
                     {selectedOrder.items.map((item: any, i: number) => (
                       <div key={i} className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-xl p-1 border border-white/10"><img src={item.img} className="w-full h-full object-contain" /></div>
                           <span className="text-xs font-black uppercase text-slate-900 dark:text-white">{item.name} <span className="text-slate-400 text-[10px]">x{item.quantity}</span></span>
                         </div>
                         <span className="text-xs font-bold text-brand-orange">₦{(item.price * item.quantity).toLocaleString()}</span>
                       </div>
                     ))}
                   </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex gap-4">
                {selectedOrder.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                      className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/10 hover:bg-red-500/20 transition-all"
                    >
                      Reject Order
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'completed', selectedOrder.receipt_url)}
                      className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-brand-orange shadow-glow-orange hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Confirm Payment
                    </button>
                  </>
                )}
                {selectedOrder.status !== 'pending' && (
                  <button onClick={() => setSelectedOrder(null)} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/10">Close Detail</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
