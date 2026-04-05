"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout'; 
import { supabase } from '@/lib/supabaseClient'; 
import { Search, Mail, Users as UsersIcon, Loader2, CheckCircle, XCircle, ShieldAlert, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MerchantDirectory() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedVendor, setSelectedVendor] = useState<any | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('is_admin', true) 
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setFetchError("No vendors found. If vendors exist, Supabase Row Level Security (RLS) is blocking your admin account from reading the table.");
      }

      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (userId: string, action: 'approve' | 'reject') => {
    setProcessingId(userId);
    try {
      // 1. Update the database
      const { error } = await supabase
        .from('profiles')
        .update({
          is_verified: action === 'approve',
          verification_status: action === 'approve' ? 'verified' : 'rejected'
        })
        .eq('id', userId);

      if (error) throw error;

      // 2. AUTOMATIC EMAIL TRIGGER
      if (action === 'approve') {
        const vendorToEmail = users.find(u => u.id === userId);
        if (vendorToEmail && vendorToEmail.email) {
          fetch('/api/notify-vendor-verified', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: vendorToEmail.email,
              businessName: vendorToEmail.business_name
            })
          }).catch(err => console.error("Failed to send success email:", err));
        }
      }

      // 3. Close Modal and Refresh list
      setSelectedVendor(null);
      await fetchUsers();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.business_name?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (u.nin_number || '').includes(search) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = users.filter(u => u.verification_status === 'pending').length;

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-[var(--foreground)] pb-20">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Merchant Directory</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Verify & Manage Vendors</p>
          </div>
          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20 text-orange-500">
                <ShieldAlert size={16} />
                <span className="text-xs font-black uppercase tracking-widest">{pendingCount} Pending Review</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20 text-green-500">
              <UsersIcon size={16} />
              <span className="text-xs font-black uppercase tracking-widest">{users.length} Total Vendors</span>
            </div>
          </div>
        </div>

        {/* ERROR DISPLAY */}
        {fetchError && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <div>
              <h3 className="text-red-500 font-black uppercase tracking-widest text-xs mb-1">Query Error / Empty Result</h3>
              <p className="text-red-400 text-sm font-bold">{fetchError}</p>
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="admin-card p-2 border border-[var(--border-color)] rounded-2xl">
          <div className="relative flex items-center bg-zinc-500/5 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <Search className="absolute left-4 text-zinc-500" size={18} />
            <input 
              type="text"
              placeholder="SEARCH BY BUSINESS NAME OR NIN..."
              className="w-full bg-transparent border-none py-4 pl-12 pr-4 outline-none text-xs font-black uppercase tracking-widest text-[var(--foreground)] placeholder:text-zinc-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="admin-card p-0 overflow-hidden border border-[var(--border-color)] rounded-3xl bg-zinc-900/20">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-500/10 border-b border-[var(--border-color)] text-[10px] uppercase tracking-widest text-zinc-500 font-black">
                <tr>
                  <th className="px-6 py-5">Business</th>
                  <th className="px-6 py-5">NIN Details</th>
                  <th className="px-6 py-5">Verification Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
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

                      {/* Business Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-500/10 flex items-center justify-center font-black text-xs text-zinc-400 group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                            {u.business_name?.charAt(0) || 'V'}
                          </div>
                          <div>
                            <div className="font-black text-sm uppercase tracking-tight">{u.business_name || 'No Name Set'}</div>
                            <div className="text-[10px] font-bold text-zinc-500 tracking-widest">{u.id.substring(0, 12)}...</div>
                          </div>
                        </div>
                      </td>

                      {/* NIN Info */}
                      <td className="px-6 py-4">
                        {u.nin_number ? (
                          <div className="bg-zinc-800/50 p-2 rounded-lg border border-zinc-700/50 inline-block">
                            <div className="font-black text-xs text-zinc-200 uppercase tracking-widest mb-1">NIN: ******{u.nin_number.slice(-4)}</div>
                            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate max-w-[120px]">{u.legal_full_name}</div>
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">Not Submitted</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {u.verification_status === 'verified' && (
                          <span className="text-[9px] bg-green-500/20 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">VERIFIED</span>
                        )}
                        {u.verification_status === 'pending' && (
                          <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest animate-pulse">PENDING REVIEW</span>
                        )}
                        {u.verification_status === 'rejected' && (
                          <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">REJECTED</span>
                        )}
                        {(!u.verification_status || u.verification_status === 'unverified') && (
                          <span className="text-[9px] bg-zinc-500/20 text-zinc-400 border border-zinc-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest">UNVERIFIED</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">

                          {/* Trigger Modal Button */}
                          {u.verification_status === 'pending' && (
                            <button 
                              onClick={() => setSelectedVendor(u)}
                              className="px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white border border-orange-500/20 rounded-xl transition-all shadow-sm font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                            >
                              <FileText size={14} /> Review
                            </button>
                          )}

                          {/* Email Contact Button */}
                          <a 
                            href={`mailto:${u.email || ''}?subject=Your MifimnPay Vendor Account`}
                            className="p-2.5 bg-zinc-500/10 hover:bg-blue-500 hover:text-white text-zinc-400 border border-transparent rounded-xl transition-all"
                            title="Email Vendor"
                          >
                            <Mail size={16} />
                          </a>

                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      No matching merchants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* REVIEW MODAL */}
      <AnimatePresence>
        {selectedVendor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative"
            >
              {/* Close Button */}
              <button 
                onClick={() => !processingId && setSelectedVendor(null)}
                disabled={!!processingId}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white disabled:opacity-50 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-8 text-center mt-2">
                <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white">Review Vendor</h2>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Verify Identity Details</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Business Name</p>
                  <p className="text-sm font-bold text-white uppercase">{selectedVendor.business_name || 'N/A'}</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">Legal Full Name</p>
                  <p className="text-sm font-bold text-white uppercase">{selectedVendor.legal_full_name || 'N/A'}</p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">National Identity Number (NIN)</p>
                  <p className="text-xl font-black text-orange-500 tracking-widest font-mono">
                    {selectedVendor.nin_number || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleVerification(selectedVendor.id, 'reject')}
                  disabled={!!processingId}
                  className="py-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingId === selectedVendor.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                  Decline
                </button>
                <button 
                  onClick={() => handleVerification(selectedVendor.id, 'approve')}
                  disabled={!!processingId}
                  className="py-4 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-glow"
                >
                  {processingId === selectedVendor.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  Approve
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </AdminLayout>
  );
}