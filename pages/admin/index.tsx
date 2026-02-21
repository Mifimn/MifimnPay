import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../lib/AuthContext';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { TrendingUp, Users, Receipt, CreditCard, Loader2 } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReceipts: 0,
    totalRevenue: 0,
    proUsers: 0
  });
  const [chartData, setChartData] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
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
          setIsAdmin(true);
          await fetchRealStats();
        } else {
          router.push('/dashboard');
        }
      }
    };

    checkAdminAndFetchData();
  }, [user, loading]);

  const fetchRealStats = async () => {
    try {
      // 1. Fetch Total Users
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      // 2. Fetch Total Receipts
      const { count: receiptCount } = await supabase.from('receipts').select('*', { count: 'exact', head: true });

      // 3. Fetch Transaction Data for Revenue (Simulated from your transactions table)
      const { data: transactions } = await supabase.from('transactions').select('amount').eq('status', 'success');
      const totalRev = transactions?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

      // 4. Fetch Chart Data (Last 7 days of activity)
      const { data: activityData } = await supabase.rpc('get_receipt_stats_by_day'); 
      // Note: We will create this SQL function in Step 2

      setStats({
        totalUsers: userCount || 0,
        totalReceipts: receiptCount || 0,
        totalRevenue: totalRev,
        proUsers: 0 // Logic for Pro users can be added here later
      });
      setChartData(activityData || []);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  if (loading || isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="animate-spin text-green-500" size={48} />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="admin-card flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm opacity-60">Total Users</p>
            <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="admin-card flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><Receipt size={24} /></div>
          <div>
            <p className="text-sm opacity-60">Receipts Created</p>
            <h3 className="text-2xl font-bold">{stats.totalReceipts}</h3>
          </div>
        </div>

        <div className="admin-card flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm opacity-60">Revenue</p>
            <h3 className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="admin-card flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg"><CreditCard size={24} /></div>
          <div>
            <p className="text-sm opacity-60">Active Sessions</p>
            <h3 className="text-2xl font-bold">Active</h3>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Growth Chart */}
        <div className="admin-card">
          <h4 className="text-lg font-bold mb-6">Receipt Generation Trend</h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="admin-card overflow-hidden">
          <h4 className="text-lg font-bold mb-6">Quick Overview</h4>
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm opacity-70">Platform Status</span>
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full font-bold">LIVE</span>
             </div>
             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50">
                <span className="text-sm opacity-70">Database Region</span>
                <span className="text-xs bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full font-bold">AWS-EU</span>
             </div>
             <p className="text-xs text-center opacity-40 mt-10">Data refreshes every time you load this page.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
