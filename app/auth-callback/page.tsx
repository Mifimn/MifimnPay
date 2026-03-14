"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Updated import for App Router
import { supabase } from '@/lib/supabaseClient'; // Uses your root lib alias
import { Loader2 } from 'lucide-react';

/**
 * AuthCallback Component
 * Handles post-login redirection based on user profile status.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // 1. Get the current session user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error("Auth error:", authError);
        router.push('/login');
        return;
      }

      // 2. Fetch their profile to check business setup and admin status
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_name, is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Default to dashboard if profile fetch fails but user exists
        router.push('/dashboard');
        return;
      }

      // 3. Traffic Control Redirect Logic
      if (profile?.is_admin) {
        // Redirect to the new admin route group path
        router.push('/admin');
      } else if (!profile?.business_name || profile.business_name === 'My Business') {
        // If business is not set up, send to onboarding
        router.push('/onboarding');
      } else {
        // Standard users go to the main dashboard overview
        router.push('/dashboard');
      }
    };

    handleAuthRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      <div className="text-center space-y-4">
        {/* Uses brand colors from your tailwind.config.js */}
        <Loader2 className="animate-spin text-brand-orange mx-auto transition-colors duration-300" size={40} />
        <p className="text-slate-500 dark:text-slate-400 font-black animate-pulse uppercase tracking-widest text-[10px] transition-colors duration-300">
          Verifying Account...
        </p>
      </div>
    </div>
  );
}
