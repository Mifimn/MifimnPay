import React, { useState } from 'react';
import { LayoutDashboard, Mail, Users, Moon, Sun, LogOut, ChevronRight, X, Menu } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: 'Intelligence', href: '/admin', icon: LayoutDashboard },
    { label: 'Campaigns', href: '/admin/campaigns', icon: Mail },
    { label: 'Users', href: '/admin/users', icon: Users },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className={isDark ? 'admin-dark min-h-screen' : 'min-h-screen transition-colors duration-300'}>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={closeSidebar} />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full p-4">
            <div className="flex items-center justify-between mb-8 px-2">
              <span className="text-xl font-black text-green-500 uppercase">Mifimn Admin</span>
              <button onClick={closeSidebar} className="lg:hidden text-zinc-500"><X size={20}/></button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeSidebar}
                  className={`flex items-center justify-between p-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${router.pathname === item.href ? 'bg-green-500 text-white' : 'hover:bg-zinc-500/10 opacity-70'}`}>
                  <div className="flex items-center gap-3"><item.icon size={18}/>{item.label}</div>
                  {router.pathname === item.href && <ChevronRight size={14}/>}
                </Link>
              ))}
            </nav>

            <div className="pt-4 border-t border-[var(--border-color)] space-y-4">
              {/* THEME TOGGLE IN SIDEBAR */}
              <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-500/5 border border-[var(--border-color)] hover:bg-zinc-500/10 transition-all">
                {isDark ? <Sun size={18} className="text-yellow-500"/> : <Moon size={18} className="text-zinc-600"/>}
                <span className="text-[10px] font-black uppercase tracking-widest">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              
              <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="w-full flex items-center gap-3 p-3 text-red-500 opacity-70 hover:opacity-100 transition-all font-black text-[10px] uppercase">
                <LogOut size={18}/> Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-[var(--border-color)] flex items-center px-6 lg:px-8 bg-[var(--card-bg)] lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-500"><Menu size={24}/></button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
