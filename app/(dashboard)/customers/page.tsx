"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, ArrowUpRight, Inbox, Loader2, User } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

// SYNCED TYPE: Matches public.customers schema
type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  total_spent: number;
  total_orders: number;
  created_at: string;
};

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. FETCH DATA FROM SUPABASE
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('vendor_id', user.id) // Scoped to currently logged-in vendor
          .order('total_spent', { ascending: false }); // Show top spenders first

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error("CRM Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user]);

  // 2. SEARCH LOGIC
  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-brand-black dark:text-white tracking-tight uppercase italic transition-colors duration-300">
          Customer Registry
        </h1>
        <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest transition-colors duration-300">
          Managing {customers.length} buyer profiles in your CRM.
        </p>
      </div>

      {/* Search Container */}
      <div className="flex items-center gap-4 bg-brand-paper dark:bg-white/5 p-2 rounded-2xl border border-brand-border dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input 
            type="text"
            placeholder="Search by name, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-14 pr-6 bg-transparent outline-none text-brand-black dark:text-white font-bold placeholder:text-brand-gray/50 transition-colors duration-300 text-sm"
          />
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-brand-paper dark:bg-[#0a0a0a] rounded-[32px] border border-brand-border dark:border-white/10 overflow-hidden shadow-sm min-h-[450px] transition-colors duration-300">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[450px] text-brand-gray">
            <Loader2 size={40} className="animate-spin mb-4 text-brand-orange" />
            <p className="text-[10px] font-black uppercase tracking-widest">Updating Ledger...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border dark:border-white/5 bg-brand-bg/50 dark:bg-white/5">
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-gray">Identity</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-gray hidden lg:table-cell">Communication</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-gray">Activity</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-gray">Investment</th>
                  <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-brand-gray text-right">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-white/5">
                <AnimatePresence>
                  {filteredCustomers.map((customer, idx) => (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-brand-bg dark:hover:bg-white/5 transition-colors group"
                    >
                      {/* Identity Section */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-brand-black dark:bg-brand-orange text-brand-paper flex items-center justify-center font-black text-sm uppercase italic shadow-sm">
                            {customer.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-black text-brand-black dark:text-white text-sm uppercase italic truncate max-w-[150px]">
                              {customer.full_name || 'Anonymous User'}
                            </p>
                            <p className="text-[10px] text-brand-gray font-bold uppercase tracking-tighter">
                              Joined {new Date(customer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Communication Section */}
                      <td className="px-8 py-5 hidden lg:table-cell">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase truncate max-w-[200px]">
                              <Mail size={12} className="text-brand-orange" /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-brand-gray uppercase">
                              <Phone size={12} className="text-brand-orange" /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Activity Section */}
                      <td className="px-8 py-5">
                         <span className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                           {customer.total_orders || 0} Successful Orders
                         </span>
                      </td>

                      {/* FINANCIAL SECTION: Correct Total Calculation */}
                      <td className="px-8 py-5">
                        <span className="font-mono font-black text-brand-black dark:text-brand-orange text-sm bg-brand-bg dark:bg-brand-orange/10 px-4 py-2 rounded-xl border border-brand-border dark:border-brand-orange/20 shadow-sm">
                          ₦{(Number(customer.total_spent) || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Insight Action */}
                      <td className="px-8 py-5 text-right">
                        <button className="p-3 text-brand-gray hover:text-brand-black dark:hover:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 rounded-xl transition-all active:scale-95">
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[450px] text-center px-6"
          >
            <div className="w-20 h-20 bg-brand-bg dark:bg-white/5 rounded-[32px] flex items-center justify-center text-brand-gray mb-6 border border-brand-border dark:border-white/10 shadow-inner">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-brand-black dark:text-white mb-2 uppercase italic tracking-tighter">Registry Empty</h3>
            <p className="text-[10px] font-bold text-brand-gray max-w-sm mx-auto mb-8 uppercase tracking-widest leading-relaxed">
              {searchQuery 
                ? "Zero matches found for that criteria." 
                : "Clients will appear here automatically as soon as a payment is confirmed via storefront or manual billing."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}