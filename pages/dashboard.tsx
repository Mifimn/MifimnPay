import { useEffect, useState, useMemo, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, TrendingUp, FileText, Loader2, 
  Calendar, QrCode, Download, ExternalLink, ChevronDown, ChevronUp, Link as LinkIcon 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext'; // Imported useTheme hook
import DashboardNavbar from '../components/dashboard/DashboardNavbar';
import ProfileAlert from '../components/dashboard/ProfileAlert';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { theme } = useTheme(); // Getting the active theme for dynamic chart colors
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [yearReceipts, setYearReceipts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });
  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);

  // State to manage mobile visibility of the QR Section
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
  }, [user, loading]);

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
  const storeUrl = `https://mifimnpay.com.ng/m/${businessSlug}`;

  const copyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    alert("Store link copied to clipboard! You can now paste it on WhatsApp or SMS.");
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    setIsDownloadingQR(true);
    try {
      const dataUrl = await toPng(qrRef.current, { pixelRatio: 3, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `qr-code-${businessSlug}.png`;
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
  }, [yearReceipts, selectedYear, selectedMonth]);

  // Dynamic colors for the chart based on the current theme
  const chartLineColor = theme === 'dark' ? '#ffffff' : '#18181b';
  const chartGridColor = theme === 'dark' ? '#27272a' : '#f4f4f5';

  if (loading) return <div className="min-h-screen bg-brand-bg flex items-center justify-center transition-colors duration-300"><Loader2 className="animate-spin text-brand-black" size={32} /></div>;

  return (
    <div className="min-h-screen bg-brand-bg pb-20 font-sans transition-colors duration-300">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      <ProfileAlert />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* BUSINESS OVERVIEW (Moved to Top for Phone View) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-brand-black tracking-tight transition-colors duration-300">Business Overview</h1>
            <p className="text-brand-gray font-medium tracking-tight transition-colors duration-300">Real-time performance for {profile?.business_name}.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-brand-paper border-2 border-brand-border rounded-xl px-4 py-2 text-xs font-black text-brand-gray outline-none transition-colors duration-300 cursor-pointer">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-brand-paper border-2 border-brand-border rounded-xl px-4 py-2 text-xs font-black text-brand-gray outline-none transition-colors duration-300 cursor-pointer">
              <option value="all">Full Year</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard title="Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-green-600 dark:text-green-500" />
          <StatsCard title="Receipts" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-600 dark:text-blue-500" />
          <StatsCard title="Active Clients" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-600 dark:text-purple-500" />
        </div>

        {/* COLLAPSIBLE QR STOREFRONT SECTION (Optimized for Mobile) */}
        <section className="bg-zinc-900 border border-transparent dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl transition-all duration-300">
          <button 
            onClick={() => setIsQrExpanded(!isQrExpanded)}
            className="w-full p-6 md:p-8 flex items-center justify-between text-white hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl text-white">
                <QrCode size={20} />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-black tracking-tight text-white">QR Storefront Tools</h2>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Live Price List & QR Generator</p>
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
                className="px-6 pb-8 md:px-8 md:pb-10"
              >
                <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <p className="text-zinc-400 text-sm font-medium max-w-md leading-relaxed">
                      Update your product prices in Settings. Customers scan this QR to see your live storefront instantly.
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <button 
                        onClick={downloadQR} 
                        disabled={isDownloadingQR}
                        className="bg-white text-zinc-900 px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                      >
                        {isDownloadingQR ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} 
                        Download QR Image
                      </button>
                      <button 
                        onClick={copyStoreLink}
                        className="bg-zinc-800 text-white px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 border border-zinc-700 hover:bg-zinc-700 transition-all"
                      >
                        <LinkIcon size={16} /> Copy Store Link
                      </button>
                      <a href={storeUrl} target="_blank" rel="noreferrer" className="bg-zinc-800 text-white px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 border border-zinc-700 hover:bg-zinc-700 transition-all">
                        <ExternalLink size={16} /> Open Web Store
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div ref={qrRef} className="bg-white p-6 rounded-3xl flex flex-col items-center border-[8px] border-zinc-800 shadow-2xl">
                      <QRCodeSVG value={storeUrl} size={150} level="H" />
                      <div className="mt-4 text-center">
                        <p className="text-zinc-900 text-[10px] font-black uppercase tracking-[0.2em]">{profile?.business_name || 'MifimnPay User'}</p>
                        <p className="text-zinc-400 text-[8px] font-bold uppercase mt-1">Scan for Live Price List</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* CHART SECTION */}
        <div className="bg-brand-paper p-8 rounded-3xl border border-brand-border shadow-sm transition-colors duration-300">
           <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4 text-center md:text-left">
            <div>
              <h3 className="font-bold text-brand-black text-lg transition-colors duration-300">{selectedMonth === "all" ? `Revenue Trend (${selectedYear})` : `${selectedMonth} ${selectedYear} Breakdown`}</h3>
              <p className="text-xs text-brand-gray font-bold uppercase tracking-[0.15em] transition-colors duration-300">{selectedMonth === "all" ? "Monthly Cumulative" : "Daily Sales Tracking"}</p>
            </div>
            {isFetching && <Loader2 className="animate-spin text-brand-gray" size={20} />}
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={chartLineColor} stopOpacity={0.1}/><stop offset="95%" stopColor={chartLineColor} stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#a1a1aa', fontWeight: 700}} dy={10} interval={selectedMonth === "all" ? 0 : 4} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', 
                    borderColor: theme === 'dark' ? '#27272a' : '#e2e8f0', 
                    color: theme === 'dark' ? '#fafafa' : '#000000',
                    borderRadius: '16px', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
                  }} 
                  itemStyle={{ color: theme === 'dark' ? '#fafafa' : '#000000', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="total" stroke={chartLineColor} strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-brand-black text-lg transition-colors duration-300">Recent History</h3>
            <div className="bg-brand-paper border border-brand-border rounded-3xl overflow-hidden shadow-sm divide-y divide-brand-border transition-colors duration-300">
              {recentReceipts.map((r, i) => (
                <div key={i} className="p-5 flex items-center justify-between hover:bg-brand-bg transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-bg rounded-2xl flex items-center justify-center text-brand-gray font-black text-lg uppercase transition-colors duration-300">{r.customer_name?.[0] || 'W'}</div>
                    <div>
                      <p className="font-bold text-brand-black text-sm transition-colors duration-300">{r.customer_name || 'Walk-in'}</p>
                      <p className="text-[10px] text-brand-gray font-bold tracking-tight uppercase transition-colors duration-300">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="font-black text-brand-black transition-colors duration-300">₦{Number(r.total_amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* DYNAMIC CTA BOX */}
          <div className="bg-brand-black rounded-3xl p-8 text-brand-paper h-fit shadow-2xl space-y-6 transition-colors duration-300 border border-transparent dark:border-brand-border">
             <h4 className="text-2xl font-black">Issue Billing</h4>
             <p className="text-brand-paper opacity-70 text-sm font-medium leading-relaxed">Ready to generate a professional receipt for a client?</p>
             <button onClick={() => router.push('/generate')} className="w-full py-5 bg-brand-paper text-brand-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
               <Plus size={22} strokeWidth={3}/> New Receipt
             </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-brand-paper p-8 rounded-3xl border border-brand-border shadow-sm transition-colors duration-300">
      <div className={`w-12 h-12 bg-brand-bg rounded-2xl flex items-center justify-center mb-6 ${color} border border-brand-border transition-colors duration-300`}>{icon}</div>
      <p className="text-xs text-brand-gray mb-1 font-black uppercase tracking-widest transition-colors duration-300">{title}</p>
      <h3 className="text-3xl font-black text-brand-black tracking-tight transition-colors duration-300">{value}</h3>
    </div>
  );
}
