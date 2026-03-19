"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, ArrowUpRight, Inbox, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

// 1. UPDATED TYPE DEFINITION TO MATCH NEW SQL SCHEMA
type Customer = {
  id: string;
  full_name: string; // Matches 'full_name' in your SQL
  email: string | null;
  phone: string | null;
  total_spent: number;
  total_orders: number; // Added to match schema
  created_at: string;
};

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('vendor_id', user.id) // SYNCED: Uses vendor_id to match your profiles link
          .order('created_at', { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, [user]);

  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-brand-black dark:text-white tracking-tight uppercase italic transition-colors duration-300">
          Customers
        </h1>
        <p className="text-sm font-bold text-brand-gray tracking-wide uppercase transition-colors duration-300">
          Manage your buyers and track their lifetime value.
        </p>
      </div>

      {/* Controls / Search Bar */}
      <div className="flex items-center gap-4 bg-brand-paper dark:bg-white/5 p-2 rounded-2xl border border-brand-border dark:border-white/10 shadow-sm transition-colors duration-300">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input 
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-brand-black dark:text-white font-medium placeholder:text-brand-gray/60 transition-colors duration-300"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-brand-paper dark:bg-[#0a0a0a] rounded-3xl border border-brand-border dark:border-white/10 overflow-hidden shadow-sm min-h-[400px] transition-colors duration-300">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-brand-gray">
            <Loader2 size={40} className="animate-spin mb-4 text-brand-orange" />
            <p className="text-sm font-bold uppercase tracking-widest">Accessing CRM Database...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border dark:border-white/5 bg-brand-bg/50 dark:bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray">Orders</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray">Total Spent</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredCustomers.map((customer, idx) => (
                    <motion.tr 
                      key={customer.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-brand-border dark:border-white/5 last:border-0 hover:bg-brand-bg dark:hover:bg-white/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-black dark:bg-brand-orange text-brand-paper flex items-center justify-center font-black text-sm uppercase shadow-sm">
                            {customer.full_name?.charAt(0) || 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-brand-black dark:text-white text-sm">{customer.full_name}</p>
                            <p className="text-xs text-brand-gray font-medium md:hidden">{customer.phone || customer.email || 'No contact'}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="space-y-1">
                          {customer.email && (
                            <div className="flex items-center gap-2 text-xs text-brand-gray font-medium">
                              <Mail size={12} /> {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-xs text-brand-gray font-medium">
                              <Phone size={12} /> {customer.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-brand-gray uppercase">{customer.total_orders} Orders</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-brand-black dark:text-brand-orange text-sm bg-brand-bg dark:bg-brand-orange/10 px-3 py-1.5 rounded-lg border border-brand-border dark:border-brand-orange/20">
                          ₦{Number(customer.total_spent).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-brand-gray hover:text-brand-black dark:hover:text-white hover:bg-brand-paper dark:hover:bg-white/10 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[400px] text-center px-6"
          >
            <div className="w-20 h-20 bg-brand-bg dark:bg-white/5 rounded-full flex items-center justify-center text-brand-gray mb-6 border border-brand-border dark:border-white/10 shadow-inner">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-brand-black dark:text-white mb-2 uppercase tracking-tight">Empty Registry</h3>
            <p className="text-sm font-medium text-brand-gray max-w-sm mx-auto mb-8">
              {searchQuery 
                ? "No matching customer accounts found in your CRM." 
                : "Your customer list will populate automatically as users place orders or generate receipts."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}