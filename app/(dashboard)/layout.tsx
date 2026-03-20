"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import ProfileAlert from '@/components/dashboard/ProfileAlert';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;

      // 1. Redirect if not logged in
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. Redirect if role is 'customer'
      // Only users with the 'vendor' role should see this dashboard shell
      if (role === 'customer') {
        router.push('/');
        return;
      }
    };

    checkAccess();
  }, [user, loading, role, router]);

  // Loading state for the entire dashboard shell
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-brand-bg">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-black transition-colors duration-300">
      {/* Notifications/Alerts */}
      <ProfileAlert />

      {/* Main Navigation Sidebar (Always visible to logged-in vendors) */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        <div className="max-w-7xl mx-auto p-6 md:p-10 w-full min-h-full">
          {/* Content is rendered here. 
            Individual pages (like Dashboard or Generate) will handle 
            locking specific features if the vendor isn't verified.
          */}
          {children}
        </div>
      </main>
    </div>
  );
}