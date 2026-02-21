import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { Users, Eye, Clock, Award, Zap, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [advData, setAdvData] = useState<any>(null);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    async function loadAnalysis() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.push('/login');

      try {
        const [analysisRes, hourlyRes] = await Promise.all([
          supabase.rpc('get_advanced_site_analysis'),
          supabase.rpc('get_hourly_activity')
        ]);

        setAdvData(analysisRes.data);
        setHourlyData(hourlyRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [router]);

  if (!isMounted || loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <Zap className="text-green-500 animate-pulse" size={48} />
    </div>
  );

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-10 pb-20"
      >
        {/* HEADER SECTION */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Site Intelligence</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Behavioral Analysis Engine</p>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all">
            <LogOut size={20} />
          </button>
        </div>

        {/* TOP METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -5 }} className="admin-card border-l-4 border-blue-500">
            <Eye className="text-blue-500 mb-2" size={24} />
            <p className="text-slate-500 text-[10px] font-black uppercase">Avg Minutes / Session</p>
            <h2 className="text-3xl font-black text-white">{advData?.avg_session_minutes?.toFixed(1) || 0}m</h2>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="admin-card border-l-4 border-green-500">
            <Award className="text-green-500 mb-2" size={24} />
            <p className="text-slate-500 text-[10px] font-black uppercase">Most Active Page</p>
            <h2 className="text-xl font-black text-white truncate">{advData?.most_visited_pages?.[0]?.page_path || '/'}</h2>
          </motion.div>

          <motion.div whileHover={{ y: -5 }} className="admin-card border-l-4 border-purple-500">
            <Clock className="text-purple-500 mb-2" size={24} />
            <p className="text-slate-500 text-[10px] font-black uppercase">Peak Usage Hour</p>
            <h2 className="text-3xl font-black text-white">{hourlyData?.[0]?.hour || 'N/A'}</h2>
          </motion.div>
        </div>

        {/* DATA VISUALIZATION SECTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CHART: Top Users (Receipt Volume) */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Top Business Users</h3>
            <div className="admin-card min-h-[350px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={advData?.top_users || []} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="business_name" type="category" stroke="#94a3b8" fontSize={10} width={100} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                  <Bar dataKey="receipt_count" radius={[0, 10, 10, 0]}>
                    {advData?.top_users?.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* CHART: Most Visited Pages */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Page View Distribution</h3>
            <div className="admin-card min-h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={advData?.most_visited_pages || []}
                    dataKey="views"
                    nameKey="page_path"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {advData?.most_visited_pages?.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* CHART: Hourly Activity (Area Chart) */}
          <section className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">24h Engagement Pulse</h3>
            <div className="admin-card">
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="hour" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '16px'}} />
                    <Area type="step" dataKey="activity_count" stroke="#22c55e" fill="url(#colorAct)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
