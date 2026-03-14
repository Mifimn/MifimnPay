"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { supabase } from '@/lib/supabaseClient';
import { GoogleAnalytics } from '@next/third-parties/google';
import InstallPrompt from '@/components/PWA/InstallPrompt';

function ActivityTracker() {
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const logActivity = async () => {
      if (!user) return;
      try {
        await supabase.from('site_activity').insert({
          user_id: user.id,
          page_path: pathname,
          session_id: new Date().toISOString().substring(0, 13), 
        });
      } catch (error) {
        console.error("Tracking Error:", error);
      }
    };
    logActivity();
  }, [pathname, user]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ActivityTracker />
        <InstallPrompt />
        {children}
        <GoogleAnalytics gaId="G-TTGK2RZ120" />
      </ThemeProvider>
    </AuthProvider>
  );
}