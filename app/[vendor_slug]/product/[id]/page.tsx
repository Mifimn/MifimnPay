import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';

interface Props {
  params: { vendor_slug: string; id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch by short_id OR id to support both formats
  const { data: product } = await supabase
    .from('menu_items')
    .select('name, description, image_url, price')
    .or(`short_id.eq.${params.id},id.eq.${params.id}`)
    .single();

  const { data: vendor } = await supabase
    .from('profiles')
    .select('business_name, logo_url')
    .eq('slug', params.vendor_slug)
    .single();

  if (!product) return { title: 'Product Not Found' };

  const displayTitle = `${product.name} | ${vendor?.business_name || params.vendor_slug}`;

  return {
    title: displayTitle,
    description: product.description,
    openGraph: {
      title: displayTitle,
      description: `₦${Number(product.price).toLocaleString()} - View details on ${vendor?.business_name}`,
      images: [product.image_url || ''],
      type: 'website',
    },
    // This removes MifimnPay from the social card and uses the Vendor Business Name
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      images: [product.image_url || ''],
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { data: product } = await supabase
    .from('menu_items')
    .select('*')
    .or(`short_id.eq.${params.id},id.eq.${params.id}`)
    .single();

  const { data: related } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', product?.user_id)
    .eq('is_active', true)
    .neq('id', product?.id)
    .limit(4);

  const { data: vendor } = await supabase
    .from('profiles')
    .select('logo_url, business_name')
    .eq('slug', params.vendor_slug)
    .single();

  return (
    <>
      {/* Tab Icon: Uses the Vendor's Logo instead of MifimnPay */}
      {vendor?.logo_url && <link rel="icon" href={vendor.logo_url} />}

      <main className="min-h-screen bg-white dark:bg-[#050505]">
        <ProductDetails 
          isLoading={false} 
          productData={product} 
          relatedProducts={related || []} 
          vendorName={vendor?.business_name}
        />
      </main>
    </>
  );
}
