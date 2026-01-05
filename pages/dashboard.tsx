import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Plus, History, Settings, LogOut, 
  TrendingUp, FileText, User, Loader2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import ProfileAlert from '../components/dashboard/ProfileAlert';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  // State for dashboard data
  const [stats, setStats] = useState({ totalRevenue: 0, totalReceipts: 0 });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 1. Fetch Headlines (Using the SQL Function we created)
        // This is FAST and won't crash even with 1,000,000 receipts
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_dashboard_stats', { target_user_id: user.id });

        if (!statsError && statsData) {
          setStats({
            totalRevenue: statsData.total_revenue || 0,
            totalReceipts: statsData.total_receipts || 0
          });
        }

        // 2. Fetch Recent Activity (Limit to last 5 only)
        const { data: recent, error: recentError } = await supabase
          .from('receipts')
          .select('id, receipt_number, customer_name, total_amount, date:created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (!recentError && recent) {
          setRecentReceipts(recent);
        }

        // 3. Fetch Chart Data (Last 7 Days Only)
        // We fetch minimal data just to draw the graph
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: graphData } = await supabase
          .from('receipts')
          .select('created_at, total_amount')
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true });

        if (graphData) {
          // Group data by day for the chart
          const formattedChart = processChartData(graphData);
          setChartData(formattedChart);
        }

      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) fetchDashboardData();
  }, [user, authLoading]);

  // Helper to group raw data by date for the chart
  const processChartData = (data: any[]) => {
    const grouped: any = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      grouped[date] = (grouped[date] || 0) + Number(item.total_amount);
    });
    return Object.keys(grouped).map(date => ({ name: date, amount: grouped[date] }));
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-zinc-900" size={32} />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Head><title>Dashboard | MifimnPay</title></Head>

      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Overview</h1>
        <button onClick={handleSignOut} className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Profile Alert Component */}
      <ProfileAlert />

      <main className="max-w-md mx-auto p-6 space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <div className="p-1.5 bg-green-100 text-green-700 rounded-lg"><TrendingUp size={16} /></div>
              <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
            </div>
            <p className="text-2xl font-black text-zinc-900">₦{stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-zinc-500">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg"><FileText size={16} /></div>
              <span className="text-xs font-bold uppercase tracking-wider">Receipts</span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{stats.totalReceipts}</p>
          </div>
        </div>

        {/* Chart Section - FIXED HEIGHT Wrapper */}
        <section className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 mb-6">Sales Trend (Last 7 Days)</h3>

          {/* CRITICAL FIX: This div with h-[200px] ensures the chart 
              always has a size, preventing the "width(-1)" crash.
          */}
          <div className="h-[200px] w-full"> 
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#a1a1aa'}} 
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                    itemStyle={{color: '#18181b', fontWeight: 'bold'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#18181b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                <TrendingUp size={32} className="mb-2 opacity-50"/>
                <p className="text-xs">No sales in last 7 days</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-sm font-bold text-zinc-900">Recent Activity</h3>
            <Link href="/history" className="text-xs font-bold text-zinc-500 hover:text-zinc-900">View All</Link>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
            {recentReceipts.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {recentReceipts.map((receipt) => (
                  <div key={receipt.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900">{receipt.customer_name || 'Walk-in'}</p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase">#{receipt.receipt_number} • {new Date(receipt.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm text-zinc-900">₦{Number(receipt.total_amount).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400">
                <p className="text-sm">No receipts yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <Link href="/generate" className="fixed bottom-6 right-6 bg-zinc-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40">
        <Plus size={24} />
      </Link>
    </div>
  );
}