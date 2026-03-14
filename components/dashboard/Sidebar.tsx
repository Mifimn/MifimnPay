"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, History, Settings, LogOut, Menu, X, Package, Sun, Moon, ShoppingCart, Users 
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const themeContext = useTheme();
  
  const [mounted, setMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null } | null>(null);

  // Set mounted to true once we are in the browser
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('business_name, logo_url')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  // If not mounted or context is missing, return a skeleton. 
  // This prevents Vercel from crashing during build!
  if (!mounted || !themeContext) {
    return <aside className="hidden md:block w-72 h-screen bg-brand-paper border-r border-brand-border shrink-0" />;
  }

  const { theme, toggleTheme } = themeContext;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'History', href: '/history', icon: History },
    { name: 'Products', href: '/products', icon: Package },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand-paper border-r border-brand-border">
      <div className="p-6 flex items-center gap-3 border-b border-brand-border">
        <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg" />
        <span className="font-black text-brand-black text-lg uppercase italic">MifimnPay</span>
      </div>
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navLinks.map((link) => (
          <Link key={link.name} href={link.href} onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
              pathname === link.href ? 'bg-brand-black text-brand-paper' : 'text-brand-gray hover:bg-brand-bg'
            }`}>
            <link.icon size={18} />
            {link.name}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-brand-border space-y-2">
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="flex-1 p-3 text-brand-gray hover:bg-brand-bg rounded-xl">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="flex-1 p-3 text-red-500/70 hover:bg-red-500/10 rounded-xl">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-paper border-b border-brand-border z-40 flex items-center justify-between px-4">
        <span className="font-black text-brand-black uppercase italic">MifimnPay</span>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 bg-brand-bg rounded-xl"><Menu size={20} /></button>
      </div>
      <aside className="hidden md:block w-72 h-screen shrink-0"><SidebarContent /></aside>
      <AnimatePresence>
        {isMobileOpen && (
          <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="md:hidden fixed inset-y-0 left-0 w-4/5 z-50 shadow-2xl">
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
