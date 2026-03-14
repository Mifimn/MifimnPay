"use client";
import dynamic from 'next/dynamic';

const CustomersClient = dynamic(
  () => import('@/components/dashboard/CustomersClient'),
  { ssr: false, loading: () => <div className="p-10 animate-pulse bg-brand-bg h-screen" /> }
);

export default function CustomersPage() {
  return <CustomersClient />;
}
