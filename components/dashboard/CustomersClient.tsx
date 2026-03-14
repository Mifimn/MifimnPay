"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Mail, Phone, ArrowUpRight, Inbox, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  total_spent: number;
  created_at: string;
};

export default function CustomersClient() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-black tracking-tight uppercase italic transition-colors duration-300">Customers</h1>
          <p className="text-sm font-bold text-brand-gray tracking-wide uppercase transition-colors duration-300">Manage buyers and track spending.</p>
        </div>
        <button className="bg-brand-black text-brand-paper px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg"><UserPlus size={18} />Add Customer</button>
      </div>
      <div className="flex items-center gap-4 bg-brand-paper p-2 rounded-2xl border border-brand-border shadow-sm transition-colors duration-300">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 pl-12 pr-4 bg-transparent outline-none text-brand-black font-medium" />
        </div>
      </div>
      <div className="bg-brand-paper rounded-3xl border border-brand-border overflow-hidden shadow-sm min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-brand-gray"><Loader2 size={40} className="animate-spin mb-4" /><p className="text-sm font-bold uppercase tracking-widest">Loading CRM...</p></div>
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-brand-gray">Customer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-brand-gray">Total Spent</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-brand-gray text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-brand-border last:border-0 hover:bg-brand-bg transition-colors group">
                    <td className="px-6 py-4 font-bold text-brand-black">{customer.name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-brand-black text-sm">₦{(customer.total_spent || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right"><ArrowUpRight size={18} className="inline text-brand-gray" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[400px] text-center"><Inbox size={32} className="text-brand-gray mb-4" /><h3 className="text-xl font-black text-brand-black uppercase">No Customers</h3></div>
        )}
      </div>
    </div>
  );
}
