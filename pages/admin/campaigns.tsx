import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Send, Users, Mail, Layout, Eye } from 'lucide-react';

export default function CampaignManager() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetUsers, setTargetUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase.from('profiles').select('id, business_name, business_email');
      setTargetUsers(data || []);
    }
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[var(--foreground)]">Email Campaigns</h1>
          <div className="px-4 py-2 bg-blue-500/10 text-blue-500 rounded-xl text-xs font-bold border border-blue-500/20">
            {targetUsers.length} REACHABLE USERS
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COMPOSER */}
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Subject Line</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-zinc-500/5 border border-zinc-500/10 rounded-xl p-4 outline-none focus:border-green-500 text-[var(--foreground)] font-bold"
                  placeholder="e.g. New Receipt Styles are Live!"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase">Message Content (HTML Supported)</label>
                <textarea 
                  rows={10}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-zinc-500/5 border border-zinc-500/10 rounded-xl p-4 outline-none focus:border-green-500 text-[var(--foreground)] font-medium"
                  placeholder="Write your professional update here..."
                />
              </div>

              <button className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-green-600 transition-all">
                <Send size={18} /> DISPATCH CAMPAIGN
              </button>
            </div>
          </div>

          {/* PREVIEW & LIST */}
          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="text-xs font-black text-zinc-500 uppercase mb-4 flex items-center gap-2">
                <Layout size={14} /> Device Preview
              </h3>
              <div className="border border-zinc-500/10 rounded-xl p-4 bg-white text-black min-h-[200px]">
                <p className="text-[10px] text-zinc-400 mb-2 border-b pb-1 font-bold italic">MifimnPay Official Message</p>
                <h4 className="font-bold text-sm mb-2">{subject || "No Subject"}</h4>
                <div className="text-xs whitespace-pre-wrap">{content || "Start typing to see preview..."}</div>
              </div>
            </div>

            <div className="admin-card max-h-[300px] overflow-y-auto">
              <h3 className="text-xs font-black text-zinc-500 uppercase mb-4 flex items-center gap-2">
                <Users size={14} /> Recipient List
              </h3>
              <div className="space-y-2">
                {targetUsers.map((u, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-zinc-500/5 rounded-lg border border-transparent hover:border-zinc-500/20">
                    <div className="w-6 h-6 rounded bg-zinc-500/20 text-[10px] flex items-center justify-center font-black">{u.business_name?.charAt(0)}</div>
                    <span className="text-[10px] font-bold truncate text-[var(--foreground)]">{u.business_email || "No Email"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
