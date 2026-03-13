"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductDetails from '@/storefront/components/Showroom/ProductDetails';

/**
 * Individual Product Page
 * Path: app/[vendor_slug]/product/[id]/page.tsx
 * * This page acts as the dynamic container for a specific product. 
 * It replaces the manual navigation logic from the previous setup.
 */
export default function ProductPage() {
  const params = useParams();
  const vendor_slug = params?.vendor_slug as string;
  const productId = params?.id as string;

  // State for loading and the specific product data
  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    /**
     * fetchProduct
     * In your production build, this will fetch a specific product 
     * from Supabase where the ID matches and belongs to the vendor_slug.
     */
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Simulation delay to allow the 3D engine and skeletons to initialize
        await new Promise((resolve) => setTimeout(resolve, 1200));

        // Placeholder for actual data fetching:
        // const { data } = await supabase.from('products').select('*').eq('id', productId).single();
        // setProductData(data);
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, vendor_slug]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
      {/* ProductDetails handles the heavy lifting:
        1. ThreeStage.tsx for the interactive 3D product view.
        2. Sourcing Intelligence (Quantity selection and basket logic).
        3. Verified badges and warehouse stock status.
      */}
      <ProductDetails 
        isLoading={isLoading} 
        // In the next step, we will update ProductDetails to accept the 
        // fetched productData as a prop instead of using location.state.
      />

      {/* 404 / Missing Product State */}
      {!isLoading && !productData && productId === "undefined" && (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
          <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-6">
            <span className="text-brand-orange text-3xl font-black">?</span>
          </div>
          <h2 className="text-2xl font-black uppercase italic dark:text-white tracking-tighter">
            Product <span className="text-brand-orange">Not Found</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium max-w-xs">
            We couldn&apos;t find this specific item in <span className="text-slate-900 dark:text-white font-bold">@{vendor_slug}&apos;s</span> catalog.
          </p>
        </div>
      )}
    </div>
  );
}