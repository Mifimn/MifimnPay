"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, TrendingUp, FileText, Loader2, 
  QrCode, Download, ExternalLink, ChevronDown, ChevronUp, Link as LinkIcon,
  Package, ShoppingBag, ShoppingCart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useThemeStore } from '@/src/storefront/store/useThemeStore';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { isDark } = useThemeStore();
  const router = useRouter();
  const qrRef = useRef<HTMLDivElement>(null);

  const [yearReceipts, setYearReceipts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, count: 0, customers: 0 });

  const [storefrontStats, setStorefrontStats] = useState({ products: 0, totalOrders: 0, pendingOrders: 0 });
  const [recentStoreOrders, setRecentStoreOrders] = useState<any[]>([]);

  const [recentReceipts, setRecentReceipts] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isDownloadingQR, setIsDownloadingQR] = useState(false);

  const [isQrExpanded, setIsQrExpanded] = useState(false);

  const actualCurrentYear = new Date().getFullYear();
  const displayYear = Math.max(actualCurrentYear, 2026);
  const [selectedYear, setSelectedYear] = useState(displayYear);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: Math.max(1, actualCurrentYear - 2026 + 1) }, (_, i) => 2026 + i).reverse();

  useEffect(() => {
    const validateIdentity = async () => {
      if (loading) return;

      // 1. If not logged in at all, go to login
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. SESSION PROTECTION LOGIC
      // Check if the current session is marked as a 'vendor' session
      const role = localStorage.getItem('mifimn_user_role');

      if (role !== 'vendor') {
        console.warn("Unauthorized Access: Redirecting customer session away from Dashboard.");
        await supabase.auth.signOut();
        localStorage.removeItem('mifimn_user_role');
        router.push('/login');
        return;
      }

      // 3. If valid vendor session, fetch data
      fetchProfile();
      fetchGlobalStats();
      fetchStorefrontStats();
    };

    validateIdentity();
  }, [user, loading, router]);

  useEffect(() => {
    if (user && localStorage.getItem('mifimn_user_role') === 'vendor') {
       fetchYearlyData(selectedYear);
    }
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

  const fetchStorefrontStats = async () => {
    try {
      const { count: productCount } = await supabase
        .from('menu_items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, customer_name, created_at, status')
        .eq('vendor_id', user?.id) 
        .order('created_at', { ascending: false });

      if (ordersData) {
        const pending = ordersData.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;
        setStorefrontStats({
          products: productCount || 0,
          totalOrders: ordersData.length,
          pendingOrders: pending
        });
        setRecentStoreOrders(ordersData.slice(0, 5));
      }
    } catch (err) { console.error("Error fetching storefront stats:", err); }
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
  const storeUrl = `https://mifimnpay.com.ng/${businessSlug}`;

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

  const chartLineColor = isDark ? '#FF6B00' : '#18181b';
  const chartGridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><Loader2 className="animate-spin text-brand-orange" size={32} /></div>;

  return (
    <div className="space-y-8 pb-10 relative z-10">
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-orange/10 via-transparent to-transparent opacity-50 dark:opacity-20" />

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
          <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none shadow-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 outline-none shadow-sm">
            <option value="all">Full Year</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Revenue" value={`₦${stats.totalSales.toLocaleString()}`} icon={<TrendingUp size={20} />} color="text-brand-orange" bgGlow="bg-brand-orange/10" />
        <StatsCard title="Total Receipts" value={stats.count.toString()} icon={<FileText size={20} />} color="text-blue-500" bgGlow="bg-blue-500/10" />
        <StatsCard title="Active Clients" value={stats.customers.toString()} icon={<Users size={20} />} color="text-purple-500" bgGlow="bg-purple-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Active Products" value={storefrontStats.products.toString()} icon={<Package size={20} />} color="text-indigo-500" bgGlow="bg-indigo-500/10" />
        <StatsCard title="Storefront Orders" value={storefrontStats.totalOrders.toString()} icon={<ShoppingBag size={20} />} color="text-emerald-500" bgGlow="bg-emerald-500/10" />
        <StatsCard title="Pending Fulfillment" value={storefrontStats.pendingOrders.toString()} icon={<ShoppingCart size={20} />} color="text-amber-500" bgGlow="bg-amber-500/10" />
      </div>

      <section className="bg-slate-900/80 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[32px] overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <button 
          onClick={() => setIsQrExpanded(!isQrExpanded)}
          className="w-full p-8 flex items-center justify-between text-white hover:bg-white/5 transition-colors relative z-10"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-orange/90 backdrop-blur-sm rounded-2xl shadow-glow-orange border border-white/20">
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
              className="px-8 pb-10 relative z-10"
            >
              <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex-1 space-y-6 text-center md:text-left">
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-wide leading-relaxed">
                    Share your automated storefront. Customers scan this QR to place orders and view your professional price list.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button 
                      onClick={downloadQR} 
                      disabled={isDownloadingQR}
                      className="bg-white/90 backdrop-blur-md text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all"
                    >
                      {isDownloadingQR ? <Loader2 className="animate-spin" size={16}/> : <Download size={16} />} 
                      Download QR
                    </button>
                    <button 
                      onClick={copyStoreLink}
                      className="bg-white/5 backdrop-blur-sm text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <LinkIcon size={16} /> Copy Link
                    </button>
                    <a href={storeUrl} target="_blank" rel="noreferrer" className="bg-white/5 backdrop-blur-sm text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/10 transition-all">
                      <ExternalLink size={16} /> View Store
                    </a>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div ref={qrRef} className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] flex flex-col items-center border-[8px] border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
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

      <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase italic tracking-tighter">Revenue Insights</h3>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Live Sales Analytics</p>
          </div>
          {isFetching && <Loader2 className="animate-spin text-brand-orange" size={20} />}
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartLineColor} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={chartLineColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#64748b', fontWeight: 800}} 
                dy={10} 
                interval={selectedMonth === "all" ? 0 : 4} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 9, fill: '#64748b', fontWeight: 800}} 
                tickFormatter={(value) => value >= 1000 ? `₦${(value / 1000).toFixed(value % 1000 !== 0 ? 1 : 0)}k` : `₦${value}`}
                domain={[0, 'auto']} 
                width={45}
                allowDataOverflow={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
                  backdropFilter: 'blur(12px)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', 
                  borderRadius: '20px',
                  borderWidth: '1px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                }} 
                labelStyle={{ fontWeight: 'black', textTransform: 'uppercase', fontSize: '10px', color: isDark ? '#fff' : '#000' }}
                itemStyle={{ color: '#FF6B00', fontWeight: 'black', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke={chartLineColor} 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase italic tracking-tighter">Recent Receipts</h3>
          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] divide-y divide-slate-100 dark:divide-white/5">
            {recentReceipts.length > 0 ? recentReceipts.map((r, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg uppercase border border-white/20 dark:border-white/5">{r.customer_name?.[0] || 'W'}</div>
                  <div>
                    <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{r.customer_name || 'Walk-in'}</p>
                    <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">#{r.receipt_number} • {new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="font-black text-brand-orange text-lg">₦{Number(r.total_amount).toLocaleString()}</span>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No recent receipts found.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 dark:bg-black/40 backdrop-blur-2xl rounded-[32px] p-8 text-white h-fit shadow-2xl border border-white/10 dark:border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 blur-[50px] rounded-full pointer-events-none" />
           <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4 relative z-10">Billing</h4>
           <p className="text-slate-300 text-xs font-bold uppercase tracking-wide leading-relaxed mb-8 relative z-10">Ready to generate a professional receipt for a client?</p>
           <button onClick={() => router.push('/generate')} className="w-full py-5 bg-brand-orange/90 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-glow-orange active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10">
             <Plus size={18} strokeWidth={4}/> Create New
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase italic tracking-tighter">Storefront Orders</h3>
          <div className="bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] divide-y divide-slate-100 dark:divide-white/5">
            {recentStoreOrders.length > 0 ? recentStoreOrders.map((o, i) => {
              let statusColor = 'text-slate-500';
              if (o.status === 'pending' || o.status === 'processing') statusColor = 'text-amber-500';
              if (o.status === 'shipped') statusColor = 'text-blue-500';
              if (o.status === 'completed') statusColor = 'text-green-500';
              if (o.status === 'cancelled') statusColor = 'text-red-500';

              return (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/50 dark:hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg uppercase border border-white/20 dark:border-white/5">{o.customer_name?.[0] || 'O'}</div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{o.customer_name || 'Online Order'}</p>
                      <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">
                        Status: <span className={statusColor}>{o.status || 'Received'}</span> • {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-brand-orange text-lg">₦{Number(o.total_amount || 0).toLocaleString()}</span>
                </div>
              );
            }) : (
              <div className="p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">No recent store orders yet.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/80 dark:bg-black/40 backdrop-blur-2xl rounded-[32px] p-8 text-white h-fit shadow-2xl border border-white/10 dark:border-white/5 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full pointer-events-none" />
           <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-4 relative z-10">Inventory</h4>
           <p className="text-slate-300 text-xs font-bold uppercase tracking-wide leading-relaxed mb-8 relative z-10">Add new products or digital items to your storefront catalog.</p>
           <button onClick={() => router.push('/products/add')} className="w-full py-5 bg-white/90 backdrop-blur-md border border-white/20 text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10">
             <Package size={18} strokeWidth={4}/> Add Product
           </button>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color, bgGlow }: any) {
  return (
    <div className="relative group bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl p-8 rounded-[32px] border border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden transition-all hover:-translate-y-1">
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none ${bgGlow}`} />
      <div className={`relative z-10 w-12 h-12 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 ${color} border border-white/40 dark:border-white/5 shadow-sm`}>{icon}</div>
      <p className="relative z-10 text-[10px] text-slate-500 mb-1 font-black uppercase tracking-widest">{title}</p>
      <h3 className="relative z-10 text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{value}</h3>
    </div>
  );
}