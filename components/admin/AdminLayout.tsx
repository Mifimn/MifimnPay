import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Mail, 
  Users, 
  ArrowLeft, 
  Moon, 
  Sun, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  // Toggle theme and apply class to ensure CSS variables update
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { 
      label: 'Site Intelligence', 
      href: '/admin', 
      icon: LayoutDashboard,
      description: 'Behavioral Analytics'
    },
    { 
      label: 'Email Campaigns', 
      href: '/admin/campaigns', 
      icon: Mail,
      description: 'User Outreach'
    },
    { 
      label: 'User Directory', 
      href: '/admin/users', 
      icon: Users,
      description: 'Account Management'
    }
  ];

  return (
    <div className={isDark ? 'admin-dark min-h-screen' : 'min-h-screen'}>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        
        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Logo Section */}
            <div className="p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-green-500/20">M</div>
                <h1 className="text-sm font-black uppercase tracking-tighter">Mifimn Admin</h1>
              </div>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    router.pathname === item.href 
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                    : 'hover:bg-zinc-500/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{item.label}</span>
                      {router.pathname !== item.href && (
                        <span className="text-[8px] font-bold opacity-50 uppercase tracking-tighter">{item.description}</span>
                      )}
                    </div>
                  </div>
                  {router.pathname === item.href && <ChevronRight size={14} />}
                </Link>
              ))}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[var(--border-color)] space-y-2">
              <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-zinc-500/10 transition-all">
                <ArrowLeft size={16} />
                Exit to App
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navbar */}
          <header className="h-16 border-b border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-between px-6 lg:px-8 z-40">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-zinc-500"
            >
              <LayoutDashboard size={20} />
            </button>

            <div className="flex-1 lg:flex-none">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hidden sm:block">
                Admin Control Center
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle Button */}
              <button 
                onClick={toggleTheme}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-500/10 hover:bg-zinc-500/20 transition-all border border-[var(--border-color)]"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun size={18} className="text-yellow-500" />
                ) : (
                  <Moon size={18} className="text-zinc-600" />
                )}
              </button>

              <div className="h-8 w-px bg-[var(--border-color)] mx-1" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black uppercase leading-none">System Root</p>
                  <p className="text-[8px] font-bold text-green-500 uppercase tracking-tighter mt-1">Authorized</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-500/20 border border-[var(--border-color)] flex items-center justify-center font-black text-[10px]">
                  AD
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Content Wrapper */}
          <main className="flex-1 overflow-y-auto bg-[var(--background)] custom-scrollbar relative">
            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Internal CSS to handle custom scrollbar and theme stability */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #22c55e;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
