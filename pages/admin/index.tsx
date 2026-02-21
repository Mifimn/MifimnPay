import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, Zap, LogOut, ChevronRight, Activity, Award } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminIntelligence() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <Zap className="text-green-500 animate-bounce" size={40} />
    </div>
  );

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-[var(--foreground)]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Site Intelligence</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Analytics Dashboard</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-2 hover:bg-zinc-500/10 rounded-lg text-zinc-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card border-b-2 border-green-500">
            <Users className="text-green-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Total Users</p>
            <h2 className="text-2xl font-black">{stats?.total_users || 0}</h2>
          </div>
          <div className="admin-card border-b-2 border-blue-500">
            <Activity className="text-blue-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Active Users (7d)</p>
            <h2 className="text-2xl font-black">{stats?.active_users_list?.length || 0}</h2>
          </div>
          <div className="admin-card border-b-2 border-emerald-500">
            <Zap className="text-emerald-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Total Receipts</p>
            <h2 className="text-2xl font-black">{stats?.total_receipts_global || 0}</h2>
          </div>
          <div className="admin-card border-b-2 border-purple-500">
            <Eye className="text-purple-500 mb-2" size={18} />
            <p className="text-[10px] font-black text-zinc-500 uppercase">Page Views</p>
            <h2 className="text-2xl font-black">
              {stats?.page_ranking?.reduce((acc: number, curr: any) => acc + curr.views, 0) || 0}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Page Rankings with Dynamic Contrast */}
          <div className="admin-card lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Most Viewed Pages</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {stats?.page_ranking?.map((page: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedPage(page.page_path)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${selectedPage === page.page_path ? 'bg-green-500/10 border-green-500' : 'bg-zinc-500/5 border-transparent'}`}
                >
                  <span className="text-xs font-bold truncate max-w-[150px]">{page.page_path === '/' ? 'Landing Page' : page.page_path}</span>
                  <span className="text-xs font-black px-2 py-1 bg-zinc-500/10 rounded-md">{page.views}</span>
                </button>
              ))}
            </div>
          </div>

          {/* User Frequency Analysis */}
          <div className="admin-card lg:col-span-2">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Top Active Users</h3>
            <div className="space-y-3">
              {stats?.active_users_list?.map((user: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-500/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center font-black">
                      {user.business_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black">{user.business_name || 'Guest User'}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Frequency Index: {user.activity_points}</p>
                    </div>
                  </div>
                  <Award className={i === 0 ? 'text-yellow-500' : 'text-zinc-600'} size={20} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
