import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { Users, Eye, Zap, LogOut, MousePointer2, Activity, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminIntelligence() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Analytics State
  const [stats, setStats] = useState<any>(null);
  const [hourlyTrends, setHourlyTrends] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    async function fetchAnalytics() {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          supabase.rpc('get_advanced_site_analysis'),
          supabase.rpc('get_hourly_activity')
        ]);
        
        setStats(statsRes.data);
        setHourlyTrends(trendsRes.data || []);
      } catch (err) {
        console.error("Analytics Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (!isMounted || loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <Zap className="text-green-500 animate-bounce" size={40} />
    </div>
  );

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Site Intelligence</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">Real-time Behavioral Data</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <span className="text-green-500 text-xs font-black">● LIVE</span>
              <span className="text-[10px] text-zinc-600 font-bold uppercase">Tracking Enabled</span>
            </div>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* TOP ROW: CORE STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card border-b-2 border-green-500">
            <Users className="text-green-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Total Users</p>
            <h2 className="text-2xl font-black text-white">{(stats?.top_users?.length || 0)}</h2>
          </div>
          <div className="admin-card border-b-2 border-blue-500">
            <Activity className="text-blue-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Avg Min Used</p>
            <h2 className="text-2xl font-black text-white">{stats?.avg_session_minutes?.toFixed(1) || 0}m</h2>
          </div>
          <div className="admin-card border-b-2 border-purple-500">
            <MousePointer2 className="text-purple-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Page Views</p>
            <h2 className="text-2xl font-black text-white">
              {stats?.most_visited_pages?.reduce((acc: any, curr: any) => acc + curr.views, 0) || 0}
            </h2>
          </div>
          <div className="admin-card border-b-2 border-emerald-500">
            <Zap className="text-emerald-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Total Receipts</p>
            <h2 className="text-2xl font-black text-white">
              {stats?.top_users?.reduce((acc: any, curr: any) => acc + curr.receipt_count, 0) || 0}
            </h2>
          </div>
        </div>

        {/* MIDDLE ROW: ANALYSIS AND PAGE RANKING */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT: Top Pages List */}
          <div className="admin-card lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Page Rank by Views</h3>
            <div className="space-y-2">
              {stats?.most_visited_pages?.map((page: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedPage(page.page_path)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedPage === page.page_path ? 'bg-green-500/10 border border-green-500/50' : 'bg-zinc-900/50 hover:bg-zinc-900 border border-transparent'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-zinc-700">0{i+1}</span>
                    <span className="text-xs font-bold text-zinc-300 truncate max-w-[120px]">{page.page_path}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white">{page.views}</span>
                    <ChevronRight size={14} className="text-zinc-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Visual Chart (Google Analytics Style) */}
          <div className="admin-card lg:col-span-2">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                {selectedPage ? `Engagement: ${selectedPage}` : 'Global Traffic Pulse'}
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"/> VISITS</div>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <AreaChart data={hourlyTrends}>
                  <defs>
                    <linearGradient id="gaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="hour" stroke="#3f3f46" fontSize={10} fontWeight="bold" />
                  <YAxis stroke="#3f3f46" fontSize={10} fontWeight="bold" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#22c55e', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="activity_count" 
                    stroke="#22c55e" 
                    strokeWidth={3} 
                    fill="url(#gaGradient)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: TOP USERS BAR CHART */}
        <div className="admin-card">
           <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-8 text-center">Platform Power Users (Receipt Volume)</h3>
           <div className="h-[250px] w-full">
             <ResponsiveContainer>
                <BarChart data={stats?.top_users || []}>
                  <XAxis dataKey="business_name" stroke="#3f3f46" fontSize={10} fontWeight="bold" />
                  <Tooltip cursor={{fill: '#18181b'}} contentStyle={{backgroundColor: '#09090b', borderRadius: '12px', border: '1px solid #27272a'}} />
                  <Bar dataKey="receipt_count" radius={[8, 8, 0, 0]}>
                    {stats?.top_users?.map((_: any, i: number) => (
                      <Cell key={i} fill={['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'][i % 5]} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

      </motion.div>
    </AdminLayout>
  );
}
