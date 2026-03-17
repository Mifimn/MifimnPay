import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ProductDetails from '@/src/storefront/components/Showroom/ProductDetails';
import ClientProductWrapper from './ClientProductWrapper'; // We'll create this below

interface Props {
  params: { vendor_slug: string; id: string };
}

/**
 * 1. SERVER-SIDE METADATA
 * This handles the "Instagram/TikTok/WhatsApp" style preview when the link is pasted.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: product } = await supabase
    .from('menu_items')
    .select('name, description, image_url, price')
    .eq('id', params.id)
    .single();

  if (!product) return { title: 'Product Not Found' };

  const title = `${product.name} | MifimnPay`;
  const description = product.description || `Sourcing price: ₦${Number(product.price).toLocaleString()}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mifimnpay.com.ng/${params.vendor_slug}/product/${params.id}`,
      siteName: 'MifimnPay',
      images: [
        {
          url: product.image_url || '/og-image.png',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image_url || '/og-image.png'],
    },
  };
}

/**
 * 2. DATA FETCHING (Server Component)
 */
export default async function ProductPage({ params }: Props) {
  // Fetch main product
  const { data: product } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', params.id)
    .single();

  // Fetch related products (same vendor, excluding current product)
  const { data: related } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', product?.user_id)
    .eq('is_active', true)
    .neq('id', params.id)
    .limit(4);

  // Fetch vendor profile for the logo
  const { data: vendorProfile } = await supabase
    .from('profiles')
    .select('logo_url, business_name')
    .eq('id', product?.user_id)
    .single();

  return (
    <>
      {/* Set the Browser Tab Icon to the Vendor's Logo */}
      {vendorProfile?.logo_url && (
        <link rel="icon" href={vendorProfile.logo_url} />
      )}

      <main className="min-h-screen bg-white dark:bg-[#050505]">
        <ProductDetails 
          isLoading={false} 
          productData={product} 
          relatedProducts={related || []} 
        />
      </main>
    </>
  );
}
