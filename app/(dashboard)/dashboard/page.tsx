"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Updated for App Router
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, TrendingUp, FileText, Loader2, 
  QrCode, Download, ExternalLink, ChevronDown, ChevronUp, Link as LinkIcon 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabaseClient'; // Path alias update
import { useAuth } from '@/lib/AuthContext';
import { useThemeStore } from '@/storefront/store/useThemeStore'; // Using the updated storefront theme store

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { isDark } = useThemeStore(); // Updated to use isDark state
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [yearReceipts, setYearReceipts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);

  const [isQrExpanded, setIsQrExpanded] = useState(false);

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) {
      fetchProfile();
      fetchGlobalStats();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchYearlyData(selectedYear);
  }, [user, selectedYear]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (data) setProfile(data);
    } catch (err) { console.error(err); }
  };

  const fetchGlobalStats = async () => {
    try {
      const { data: statsData } = await supabase.rpc('get_dashboard_stats', { target_user_id: user?.id });
      const { data: recent } = await supabase
        .from('receipts')
        .select('total_amount, customer_name, created_at, receipt_number')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (statsData) {
        setStats(prev => ({ ...prev, totalSales: statsData.total_revenue || 0, count: statsData.total_receipts || 0 }));
      }
      if (recent) setRecentReceipts(recent);
    } catch (err) { console.error(err); }
  };

  const fetchYearlyData = async (year: number) => {
    setIsFetching(true);
    try {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      const { data } = await supabase.from('receipts').select('total_amount, created_at, customer_name').eq('user_id', user?.id).gte('created_at', startDate).lte('created_at', endDate).order('created_at', { ascending: true });
      if (data) {
        setYearReceipts(data);
        const unique = new Set(data.map(r => r.customer_name)).size;
        setStats(prev => ({ ...prev, customers: unique }));
      }
    } catch (err) { console.error(err); } finally { setIsFetching(false); }
  };

  const businessSlug = profile?.slug || profile?.business_name?.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') || '';
  const storeUrl = `https://mifimnpay.com.ng/${businessSlug}`; // Updated to new storefront URL pattern]

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    alert("Store link copied!");
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    setIsDownloadingQR(true);
    try {
      const dataUrl = await toPng(qrRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `qr-${businessSlug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error(err); } finally { setIsDownloadingQR(false); }
  };

  const chartData = useMemo(() => {
    if (selectedMonth === "all") {
      return months.map((m, index) => {
        const total = yearReceipts.filter(r => new Date(r.created_at).getMonth() === index).reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        return { name: m, total };
      });
    } else {
      const monthIndex = months.indexOf(selectedMonth);
      const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const total = yearReceipts.filter(r => {
          const d = new Date(r.created_at);
          return d.getMonth() === monthIndex && d.getDate() === day;
        }).reduce((acc, r) => acc + (Number(r.total_amount) || 0), 0);
        return { name: `${day}`, total };
      });
    }
  }, [yearReceipts, selectedYear, selectedMonth, months]);

  const chartLineColor = isDark ? '#FF6B00' : '#18181b'; // Using brand-orange for dark mode chart
  const chartGridColor = isDark ? '#27272a' : '#f4f4f5';

  if (loading) return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={32} /></div>;

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
            Performance metrics for {profile?.business_name}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none">
            <option value="all">Full Year</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-brand-orange" />
        <StatsCard title="Total Receipts" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-500" />
        <StatsCard title="Active Clients" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-500" />
      </div>

      {/* QR Storefront Tools (Swell Mimic) */}
      <section className="bg-slate-900 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
        <button 
          onClick={() => setIsQrExpanded(!isQrExpanded)}
          className="w-full p-8 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-orange rounded-2xl shadow-glow-orange">
              <QrCode size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-black tracking-tighter uppercase italic">Storefront Tools</h2>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Digital Price List & Acquisition</p>
            </div>
          </div>
          {isQrExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        <AnimatePresence>
          {isQrExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-8 pb-10"
            >
              <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wide leading-relaxed">
                    Share your automated storefront. Customers scan this QR to place orders and view your professional price list.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button 
                      onClick={downloadQR} 
                      disabled={isDownloadingQR}
                      className="bg-white text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                    >
                      {isDownloadingQR ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} 
                      Download QR
                    </button>
                    <button 
                      onClick={copyStoreLink}
                      className="bg-white/10 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <LinkIcon size={16} /> Copy Link
                    </button>
                    <a href={storeUrl} target="_blank" rel="noreferrer" className="bg-white/10 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/20 transition-all">
                      <ExternalLink size={16} /> View Store
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div ref={qrRef} className="bg-white p-6 rounded-[32px] flex flex-col items-center border-[10px] border-slate-800 shadow-2xl">
                    <QRCodeSVG value={storeUrl} size={140} level="H" />
                    <div className="mt-4 text-center">
                      <p className="text-black text-[9px] font-black uppercase tracking-[0.2em]">{profile?.business_name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Chart Section */}
      <div className="bg-white dark:bg-[#0f0f0f] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase italic tracking-tighter">Revenue Insights</h3>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Live Sales Analytics</p>
          </div>
          {isFetching && <Loader2 className="animate-spin text-brand-orange" size={20} />}
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartLineColor} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={chartLineColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#64748b', fontWeight: 800}} dy={10} interval={selectedMonth === "all" ? 0 : 4} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#18181b' : '#ffffff', 
                  borderColor: isDark ? '#27272a' : '#e2e8f0', 
                  borderRadius: '20px',
                  borderWidth: '1px'
                }} 
                labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: isDark ? '#fff' : '#000' }}
                itemStyle={{ color: '#FF6B00', fontWeight: 'black', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="total" stroke={chartLineColor} strokeWidth={4} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase italic tracking-tighter">Recent History</h3>
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/10 rounded-[32px] overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-white/5">
            {recentReceipts.map((r, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-white/10 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg uppercase transition-colors">{r.customer_name?.[0] || 'W'}</div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{r.customer_name || 'Walk-in'}</p>
                    <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="font-black text-brand-orange text-lg">₦{Number(r.total_amount).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Quick Action Box */}
        <div className="bg-slate-900 dark:bg-white/5 rounded-[32px] p-8 text-white h-fit shadow-2xl border border-transparent dark:border-white/10">
           <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4">Billing</h4>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wide leading-relaxed mb-8">Ready to generate a professional receipt for a client?</p>
           <button onClick={() => router.push('/generate')} className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-glow-orange active:scale-95 transition-all flex items-center justify-center gap-3">
             <Plus size={18} strokeWidth={4}/> Create New
           </button>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white dark:bg-[#0f0f0f] p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm">
      <div className={`w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 ${color} border border-slate-100 dark:border-white/10`}>{icon}</div>
      <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{value}</h3>
    </div>
  );
}
