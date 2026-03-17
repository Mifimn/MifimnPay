import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';

interface Props {
  params: Promise<{ vendor_slug: string; id: string }>;
}

/**
 * SOCIAL PREVIEW METADATA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, vendor_slug } = await params;

  const { data: product } = await supabase
    .from('menu_items')
    .select('name, description, image_url, price')
    .or(`short_id.eq."${id}",id.eq."${id}"`)
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
  // Await params to get the ID and Slug
  const { id, vendor_slug } = await params;

  // 1. Fetch Product by short_id OR standard uuid
  const { data: product } = await supabase
    .from('menu_items')
    .select('*')
    .or(`short_id.eq."${id}",id.eq."${id}"`)
    .maybeSingle();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic dark:text-white">Asset Not Found</h2>
          <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">The link may be broken or expired.</p>
          <a href={`/${vendor_slug}`} className="mt-6 inline-block text-brand-orange text-[10px] font-black uppercase border-b-2 border-brand-orange">Return to Showroom</a>
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

  // 3. Fetch Vendor Profile
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
