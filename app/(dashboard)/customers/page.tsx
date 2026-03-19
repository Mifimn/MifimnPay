"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, ArrowUpRight, Inbox, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

// Define the Customer type based on the Supabase schema we will use
type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  total_spent: number;
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
          .eq('user_id', user.id)
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
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (customer.phone && customer.phone.includes(searchQuery))
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-brand-black tracking-tight uppercase italic transition-colors duration-300">
          Customers
        </h1>
        <p className="text-sm font-bold text-brand-gray tracking-wide uppercase transition-colors duration-300">
          Manage your buyers and track their spending.
        </p>
      </div>

      {/* Controls / Search Bar */}
      <div className="flex items-center gap-4 bg-brand-paper p-2 rounded-2xl border border-brand-border shadow-sm transition-colors duration-300">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input 
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-brand-black font-medium placeholder:text-brand-gray/60 transition-colors duration-300"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-brand-paper rounded-3xl border border-brand-border overflow-hidden shadow-sm min-h-[400px] transition-colors duration-300">
        {isLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center h-[400px] text-brand-gray">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading CRM...</p>
          </div>
        ) : filteredCustomers.length > 0 ? (
          // Customer List
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray hidden md:table-cell">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray">Total Spent</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-brand-gray text-right">Actions</th>
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
                      className="border-b border-brand-border last:border-0 hover:bg-brand-bg transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-black text-brand-paper flex items-center justify-center font-black text-sm uppercase shadow-sm">
                            {customer.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-brand-black text-sm">{customer.name}</p>
                            <p className="text-xs text-brand-gray font-medium md:hidden">{customer.phone || customer.email || 'No contact'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info (Desktop Only) */}
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
                          {!customer.email && !customer.phone && (
                            <span className="text-xs text-brand-gray/50 italic">No contact info</span>
                          )}
                        </div>
                      </td>

                      {/* Total Spent */}
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-brand-black text-sm bg-brand-bg px-3 py-1.5 rounded-lg border border-brand-border">
                          ₦{customer.total_spent.toLocaleString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-brand-gray hover:text-brand-black hover:bg-brand-paper rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
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
          // Empty State
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-[400px] text-center px-6"
          >
            <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center text-brand-gray mb-6 border border-brand-border shadow-inner">
              <Inbox size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-black text-brand-black mb-2 uppercase tracking-tight">No Customers Yet</h3>
            <p className="text-sm font-medium text-brand-gray max-w-sm mx-auto mb-8">
              {searchQuery 
                ? "We couldn't find any customers matching your search." 
                : "When customers buy from your storefront or you generate a receipt, they will automatically appear here."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}