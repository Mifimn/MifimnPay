import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router'; 
import { useEffect } from 'react'; // Added useEffect for tracking
import '../styles/globals.css';
import { AuthProvider, useAuth } from '../lib/AuthContext'; // Updated to import useAuth
import { supabase } from '../lib/supabaseClient'; // Imported supabase client
import ProfileAlert from '../components/dashboard/ProfileAlert'; 
import InstallPrompt from '../components/PWA/InstallPrompt'; 
import { GoogleAnalytics } from '@next/third-parties/google';

// Internal component to handle activity tracking
function ActivityTracker() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const logActivity = async () => {
      // We only track activity for logged-in users to identify "Top Users"
      if (!user) return;

      try {
        await supabase.from('site_activity').insert({
          user_id: user.id,
          page_path: router.pathname,
          // Creating a simple session ID based on the date to group "minutes used"
          session_id: new Date().toISOString().substring(0, 13), 
        });
      } catch (error) {
        console.error("Tracking Error:", error);
      }
    };

    // Log activity on every initial load and every route change
    logActivity();
  }, [router.pathname, user]);

  return null;
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  const siteUrl = 'https://mifimnpay.com.ng'; 
  const canonicalUrl = `${siteUrl}${router.asPath === '/' ? '' : router.asPath}`.split('?')[0];

  const title = "MifimnPay | Professional Receipt Generator";
  const description = "Generate authentic branded receipts instantly with MifimnPay.";
  const shareImage = `${siteUrl}/og-image.png`;

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <title key="title">{title}</title>
        <meta name="description" content={description} key="desc" />
        
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />

        <meta property="fb:app_id" content="966242223397117" />
        <meta property="og:type" content="website" key="ogtype" />
        <meta property="og:url" content={canonicalUrl} key="ogurl" />
        <meta property="og:title" content={title} key="ogtitle" />
        <meta property="og:description" content={description} key="ogdesc" />
        <meta property="og:image" content={shareImage} key="ogimage" />
        <meta property="og:image:secure_url" content={shareImage} key="ogimagesecure" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" key="ogimgtype" />

        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:title" content={title} key="twtitle" />
        <meta name="twitter:description" content={description} key="twdesc" />
        <meta name="twitter:image" content={shareImage} key="twimage" />

        <link rel="icon" href="/favicon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
      </Head>
      
      {/* INITIALIZE TRACKING */}
      <ActivityTracker /> 
      
      <InstallPrompt />
      <ProfileAlert />
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-TTGK2RZ120" />
    </AuthProvider>
  );
}
