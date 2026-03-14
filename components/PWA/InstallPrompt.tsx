"use client";

import { useState, useEffect } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 animate-in fade-in slide-in-from-top duration-500">
      <div className="max-w-md mx-auto bg-white dark:bg-[#0f0f0f] text-slate-900 dark:text-white rounded-[24px] shadow-2xl p-4 flex items-center justify-between border border-slate-200 dark:border-white/10 backdrop-blur-md transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-white/5 transition-colors">
             <img src="/favicon.png" alt="Logo" className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">MifimnPay OS</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mt-0.5">Install for faster access</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Later
          </button>
          <button 
            onClick={handleInstallClick}
            className="px-5 py-3 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-glow-orange hover:scale-105 active:scale-95 transition-all"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;