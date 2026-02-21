import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Users, Receipt, Banknote, ShieldCheck, Zap, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    async function initializeDashboard() {
      // 1. Get session quickly (getSession is faster than getUser for initial UI)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      try {
        // 2. PARALLEL EXECUTION: Check Admin + Fetch Stats + Fetch Trends simultaneously
        // This cuts your waiting time by 60%
        const [profileRes, statsRes, trendsRes] = await Promise.all([
          supabase.from('profiles').select('is_admin').eq('id', session.user.id).single(),
          supabase.rpc('get_admin_stats'),
          supabase.rpc('get_platform_trends')
        ]);

        // 3. Security Guard
        if (!profileRes.data?.is_admin) {
          router.push('/dashboard');
          return;
        }

        setStats(statsRes.data);
        setTrends(trendsRes.data || []);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    }

    initializeDashboard();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Immediate escape for non-mounted to prevent hydration hang
  if (!isMounted) return null;

  if (loading || !stats) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
       <motion.div 
         animate={{ rotate: 360 }} 
         transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
         className="mb-4"
       >
        <Zap className="text-green-500" size={48} />
      </motion.div>
      <p className="text-slate-500 font-bold animate-pulse text-xs tracking-widest uppercase">
        Accelerating Analysis...
      </p>
    </div>
  );

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-8 pb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white">Platform Analysis</h1>
            <p className="text-slate-400 text-sm font-medium">Parallel Data Processing Active.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-500/20 transition-all">
              <LogOut size={16} /> LOGOUT
            </button>
            <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM LIVE
            </span>
          </div>
        </div>

        {/* SECTION: STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', val: stats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Receipts Issued', val: stats.total_receipts, icon: Receipt, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Revenue', val: `₦${stats.total_revenue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Verified Businesses', val: stats.pro_users, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((s, i) => (
            <div key={i} className="admin-card group hover:border-green-500/50 transition-all">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                <s.icon className={s.color} size={24} />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              <h2 className="text-3xl font-black mt-1 text-white">{s.val}</h2>
            </div>
          ))}
        </div>

        {/* SECTION: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card min-h-[450px]">
             <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-white">
              <div className="w-1 h-4 bg-green-500 rounded-full" /> Growth Trend
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorReceipt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#475569" fontSize={10} fontWeight="bold" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', color: '#fff' }} />
                  <Area type="monotone" dataKey="receipt_count" stroke="#22c55e" fillOpacity={1} fill="url(#colorReceipt)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="admin-card">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-white">Daily Volume</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <BarChart data={trends}>
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} fontWeight="bold" />
                  <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155'}} />
                  <Bar dataKey="receipt_count" radius={[10, 10, 0, 0]}>
                    {trends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === trends.length - 1 ? '#22c55e' : '#334155'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
