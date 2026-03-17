import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';

interface Props {
  // In Next.js 15, params MUST be a Promise
  params: Promise<{ vendor_slug: string; id: string }>;
}

/**
 * 1. WHATSAPP/SOCIAL PREVIEW METADATA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // You must AWAIT params before using the ID
  const { id } = await params;

  const { data: product } = await supabase
    .from('menu_items')
    .select('name, description, image_url, price')
    // Use double quotes around the ID variable for strict PostgREST string matching
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
 * 2. MAIN SERVER COMPONENT
 */
export default async function ProductPage({ params }: Props) {
  // You must AWAIT params here too
  const { id, vendor_slug } = await params;

  // Fetch Product by short_id OR standard uuid
  const { data: product } = await supabase
    .from('menu_items')
    .select('*')
    .or(`short_id.eq."${id}",id.eq."${id}"`)
    .maybeSingle();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase italic dark:text-white leading-none">Asset Not Found</h2>
          <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">The link may be broken or expired.</p>
          <a href={`/${vendor_slug}`} className="mt-8 inline-block text-brand-orange text-[10px] font-black uppercase border-b-2 border-brand-orange pb-1">
            Return to Showroom
          </a>
        </div>
      </div>
    );
  }

  // Fetch Related Items from same vendor
  const { data: related } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', product.user_id)
    .eq('is_active', true)
    .neq('id', product.id)
    .limit(4);

  // Fetch Vendor Profile for the copy tool
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
