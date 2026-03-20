"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import ProfileAlert from '@/components/dashboard/ProfileAlert';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, ShieldAlert, ArrowRight } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      // 1. Redirect if not logged in
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. Redirect if role is 'customer' (Customers should never see this layout)
      if (role === 'customer') {
        router.push('/');
        return;
      }

      // 3. Fetch Verification Status for Vendors
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_verified, verification_status')
          .eq('id', user.id)
          .single();

        if (data) setProfile(data);
      } catch (err) {
        console.error("Layout verification check failed:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, loading, role, router]);

  // Loading state for the entire dashboard shell
  if (loading || isChecking) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gray">
          Initializing Secure Session...
        </p>
      </div>
    );
  }

  // Verification Wall: If vendor is not verified, show a restricted view
  if (profile && !profile.is_verified) {
    return (
      <div className="h-screen w-full bg-brand-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-brand-paper border border-brand-border rounded-[40px] p-10 text-center shadow-2xl">
          <div className="w-20 h-20 bg-brand-orange/10 text-brand-orange rounded-3xl flex items-center justify-center mx-auto mb-8">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-3xl font-black text-brand-black tracking-tighter uppercase italic mb-4">
            Identity Required
          </h2>
          <p className="text-brand-gray text-sm font-bold uppercase tracking-tight leading-relaxed mb-10">
            To prevent fraud and maintain the security of our community, all vendors must verify their identity before accessing business tools.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => router.push('/verify')}
              className="w-full py-5 bg-brand-black text-brand-paper rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-brand-orange transition-all"
            >
              Start Verification <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => supabase.auth.signOut()}
              className="w-full py-5 text-brand-gray font-black uppercase text-[10px] tracking-widest hover:text-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full Dashboard Access
  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-black transition-colors duration-300">
      <ProfileAlert />

      {/* Main Navigation Menu */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 md:p-10 w-full min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}