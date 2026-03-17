"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const InstallPrompt = () => {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // BLOCK PWA PROMPT ON STOREFRONT
    const isStorefront = pathname !== '/' && 
                         !pathname.startsWith('/dashboard') && 
                         !pathname.startsWith('/admin');

    if (isStorefront) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [pathname]);

  // ... (Keep handleInstallClick and UI the same)
  if (!isVisible) return null;
  return ( /* ... UI code ... */ null );
};

export default InstallPrompt;
