import React, { useState, useEffect } from 'react';
import { Moon, Sun, LayoutDashboard, Mail, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Defaulting to dark mode for admin
  const router = useRouter();

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className={isDark ? 'admin-dark min-h-screen' : 'min-h-screen'}>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        
        {/* Sidebar */}
        <aside className="w-64 border-r border-[var(--border-color)] bg-[var(--card-bg)] hidden md:flex flex-col">
          <div className="p-6 border-b border-[var(--border-color)]">
            <h1 className="text-xl font-bold text-green-500">MifimnPay Admin</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <Link href="/admin" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-500/10 ${router.pathname === '/admin' ? 'bg-green-500/10 text-green-500' : ''}`}>
              <LayoutDashboard size={20} />
              Analysis
            </Link>
            <Link href="/admin/campaigns" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-500/10 ${router.pathname === '/admin/campaigns' ? 'bg-green-500/10 text-green-500' : ''}`}>
              <Mail size={20} />
              Campaigns
            </Link>
            <Link href="/admin/users" className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-500/10 ${router.pathname === '/admin/users' ? 'bg-green-500/10 text-green-500' : ''}`}>
              <Users size={20} />
              User List
            </Link>
          </nav>

          <div className="p-4 border-t border-[var(--border-color)]">
            <Link href="/dashboard" className="flex items-center gap-3 p-3 text-sm opacity-70 hover:opacity-100">
              <ArrowLeft size={16} />
              Back to Main App
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--card-bg)]">
            <h2 className="font-semibold text-lg uppercase tracking-wider">
              {router.pathname.replace('/admin', '').replace('/', '') || 'Dashboard Overview'}
            </h2>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-[var(--border-color)] transition-colors"
            >
              {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
          </header>

          {/* Page Content */}
          <div className="p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
