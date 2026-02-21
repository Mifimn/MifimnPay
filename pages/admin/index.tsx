import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { Users, Receipt, Banknote, ShieldCheck, Zap, Loader2, LogOut } from 'lucide-react';

const containerVars = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVars = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 1. Prevent Hydration Mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Auth Protection and Data Fetching
  useEffect(() => {
    if (!isMounted) return;

    const checkAdminAndFetchData = async () => {
      if (!loading && !user) {
        router.push('/login');
        return;
      }

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profile?.is_admin) {
          await loadDashboardData();
        } else {
          router.push('/dashboard');
        }
      }
    };

    checkAdminAndFetchData();
  }, [user, loading, isMounted, router]);

  const loadDashboardData = async () => {
    try {
      // Calling Supabase RPC functions for heavy calculations
      const { data: adminStats, error: statsError } = await supabase.rpc('get_admin_stats');
      const { data: trendData, error: trendError } = await supabase.rpc('get_platform_trends');
      
      if (statsError) throw statsError;
      
      setStats(adminStats);
      setTrends(trendData || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!isMounted || loading || isDataLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Zap className="text-green-500" size={48} />
        </motion.div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <motion.div 
        variants={containerVars} 
        initial="hidden" 
        animate="visible" 
        className="space-y-8 pb-12"
      >
        {/* SECTION 1: HEADER & LOGOUT */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white">Platform Analysis</h1>
            <p className="text-slate-400 text-sm font-medium">Real-time data processed via Supabase Engine.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-500/20 transition-all"
            >
              <LogOut size={16} /> LOGOUT
            </button>
            <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-500 rounded-2xl text-xs font-bold flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM LIVE
            </span>
          </div>
        </div>

        {/* SECTION 2: KEY STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', val: stats.total_users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Receipts Issued', val: stats.total_receipts, icon: Receipt, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Revenue', val: `₦${stats.total_revenue.toLocaleString()}`, icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Verified Businesses', val: stats.pro_users, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((s, i) => (
            <motion.div key={i} variants={itemVars} className="admin-card group hover:border-green-500/50 transition-all cursor-default">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <s.icon className={s.color} size={24} />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              <h2 className="text-3xl font-black mt-1 text-white">{s.val}</h2>
            </motion.div>
          ))}
        </div>

        {/* SECTION 3: ADVANCED CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Multi-Line Area Chart */}
          <motion.div variants={itemVars} className="admin-card min-h-[450px]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2 text-white">
              <div className="w-1 h-4 bg-green-500 rounded-full" /> Growth & Activity
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', color: '#fff' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receipt_count" 
                    stroke="#22c55e" 
                    fillOpacity={1} 
                    fill="url(#colorReceipt)" 
                    strokeWidth={4} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-6 justify-center">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-3 h-1 bg-green-500 rounded-full" /> DAILY RECEIPTS
              </div>
            </div>
          </motion.div>

          {/* Bar Chart for Volume */}
          <motion.div variants={itemVars} className="admin-card">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-white">Volume Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
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
            <p className="text-center text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-widest">
              Last 7 active days volume
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminDashboard;
