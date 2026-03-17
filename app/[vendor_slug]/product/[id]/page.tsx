"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';

/**
 * Single Product View Page
 * Path: app/[vendor_slug]/product/[id]/page.tsx
 */
export default function ProductPage() {
  const params = useParams();
  const product_id = params?.id as string;
  const vendor_slug = params?.vendor_slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [productData, setProductData] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!product_id) return;
      setIsLoading(true);

      try {
        // Fetch only the specific product matching the ID from the URL
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', product_id)
          .single(); // Get one single item

        if (error) throw error;
        setProductData(data);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [product_id]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505]">
      <ProductDetails 
        isLoading={isLoading} 
        productData={productData} 
      />
    </div>
  );
}
