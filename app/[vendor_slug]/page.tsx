"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ShowroomMain from '@/storefront/components/Showroom/ShowroomMain';

/**
 * Vendor Showroom Page
 * This is the main landing page for a specific vendor's store.
 * It dynamically detects the vendor via the URL slug.
 */
export default function VendorShowroomPage() {
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  
  // State for loading and vendor-specific products
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProducts, setVendorProducts] = useState([]);

  useEffect(() => {
    /**
     * fetchVendorData
     * In the future, this will call your Supabase/API to fetch 
     * products where vendor_slug === vendor_slug.
     */
    const fetchVendorData = async () => {
      setIsLoading(true);
      try {
        // Simulation delay to show the Glow Skeletons
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Example: const { data } = await supabase.from('products').select('*').eq('slug', vendor_slug);
        // setVendorProducts(data || []);
      } catch (error) {
        console.error("Error fetching vendor products:", error);
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
      {/* ShowroomMain handles the Hero slideshow, categories, and product grid.
        We pass the loading state to trigger the FeedSkeleton.
      */}
      <ShowroomMain 
        isSkeleton={isLoading} 
        onAddInquiry={(product: any) => {
          // This triggers the basket logic defined in useCartStore
          console.log("Customer is adding product to inquiry:", product);
        }} 
      />
      
      {/* Empty State Display
        Shown only if loading is finished and no products exist for this slug.
      */}
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
