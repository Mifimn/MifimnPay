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

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  // Sidebar starts closed on mobile, open on desktop via CSS
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const router = useRouter();

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = async () => {
    setIsSidebarOpen(false); // Close sidebar on logout
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Helper to close sidebar after clicking a link
  const closeSidebar = () => {
    setIsSidebarOpen(false);
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
        
        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={closeSidebar}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--card-bg)] border-r border-[var(--border-color)] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-green-500/20">M</div>
                <h1 className="text-sm font-black uppercase tracking-tighter">Mifimn Admin</h1>
              </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-2 mt-4">
              {navItems.map((item) => (
                <Link 
                  key={item.href}
                  href={item.href} 
                  onClick={closeSidebar} // COLLAPSE AFTER NAVIGATION
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

            <div className="p-4 border-t border-[var(--border-color)] space-y-2">
              <Link 
                href="/dashboard" 
                onClick={closeSidebar} // COLLAPSE AFTER EXIT
                className="flex items-center gap-3 p-3 rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:bg-zinc-500/10 transition-all"
              >
                <ArrowLeft size={16} />
                Exit to App
              </Link>
              <button 
                onClick={handleLogout} // COLLAPSE ON LOGOUT
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
          <header className="h-16 border-b border-[var(--border-color)] bg-[var(--card-bg)] flex items-center justify-between px-6 lg:px-8 z-40">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 -ml-2 text-zinc-500"
            >
              <LayoutDashboard size={20} />
            </button>
            {/* ... Rest of the header code ... */}
          </header>

          <main className="flex-1 overflow-y-auto bg-[var(--background)] custom-scrollbar relative p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
