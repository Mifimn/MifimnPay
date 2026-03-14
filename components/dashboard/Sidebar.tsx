"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  History, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Package, 
  Sun, 
  Moon,
  ShoppingCart,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  
  // --- SAFETY CHECK START ---
  const themeContext = useTheme();

  // If the context is not yet available, we return a shell/loader 
  // to prevent the "useTheme must be used within a ThemeProvider" error.
  if (!themeContext) {
    return (
      <aside className="hidden md:block w-72 h-screen bg-brand-paper border-r border-brand-border shrink-0" />
    );
  }

  const { theme, toggleTheme } = themeContext;
  // --- SAFETY CHECK END ---

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null } | null>(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const closeMenu = () => setIsMobileOpen(false);

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutGrid },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'History', href: '/history', icon: History },
    { name: 'Products', href: '/products', icon: Package },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-brand-paper border-r border-brand-border transition-colors duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-brand-border">
        <img src="/favicon.png" alt="MifimnPay" className="w-8 h-8 rounded-lg shadow-sm object-cover" />
        <span className="font-black text-brand-black text-lg tracking-tight uppercase italic">MifimnPay</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-brand-gray mb-4">Main Menu</p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name}
              href={link.href}
              onClick={closeMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-black text-brand-paper shadow-md' 
                  : 'text-brand-gray hover:bg-brand-bg hover:text-brand-black'
              }`}
            >
              <link.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-brand-border space-y-2">
        <Link 
          href="/settings"
          onClick={closeMenu}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
            pathname === '/settings' 
              ? 'bg-brand-black text-brand-paper shadow-md' 
              : 'text-brand-gray hover:bg-brand-bg hover:text-brand-black'
          }`}
        >
          <Settings size={18} strokeWidth={pathname === '/settings' ? 2.5 : 2} />
          Settings
        </Link>

        <div className="flex items-center gap-2 px-2 py-2">
          <button 
            onClick={toggleTheme}
            className="flex-1 flex justify-center items-center p-3 text-brand-gray hover:bg-brand-bg hover:text-brand-black rounded-xl transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 flex justify-center items-center p-3 text-red-500/70 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
            title="Log Out"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="mt-2 p-3 bg-brand-bg rounded-2xl border border-brand-border flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-paper rounded-xl overflow-hidden border border-brand-border flex items-center justify-center flex-shrink-0">
            {profile?.logo_url ? (
              <img src={profile.logo_url} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span className="font-black text-brand-gray uppercase">{profile?.business_name?.charAt(0) || 'M'}</span>
            )}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-brand-black truncate">{profile?.business_name || 'Merchant Setup'}</p>
            <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-brand-paper/80 backdrop-blur-md border-b border-brand-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/favicon.png" alt="MifimnPay" className="w-6 h-6 rounded object-cover" />
          <span className="font-black text-brand-black uppercase italic tracking-tight">MifimnPay</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-brand-black bg-brand-bg rounded-xl">
          <Menu size={20} />
        </button>
      </div>

      <aside className="hidden md:block w-72 h-screen flex-shrink-0 z-30 relative">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={closeMenu} className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-4/5 max-w-sm z-50 shadow-2xl"
            >
              <SidebarContent />
              <button onClick={closeMenu} className="absolute top-4 right-4 p-2 bg-brand-bg text-brand-black rounded-full border border-brand-border">
                <X size={20} />
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
