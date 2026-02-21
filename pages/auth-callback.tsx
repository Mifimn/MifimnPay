import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

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

      // 2. Fetch their profile to check is_admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('business_name, is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        router.push('/dashboard');
        return;
      }

      // 3. Traffic Control Redirect
      if (profile?.is_admin) {
        router.push('/admin');
      } else if (!profile?.business_name || profile.business_name === 'My Business') {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    };

    handleAuthRedirect();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-zinc-900 mx-auto" size={40} />
        <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Verifying Account...
        </p>
      </div>
    </div>
  );
}
