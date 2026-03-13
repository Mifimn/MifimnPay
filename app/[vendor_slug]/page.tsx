"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ShowroomMain from '@/storefront/components/Showroom/ShowroomMain';

export default function VendorShowroomPage() {
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;

  const [isLoading, setIsLoading] = useState(true);
  // We'll keep this empty for now to test the "Inactive" state, 
  // or you can populate it with mock data to see the products.
  const [vendorProducts, setVendorProducts] = useState([]);

  useEffect(() => {
    const fetchVendorData = async () => {
      setIsLoading(true);
      try {
        // Simulation delay to test UI transitions and skeletons
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // FRONTEND-ONLY PREVIEW: 
        // You can uncomment the line below to test how it looks with data
        // setVendorProducts([...MOCK_DATA]); 
      } catch (error) {
        console.error("Error connecting frontend:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (vendor_slug) {
      fetchVendorData();
    }
  }, [vendor_slug]);

  return (
    <div className="min-h-screen">
      <ShowroomMain 
        isSkeleton={isLoading} 
        products={vendorProducts} // Now passing the dynamic state
        vendorName={vendor_slug}   // Passing the slug to display on the frontend
        onAddInquiry={(product: any) => {
          console.log("Customer adding to inquiry:", product);
        }} 
      />

      {!isLoading && vendorProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mb-4">
             <span className="text-brand-orange font-bold text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-black uppercase italic dark:text-white tracking-tighter">
            Storefront <span className="text-brand-orange">Inactive</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium max-w-xs">
            The vendor <span className="font-bold text-slate-900 dark:text-white">@{vendor_slug}</span> has not added any products to their showroom yet.
          </p>
        </div>
      )}
    </div>
  );
}
