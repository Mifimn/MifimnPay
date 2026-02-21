import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Filter, Mail, Layout, Users, Smartphone, Eye } from 'lucide-react';

export default function CampaignManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    loadRecipients();
  }, []);

  async function loadRecipients() {
    setLoading(true);
    const { data } = await supabase.rpc('get_campaign_recipients');
    if (data) {
      setUsers(data);
      setSelectedIds(data.map((u: any) => u.id));
    }
    setLoading(false);
  }

  // PROFESSIONAL HTML TEMPLATE GENERATOR
  const generateHtml = (businessName: string, content: string) => {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #09090b; padding: 32px; text-align: center;">
          <div style="background-color: #22c55e; width: 40px; height: 40px; border-radius: 8px; display: inline-block; line-height: 40px; color: white; font-weight: 900; font-size: 20px;">M</div>
          <h1 style="color: white; margin-top: 16px; font-size: 18px; text-transform: uppercase; letter-spacing: 2px;">MifimnPay</h1>
        </div>
        <div style="padding: 40px; color: #18181b; line-height: 1.6;">
          <h2 style="font-weight: 900; font-size: 20px; margin-bottom: 24px;">Hello ${businessName},</h2>
          <div style="font-size: 16px; color: #52525b;">${content.replace(/\n/g, '<br/>')}</div>
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f4f4f5; text-align: center;">
            <a href="https://mifimnpay.com.ng/dashboard" style="background-color: #22c55e; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block;">Open Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #a1a1aa;">
          &copy; 2026 MifimnPay. Professional Receipts, Generated Instantly.
        </div>
      </div>
    `;
  };

  const filterUsers = (type: 'all' | 'frequent' | 'inactive') => {
    if (type === 'all') setSelectedIds(users.map(u => u.id));
    if (type === 'frequent') setSelectedIds(users.filter(u => u.is_frequent).map(u => u.id));
    if (type === 'inactive') setSelectedIds(users.filter(u => !u.last_active).map(u => u.id));
  };

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-[var(--foreground)] pb-20">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Campaign Dispatch</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Professional HTML Templates</p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-[10px] font-black uppercase">
              {selectedIds.length} Targeted Recipients
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* EDITOR SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Email Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="The Subject of your Email"
                  className="w-full bg-zinc-500/5 border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-green-500 font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase px-1">Message Content</label>
                <textarea 
                  rows={10}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Just type your message... the template handles the rest."
                  className="w-full bg-zinc-500/5 border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-green-500 font-medium leading-relaxed"
                />
              </div>

              <button className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all">
                <Send size={18} /> DISPATCH CAMPAIGN
              </button>
            </div>

            {/* PREVIEW COMPONENT */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Smartphone size={14}/> Mobile Inbox Preview</h3>
               <div className="bg-zinc-100 rounded-[32px] p-4 border-[8px] border-zinc-900 shadow-2xl max-w-sm mx-auto overflow-hidden">
                  <div className="bg-white h-[500px] overflow-y-auto rounded-2xl custom-scrollbar scale-95 origin-top">
                    <div dangerouslySetInnerHTML={{ __html: generateHtml("Recipient Business", messageBody || "Type your message above to see how it looks here...") }} />
                  </div>
               </div>
            </div>
          </div>

          {/* RECIPIENT SELECTION */}
          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2"><Filter size={14}/> Segmentation</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'frequent', 'inactive'].map((f) => (
                  <button key={f} onClick={() => filterUsers(f as any)} className="px-3 py-1.5 bg-zinc-500/10 rounded-lg text-[10px] font-black uppercase hover:bg-green-500 hover:text-white transition-all">
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-card max-h-[600px] overflow-y-auto custom-scrollbar">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2"><Users size={14}/> Recipient Directory</h3>
              {loading ? (
                <div className="py-10 text-center animate-pulse text-[10px] font-black text-zinc-500 uppercase">Indexing...</div>
              ) : (
                <div className="space-y-2">
                  {users.map((u) => (
                    <button key={u.id} onClick={() => setSelectedIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} 
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${selectedIds.includes(u.id) ? 'border-green-500 bg-green-500/5' : 'border-transparent bg-zinc-500/5 opacity-60'}`}>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{u.business_name}</p>
                        <p className="text-[8px] font-bold text-zinc-500">{u.auth_email}</p>
                      </div>
                      {selectedIds.includes(u.id) && <CheckCircle2 size={16} className="text-green-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
