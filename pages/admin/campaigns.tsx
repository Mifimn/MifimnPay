import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, UserPlus, Zap, Filter } from 'lucide-react';

export default function CampaignManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    async function loadRecipients() {
      const { data } = await supabase.rpc('get_campaign_recipients');
      setUsers(data || []);
      setSelectedIds(data?.map((u: any) => u.id) || []); // Default select all
    }
    loadRecipients();
  }, []);

  const filterUsers = (type: 'all' | 'frequent' | 'inactive') => {
    if (type === 'all') setSelectedIds(users.map(u => u.id));
    if (type === 'frequent') setSelectedIds(users.filter(u => u.is_frequent).map(u => u.id));
    if (type === 'inactive') setSelectedIds(users.filter(u => !u.last_active).map(u => u.id));
  };

  const toggleUser = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-3xl font-black uppercase tracking-tighter">Campaign Dispatch</h1>
          <div className="admin-card space-y-4">
             <input type="text" placeholder="Campaign Subject" value={subject} onChange={(e)=>setSubject(e.target.value)} className="w-full bg-zinc-500/5 border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-green-500 text-[var(--foreground)] font-bold" />
             <textarea rows={8} placeholder="Message HTML/Text Content" value={content} onChange={(e)=>setContent(e.target.value)} className="w-full bg-zinc-500/5 border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-green-500 text-[var(--foreground)]" />
             <button className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3">
               <Send size={18}/> Send to {selectedIds.length} Recipients
             </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="admin-card">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-4 flex items-center gap-2"><Filter size={14}/> Selection Filters</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'frequent', 'inactive'].map(f => (
                <button key={f} onClick={() => filterUsers(f as any)} className="px-3 py-1.5 bg-zinc-500/10 rounded-lg text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all">{f}</button>
              ))}
            </div>
          </div>

          <div className="admin-card max-h-[500px] overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black uppercase text-zinc-500 mb-4">Recipient Directory</h3>
            <div className="space-y-2">
              {users.map((u) => (
                <button key={u.id} onClick={() => toggleUser(u.id)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedIds.includes(u.id) ? 'border-green-500 bg-green-500/5' : 'border-transparent bg-zinc-500/5 opacity-60'}`}>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{u.business_name || 'Guest'}</p>
                    <p className="text-[8px] font-bold text-zinc-500">{u.auth_email}</p>
                  </div>
                  {selectedIds.includes(u.id) && <CheckCircle2 size={16} className="text-green-500" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
