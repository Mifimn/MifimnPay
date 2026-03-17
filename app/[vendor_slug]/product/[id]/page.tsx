import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';

interface Props {
  params: Promise<{ vendor_slug: string; id: string }>;
}

/**
 * SOCIAL PREVIEW METADATA
 * Uses Vendor Slug/Name for professional branding
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, vendor_slug } = await params;

  const { data: product } = await supabase
    .from('menu_items')
    .select('name, description, image_url, price')
    .eq('id', id)
    .maybeSingle();

  if (!product) return { title: 'Product Not Found' };

  // Use the vendor slug for the title branding
  const displayTitle = `${product.name} | ${vendor_slug.toUpperCase()}`;

  return {
    title: displayTitle,
    description: product.description || `View ${product.name} on our showroom.`,
    openGraph: {
      title: displayTitle,
      description: `₦${Number(product.price).toLocaleString()} - Available now.`,
      url: `https://mifimnpay.com.ng/${vendor_slug}/product/${id}`,
      siteName: vendor_slug.toUpperCase(),
      images: [
        {
          url: product.image_url || '',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      images: [product.image_url || ''],
    },
  };
}

/**
 * MAIN SERVER COMPONENT
 */
export default async function ProductPage({ params }: Props) {
  const { id, vendor_slug } = await params;

  // 1. Fetch Product by standard UUID
  const { data: product } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic dark:text-white">Product Not Found</h2>
          <a href={`/${vendor_slug}`} className="mt-6 inline-block text-brand-orange text-[10px] font-black uppercase border-b-2 border-brand-orange pb-1">
            Back to Showroom
          </a>
        </div>
      </div>
    );
  }

  // 2. Fetch Related Items from same vendor
  const { data: related } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', product.user_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4);

  // 3. Fetch Vendor Profile for Business Name
  const { data: vendor } = await supabase
    .from('profiles')
    .select('business_name')
    .eq('id', product.user_id)
    .single();

  return (
    <main className="min-h-screen bg-white dark:bg-[#050505]">
      <ProductDetails 
        isLoading={false} 
        productData={product} 
        relatedProducts={related || []} 
        vendorName={vendor?.business_name || vendor_slug}
      />
    </main>
  );
}
