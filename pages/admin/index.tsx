import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, Zap, LogOut, Activity, Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminIntelligence() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeData, setTimeData] = useState<any[]>([]);
  const [timeFrame, setTimeFrame] = useState('24h');

  const timeFrames = [
    { id: '30m', label: '30M' },
    { id: '2h', label: '2H' },
    { id: '24h', label: '24H' },
    { id: '7d', label: '7D' },
    { id: '1m', label: '1M' },
  ];

  useEffect(() => {
    setIsMounted(true);
    fetchData(timeFrame);
  }, [timeFrame]);

  async function fetchData(frame: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      const [statsRes, timeRes] = await Promise.all([
        supabase.rpc('get_advanced_site_analysis'),
        supabase.rpc('get_timeframe_activity', { filter_type: frame })
      ]);

      setStats(statsRes.data);
      setTimeData(timeRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!isMounted || loading) return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <Zap className="text-green-500 animate-pulse" size={48} />
    </div>
  );

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-[var(--foreground)]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Site Intelligence</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Global Traffic & Engagement</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-2 hover:bg-zinc-500/10 rounded-xl text-zinc-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        {/* TOP METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card border-b-2 border-green-500">
            <Users className="text-green-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Total Users</p>
            <h2 className="text-2xl font-black">{stats?.total_users || 0}</h2>
          </div>
          <div className="admin-card border-b-2 border-blue-500">
            <Activity className="text-blue-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Active (7d)</p>
            <h2 className="text-2xl font-black">{stats?.active_users_list?.length || 0}</h2>
          </div>
          <div className="admin-card border-b-2 border-emerald-500">
            <Zap className="text-emerald-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Total Receipts</p>
            <h2 className="text-2xl font-black">{stats?.total_receipts_global || 0}</h2>
          </div>
          <div className="admin-card border-b-2 border-purple-500">
            <Eye className="text-purple-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Site Views</p>
            <h2 className="text-2xl font-black">
              {stats?.page_ranking?.reduce((acc: number, curr: any) => acc + curr.views, 0) || 0}
            </h2>
          </div>
        </div>

        {/* TIME FRAME CHART */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest px-2 flex items-center gap-2">
              <Clock size={14} /> Engagement Pulse
            </h3>
            <div className="flex bg-zinc-500/10 p-1 rounded-xl border border-zinc-500/10">
              {timeFrames.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTimeFrame(f.id)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${timeFrame === f.id ? 'bg-green-500 text-white shadow-lg' : 'text-zinc-500 hover:text-[var(--foreground)]'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="admin-card min-h-[400px]">
            <div className="h-[350px] w-full">
              <ResponsiveContainer>
                <AreaChart data={timeData}>
                  <defs>
                    <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" vertical={false} opacity={0.1} />
                  <XAxis dataKey="label" stroke="#888888" fontSize={10} fontWeight="bold" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="activity_count" stroke="#22c55e" fill="url(#engGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* PAGE RANKING & ACTIVE USERS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Page View Ranking</h3>
            <div className="space-y-2">
              {stats?.page_ranking?.map((page: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-500/5 rounded-xl border border-zinc-500/10">
                  <span className="text-xs font-bold">{page.page_path === '/' ? 'Landing Page' : page.page_path}</span>
                  <span className="text-xs font-black text-green-500 bg-green-500/10 px-2 py-0.5 rounded">{page.views}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Active Business Users</h3>
            <div className="space-y-3">
              {stats?.active_users_list?.map((user: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-zinc-500/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-500 flex items-center justify-center font-black text-xs">
                      {user.business_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm font-bold">{user.business_name || 'Anonymous User'}</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase">Score: {user.activity_points}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
