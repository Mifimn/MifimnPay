import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, ArrowUpRight, Loader2, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchDashboardData();
  }, [user, loading]);

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      const { data: receipts } = await supabase
        .from('receipts')
        .select('total_amount, customer_name, created_at, receipt_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (receipts) {
        const total = receipts.reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        const uniqueCustomers = new Set(receipts.map(r => r.customer_name)).size;
        
        setStats({ totalSales: total, count: receipts.length, customers: uniqueCustomers });
        setRecentReceipts(receipts.slice(0, 5)); // Get last 5
      }
    } catch (err) { console.error(err); }
    finally { setIsFetching(false); }
  };

  if (loading || isFetching) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <Loader2 className="animate-spin text-zinc-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-zinc-900">Business Overview</h1>
          <p className="text-zinc-500 text-sm">Real-time performance of your business.</p>
        </motion.div>

        {/* 1. Functional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Total Sales" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} trend="+ Live" color="text-green-600" />
          <StatsCard title="Receipts Generated" value={stats.count.toString()} icon={<FileText size={20} />} trend="Total" color="text-blue-600" />
          <StatsCard title="Active Customers" value={stats.customers.toString()} icon={<Users size={20} />} trend="Unique" color="text-purple-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2. Recent Transactions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-zinc-900">Recent Receipts</h3>
              <Link href="/history" className="text-sm text-zinc-500 hover:text-zinc-900 flex items-center gap-1">View All <ArrowUpRight size={14}/></Link>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
              {recentReceipts.length > 0 ? (
                <div className="divide-y divide-zinc-100">
                  {recentReceipts.map((r, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold uppercase">{r.customer_name[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{r.customer_name}</p>
                          <p className="text-xs text-zinc-400">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-zinc-900">₦{Number(r.total_amount).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-400 italic text-sm">No receipts generated yet.</div>
              )}
            </div>
          </div>

          {/* 3. Quick Actions & Growth Panel */}
          <div className="space-y-4">
             <h3 className="font-bold text-zinc-900">Growth</h3>
             <div className="bg-zinc-900 rounded-2xl p-6 text-white space-y-4 relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-zinc-400 text-xs uppercase font-bold tracking-widest mb-1">Coming Soon</p>
                  <h4 className="text-lg font-bold mb-2">Detailed Analytics</h4>
                  <p className="text-sm text-zinc-400 mb-6">Track your monthly growth and customer retention automatically.</p>
                  <button onClick={() => router.push('/generate')} className="w-full py-3 bg-white text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all">
                    <Plus size={18}/> New Receipt
                  </button>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-zinc-50 rounded-xl ${color}`}>{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">{trend}</span>
      </div>
      <p className="text-sm text-zinc-500 mb-1">{title}</p>
      <h3 className="text-2xl font-black text-zinc-900">{value}</h3>
    </div>
  );
}
