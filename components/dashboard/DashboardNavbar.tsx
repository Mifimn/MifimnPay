import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, User, LayoutGrid, History, Settings, LogOut, Menu, X, Package, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../lib/AuthContext';
import { useTheme } from '../../lib/ThemeContext';

export default function DashboardNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Hooked in the Theme Context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<{ business_name: string; logo_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('business_name, logo_url').eq('id', user.id).single();
        if (data) setProfile(data);
      };
      fetchProfile();
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (path: string) => router.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-brand-paper/80 backdrop-blur-md border-b border-brand-border px-4 md:px-6 py-3 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center">

        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="MifimnPay" 
              className="w-8 h-8 rounded-lg shadow-sm object-cover" 
            />
            <span className="font-bold text-brand-black text-lg hidden md:block tracking-tight transition-colors duration-300">MifimnPay</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-brand-bg p-1 rounded-lg transition-colors duration-300 border border-transparent dark:border-brand-border">
            <NavLink href="/dashboard" icon={<LayoutGrid size={16} />} label="Overview" active={isActive('/dashboard')} />
            <NavLink href="/history" icon={<History size={16} />} label="History" active={isActive('/history')} />
            <NavLink href="/settings" icon={<Package size={16} />} label="Price List" active={false} />
            <NavLink href="/settings" icon={<Settings size={16} />} label="Settings" active={isActive('/settings')} />
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* THEME TOGGLE BUTTON */}
          <button 
            onClick={toggleTheme} 
            className="w-8 h-8 flex items-center justify-center text-brand-gray hover:text-brand-black hover:bg-brand-bg rounded-full transition-all duration-300 active:scale-90"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* REFINED SMALL PLUS ICON */}
          <Link 
            href="/generate" 
            className="group relative flex items-center justify-center w-8 h-8 bg-brand-black text-brand-paper rounded-full hover:scale-110 active:scale-90 transition-all duration-200 shadow-md dark:shadow-none"
            title="Create New Receipt"
          >
            <Plus size={16} strokeWidth={3} />

            <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-brand-black text-[9px] font-black text-brand-paper px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-tighter whitespace-nowrap z-50">
              New Receipt
            </span>
          </Link>

          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-3 focus:outline-none group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-brand-black transition-colors duration-300 truncate max-w-[120px]">{profile?.business_name || 'Vendor'}</p>
                <p className="text-[10px] text-brand-gray transition-colors duration-300">Free Plan</p>
              </div>
              <div className="w-9 h-9 bg-brand-bg rounded-full overflow-hidden border border-brand-border flex items-center justify-center transition-colors duration-300">
                {profile?.logo_url ? <img src={profile.logo_url} className="w-full h-full object-cover" /> : <User size={18} className="text-brand-gray/70" />}
              </div>
              <div className="md:hidden p-1 text-brand-black hover:bg-brand-bg rounded-lg transition-colors duration-300">
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </div>
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-64 bg-brand-paper rounded-xl shadow-xl border border-brand-border z-50 overflow-hidden transition-colors duration-300">
                     <div className="px-4 py-3 border-b border-brand-border bg-brand-bg transition-colors duration-300">
                        <p className="text-sm font-bold text-brand-black transition-colors duration-300">{profile?.business_name || 'Vendor'}</p>
                        <p className="text-xs text-brand-gray transition-colors duration-300">Free Plan</p>
                     </div>
                     <div className="md:hidden p-2 border-b border-brand-border transition-colors duration-300">
                        <MobileLink href="/dashboard" icon={<LayoutGrid size={16}/>} label="Overview" active={isActive('/dashboard')} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink href="/history" icon={<History size={16}/>} label="History" active={isActive('/history')} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink href="/settings" icon={<Package size={16}/>} label="Price List" active={false} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink href="/settings" icon={<Settings size={16}/>} label="Settings" active={isActive('/settings')} onClick={() => setIsMenuOpen(false)} />
                        <MobileLink href="/generate" icon={<Plus size={16}/>} label="Create Receipt" active={false} onClick={() => setIsMenuOpen(false)} />
                     </div>
                     <div className="p-2">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                            <LogOut size={16} /> Log Out
                        </button>
                     </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-300 flex items-center gap-2 ${active ? 'bg-brand-paper text-brand-black shadow-sm' : 'text-brand-gray hover:text-brand-black'}`}>{icon} {label}</Link>
  );
}

function MobileLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-300 ${active ? 'bg-brand-bg text-brand-black' : 'text-brand-gray hover:bg-brand-bg hover:text-brand-black'}`}>{icon} {label}</Link>
  );
}
