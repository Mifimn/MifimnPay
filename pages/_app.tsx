import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import { AuthProvider } from '../lib/AuthContext'; // Import the new provider

export default function App({ Component, pageProps }: AppProps) {
  const siteUrl = 'https://mifimnpay.vercel.app'; 

  return (
    <AuthProvider> {/* Wrap everything here */}
      <Head>
        <title>MifimnPay | Professional Receipt Generator</title>
        <meta name="description" content="Generate authentic OPay-style receipts instantly with MifimnPay." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        
        <link rel="icon" href="/favicon.png" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MifimnPay" />
        <meta property="og:image" content={`${siteUrl}/og-image.png`} />
      </Head>
      
      <Component {...pageProps} />
    </AuthProvider>
  );
}
