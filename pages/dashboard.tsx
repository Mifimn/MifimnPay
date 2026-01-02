import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus, Users, TrendingUp, FileText, ArrowUpRight, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('Vendor');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) fetchProfile();
  }, [user, loading]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', user?.id)
      .single();
    if (data?.business_name) setBusinessName(data.business_name);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-brand-black">Welcome back, {businessName} 👋</h1>
          <p className="text-brand-gray text-sm">Here is your business overview.</p>
        </motion.div>

        {/* Stats Cards and Recent History here... */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
            <FileText className="mx-auto text-zinc-300 mb-4" size={48} />
            <h3 className="font-bold">No receipts found</h3>
            <p className="text-zinc-500 mb-6">Start by creating your first professional receipt.</p>
            <button onClick={() => router.push('/generate')} className="bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2">
                <Plus size={20} /> Create New Receipt
            </button>
        </div>
      </main>
    </div>
  );
}
