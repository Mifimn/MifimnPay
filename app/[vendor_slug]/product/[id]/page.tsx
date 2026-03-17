import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';

interface Props {
  params: { vendor_slug: string; id: string };
}

/**
 * SOCIAL PREVIEW METADATA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: product } = await supabase
    .from('menu_items')
    .select('name, description, image_url, price')
    .or(`short_id.eq.${params.id},id.eq.${params.id}`) // Checks both long and short IDs
    .maybeSingle();

  if (!product) return { title: 'Product Not Found' };

  return {
    title: `${product.name} | Sourcing`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: `₦${Number(product.price).toLocaleString()} - View details on our showroom.`,
      images: [product.image_url || ''],
    },
  };
}

/**
 * MAIN SERVER COMPONENT
 */
export default async function ProductPage({ params }: Props) {
  // 1. Fetch Product by short_id OR standard uuid
  const { data: product, error } = await supabase
    .from('menu_items')
    .select('*')
    .or(`short_id.eq.${params.id},id.eq.${params.id}`)
    .maybeSingle();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic dark:text-white">Asset Not Found</h2>
          <p className="text-slate-500 text-xs font-bold mt-2 uppercase">The link may be broken or expired.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch Related Items
  const { data: related } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', product.user_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4);

  // 3. Fetch Vendor Profile (to get Business Name for the share tool)
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
        vendorName={vendor?.business_name || params.vendor_slug}
      />
    </main>
  );
}
