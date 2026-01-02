import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import DashboardNavbar from '../components/dashboard/DashboardNavbar';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [businessName, setBusinessName] = useState('Vendor');
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const checkProfile = async () => {
        const { data } = await supabase.from('profiles').select('business_name').eq('id', user.id).single();
        if (!data?.business_name || data.business_name === 'My Business') {
          router.push('/onboarding');
        } else {
          setBusinessName(data.business_name);
          setIsChecking(false);
        }
      };
      checkProfile();
    }
  }, [user, loading, router]);

  if (loading || isChecking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-brand-bg pb-20">
      <Head><title>Dashboard | MifimnPay</title></Head>
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-black mb-8">Welcome back, {businessName} 👋</h1>
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
            <FileText className="mx-auto text-zinc-300 mb-4" size={48} />
            <h3 className="font-bold text-zinc-950">No receipts found</h3>
            <p className="text-zinc-500 mb-6">Start by creating your first professional receipt.</p>
            <button onClick={() => router.push('/generate')} className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2">
                <Plus size={20} /> Create New Receipt
            </button>
        </div>
      </main>
    </div>
  );
}