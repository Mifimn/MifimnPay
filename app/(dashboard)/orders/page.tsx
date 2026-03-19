"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingBag, Filter, MoreHorizontal, ArrowUpRight, 
  Loader2, Clock, CheckCircle, XCircle, Truck, MapPin, 
  Bus, CreditCard, Eye, Trash2, ExternalLink, X, MessageCircle, Key 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

// 1. TYPE DEFINITION
type Order = {
  id: string;
  short_id: string; 
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  shipping_fee: number;
  shipping_state: string;
  shipping_lga: string;
  shipping_location: string | null;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'awaiting_confirmation' | 'paid' | 'failed';
  payment_method: 'paystack' | 'manual';
  receipt_url: string | null;
  created_at: string;
  items: any[];
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'completed'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // State for Delivery PIN input
  const [deliveryPin, setDeliveryPin] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('vendor_id', user.id) // Fetches orders for this vendor
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

  const handleUpdateStatus = async (orderId: string, newStatus: string, receiptUrl?: string | null) => {
    try {
      const updates: any = { status: newStatus };

      // Auto-mark as paid if it enters processing, shipped, or completed
      if (['processing', 'shipped', 'completed'].includes(newStatus)) {
        updates.payment_status = 'paid';
      }

      const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
      if (error) throw error;

      // Storage Cleanup: Remove receipt image only when order is officially completed/closed
      if (newStatus === 'completed' && receiptUrl) {
        // Extract the file path from the public URL
        const parts = receiptUrl.split('/receipts/');
        if (parts.length > 1) {
          const filePath = parts[1];
          await supabase.storage.from('receipts').remove([filePath]);
        }
      }

      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updates, receipt_url: newStatus === 'completed' ? null : o.receipt_url } : o));
      setSelectedOrder(null);
    } catch (err) {
      alert("Update failed. Please check your connection.");
    }
  };

  const handleVerifyDelivery = async (order: Order) => {
    if (deliveryPin.trim().toUpperCase() !== order.short_id.toUpperCase()) {
      return alert("Invalid Delivery PIN! Please ask the rider to confirm the code with the customer.");
    }
    await handleUpdateStatus(order.id, 'completed', order.receipt_url);
    setDeliveryPin('');
    alert("PIN Verified! Order successfully marked as Completed.");
  };

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'shipped': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'processing': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-1">
            Orders <span className="text-brand-orange">&</span> Logistics
          </h1>
          <p className="text-[10px] font-black text-slate-500 tracking-widest uppercase mt-1">
            Smart Logistics & Escrow Management
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm w-fit overflow-x-auto max-w-full no-scrollbar">
        {(['all', 'pending', 'processing', 'shipped', 'completed'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === t ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table Container */}
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
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Order Ref</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Logistics</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Total</th>
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
                        <span className="font-mono text-[10px] font-bold text-brand-orange mb-1">#{order.short_id}</span>
                        <p className="font-black text-sm text-slate-900 dark:text-white uppercase italic">{order.customer_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{order.items?.length || 0} items • {order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          {order.shipping_location ? (
                            <><MapPin size={14} className="text-brand-orange" /><span className="text-[10px] font-black uppercase tracking-tight">{order.shipping_location}</span></>
                          ) : (
                            <><MessageCircle size={14} className="text-brand-orange" /><span className="text-[10px] font-black uppercase tracking-tight">WhatsApp Manual</span></>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase italic">{order.shipping_lga}, {order.shipping_state}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-slate-900 dark:text-white tracking-tighter">₦{(order.total_amount).toLocaleString()}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <CreditCard size={10} className="text-slate-400" />
                          <span className="text-[9px] font-black uppercase text-slate-500">{order.payment_status}</span>
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
                        onClick={() => { setSelectedOrder(order); setDeliveryPin(''); }}
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
            <p className="text-[10px] font-bold text-slate-500 max-w-sm mt-2 uppercase tracking-widest">No orders matching this filter.</p>
          </div>
        )}
      </div>

      {/* Modal View */}
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
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sourcing Agent</h4>
                      <p className="font-black text-lg text-slate-900 dark:text-white">{selectedOrder.customer_name}</p>
                      <p className="text-sm font-bold text-slate-500">{selectedOrder.customer_phone}</p>
                      {selectedOrder.customer_address && (
                        <p className="text-xs font-medium text-slate-500 mt-1">{selectedOrder.customer_address}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logistics Info</h4>
                      <div className="flex items-center gap-2 mb-1">
                        {selectedOrder.shipping_location ? <Truck size={14} className="text-brand-orange" /> : <MessageCircle size={14} className="text-brand-orange" />}
                        <span className="text-sm font-black uppercase text-slate-900 dark:text-white">
                          {selectedOrder.shipping_location || "WhatsApp Negotiated"}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-500 italic">{selectedOrder.shipping_lga}, {selectedOrder.shipping_state}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Verification Asset</h4>
                    {selectedOrder.receipt_url ? (
                      <div className="relative group aspect-square rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-black">
                        <img src={selectedOrder.receipt_url} alt="Receipt" className="w-full h-full object-cover" />
                        <a href={selectedOrder.receipt_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-all">
                          <ExternalLink className="text-white" size={24} />
                        </a>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 dark:bg-white/5">
                        <CreditCard size={24} className="text-slate-300 mb-2" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">
                          {selectedOrder.payment_method === 'paystack' ? 'Automated Verified' : 'No Receipt Uploaded'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-white/5">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Assets Requested</h4>
                   <div className="space-y-4">
                     {selectedOrder.items.map((item: any, i: number) => {
                       const isWholesale = item.wholesale_price && item.quantity >= (item.moq || 1);
                       const unitPrice = isWholesale ? (item.wholesale_price / (item.moq || 1)) : Number(item.price);
                       const lineTotal = unitPrice * item.quantity;

                       return (
                         <div key={i} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-white rounded-xl p-1 border border-slate-200 dark:border-white/10">
                               <img src={item.img || item.image_url} className="w-full h-full object-contain" alt="" />
                             </div>
                             <span className="text-xs font-black uppercase text-slate-900 dark:text-white">
                               {item.name} <span className="text-slate-400 text-[10px]">x{item.quantity}</span>
                             </span>
                           </div>
                           <span className="text-xs font-bold text-brand-orange">₦{Math.round(lineTotal).toLocaleString()}</span>
                         </div>
                       );
                     })}
                   </div>

                   <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-1 items-end">
                      <p className="text-[10px] font-black uppercase text-slate-400">Shipping: ₦{(selectedOrder.shipping_fee || 0).toLocaleString()}</p>
                      <p className="text-sm font-black uppercase italic dark:text-white">Total: <span className="text-brand-orange">₦{(selectedOrder.total_amount).toLocaleString()}</span></p>
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
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                      className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-brand-orange shadow-glow-orange hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Confirm Payment
                    </button>
                  </>
                )}

                {selectedOrder.status === 'processing' && (
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                    className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Truck size={16} /> Dispatch to Logistics
                  </button>
                )}

                {selectedOrder.status === 'shipped' && (
                  <div className="w-full flex flex-col sm:flex-row gap-3">
                    <input 
                      type="text" 
                      placeholder="Enter Delivery PIN" 
                      value={deliveryPin}
                      onChange={(e) => setDeliveryPin(e.target.value)}
                      maxLength={6}
                      className="flex-1 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-4 text-center font-mono font-black text-lg text-slate-900 dark:text-white outline-none focus:border-green-500 transition-colors uppercase placeholder:text-[10px] placeholder:font-sans"
                    />
                    <button 
                      onClick={() => handleVerifyDelivery(selectedOrder)}
                      disabled={deliveryPin.length < 6}
                      className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Key size={16} /> Verify PIN
                    </button>
                  </div>
                )}

                {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                  <button onClick={() => setSelectedOrder(null)} className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">Close Detail</button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}