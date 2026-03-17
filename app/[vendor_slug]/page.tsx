import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import ShowroomMain from '@/src/storefront/components/Showroom/ShowroomMain';
import HeroSlideshow from '@/src/storefront/components/Showroom/HeroSlideshow';

interface Props {
  params: Promise<{ vendor_slug: string }>;
}

/**
 * 1. SERVER-SIDE METADATA
 * Generates the preview for the storefront link (WhatsApp/Instagram)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { vendor_slug } = await params;

  // Fetch Vendor Profile for metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, about_text, logo_url')
    .eq('slug', vendor_slug)
    .single();

  if (!profile) return { title: 'Showroom Not Found' };

  const title = `${profile.business_name} | Official Showroom`;
  const description = profile.about_text || `Browse products from ${profile.business_name} on MifimnPay.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mifimnpay.com.ng/${vendor_slug}`,
      siteName: profile.business_name,
      images: [
        {
          url: profile.logo_url || '/favicon.png', // Vendor logo as the share image
          width: 800,
          height: 800,
          alt: profile.business_name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [profile.logo_url || '/favicon.png'],
    },
  };
}

/**
 * 2. VENDOR SHOWROOM PAGE (Server Component)
 */
export default async function VendorShowroomPage({ params }: Props) {
  const { vendor_slug } = await params;

  // Fetch Vendor Profile Data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', vendor_slug)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#050505]">
        <h2 className="text-xl font-black uppercase italic dark:text-white">Storefront Not Found</h2>
      </div>
    );
  }

  // Fetch Vendor Products from 'menu_items'
  const { data: products } = await supabase
    .from('menu_items')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  // Map products for ShowroomMain
  const mappedProducts = (products || []).map(p => ({
    ...p,
    img: p.image_url,
    price: p.price
  }));

  return (
    <>
      {/* Dynamic Favicon Swapping to Vendor Logo */}
      {profile.logo_url && <link rel="icon" href={profile.logo_url} />}

      <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-500">
        
        {/* Promotion Marquee */}
        {profile.banner_type === 'text' && profile.promo_texts?.some((t: string) => t.length > 0) && (
          <div className="bg-slate-900 dark:bg-black text-white py-3 overflow-hidden whitespace-nowrap border-b border-white/10 relative z-20">
            <div className="inline-block animate-marquee">
              {profile.promo_texts.map((text: string, i: number) => (
                text && <span key={i} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
              ))}
              {/* Infinite Loop Repeat */}
              {profile.promo_texts.map((text: string, i: number) => (
                text && <span key={`rep-${i}`} className="mx-12 font-black uppercase text-[10px] tracking-[0.2em] italic">{text}</span>
              ))}
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 py-8 space-y-12 relative z-10">
          
          {/* Hero Section */}
          <HeroSlideshow 
            isLoading={false}
            bannerType={profile.banner_type}
            banners={profile.banner_urls}
            promoTexts={profile.promo_texts}
            themeColor={profile.theme_color}
          />

          {/* Product Grid */}
          <ShowroomMain 
            isSkeleton={false} 
            products={mappedProducts} 
            vendorName={profile.business_name}
            aboutText={profile.about_text}
            themeColor={profile.theme_color || '#f97316'}
          />

          {/* Empty State */}
          {mappedProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
              <div 
                className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 border transition-all duration-500 shadow-lg"
                style={{ 
                  backgroundColor: `${profile.theme_color || '#f97316'}1a`,
                  borderColor: `${profile.theme_color || '#f97316'}33` 
                }}
              >
                 <span 
                  className="font-black text-3xl italic"
                  style={{ color: profile.theme_color || '#f97316' }}
                 >
                  !
                 </span>
              </div>
              <h2 className="text-3xl font-black uppercase italic dark:text-white tracking-tighter">
                Storefront <span style={{ color: profile.theme_color || '#f97316' }}>Coming Soon</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 font-bold max-w-xs uppercase tracking-wide">
                The vendor <span className="text-slate-900 dark:text-white">@{vendor_slug}</span> is currently setting up their catalog.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
