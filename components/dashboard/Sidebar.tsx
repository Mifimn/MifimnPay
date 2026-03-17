"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, History, Settings, LogOut, Menu, X, Package, Sun, Moon, ShoppingCart, Users,
  ExternalLink, FilePlus, Wrench, Globe 
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
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null; slug: string | null } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('business_name, logo_url, slug')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  if (!mounted || !themeContext) {
    return <aside className="hidden md:block w-72 h-screen bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border-r border-white/40 dark:border-white/10 shrink-0" />;
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
    { name: 'Store Setup', href: '/setup', icon: Wrench }, 
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div 
      className="flex flex-col h-full bg-white/60 dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border-r border-white/40 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
      style={{ '--brand-orange': '#ff7d1a' } as any} // FORCES LOCAL SCOPE TO DEFAULT ORANGE
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/40 dark:border-white/10">
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-black text-slate-900 dark:text-white text-lg uppercase italic tracking-tighter">MifimnPay</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all">
            <X size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {/* ACTION: Quick Generate Receipt */}
        <div className="mb-6 px-2">
          <Link 
            href="/generate" 
            onClick={() => onClose?.()}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#ff7d1a] text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-glow-orange hover:scale-[1.02] active:scale-95 transition-all"
          >
            <FilePlus size={16} />
            Generate Receipt
          </Link>
        </div>

        {/* Main Navigation */}
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => onClose?.()}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isActive 
                  ? 'bg-white dark:bg-white/10 text-[#ff7d1a] shadow-sm border border-[#ff7d1a]/20' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-[#ff7d1a]' : ''} />
              {link.name}
            </Link>
          )
        })}

        {/* View Storefront Link */}
        {profile?.slug && (
          <div className="pt-4 mt-4 border-t border-white/20 dark:border-white/5">
             <a 
              href={`/${profile.slug}`} 
              target="_blank"
              rel="external noreferrer"
              onClick={(e) => {
                onClose?.();
                if (window.matchMedia('(display-mode: standalone)').matches) {
                   window.open(`/${profile.slug}`, '_system'); 
                }
              }}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-white/5 border border-transparent hover:border-[#ff7d1a]/30 hover:text-[#ff7d1a] transition-all"
            >
              <div className="flex items-center gap-3">
                <Globe size={16} />
                Visit Store
              </div>
              <span className="text-[8px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md">WEB</span>
            </a>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/40 dark:border-white/10 space-y-2">
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="flex-1 flex justify-center p-3 text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl transition-all shadow-sm">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="flex-1 flex justify-center p-3 text-red-500/80 hover:bg-red-500/10 rounded-xl transition-all shadow-sm">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          main { padding-top: 5rem !important; }
        }
      `}} />

      {/* Mobile Header */}
      <div 
        className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-[#0a0a0a]/70 backdrop-blur-xl border-b border-white/40 dark:border-white/10 z-40 flex items-center justify-between px-4"
        style={{ '--brand-orange': '#ff7d1a' } as any} // FORCES LOCAL SCOPE TO DEFAULT ORANGE
      >
        <div className="flex items-center gap-3">
          <img src="/favicon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">MifimnPay</span>
        </div>
        <button onClick={() => setIsMobileOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-white/5 rounded-xl transition-all">
          <Menu size={20} />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 h-screen shrink-0 relative z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} 
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="md:hidden fixed inset-y-0 left-0 w-4/5 max-w-[320px] z-50 shadow-2xl"
            >
              <SidebarContent onClose={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
