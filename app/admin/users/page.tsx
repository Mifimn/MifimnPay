"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout'; // Path alias update
import { supabase } from '@/lib/supabaseClient'; // Path alias update
import { Search, Mail, Users as UsersIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    (u.business_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-[var(--foreground)] pb-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">User Directory</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Manage Merchants & Admins</p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 text-green-500">
            <UsersIcon size={16} />
            <span className="text-xs font-black uppercase tracking-widest">{users.length} Total</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="admin-card p-2 border border-[var(--border-color)]">
          <div className="relative flex items-center bg-zinc-500/5 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <Search className="absolute left-4 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="SEARCH BY BUSINESS NAME OR ID..."
              className="w-full bg-transparent border-none py-4 pl-12 pr-4 outline-none text-xs font-black uppercase tracking-widest text-[var(--foreground)] placeholder:text-zinc-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="admin-card p-0 overflow-hidden border border-[var(--border-color)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-zinc-500/10 border-b border-[var(--border-color)] text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                <tr>
                  <th className="px-6 py-5">Business / User</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Joined</th>
                  <th className="px-6 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-green-500 mb-2" size={24} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Loading Directory...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-zinc-500/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-500/10 flex items-center justify-center font-black text-xs text-zinc-400 group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                            {u.business_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">{u.business_name || 'No Name Set'}</div>
                            <div className="text-[10px] font-bold text-zinc-500 tracking-widest">{u.id.substring(0, 12)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_admin ? (
                          <span className="text-[9px] bg-purple-500/20 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">ADMIN</span>
                        ) : (
                          <span className="text-[9px] bg-blue-500/20 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">MERCHANT</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {new Date(u.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="p-3 bg-zinc-500/10 hover:bg-green-500 hover:text-white text-zinc-400 rounded-xl transition-all inline-flex items-center justify-center"
                          title={`Email ${u.business_name || 'User'}`}
                        >
                          <Mail size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      No matching users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}