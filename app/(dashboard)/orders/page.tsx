"use client";
import dynamic from 'next/dynamic';

const OrdersClient = dynamic(
  () => import('@/components/dashboard/OrdersClient'),
  { ssr: false, loading: () => <div className="p-10 animate-pulse bg-brand-bg h-screen" /> }
);

export default function OrdersPage() {
  return <OrdersClient />;
}
