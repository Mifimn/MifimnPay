import Sidebar from '@/components/dashboard/Sidebar';
import ProfileAlert from '@/components/dashboard/ProfileAlert';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-black transition-colors duration-300">
      <ProfileAlert />

      {/* This is what brings your menu back! */}
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-7xl mx-auto p-6 md:p-10 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}