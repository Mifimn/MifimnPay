import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext';
import ProfileAlert from '../components/dashboard/ProfileAlert'; 
import InstallPrompt from '../components/PWA/InstallPrompt'; 
import { GoogleAnalytics } from '@next/third-parties/google';

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = 'https://mifimnpay.vercel.app'; 
  const title = "MifimnPay | Professional Receipt Generator";
  const description = "Generate authentic branded receipts instantly with MifimnPay.";
  // Updated to use favicon.png for everything
  const shareImage = `${siteUrl}/favicon.png`;

  return (
    <AuthProvider>
      <Head>
        {/* Basic Metadata */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="google-site-verification" content="3LLBnYF_neMyal_kjtQyVOSE25JcDQBwnw40fWe_yEE" />
        <link rel="icon" href="/favicon.png" />

        {/* --- PWA & Mobile Optimization Tags --- */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MifimnPay" />
        <link rel="apple-touch-icon" href="/favicon.png" />

        {/* --- Open Graph / WhatsApp / Facebook Preview --- */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:secure_url" content={shareImage} />
        <meta property="og:image:type" content="image/png" />
        {/* Note: Standard OG images are 1200x630, but since you are using a favicon, 
            removing fixed width/height allows the platform to scale it better */}

        {/* --- Twitter Preview --- */}
        <meta name="twitter:card" content="summary" /> {/* Changed from summary_large_image to summary for a square icon look */}
        <meta name="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={shareImage} />
      </Head>
      
      <InstallPrompt />
      <ProfileAlert />
      <Component {...pageProps} />
      <GoogleAnalytics gaId="G-TTGK2RZ120" />
    </AuthProvider>
  );
}
