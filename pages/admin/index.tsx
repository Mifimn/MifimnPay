import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Users, Receipt, Banknote, ShieldCheck, Zap, LogOut, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    async function initializeDashboard() {
      try {
        // 1. Quick Session Check
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        // 2. Verify Admin Status First (Fastest Call)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile?.is_admin) {
          router.push('/dashboard');
          return;
        }

        // 3. Fetch Data with Individual Error Catching
        // Using Promise.allSettled so one failure doesn't stop the whole page
        const [statsResult, trendsResult] = await Promise.allSettled([
          supabase.rpc('get_admin_stats'),
          supabase.rpc('get_platform_trends')
        ]);

        if (statsResult.status === 'fulfilled' && !statsResult.value.error) {
          setStats(statsResult.value.data);
        } else {
          // Fallback empty stats if RPC fails
          setStats({ total_users: 0, total_receipts: 0, total_revenue: 0, pro_users: 0 });
          console.error("Stats RPC Error");
        }

        if (trendsResult.status === 'fulfilled' && !trendsResult.value.error) {
          setTrends(trendsResult.value.data || []);
        }

      } catch (err: any) {
        console.error("Critical Dashboard Error:", err);
        setError(err.message);
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

  if (!isMounted) return null;

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
       <motion.div 
         animate={{ rotate: 360 }} 
         transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
         className="mb-4"
       >
        <Zap className="text-green-500" size={48} />
      </motion.div>
      <p className="text-slate-500 font-bold animate-pulse text-xs tracking-widest uppercase">
        Establishing Secure Connection...
      </p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center">
      <AlertTriangle className="text-red-500 mb-4" size={48} />
      <h2 className="text-white text-xl font-bold mb-2">Connection Timeout</h2>
      <p className="text-slate-400 max-w-sm mb-6">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-white text-black px-6 py-2 rounded-xl font-bold">
        Retry Connection
      </button>
    </div>
  );

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="space-y-8 pb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white">Platform Analysis</h1>
            <p className="text-slate-400 text-sm font-medium">System operational.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-500/20 transition-all">
              <LogOut size={16} /> LOGOUT
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', val: stats?.total_users ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Receipts Issued', val: stats?.total_receipts ?? 0, icon: Receipt, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Revenue', val: `₦${(stats?.total_revenue ?? 0).toLocaleString()}`, icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Verified Businesses', val: stats?.pro_users ?? 0, icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((s, i) => (
            <div key={i} className="admin-card">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mb-4`}>
                <s.icon className={s.color} size={24} />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              <h2 className="text-3xl font-black mt-1 text-white">{s.val}</h2>
            </div>
          ))}
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="admin-card min-h-[400px]">
            <h3 className="text-sm font-black uppercase tracking-widest mb-8 text-white">Activity Trend</h3>
            {trends.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="day" stroke="#475569" fontSize={10} />
                    <YAxis stroke="#475569" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                    <Area type="monotone" dataKey="receipt_count" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-600 italic">
                Insufficient data for trends
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
