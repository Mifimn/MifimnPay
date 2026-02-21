import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  CheckCircle2, 
  Filter, 
  Users, 
  Smartphone, 
  Sparkles, 
  Mail, 
  Info,
  AlertCircle
} from 'lucide-react';

// 1. PRE-SET TEMPLATES
const TEMPLATES = {
  welcome: {
    subject: "Welcome to the MifimnPay Family! 🚀",
    message: "We're excited to have you on board! MifimnPay is built to help your business grow by making receipt generation seamless and professional.\n\nHave you tried generating your first branded receipt yet? Head over to your dashboard to get started!"
  },
  update: {
    subject: "New Feature Alert: Site Intelligence is Live! 📈",
    message: "We've just launched the Site Intelligence dashboard for our pro users. You can now track your business growth and customer engagement in real-time.\n\nCheck out the new analytics tab in your dashboard today!"
  },
  maintenance: {
    subject: "Scheduled Maintenance Notification 🛠️",
    message: "MifimnPay will be undergoing brief maintenance this weekend to improve our server speeds. You might experience 5-10 minutes of downtime on Sunday at 2:00 AM WAT.\n\nThank you for your patience!"
  }
};

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

  // 2. FETCH RECIPIENTS (Auth Emails + Profile Business Names)
  async function loadRecipients() {
    setLoading(true);
    const { data, error } = await supabase.rpc('get_campaign_recipients');
    if (error) {
      console.error("Selection Error:", error);
    } else {
      setUsers(data || []);
      // Auto-select all by default
      setSelectedIds(data?.map((u: any) => u.id) || []);
    }
    setLoading(false);
  }

  // 3. APPLY TEMPLATE LOGIC
  const applyTemplate = (type: keyof typeof TEMPLATES) => {
    setSubject(TEMPLATES[type].subject);
    setMessageBody(TEMPLATES[type].message);
  };

  // 4. PREVIEW HTML GENERATOR (Matches the API backend)
  const generateHtmlPreview = (businessName: string, content: string) => {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #09090b; padding: 32px; text-align: center;">
          <div style="background-color: #22c55e; width: 40px; height: 40px; border-radius: 8px; display: inline-block; line-height: 40px; color: white; font-weight: 900; font-size: 20px; text-align: center;">M</div>
          <h1 style="color: white; margin-top: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">MifimnPay</h1>
        </div>
        <div style="padding: 40px; color: #18181b; line-height: 1.6;">
          <h2 style="font-size: 18px; margin-bottom: 20px; font-weight: 900;">Hello ${businessName},</h2>
          <div style="color: #52525b; font-size: 15px;">${content.replace(/\n/g, '<br/>') || 'Your message will appear here...'}</div>
          <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #f4f4f5; text-align: center;">
            <a href="https://mifimnpay.com.ng/dashboard" style="background-color: #22c55e; color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 14px;">Go to Dashboard</a>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; font-size: 11px; color: #a1a1aa;">
          Sent via MifimnPay Intelligence Hub<br/>
          &copy; 2026 MifimnPay Services. All rights reserved.
        </div>
      </div>
    `;
  };

  // 5. DISPATCH ACTION
  const handleDispatch = async () => {
    if (!subject || !messageBody || selectedIds.length === 0) {
      alert("Please check: Subject, Message, and at least one Recipient.");
      return;
    }

    setDispatching(true);
    const selectedUsers = users.filter(u => selectedIds.includes(u.id));

    try {
      const response = await fetch('/api/admin/dispatch-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          messageBody,
          recipients: selectedUsers
        }),
      });

      if (response.ok) {
        alert(`Success! Campaign sent to ${selectedUsers.length} users.`);
        setSubject('');
        setMessageBody('');
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to dispatch");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setDispatching(false);
    }
  };

  const filterUsers = (type: 'all' | 'frequent' | 'inactive') => {
    if (type === 'all') setSelectedIds(users.map(u => u.id));
    if (type === 'frequent') setSelectedIds(users.filter(u => u.is_frequent).map(u => u.id));
    if (type === 'inactive') setSelectedIds(users.filter(u => !u.last_active).map(u => u.id));
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-20 text-[var(--foreground)]">

        {/* HEADER & TEMPLATE BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Campaign Hub</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Connect with your users</p>
          </div>
          <div className="flex flex-wrap gap-2 bg-zinc-500/5 p-2 rounded-2xl border border-[var(--border-color)]">
            <span className="text-[9px] font-black text-zinc-500 uppercase px-2 py-2 flex items-center gap-1">
              <Sparkles size={10} /> Templates:
            </span>
            {(Object.keys(TEMPLATES) as Array<keyof typeof TEMPLATES>).map((t) => (
              <button 
                key={t} 
                onClick={() => applyTemplate(t)}
                className="px-4 py-2 bg-green-500/10 hover:bg-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all border border-green-500/20"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COMPOSER SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="admin-card space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                  <Info size={12}/> Email Subject Line
                </label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Major Update to MifimnPay Dashboard"
                  className="w-full bg-zinc-500/5 border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-green-500 font-bold text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 px-1">
                  <Mail size={12}/> Message Content
                </label>
                <textarea 
                  rows={10}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Write your professional message here..."
                  className="w-full bg-zinc-500/5 border border-[var(--border-color)] p-4 rounded-xl outline-none focus:border-green-500 text-sm font-medium leading-relaxed"
                />
              </div>

              <button 
                onClick={handleDispatch}
                disabled={dispatching || selectedIds.length === 0}
                className="w-full bg-green-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Send size={18} /> {dispatching ? 'DISPATCHING CAMPAIGN...' : `SEND TO ${selectedIds.length} RECIPIENTS`}
              </button>
            </div>

            {/* PREVIEW WINDOW */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 px-2">
                <Smartphone size={14}/> Mobile Layout Preview
              </h3>
              <div className="bg-zinc-100 rounded-[40px] p-4 border-[10px] border-zinc-900 shadow-2xl max-w-sm mx-auto">
                <div className="bg-white h-[450px] overflow-y-auto rounded-2xl custom-scrollbar">
                  <div dangerouslySetInnerHTML={{ __html: generateHtmlPreview("Your Customer", messageBody) }} />
                </div>
              </div>
            </div>
          </div>

          {/* RECIPIENT & FILTER SECTION */}
          <div className="space-y-6">
            <div className="admin-card">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2">
                <Filter size={14} /> Quick Filter
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {['all', 'frequent', 'inactive'].map((f) => (
                  <button 
                    key={f} 
                    onClick={() => filterUsers(f as any)}
                    className="py-2 bg-zinc-500/10 rounded-xl text-[9px] font-black uppercase hover:bg-zinc-500/20 transition-all border border-transparent"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-card flex flex-col h-[700px]">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2">
                <Users size={14} /> User Directory
              </h3>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {loading ? (
                  <div className="py-20 text-center animate-pulse text-[10px] font-black text-zinc-500 uppercase">Synchronizing Users...</div>
                ) : users.length === 0 ? (
                  <div className="py-20 text-center text-zinc-500 space-y-2">
                    <AlertCircle className="mx-auto" size={24} />
                    <p className="text-[10px] font-black uppercase">No Users Found</p>
                  </div>
                ) : (
                  users.map((u) => (
                    <button 
                      key={u.id} 
                      onClick={() => setSelectedIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} 
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        selectedIds.includes(u.id) 
                        ? 'border-green-500 bg-green-500/5' 
                        : 'border-transparent bg-zinc-500/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="text-left flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${selectedIds.includes(u.id) ? 'bg-green-500 text-white' : 'bg-zinc-500/20 text-zinc-500'}`}>
                          {u.business_name?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[10px] font-black uppercase truncate max-w-[100px]">{u.business_name || 'Guest User'}</p>
                          <p className="text-[8px] font-bold text-zinc-500 truncate max-w-[100px]">{u.auth_email}</p>
                        </div>
                      </div>
                      {selectedIds.includes(u.id) && <CheckCircle2 size={16} className="text-green-500" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}